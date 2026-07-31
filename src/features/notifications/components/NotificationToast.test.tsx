import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createStore, Provider as JotaiProvider } from 'jotai';
import { NotificationToast } from './NotificationToast';
import { activeToastsAtom } from '@/features/notifications/store/notificationAtoms';
import { markNotificationReadApi } from '@/features/notifications/api/notificationService';
import type { NotificationItem } from '@/features/notifications/types/notification';

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

vi.mock('@/features/notifications/api/notificationService', () => ({
  markNotificationReadApi: vi.fn(),
  markAllNotificationsReadApi: vi.fn(),
}));

const restockItem: NotificationItem = {
  id: 'restock-1',
  category: 'RESTOCK_ALERT',
  severity: 'HIGH',
  title: '대체 발주 추천 생성',
  message: "'테스트 도서' 반려 건에 대한 대체 발주 추천안이 생성되었습니다.",
  timestamp: '2026-07-29T05:34:17.370201',
  read: false,
  payload: {
    orderProposalId: 'proposal-1',
    returnJobId: 'return-1',
    bookId: 'book-1',
    recommendedOrderQuantity: 11,
    riskLevel: 'HIGH',
  },
};

const fdsItem: NotificationItem = {
  id: 'fds-1',
  category: 'FDS_ALERT',
  severity: 'MEDIUM',
  title: '이상거래 탐지',
  message: '이상거래가 탐지되었습니다.',
  timestamp: '2026-07-29T05:00:00.000000',
  read: false,
};

function renderToast(item: NotificationItem) {
  const store = createStore();
  store.set(activeToastsAtom, [item]);
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={queryClient}>
      <JotaiProvider store={store}>
        <NotificationToast item={item} />
      </JotaiProvider>
    </QueryClientProvider>
  );
  return { store };
}

describe('NotificationToast', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(markNotificationReadApi).mockResolvedValue(undefined);
  });

  it('RESTOCK_ALERT + payload가 있으면 추천 수량/위험도 배지와 바로 보기·닫기 버튼을 보여준다', () => {
    renderToast(restockItem);

    expect(screen.getByText('추천 11권')).toBeInTheDocument();
    expect(screen.getByText(/위험도 높음/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '바로 보기' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '닫기' })).toBeInTheDocument();
  });

  it('바로 보기를 클릭하면 읽음 처리·토스트 닫기·이동이 모두 일어난다', async () => {
    const { store } = renderToast(restockItem);

    fireEvent.click(screen.getByRole('button', { name: '바로 보기' }));

    expect(mockPush).toHaveBeenCalledWith('/admin/restock?proposalId=proposal-1');
    expect(store.get(activeToastsAtom)).toHaveLength(0);
    await waitFor(() => {
      expect(markNotificationReadApi).toHaveBeenCalledWith('restock-1');
    });
  });

  it('닫기 버튼을 클릭하면 토스트만 닫히고 이동/읽음 처리는 일어나지 않는다', () => {
    const { store } = renderToast(restockItem);

    fireEvent.click(screen.getByRole('button', { name: '닫기' }));

    expect(store.get(activeToastsAtom)).toHaveLength(0);
    expect(mockPush).not.toHaveBeenCalled();
    expect(markNotificationReadApi).not.toHaveBeenCalled();
  });

  it('RESTOCK_ALERT가 아니면 기존처럼 제목/메시지만 있는 단순 토스트를 보여준다', () => {
    renderToast(fdsItem);

    expect(screen.getByText('이상거래 탐지')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '바로 보기' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '닫기' })).not.toBeInTheDocument();
  });
});
