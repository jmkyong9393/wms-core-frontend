import { type BookGrade } from '@/features/inspections/types/inspection';

// 관리자 HITL 최종 판정 액션 (POST /api/v1/inspections/{job_id}/hitl 명세 기준)
export type HitlDecisionAction =
  | 'APPROVE_NORMAL'
  | 'APPROVE_DOWNGRADE'
  | 'REJECT_RETURN'
  | 'REJECT_DISCARD'
  | 'RE_CHECK';

export interface HitlReasonCode {
  code: string;
  label: string;
}

// 정상 승인용 오탐 코드
const FP_REASON_CODES: HitlReasonCode[] = [
  { code: 'FP_SHADOW', label: '그림자를 훼손으로 잘못 판단' },
  { code: 'FP_COVER_PATTERN', label: '표지 그림이나 무늬를 훼손으로 잘못 판단' },
  { code: 'FP_GLARE', label: '조명 또는 플래시 반사를 오염으로 잘못 판단' },
  { code: 'FP_BOOK_BAND', label: '띠지나 정상 바코드 스티커를 훼손으로 잘못 판단' },
  { code: 'FP_DUST', label: '닦아낼 수 있는 먼지를 영구 오염으로 잘못 판단' },
  { code: 'FP_OTHER', label: '기타 AI 오탐' },
];

// 외부 파손 코드
const DMG_EXT_REASON_CODES: HitlReasonCode[] = [
  { code: 'DMG_EXT_WET', label: '침수 또는 외부 액체 오염' },
  { code: 'DMG_EXT_CRUSH', label: '모서리 찍힘 또는 눌림' },
  { code: 'DMG_EXT_TEAR', label: '찢어짐 또는 외부 파손' },
  { code: 'DMG_EXT_BOX', label: '박스 파손으로 인한 도서 훼손' },
  { code: 'DMG_EXT_OTHER', label: '기타 외부 파손' },
];

// 내부 결함 코드
const DMG_INT_REASON_CODES: HitlReasonCode[] = [
  { code: 'DMG_INT_BINDING', label: '제본 또는 인쇄 불량' },
  { code: 'DMG_INT_STAIN', label: '영구 오염, 낙서 또는 지워지지 않는 이물질' },
  { code: 'DMG_INT_DISCOLOR', label: '변색 또는 황변' },
  { code: 'DMG_INT_BARCODE', label: '바코드 훼손 또는 스캔 불가' },
  { code: 'DMG_INT_OTHER', label: '기타 내부 결함' },
];

// 재검토·예외 코드
// TODO(backend): SYS_MISSING_PARTS 설명이 자료마다 다름
// - 사유 코드 명세 문서: "부록, CD 또는 세트 구성품 누락"
// - 일부 원문 API 문서: "이미지 누락"
// 백엔드 확인 전까지 사유 코드 명세 문서 표기를 그대로 사용
const SYS_REASON_CODES: HitlReasonCode[] = [
  { code: 'SYS_BLURRY', label: '흐림, 흔들림, 가림 또는 역광으로 판독 불가' },
  { code: 'SYS_WRONG_ITEM', label: 'ISBN과 사진 속 도서가 다름' },
  { code: 'SYS_MISSING_PARTS', label: '부록, CD 또는 세트 구성품 누락' },
  { code: 'SYS_OTHER', label: '기타 촬영·시스템 예외' },
];

// 액션별 선택 가능한 사유 코드 매핑
// TODO(backend): 명세에 명시적 매핑표가 없어 프론트 UX 편의상 추정한 조합.
// 백엔드 유효성 검증 규칙과 다를 수 있으므로 확인되는 대로 이 객체만 수정하면 됨.
export const HITL_REASON_CODES_BY_ACTION: Record<HitlDecisionAction, HitlReasonCode[]> = {
  APPROVE_NORMAL: FP_REASON_CODES,
  APPROVE_DOWNGRADE: [...DMG_EXT_REASON_CODES, ...DMG_INT_REASON_CODES],
  REJECT_RETURN: [...DMG_EXT_REASON_CODES, ...DMG_INT_REASON_CODES],
  REJECT_DISCARD: [...DMG_EXT_REASON_CODES, ...DMG_INT_REASON_CODES],
  RE_CHECK: SYS_REASON_CODES,
};

// 하향 승인(APPROVE_DOWNGRADE) 시 선택 가능한 등급.
// 화면 표시는 getGradeLabel()을 그대로 사용 (EXCELLENT → "A등급", NORMAL → "B등급").
// target_grade 값은 EXCELLENT/NORMAL로 확정 (기존 API 문서의 A/B 표기는 오기).
export const DOWNGRADE_GRADE_OPTIONS: Extract<BookGrade, 'EXCELLENT' | 'NORMAL'>[] = [
  'EXCELLENT',
  'NORMAL',
];

// APPROVE_NORMAL의 최종 등급 (요약 표시용, 요청 바디에는 포함하지 않음)
export const APPROVE_NORMAL_GRADE: BookGrade = 'MINT';
