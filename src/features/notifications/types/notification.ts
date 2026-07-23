export type NotificationCategory = 'FDS' | 'AGENT_ANOMALY';
export type NotificationSeverity = 'CRITICAL' | 'WARNING' | 'INFO';

export interface NotificationItem {
  id: string;
  category: NotificationCategory;
  severity: NotificationSeverity;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

// 새 알림 생성 시 필요한 입력값
export type NotificationInput = Omit<NotificationItem, 'id' | 'timestamp' | 'read'>;
