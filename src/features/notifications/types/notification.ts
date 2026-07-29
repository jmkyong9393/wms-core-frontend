export type NotificationCategory = 'AGENT_ALERT' | 'FDS_ALERT' | 'RESTOCK_ALERT';
export type NotificationSeverity = 'HIGH' | 'MEDIUM' | 'LOW';

// 알림 데이터
export interface NotificationItem {
  id: string;
  category: NotificationCategory;
  severity: NotificationSeverity;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

// Mock 알림 생성용 데이터
export type NotificationInput = Omit<NotificationItem, 'id' | 'timestamp' | 'read'>;

// 알림 목록 조회 결과
export interface NotificationListResult {
  items: NotificationItem[];
  unreadCount: number;
}

// SSE 연결 티켓 발급 결과
export interface NotificationStreamTicket {
  ticket: string;
  expiresIn: number;
}
