import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { InspectionHistoryDetailDialog } from '@/features/inspections/components/InspectionHistoryDetailDialog';
import type { InspectionHistoryRow } from '@/features/inspections/types/inspectionHistory';
import { getAgentLog } from '@/features/inspections/api/agentLogService';

vi.mock('@/features/inspections/api/agentLogService', () => ({
  getAgentLog: vi.fn(),
}));

const mockedGetAgentLog = vi.mocked(getAgentLog);

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
});
