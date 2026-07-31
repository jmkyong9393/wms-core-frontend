import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { RestockDecisionConfirmDialog } from './RestockDecisionConfirmDialog';
import { approveRestockProposal, rejectRestockProposal } from '@/features/restock/api/restockProposalService';

vi.mock('@/features/restock/api/restockProposalService', () => ({
  approveRestockProposal: vi.fn(),
  rejectRestockProposal: vi.fn(),
}));

function axiosErrorWithStatus(status: number) {
  return new AxiosError('failed', undefined, undefined, undefined, {
    status,
    data: { detail: 'error' },
    statusText: '',
    headers: {},
    // @ts-expect-error - config is not needed for this test
    config: {},
  });
}

function renderDialog(mode: 'approve' | 'reject', onClose = vi.fn()) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={queryClient}>
      <RestockDecisionConfirmDialog proposalId="p1" mode={mode} onClose={onClose} />
    </QueryClientProvider>
  );
  return { onClose };
}

describe('RestockDecisionConfirmDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('승인 성공 + APPROVED 응답이면 안내 문구를 보여주고 확인 클릭 시 onClose를 호출한다', async () => {
    vi.mocked(approveRestockProposal).mockResolvedValueOnce({
      proposalId: 'p1',
      status: 'APPROVED',
      autoPoOrderId: 'po-1',
      reviewedAt: '2026-07-29T07:33:20.161129',
      message: 'Restock 추천안을 승인하고 AUTO_PO 주문을 생성했습니다.',
    });
    const { onClose } = renderDialog('approve');

    fireEvent.click(screen.getByRole('button', { name: '승인' }));

    expect(await screen.findByText('승인되었습니다. 발주가 생성되었습니다.')).toBeInTheDocument();
    expect(screen.queryByText(/AUTO_PO/)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '확인' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('승인 성공 + NOT_REQUIRED 응답이면 발주 불필요 안내를 보여준다', async () => {
    vi.mocked(approveRestockProposal).mockResolvedValueOnce({
      proposalId: 'p1',
      status: 'NOT_REQUIRED',
      autoPoOrderId: null,
      reviewedAt: '2026-07-29T07:35:52.096972',
      message: '진행 중 AUTO_PO 수량에 반영된 결과 추가 발주가 필요하지 않습니다.',
    });
    renderDialog('approve');

    fireEvent.click(screen.getByRole('button', { name: '승인' }));

    expect(
      await screen.findByText('이미 진행 중인 발주 수량으로 충분해 추가 발주 없이 처리되었습니다.')
    ).toBeInTheDocument();
    expect(screen.queryByText(/AUTO_PO/)).not.toBeInTheDocument();
  });

  it('반려 성공 + REJECTED 응답이면 반려 안내를 보여준다', async () => {
    vi.mocked(rejectRestockProposal).mockResolvedValueOnce({
      proposalId: 'p1',
      status: 'REJECTED',
      autoPoOrderId: null,
      reviewedAt: '2026-07-29T07:34:04.230814',
      message: 'Restock 추천안을 반려했습니다.',
    });
    renderDialog('reject');

    fireEvent.click(screen.getByRole('button', { name: '반려' }));

    expect(await screen.findByText('반려되었습니다.')).toBeInTheDocument();
    expect(screen.queryByText(/AUTO_PO/)).not.toBeInTheDocument();
  });

  it('실패하면 인라인 에러만 표시하고 결과 안내 화면으로 전환되지 않는다', async () => {
    vi.mocked(approveRestockProposal).mockRejectedValueOnce(axiosErrorWithStatus(409));
    renderDialog('approve');

    fireEvent.click(screen.getByRole('button', { name: '승인' }));

    expect(await screen.findByText('이미 처리된 추천안입니다. 최신 상태를 반영했습니다.')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '확인' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: '취소' })).toBeInTheDocument();
  });
});
