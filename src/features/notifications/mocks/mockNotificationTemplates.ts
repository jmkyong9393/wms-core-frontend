// 개발·테스트용 Mock 알림 목록
// wms_mock_mode가 true일 때만 사용
import type { NotificationInput } from '@/features/notifications/types/notification';

export const mockNotificationTemplates: NotificationInput[] = [
  {
    category: 'FDS_ALERT',
    severity: 'HIGH',
    title: 'FDS 이상거래 적발 (위험점수 92점)',
    message: '동일 결제수단으로 단시간 다중 반품 시도가 감지되었습니다.',
  },
  {
    category: 'FDS_ALERT',
    severity: 'MEDIUM',
    title: 'FDS 이상거래 적발 (위험점수 61점)',
    message: '비정상적인 야간 대량 주문 패턴이 감지되었습니다.',
  },
  {
    category: 'FDS_ALERT',
    severity: 'LOW',
    title: 'FDS 이상거래 적발 (위험점수 35점)',
    message: '신규 고객의 첫 거래 금액이 평균보다 높게 감지되었습니다.',
  },
  {
    category: 'AGENT_ALERT',
    severity: 'HIGH',
    title: '품질 검증 오류',
    message: 'Critic 에이전트가 검수 파이프라인에서 처리 불가능한 오류를 반환했습니다.',
  },
  {
    category: 'AGENT_ALERT',
    severity: 'MEDIUM',
    title: 'Vision 신뢰도 낮음',
    message: '도서 상태 판정 신뢰도가 임계치보다 낮아 관리자 확인이 권장됩니다.',
  },
  {
    category: 'AGENT_ALERT',
    severity: 'MEDIUM',
    title: 'Vision 판정 결과 충돌',
    message: '외관과 내지 판정 결과가 서로 다르게 감지되었습니다.',
  },
  {
    category: 'AGENT_ALERT',
    severity: 'LOW',
    title: '정책상 관리자 검토 필요',
    message: 'Policy 에이전트가 자동 처리 대신 관리자 검토를 요청했습니다.',
  },
  {
    category: 'RESTOCK_ALERT',
    severity: 'MEDIUM',
    title: '대체 발주 추천 생성',
    message: "'클린 코드' 반려 건에 대한 대체 발주 추천안이 생성되었습니다. 추천 수량: 6권",
    payload: {
      orderProposalId: 'mock-proposal-1',
      returnJobId: 'mock-return-1',
      bookId: 'mock-book-1',
      recommendedOrderQuantity: 6,
      riskLevel: 'MEDIUM',
    },
  },
];
