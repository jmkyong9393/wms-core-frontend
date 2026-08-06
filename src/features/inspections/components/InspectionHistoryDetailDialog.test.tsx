import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { InspectionHistoryDetailDialog } from '@/features/inspections/components/InspectionHistoryDetailDialog';
import type { InspectionHistoryRow } from '@/features/inspections/types/inspectionHistory';
import type { InspectionDetailResponse } from '@/features/inspections/types/inspection';
import { getAgentLog } from '@/features/inspections/api/agentLogService';
import { getInspectionDetail } from '@/features/inspections/api/inspectionHistoryService';

vi.mock('@/features/inspections/api/agentLogService', () => ({
  getAgentLog: vi.fn(),
}));

// InspectionHistoryDetailDialog가 LPN/원본 이미지 조회에 사용하는 실제 apiClient 호출을 대신 mock
vi.mock('@/features/inspections/api/inspectionHistoryService', () => ({
  getInspectionDetail: vi.fn(),
}));

const mockedGetAgentLog = vi.mocked(getAgentLog);
const mockedGetInspectionDetail = vi.mocked(getInspectionDetail);

function buildDetail(overrides: Partial<InspectionDetailResponse> = {}): InspectionDetailResponse {
  return {
    id: 'insp_001',
    book: { id: 'book_001', title: '싯다르타', isbn: null },
    status: 'APPROVED',
    mode: 'RETURN',
    finalGrade: 'MINT',
    isFastTrack: true,
    ubciScore: 100,
    finalReport: null,
    lpnBarcode: null,
    labelScanUrl: null,
    originalImageUrls: [],
    visionDetections: [],
    aiResult: { decision: null, reasonCode: null, defects: [], revisionCount: 0, repairDirective: null },
    hitl: {},
    hitlHistory: [],
    steps: [],
    inspectedAt: '2026-07-01T09:12:00.000Z',
    updatedAt: '2026-07-01T09:14:00.000Z',
    ...overrides,
  };
}

function buildRow(overrides: Partial<InspectionHistoryRow> = {}): InspectionHistoryRow {
  return {
    id: 'insp_001',
    bookId: 'book_001',
    bookTitle: '싯다르타',
    finalGrade: 'MINT',
    isFastTrack: true,
    status: 'APPROVED',
    ubciScore: 100,
    finalReport: 'Auto-refund 승인 및 UBCI 디지털 품질 보증서 발급',
    inspectedAt: '2026-07-01T09:12:00.000Z',
    updatedAt: '2026-07-01T09:14:00.000Z',
    steps: [],
    ...overrides,
  };
}

function renderDialog(row: InspectionHistoryRow | null) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const onClose = vi.fn();
  const view = render(
    <QueryClientProvider client={queryClient}>
      <InspectionHistoryDetailDialog row={row} onClose={onClose} />
    </QueryClientProvider>
  );
  return { ...view, queryClient, onClose };
}

describe('InspectionHistoryDetailDialog', () => {
  beforeEach(() => {
    mockedGetInspectionDetail.mockResolvedValue(buildDetail());
  });

  it('Agent 로그 조회가 실패해도 나머지 모달 내용은 정상적으로 유지된다', async () => {
    mockedGetAgentLog.mockRejectedValue(new Error('Not Found'));

    renderDialog(buildRow());

    expect(await screen.findByText('Agent 로그를 불러오는데 실패했습니다.')).toBeInTheDocument();
    // Agent 로그 실패 후에도 모달 정보 유지
    expect(screen.getByText('싯다르타')).toBeInTheDocument();
    expect(screen.getByText(/Auto-refund 승인/)).toBeInTheDocument();
  });

  it('실패했던 검수 건에서 다른 검수 건으로 전환하면 이전 에러 상태가 남지 않는다', async () => {
    mockedGetAgentLog.mockImplementation((inspectionId: string) =>
      inspectionId === 'insp_fail'
        ? Promise.reject(new Error('Not Found'))
        : Promise.resolve([
            {
              stepOrder: 1,
              agentName: 'Vision',
              executionStatus: 'COMPLETED',
              resultSummary: '결함 미발견',
            },
          ])
    );

    const { rerender, queryClient, onClose } = renderDialog(buildRow({ id: 'insp_fail' }));
    expect(await screen.findByText('Agent 로그를 불러오는데 실패했습니다.')).toBeInTheDocument();

    rerender(
      <QueryClientProvider client={queryClient}>
        <InspectionHistoryDetailDialog
          row={buildRow({ id: 'insp_ok', bookTitle: '다른 책' })}
          onClose={onClose}
        />
      </QueryClientProvider>
    );

    expect(await screen.findByText('Vision Agent')).toBeInTheDocument();
    expect(screen.queryByText('Agent 로그를 불러오는데 실패했습니다.')).not.toBeInTheDocument();
  });

  it('imageIndex가 일치하는 결함만 현재 사진 위에 오버레이 배지로 표시된다', async () => {
    mockedGetAgentLog.mockResolvedValue([]);
    mockedGetInspectionDetail.mockResolvedValue(
      buildDetail({
        originalImageUrls: ['https://example.com/front.jpg', 'https://example.com/back.jpg'],
        visionDetections: [
          {
            imageIndex: 0,
            imageView: 'FRONT',
            imageUrl: 'https://example.com/front.jpg',
            type: 'COVER_TEAR',
            defectType: 'COVER_TEAR',
            ratio: 15,
            confidence: 0.91,
            yoloConfidence: 0.84,
            bbox: [0.1, 0.1, 0.3, 0.3],
            coordinateSpace: 'ORIGINAL_IMAGE_NORMALIZED',
          },
        ],
      })
    );

    renderDialog(buildRow());

    const img = await screen.findByAltText('도서 촬영 사진 1');
    Object.defineProperty(img, 'naturalWidth', { value: 800, configurable: true });
    Object.defineProperty(img, 'naturalHeight', { value: 600, configurable: true });
    Object.defineProperty(img, 'offsetWidth', { value: 400, configurable: true });
    Object.defineProperty(img, 'offsetHeight', { value: 300, configurable: true });
    fireEvent.load(img);

    expect(await screen.findByText(/COVER_TEAR/)).toBeInTheDocument();

    fireEvent.click(screen.getByTitle('다음 사진'));

    expect(screen.queryByText(/COVER_TEAR/)).not.toBeInTheDocument();
  });
});
