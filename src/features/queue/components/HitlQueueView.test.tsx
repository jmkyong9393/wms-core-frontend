import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createStore, Provider as JotaiProvider } from 'jotai';
import HitlQueueView from './HitlQueueView';
import { listInspectionHistory } from '@/features/inspections/api/inspectionHistoryService';
import { getInspectionMetrics } from '@/services/dashboardService';
import type { InspectionHistoryRow } from '@/features/inspections/types/inspectionHistory';
import { hitlQueueAtom, type HitlQueueItem } from '@/features/queue/store/queueAtoms';

// 테스트용 localStorage 설정 (queueAtoms → authAtoms의 atomWithStorage가 의존)
vi.hoisted(() => {
  const store: Record<string, string> = {};
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = String(value);
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      Object.keys(store).forEach((key) => delete store[key]);
    },
  });
});

vi.mock('@/features/inspections/api/inspectionHistoryService', () => ({
  listInspectionHistory: vi.fn(),
}));

vi.mock('@/services/dashboardService', () => ({
  getInspectionMetrics: vi.fn(),
}));

const mockedListInspectionHistory = vi.mocked(listInspectionHistory);
const mockedGetInspectionMetrics = vi.mocked(getInspectionMetrics);

function buildRow(overrides: Partial<InspectionHistoryRow> = {}): InspectionHistoryRow {
  return {
    id: 'insp_001',
    bookId: 'book_001',
    bookTitle: '테스트 도서',
    finalGrade: null,
    isFastTrack: false,
    status: 'HITL_REQUIRED',
    ubciScore: 55,
    finalReport: null,
    inspectedAt: '2026-07-16T10:00:00.000Z',
    updatedAt: '2026-07-16T10:00:00.000Z',
    steps: [],
    ...overrides,
  };
}

function renderView(seedQueue?: HitlQueueItem[]) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const store = createStore();
  if (seedQueue) store.set(hitlQueueAtom, seedQueue);
  const view = render(
    <QueryClientProvider client={queryClient}>
      <JotaiProvider store={store}>
        <HitlQueueView />
      </JotaiProvider>
    </QueryClientProvider>
  );
  return { ...view, store };
}

describe('HitlQueueView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedGetInspectionMetrics.mockResolvedValue({
      total_jobs: 10,
      pending_jobs: 1,
      processing_jobs: 1,
      hitl_required_jobs: 2,
      recheck_required_jobs: 0,
      approved_jobs: 5,
      rejected_jobs: 1,
      failed_jobs: 0,
      average_processing_time_seconds: 3.2,
    });
  });

  it('별도 HITL 목록 API 없이 검수 이력 API를 status=HITL_REQUIRED로 호출해 큐를 채운다', async () => {
    mockedListInspectionHistory.mockResolvedValueOnce({
      items: [buildRow()],
      total: 1,
      page: 1,
      size: 20,
      total_pages: 1,
    });

    renderView();

    expect((await screen.findAllByText('테스트 도서')).length).toBeGreaterThan(0);
    expect(listInspectionHistory).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'HITL_REQUIRED', page: 1, size: 20 })
    );
  });

  it('페이지네이션 버튼으로 다음 page를 재조회한다', async () => {
    mockedListInspectionHistory
      .mockResolvedValueOnce({
        items: [buildRow({ id: 'insp_001', bookTitle: '첫 페이지 도서' })],
        total: 25,
        page: 1,
        size: 20,
        total_pages: 2,
      })
      .mockResolvedValueOnce({
        items: [buildRow({ id: 'insp_002', bookTitle: '둘째 페이지 도서' })],
        total: 25,
        page: 2,
        size: 20,
        total_pages: 2,
      });

    renderView();

    expect((await screen.findAllByText('첫 페이지 도서')).length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole('button', { name: '다음' }));

    await waitFor(() => {
      expect(listInspectionHistory).toHaveBeenLastCalledWith(
        expect.objectContaining({ status: 'HITL_REQUIRED', page: 2, size: 20 })
      );
    });
    expect((await screen.findAllByText('둘째 페이지 도서')).length).toBeGreaterThan(0);
  });

  it('KPI 카드가 페이지네이션과 무관한 실제 inspection-metrics 응답값을 반영한다', async () => {
    mockedListInspectionHistory.mockResolvedValueOnce({
      items: [],
      total: 0,
      page: 1,
      size: 20,
      total_pages: 0,
    });

    renderView();

    // 검토 대기건수 = hitl_required_jobs
    expect(await screen.findByText('2건')).toBeInTheDocument();
    // 금일 누적 처리량 = approved_jobs + rejected_jobs
    expect(await screen.findByText('6건')).toBeInTheDocument();
  });

  it('승인 처리 중(PROCESSING)인 카드는 목록이 재조회돼도 검토 대기로 되돌아가지 않는다', async () => {
    // 백엔드 비동기 처리 지연으로 승인한 건이 여전히 HITL_REQUIRED로 응답에 남아있는 상황을 재현
    mockedListInspectionHistory.mockResolvedValueOnce({
      items: [buildRow({ id: 'insp_001', bookTitle: '승인 처리중 도서' })],
      total: 1,
      page: 1,
      size: 20,
      total_pages: 1,
    });

    const { store } = renderView([
      { id: 'insp_001', title: '승인 처리중 도서', status: 'PROCESSING', reviewer: '관리자A' },
    ]);

    await waitFor(() => {
      expect(mockedListInspectionHistory).toHaveBeenCalled();
    });

    expect(store.get(hitlQueueAtom).find((item) => item.id === 'insp_001')?.status).toBe('PROCESSING');
  });

  it('승인 완료(APPROVED)된 카드는 목록 응답에서 빠져도 큐에서 사라지지 않는다', async () => {
    // 백엔드가 실제로 HITL_REQUIRED에서 전이를 완료해 목록 응답에서 빠진 상황을 재현
    mockedListInspectionHistory.mockResolvedValueOnce({
      items: [],
      total: 0,
      page: 1,
      size: 20,
      total_pages: 0,
    });

    const { store } = renderView([{ id: 'insp_001', title: '승인 완료 도서', status: 'APPROVED' }]);

    await waitFor(() => {
      expect(mockedListInspectionHistory).toHaveBeenCalled();
    });

    expect(store.get(hitlQueueAtom).find((item) => item.id === 'insp_001')?.status).toBe('APPROVED');
  });
});
