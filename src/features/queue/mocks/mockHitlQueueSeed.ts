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
  {
    id: 'hitl_004',
    isbn: '9788936434267',
    title: '아몬드',
    ubciScore: 71,
    status: 'AWAITING_REVIEW',
    agentLogs: [
      {
        agent: 'Vision',
        message: '표지 모서리 눌림 2건과 미세한 마모 흔적 탐지 (BBox 3건)',
      },
      {
        agent: 'Policy',
        message: 'UBCI 감점 29점 산출 (모서리 눌림 -17점, 표지 마모 -12점)',
      },
      {
        agent: 'Critic',
        message: '모서리 눌림이 판매 등급에 영향을 줄 수 있어 추가 확인 필요',
      },
      {
        agent: 'Report',
        message: '판매 가능 등급 확정을 위해 관리자 수동 검토 요청 (HITL_REQUIRED)',
      },
    ],
    finalReport: '표지 모서리 손상의 정도를 확인한 후 승인 여부를 결정해야 합니다.',
  },
  {
    id: 'hitl_005',
    isbn: '9791161571188',
    title: '불편한 편의점',
    ubciScore: 68,
    status: 'AWAITING_REVIEW',
    agentLogs: [
      {
        agent: 'Vision',
        message: '책등 접힘 1건과 표지 오염 흔적 2건 탐지 (BBox 3건)',
      },
      {
        agent: 'Policy',
        message: 'UBCI 감점 32점 산출 (책등 접힘 -14점, 표지 오염 -18점)',
      },
      {
        agent: 'Critic',
        message: '표지 오염이 단순 먼지인지 실제 얼룩인지 구분이 어려움',
      },
      {
        agent: 'Report',
        message: '오염 여부 확인을 위해 관리자 수동 검토 요청 (HITL_REQUIRED)',
      },
    ],
    finalReport: '표지 오염이 제거 가능한 수준인지 관리자 확인이 필요합니다.',
  },
  {
    id: 'hitl_006',
    isbn: '9788949120533',
    title: '데미안',
    ubciScore: 43,
    status: 'AWAITING_REVIEW',
    agentLogs: [
      {
        agent: 'Vision',
        message: '표지 찢김, 책등 벌어짐, 내지 낙서 흔적 탐지 (BBox 5건)',
      },
      {
        agent: 'Policy',
        message: 'UBCI 감점 57점 산출, 재판매 불가 기준에 근접',
      },
      {
        agent: 'Critic',
        message: '책등 벌어짐이 단순 사용 흔적인지 파손인지 추가 확인 필요',
      },
      {
        agent: 'Report',
        message: '반려 기준 경계 구간으로 관리자 수동 검토 요청 (HITL_REQUIRED)',
      },
    ],
    finalReport: '책등 손상의 심각도를 확인한 후 반려 여부를 결정해야 합니다.',
  },
  {
    id: 'hitl_007',
    isbn: '9788954681152',
    title: '미드나잇 라이브러리',
    ubciScore: 67,
    status: 'AWAITING_REVIEW',
    agentLogs: [
      {
        agent: 'Vision',
        message: '표지 눌림 2건과 페이지 접힘 1건 탐지 (BBox 3건)',
      },
      {
        agent: 'Policy',
        message: 'UBCI 감점 33점 산출, 판매 가능 여부 경계 구간',
      },
      {
        agent: 'Critic',
        message: '페이지 접힘 범위가 작아 감점 수준을 다시 확인할 필요가 있음',
      },
      {
        agent: 'Report',
        message: '등급 판단 경계 구간으로 관리자 수동 검토 요청 (HITL_REQUIRED)',
      },
    ],
    finalReport: '페이지 접힘의 범위를 확인한 후 판매 등급을 결정해야 합니다.',
  },
  {
    id: 'hitl_008',
    isbn: '9788954682159',
    title: '파친코',
    ubciScore: 74,
    status: 'AWAITING_REVIEW',
    agentLogs: [
      {
        agent: 'Vision',
        message: '책등 변색과 표지 미세 긁힘 2건 탐지 (BBox 2건)',
      },
      {
        agent: 'Policy',
        message: 'UBCI 감점 26점 산출 (책등 변색 -15점, 표지 긁힘 -11점)',
      },
      {
        agent: 'Critic',
        message: '책등 변색이 촬영 조명에 의해 과하게 탐지되었을 가능성이 있음',
      },
      {
        agent: 'Report',
        message: '변색 여부 확인을 위해 관리자 수동 검토 요청 (HITL_REQUIRED)',
      },
    ],
    finalReport: '책등 변색이 실제 손상인지 관리자 확인이 필요합니다.',
  },
  {
    id: 'hitl_009',
    isbn: '9788932917245',
    title: '어린 왕자',
    ubciScore: 36,
    status: 'AWAITING_REVIEW',
    agentLogs: [
      {
        agent: 'Vision',
        message: '내지 여러 페이지에서 색칠과 필기 흔적 탐지 (BBox 8건)',
      },
      {
        agent: 'Policy',
        message: 'UBCI 감점 64점 산출, 재판매 불가 기준에 해당할 가능성이 높음',
      },
      {
        agent: 'Critic',
        message: '일부 필기 흔적이 인쇄된 그림과 겹쳐 탐지 오류 가능성이 있음',
      },
      {
        agent: 'Report',
        message: '실제 낙서 범위 확인을 위해 관리자 수동 검토 요청 (HITL_REQUIRED)',
      },
    ],
    finalReport: '내지 낙서 범위를 확인한 후 반려 여부를 결정해야 합니다.',
  },
  {
    id: 'hitl_010',
    isbn: '9788983920775',
    title: '해리 포터와 마법사의 돌',
    ubciScore: 64,
    status: 'AWAITING_REVIEW',
    agentLogs: [
      {
        agent: 'Vision',
        message: '표지 모서리 마모 2건과 책등 주름 1건 탐지 (BBox 3건)',
      },
      {
        agent: 'Policy',
        message: 'UBCI 감점 36점 산출 (모서리 마모 -20점, 책등 주름 -16점)',
      },
      {
        agent: 'Critic',
        message: '책등 주름이 제본 손상인지 일반적인 사용 흔적인지 판단이 어려움',
      },
      {
        agent: 'Report',
        message: '제본 상태 확인을 위해 관리자 수동 검토 요청 (HITL_REQUIRED)',
      },
    ],
    finalReport: '책등 주름의 심각도를 확인한 후 등급을 결정해야 합니다.',
  },
  {
    id: 'hitl_011',
    isbn: '9788934972464',
    title: '사피엔스',
    ubciScore: 59,
    status: 'AWAITING_REVIEW',
    agentLogs: [
      {
        agent: 'Vision',
        message: '책등 변색과 페이지 가장자리 얼룩 2건 탐지 (BBox 2건)',
      },
      {
        agent: 'Policy',
        message: 'UBCI 감점 41점 산출, 오염 범위에 따른 추가 판단 필요',
      },
      {
        agent: 'Critic',
        message: '조명 영향으로 얼룩이 실제보다 진하게 탐지되었을 가능성이 있음',
      },
      {
        agent: 'Report',
        message: '이미지 재확인과 관리자 수동 검토 요청 (HITL_REQUIRED)',
      },
    ],
    finalReport: '조명으로 인한 잘못된 탐지 가능성이 있어 관리자 확인이 필요합니다.',
  },
  {
    id: 'hitl_012',
    isbn: '9791165341909',
    title: '달러구트 꿈 백화점',
    ubciScore: 41,
    status: 'AWAITING_REVIEW',
    agentLogs: [
      {
        agent: 'Vision',
        message: '물에 젖은 흔적과 페이지 뒤틀림 5건 탐지 (BBox 5건)',
      },
      {
        agent: 'Policy',
        message: 'UBCI 감점 59점 산출, 수분 손상 기준을 초과할 가능성이 있음',
      },
      {
        agent: 'Critic',
        message: '여러 페이지에서 손상이 탐지되었지만 실제 확산 범위 확인이 필요함',
      },
      {
        agent: 'Report',
        message: '수분 손상 범위 확인을 위해 관리자 수동 검토 요청 (HITL_REQUIRED)',
      },
    ],
    finalReport: '페이지 변형과 수분 손상 범위를 확인한 후 반려 여부를 결정해야 합니다.',
  },
];