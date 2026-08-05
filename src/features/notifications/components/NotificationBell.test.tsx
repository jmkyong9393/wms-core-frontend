import type { ReactNode } from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createStore, Provider as JotaiProvider } from 'jotai';
import { NotificationBell } from './NotificationBell';
import {
  notificationsAtom,
  unreadNotificationCountAtom,
} from '@/features/notifications/store/notificationAtoms';
import type { NotificationItem } from '@/features/notifications/types/notification';
import {
  markNotificationReadApi,
  markAllNotificationsReadApi,
} from '@/features/notifications/api/notificationService';

vi.mock('@/features/notifications/api/notificationService', () => ({
  markNotificationReadApi: vi.fn(),
  markAllNotificationsReadApi: vi.fn(),
}));

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

const restockItemWithPayload: NotificationItem = {
  id: 'n3',
  category: 'RESTOCK_ALERT',
  severity: 'HIGH',
  title: '대체 발주 추천 생성',
  message: "'테스트 도서' 반려 건에 대한 대체 발주 추천안이 생성되었습니다.",
  timestamp: '2026-07-28T04:29:44.850691',
  read: false,
  payload: {
    orderProposalId: 'proposal-1',
    returnJobId: 'return-1',
    bookId: 'book-1',
    proposalSource: 'RETURN_REJECTION',
    recommendedOrderQuantity: 11,
    riskLevel: 'HIGH',
  },
};

const items: NotificationItem[] = [
  {
    id: 'n1',
    category: 'FDS_ALERT',
    severity: 'HIGH',
    title: 'FDS 이상거래 적발',
    message: '위험점수 92점',
    timestamp: '2026-07-28T04:29:44.850691',
    read: false,
  },
  {
    id: 'n2',
    category: 'RESTOCK_ALERT',
    severity: 'LOW',
    title: '자동발주 초안 생성 필요',
    message: '재고 부족',
    timestamp: '2026-07-28T04:29:44.850691',
    read: true,
  },
];

function renderBell(initialItems: NotificationItem[] = items) {
  const store = createStore();
  store.set(notificationsAtom, initialItems);
  store.set(unreadNotificationCountAtom, initialItems.filter((n) => !n.read).length);
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <JotaiProvider store={store}>{children}</JotaiProvider>
    </QueryClientProvider>
  );

  render(<NotificationBell />, { wrapper });
  return { store };
}

describe('NotificationBell', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('clicking a RESTOCK_ALERT item with a payload marks it read once and navigates once to its proposal detail', async () => {
    vi.mocked(markNotificationReadApi).mockResolvedValueOnce(undefined);
    renderBell([restockItemWithPayload]);

    fireEvent.click(screen.getByLabelText('알림'));
    fireEvent.click(screen.getByText('대체 발주 추천 생성'));

    await waitFor(() => {
      expect(markNotificationReadApi).toHaveBeenCalledTimes(1);
      expect(markNotificationReadApi).toHaveBeenCalledWith('n3');
    });
    expect(mockPush).toHaveBeenCalledTimes(1);
    expect(mockPush).toHaveBeenCalledWith('/admin/restock?proposalId=proposal-1');
  });

  it('clicking a RESTOCK_ALERT item without a payload only marks it read and does not navigate', async () => {
    vi.mocked(markNotificationReadApi).mockResolvedValueOnce(undefined);
    // items[1] (n2)은 RESTOCK_ALERT지만 payload가 없는 케이스
    renderBell(items);

    fireEvent.click(screen.getByLabelText('알림'));
    fireEvent.click(screen.getByText('자동발주 초안 생성 필요'));

    await waitFor(() => {
      expect(markNotificationReadApi).toHaveBeenCalledWith('n2');
    });
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('clicking a non-RESTOCK_ALERT item never navigates', async () => {
    vi.mocked(markNotificationReadApi).mockResolvedValueOnce(undefined);
    renderBell(items);

    fireEvent.click(screen.getByLabelText('알림'));
    fireEvent.click(screen.getByText('FDS 이상거래 적발'));

    await waitFor(() => {
      expect(markNotificationReadApi).toHaveBeenCalledWith('n1');
    });
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('shows the unread count badge and renders category labels once opened', () => {
    renderBell();

    expect(screen.getByText('1')).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText('알림'));

    expect(screen.getByText('FDS 이상거래')).toBeInTheDocument();
    expect(screen.getByText('자동발주 알림')).toBeInTheDocument();
    expect(screen.getByText('FDS 이상거래 적발')).toBeInTheDocument();
  });

  it('shows a proposalSource badge for a RESTOCK_ALERT item that has one', () => {
    renderBell([restockItemWithPayload]);

    fireEvent.click(screen.getByLabelText('알림'));

    expect(screen.getByText('반려 대체 발주')).toBeInTheDocument();
  });

  it('shows the empty state when there are no notifications', () => {
    renderBell([]);

    fireEvent.click(screen.getByLabelText('알림'));

    expect(screen.getByText('새로운 알림이 없습니다')).toBeInTheDocument();
  });

  it('calls the mark-read API and updates read state when an item is clicked', async () => {
    vi.mocked(markNotificationReadApi).mockResolvedValueOnce(undefined);
    const { store } = renderBell();

    fireEvent.click(screen.getByLabelText('알림'));
    fireEvent.click(screen.getByText('FDS 이상거래 적발'));

    await waitFor(() => {
      expect(markNotificationReadApi).toHaveBeenCalledWith('n1');
    });
    await waitFor(() => {
      expect(store.get(notificationsAtom).find((n) => n.id === 'n1')?.read).toBe(true);
    });
    expect(store.get(unreadNotificationCountAtom)).toBe(0);
  });

  it('calls the mark-all-read API and marks every item read when clicking "모두 읽음"', async () => {
    vi.mocked(markAllNotificationsReadApi).mockResolvedValueOnce(undefined);
    const { store } = renderBell();

    fireEvent.click(screen.getByLabelText('알림'));
    fireEvent.click(screen.getByText('모두 읽음'));

    await waitFor(() => {
      expect(markAllNotificationsReadApi).toHaveBeenCalledTimes(1);
    });
    await waitFor(() => {
      expect(store.get(notificationsAtom).every((n) => n.read)).toBe(true);
    });
    expect(store.get(unreadNotificationCountAtom)).toBe(0);
  });
});
