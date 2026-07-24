export type NotificationType = 'AGENT_ALERT' | 'FDS_ALERT' | 'RESTOCK_ALERT';
export type NotificationSeverity = 'CRITICAL' | 'WARNING' | 'INFO';

export interface NotificationItem {
  id: string;
  type: NotificationType;
  severity: NotificationSeverity;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

// 새 알림 생성 시 필요한 입력값
export type NotificationInput = Omit<NotificationItem, 'id' | 'timestamp' | 'read'>;
