import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RestockProposalDetailDialog } from './RestockProposalDetailDialog';
import { getRestockProposal } from '@/features/restock/api/restockProposalService';
import { getAgentLog } from '@/features/inspections/api/agentLogService';
import type { RestockProposalDetail } from '@/features/restock/types/restockProposal';

vi.mock('@/features/restock/api/restockProposalService', () => ({
  getRestockProposal: vi.fn(),
}));

vi.mock('@/features/inspections/api/agentLogService', () => ({
  getAgentLog: vi.fn(),
}));

const mockedGetAgentLog = vi.mocked(getAgentLog);

function buildDetail(overrides: Partial<RestockProposalDetail> = {}): RestockProposalDetail {
  return {
    id: 'p1',
    book: {
      id: 'b1',
      title: '테스트 도서',
      isbn: '9790000000999',
      publisher: null,
      coverImageUrl: null,
    },
    returnJobId: 'r1',
    proposalSource: 'RETURN_REJECTION',
    status: 'PENDING',
    recentSalesQuantity: 10,
    currentStock: 0,
    pendingAutoPoQuantity: 0,
    rejectedQuantity: 1,
    rejectionReasonCode: 'DMG_EXT_WET',
    recommendedOrderQuantity: 11,
    reasonSummary: '추천 발주 수량은 11권으로, 최근 판매량 10권과 반려 수량 1권을 반영했습니다.',
    evidence: ['최근 판매량: 10권', '현재 창고 가용 재고: 0권'],
    riskLevel: 'HIGH',
    autoPoOrderId: null,
    reviewerId: null,
    reviewerEmployeeId: null,
    reviewedAt: null,
    reviewComment: null,
    createdAt: '2026-07-29T05:34:17.347728',
    updatedAt: '2026-07-29T05:34:17.347743',
    ...overrides,
  };
}

function renderDialog(proposalId: string | null) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const onClose = vi.fn();
  const view = render(
    <QueryClientProvider client={queryClient}>
      <RestockProposalDetailDialog proposalId={proposalId} onClose={onClose} />
    </QueryClientProvider>
  );
  return { ...view, onClose };
}

describe('RestockProposalDetailDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedGetAgentLog.mockResolvedValue([]);
  });

  it('PENDING 상태에서는 승인/반려 버튼을 노출한다', async () => {
    vi.mocked(getRestockProposal).mockResolvedValueOnce(buildDetail({ status: 'PENDING' }));

    renderDialog('p1');

    expect(await screen.findByRole('button', { name: /승인/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /반려/ })).toBeInTheDocument();
  });

  it('APPROVED 상태에서는 승인 완료 안내와 autoPoOrderId를 표시하고 버튼은 숨긴다', async () => {
    vi.mocked(getRestockProposal).mockResolvedValueOnce(
      buildDetail({ status: 'APPROVED', autoPoOrderId: 'po-123' })
    );

    renderDialog('p1');

    expect(await screen.findByText(/생성된 발주 번호/)).toBeInTheDocument();
    expect(screen.getByText(/po-123/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '✓ 승인' })).not.toBeInTheDocument();
  });

  it('REJECTED 상태에서는 반려 안내와 코멘트를 표시한다', async () => {
    vi.mocked(getRestockProposal).mockResolvedValueOnce(
      buildDetail({
        status: 'REJECTED',
        reviewComment: '현재 재고로 충분함',
        reviewedAt: '2026-07-29T07:34:04.230814',
        reviewerEmployeeId: 'W0001',
      })
    );

    renderDialog('p1');

    expect(await screen.findByText('반려된 추천안입니다.')).toBeInTheDocument();
    expect(screen.getByText(/현재 재고로 충분함/)).toBeInTheDocument();
  });

  it('검토가 이뤄진 건(reviewedAt 존재)은 상태와 무관하게 검토자·검토 시각을 공통 섹션에 표시한다', async () => {
    vi.mocked(getRestockProposal).mockResolvedValueOnce(
      buildDetail({
        status: 'APPROVED',
        autoPoOrderId: 'po-123',
        reviewerEmployeeId: 'W0002',
        reviewedAt: '2026-07-29T07:33:20.161129',
      })
    );

    renderDialog('p1');

    expect(await screen.findByText('검토 이력')).toBeInTheDocument();
    expect(screen.getByText(/검토자: W0002/)).toBeInTheDocument();
    expect(screen.getByText(/검토 시각: 2026-07-29/)).toBeInTheDocument();
  });

  it('아직 검토되지 않은(reviewedAt이 null인) PENDING 건에는 검토 이력 섹션을 표시하지 않는다', async () => {
    vi.mocked(getRestockProposal).mockResolvedValueOnce(buildDetail({ status: 'PENDING', reviewedAt: null }));

    renderDialog('p1');

    await screen.findByRole('button', { name: /승인/ });
    expect(screen.queryByText('검토 이력')).not.toBeInTheDocument();
  });

  it('NOT_REQUIRED 상태에서는 안내 문구만 표시하고 버튼은 숨긴다', async () => {
    vi.mocked(getRestockProposal).mockResolvedValueOnce(buildDetail({ status: 'NOT_REQUIRED' }));

    renderDialog('p1');

    expect(await screen.findByText(/추가 발주가 필요하지 않습니다/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '✓ 승인' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '✕ 반려' })).not.toBeInTheDocument();
  });

  it('returnJobId가 있으면(반려 대체 발주) 관련 검수 Agent 로그 섹션을 표시한다', async () => {
    mockedGetAgentLog.mockResolvedValueOnce([
      {
        stepOrder: 1,
        agentName: 'Vision',
        executionStatus: 'COMPLETED',
        resultSummary: '표지 파손 탐지',
      },
    ]);
    vi.mocked(getRestockProposal).mockResolvedValueOnce(buildDetail({ returnJobId: 'r1' }));

    renderDialog('p1');

    expect(await screen.findByText('관련 검수 Agent 로그')).toBeInTheDocument();
    expect(await screen.findByText('Vision Agent')).toBeInTheDocument();
    expect(getAgentLog).toHaveBeenCalledWith('r1');
  });

  it('returnJobId가 없으면(안전재고 부족) 관련 검수 Agent 로그 섹션을 표시하지 않는다', async () => {
    vi.mocked(getRestockProposal).mockResolvedValueOnce(
      buildDetail({ returnJobId: null, proposalSource: 'SAFETY_STOCK' })
    );

    renderDialog('p1');

    await screen.findByRole('button', { name: /승인/ });
    expect(screen.queryByText('관련 검수 Agent 로그')).not.toBeInTheDocument();
    expect(getAgentLog).not.toHaveBeenCalled();
  });

  it('proposalId가 null이면 모달 내용을 조회하지 않는다', () => {
    renderDialog(null);

    expect(getRestockProposal).not.toHaveBeenCalled();
  });
});
