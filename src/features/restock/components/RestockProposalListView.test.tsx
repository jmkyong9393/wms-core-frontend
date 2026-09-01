import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RestockProposalListView } from './RestockProposalListView';
import { listRestockProposals, getRestockProposal } from '@/features/restock/api/restockProposalService';
import type { RestockProposalListItem } from '@/features/restock/types/restockProposal';

const mockReplace = vi.fn();

// 테스트 시점에 값을 바꿔 URL 변경을 시뮬레이션할 수 있도록 let으로 선언
let mockSearchParams = new URLSearchParams();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mockReplace, push: vi.fn() }),
  usePathname: () => '/admin/restock',
  useSearchParams: () => mockSearchParams,
}));

vi.mock('@/features/restock/api/restockProposalService', () => ({
  listRestockProposals: vi.fn(),
  getRestockProposal: vi.fn(),
}));

// RestockProposalDetailDialog가 렌더링하는 AgentLogSection이 실제 apiClient를 타지 않도록 mock
vi.mock('@/features/inspections/api/agentLogService', () => ({
  getAgentLog: vi.fn(),
}));

function buildItem(overrides: Partial<RestockProposalListItem> = {}): RestockProposalListItem {
  return {
    id: 'p1',
    book: { id: 'b1', title: '테스트 도서', isbn: '9790000000999', publisher: null, coverImageUrl: null },
    status: 'PENDING',
    proposalSource: 'RETURN_REJECTION',
    recommendedOrderQuantity: 4,
    riskLevel: 'MEDIUM',
    recentSalesQuantity: 10,
    currentStock: 0,
    pendingAutoPoQuantity: 7,
    rejectedQuantity: 1,
    createdAt: '2026-07-29T07:07:09.750113',
    reviewedAt: null,
    ...overrides,
  };
}

function renderView() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <RestockProposalListView />
    </QueryClientProvider>
  );
}

describe('RestockProposalListView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParams = new URLSearchParams();
    vi.mocked(getRestockProposal).mockResolvedValue(
      // 모달 로딩 상태만 확인하는 테스트에서는 상세 내용이 중요하지 않음
      undefined as never
    );
  });

  it('출판사를 도서 정보에 표시한다', async () => {
    vi.mocked(listRestockProposals).mockResolvedValueOnce([
      buildItem({
        id: 'p1',
        book: { id: 'b1', title: '테스트 도서', isbn: '9790000000999', publisher: '테스트출판사', coverImageUrl: null },
        createdAt: '2026-07-29T07:07:09.750113',
        reviewedAt: '2026-08-02T07:33:20.161129',
      }),
    ]);

    renderView();

    expect(await screen.findByText(/테스트출판사/)).toBeInTheDocument();
  });

  it('출판사가 없으면 -로 표시한다', async () => {
    vi.mocked(listRestockProposals).mockResolvedValueOnce([
      buildItem({ id: 'p1', book: { id: 'b1', title: '테스트 도서', isbn: '9790000000999', publisher: null, coverImageUrl: null } }),
    ]);

    renderView();

    expect(await screen.findByText(/9790000000999 · -/)).toBeInTheDocument();
  });

  it('행을 클릭하면 router.replace를 proposalId 쿼리 파라미터와 함께 호출한다', async () => {
    vi.mocked(listRestockProposals).mockResolvedValueOnce([buildItem({ id: 'p1' })]);

    renderView();

    const detailButton = await screen.findByRole('button', { name: '상세보기' });
    fireEvent.click(detailButton);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/admin/restock?proposalId=p1', { scroll: false });
    });
  });

  it('모달을 닫으면 router.replace로 proposalId 쿼리 파라미터를 제거한다', async () => {
    mockSearchParams = new URLSearchParams('proposalId=p1');
    vi.mocked(listRestockProposals).mockResolvedValueOnce([buildItem({ id: 'p1' })]);

    renderView();

    const closeButton = await screen.findByRole('button', { name: 'Close' });
    fireEvent.click(closeButton);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/admin/restock', { scroll: false });
    });
  });

  it('URL의 proposalId가 바뀌면 상세 조회 대상도 함께 바뀐다', async () => {
    vi.mocked(listRestockProposals).mockResolvedValue([buildItem({ id: 'p1' })]);

    mockSearchParams = new URLSearchParams('proposalId=p1');
    const { rerender } = renderView();

    await waitFor(() => {
      expect(getRestockProposal).toHaveBeenCalledWith('p1');
    });

    mockSearchParams = new URLSearchParams('proposalId=p2');
    rerender(
      <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
        <RestockProposalListView />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(getRestockProposal).toHaveBeenCalledWith('p2');
    });
  });
});
