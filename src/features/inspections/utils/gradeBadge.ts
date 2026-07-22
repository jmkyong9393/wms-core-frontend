import type { BookGrade } from '../types/inspection';

// 도서 등급별 배지 색상
export const GRADE_BADGE_STYLE: Record<BookGrade, string> = {
  MINT: 'bg-blue-100 text-blue-700',
  EXCELLENT: 'bg-indigo-100 text-indigo-700',
  NORMAL: 'bg-yellow-100 text-yellow-700',
  REJECT: 'bg-red-100 text-red-700',
};

// 등록되지 않은 등급에 적용할 기본 색상
const DEFAULT_GRADE_BADGE_STYLE = 'bg-gray-100 text-gray-600';

export function getGradeBadgeStyle(grade: string): string {
  return GRADE_BADGE_STYLE[grade as BookGrade] ?? DEFAULT_GRADE_BADGE_STYLE;
}

// 도서 등급별 화면 표시 라벨
export const GRADE_LABEL_KO: Record<BookGrade, string> = {
  MINT: 'S등급',
  EXCELLENT: 'A등급',
  NORMAL: 'B등급',
  REJECT: '반려/폐기',
};

const UNKNOWN_GRADE_LABEL = '알 수 없음';

export function getGradeLabel(grade: string): string {
  return GRADE_LABEL_KO[grade as BookGrade] ?? UNKNOWN_GRADE_LABEL;
}