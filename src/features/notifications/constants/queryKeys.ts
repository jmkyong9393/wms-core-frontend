// 알림 읽음 처리 mutation key factory
export const notificationKeys = {
  markRead: ['notifications', 'markRead'] as const,
  markAllRead: ['notifications', 'markAllRead'] as const,
};
