import { apiClient } from '@/lib/api-client';
import {
  NOTIFICATION_LIST_ENDPOINT,
  NOTIFICATION_READ_ALL_ENDPOINT,
  NOTIFICATION_STREAM_TICKET_ENDPOINT,
  NOTIFICATION_LIST_LIMIT,
  notificationReadEndpoint,
} from '@/features/notifications/constants/notificationApi';
import type {
  NotificationItem,
  NotificationListResult,
  NotificationStreamTicket,
} from '@/features/notifications/types/notification';

interface NotificationListApiResponse {
  items: NotificationItem[];
  unread_count: number;
}

interface NotificationStreamTicketApiResponse {
  ticket: string;
  expires_in: number;
}

// 알림 목록 조회
export async function listNotifications(
  limit: number = NOTIFICATION_LIST_LIMIT
): Promise<NotificationListResult> {
  const res = await apiClient.get<NotificationListApiResponse>(NOTIFICATION_LIST_ENDPOINT, {
    params: { limit },
  });
  return { items: res.data.items, unreadCount: res.data.unread_count };
}

// 개별 알림 읽음 처리
export async function markNotificationReadApi(id: string): Promise<void> {
  await apiClient.patch(notificationReadEndpoint(id));
}

// 전체 알림 읽음 처리
export async function markAllNotificationsReadApi(): Promise<void> {
  await apiClient.patch(NOTIFICATION_READ_ALL_ENDPOINT);
}

// SSE 연결용 단기 티켓 발급
export async function issueNotificationStreamTicket(): Promise<NotificationStreamTicket> {
  const res = await apiClient.post<NotificationStreamTicketApiResponse>(
    NOTIFICATION_STREAM_TICKET_ENDPOINT
  );
  return { ticket: res.data.ticket, expiresIn: res.data.expires_in };
}
