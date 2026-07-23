// FDS·에이전트 정보를 참고한 Mock 알림 예시
// TODO(backend): 실제 SSE 명세 확정 후 데이터 구조와 분류 기준 수정
import type { NotificationInput } from '@/features/notifications/types/notification';

export const mockNotificationTemplates: NotificationInput[] = [
  {
    category: 'FDS',
    severity: 'CRITICAL',
    title: 'FDS 이상거래 적발 (위험점수 92점)',
    message: '동일 결제수단으로 단시간 다중 반품 시도가 감지되었습니다.',
  },
  {
    category: 'FDS',
    severity: 'WARNING',
    title: 'FDS 이상거래 적발 (위험점수 61점)',
    message: '비정상적인 야간 대량 주문 패턴이 감지되었습니다.',
  },
  {
    category: 'FDS',
    severity: 'INFO',
    title: 'FDS 이상거래 적발 (위험점수 35점)',
    message: '신규 고객의 첫 거래 금액이 평균보다 높게 감지되었습니다.',
  },
  {
    category: 'AGENT_ANOMALY',
    severity: 'CRITICAL',
    title: '품질 검증 오류',
    message: 'Critic 에이전트가 검수 파이프라인에서 처리 불가능한 오류를 반환했습니다.',
  },
  {
    category: 'AGENT_ANOMALY',
    severity: 'WARNING',
    title: 'Vision 신뢰도 낮음',
    message: '도서 상태 판정 신뢰도가 임계치보다 낮아 관리자 확인이 권장됩니다.',
  },
  {
    category: 'AGENT_ANOMALY',
    severity: 'WARNING',
    title: 'Vision 판정 결과 충돌',
    message: '외관과 내지 판정 결과가 서로 다르게 감지되었습니다.',
  },
  {
    category: 'AGENT_ANOMALY',
    severity: 'INFO',
    title: '정책상 관리자 검토 필요',
    message: 'Policy 에이전트가 자동 처리 대신 관리자 검토를 요청했습니다.',
  },
];
