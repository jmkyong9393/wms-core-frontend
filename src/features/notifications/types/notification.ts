import type { RiskLevel } from '@/features/restock/types/restockProposal';

export type NotificationCategory = 'AGENT_ALERT' | 'FDS_ALERT' | 'RESTOCK_ALERT';
export type NotificationSeverity = 'HIGH' | 'MEDIUM' | 'LOW';

// 프론트에서 사용하는 발주 추천 알림 데이터
export interface RestockAlertPayload {
  orderProposalId: string;
  returnJobId: string;
  bookId: string;
  recommendedOrderQuantity: number;
  riskLevel: RiskLevel;
}

// 백엔드 SSE에서 전달하는 발주 추천 알림 데이터
export interface RestockAlertPayloadWire {
  order_proposal_id: string;
  return_job_id: string;
  book_id: string;
  recommended_order_quantity: number;
  risk_level: RiskLevel;
}

// 화면에서 사용하는 알림 정보
export interface NotificationItem {
  id: string;
  category: NotificationCategory;
  severity: NotificationSeverity;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  // 발주 추천 알림의 상세 이동 정보
  payload?: RestockAlertPayload;
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
