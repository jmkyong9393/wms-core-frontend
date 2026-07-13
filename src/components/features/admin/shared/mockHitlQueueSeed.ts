import type { HitlQueueItem } from '@/stores/atoms';

// 관리자 검토 대기 화면에서 사용할 임시 데이터
export const mockHitlQueueSeed: HitlQueueItem[] = [
  {
    id: 'hitl_001',
    isbn: '9788966262281',
    title: '코스모스',
    ubciScore: 62,
    status: 'HITL_REQUIRED',
  },
  {
    id: 'hitl_002',
    isbn: '9791162244584',
    title: '포켓몬 생태도감',
    ubciScore: 55,
    status: 'HITL_REQUIRED',
  },
  {
    id: 'hitl_003',
    isbn: '9788994492032',
    title: '니체의 초월자',
    ubciScore: 48,
    status: 'HITL_REQUIRED',
  },
];