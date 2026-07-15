import type { HitlQueueItem } from '@/features/queue/store/queueAtoms';

// 관리자 검토 대기 화면에서 사용할 임시 데이터
export const mockHitlQueueSeed: HitlQueueItem[] = [
  {
    id: 'hitl_001',
    isbn: '9788966262281',
    title: '코스모스',
    ubciScore: 62,
    status: 'AWAITING_REVIEW',
    agentLogs: [
      { agent: 'Vision', message: '표지 우측 하단 모서리 마모 1건, 내지 얼룩 1건 탐지 (BBox 2건)' },
      { agent: 'Policy', message: 'UBCI 감점 38점 산출 (표지 손상 -20점, 내지 얼룩 -18점)' },
      { agent: 'Critic', message: '탐지 위치와 감점 근거가 일치하나, 신뢰도 62%로 임계치 미달' },
      { agent: 'Report', message: '신뢰도 미달로 관리자 수동 검토 요청 (HITL_REQUIRED)' },
    ],
    finalReport: '자동 판정 신뢰도 미달로 관리자 확인이 필요합니다.',
  },
  {
    id: 'hitl_002',
    isbn: '9791162244584',
    title: '포켓몬 생태도감',
    ubciScore: 55,
    status: 'AWAITING_REVIEW',
    agentLogs: [
      { agent: 'Vision', message: '내지 다수 페이지에 낙서 흔적 3건 탐지 (BBox 3건)' },
      { agent: 'Policy', message: 'UBCI 감점 45점 산출 (아동 도서 낙서 가중치 적용)' },
      { agent: 'Critic', message: '낙서 범위 판단이 페이지마다 상이하여 교차 검증 보류' },
      { agent: 'Report', message: '판정 근거 상충으로 관리자 수동 검토 요청 (HITL_REQUIRED)' },
    ],
    finalReport: '에이전트 간 판정 근거가 상충하여 관리자 확인이 필요합니다.',
  },
  {
    id: 'hitl_003',
    isbn: '9788994492032',
    title: '니체의 초월자',
    ubciScore: 48,
    status: 'AWAITING_REVIEW',
    agentLogs: [
      { agent: 'Vision', message: '표지 파손 및 내지 물얼룩 다수 탐지 (BBox 6건)' },
      { agent: 'Policy', message: 'UBCI 감점 52점 산출, 매입 기준 하한 근접' },
      { agent: 'Critic', message: '물얼룩 확산 범위 추정치가 Vision 결과와 8% 오차' },
      { agent: 'Report', message: '경계선상 점수로 자동 반려 대신 관리자 수동 검토 요청' },
    ],
    finalReport: '매입 기준 경계선상 점수로 관리자 확인이 필요합니다.',
  },
];