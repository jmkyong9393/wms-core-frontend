import type { BookGrade } from '../types/inspection';

// 도서 등급별 배지 색상
export const GRADE_BADGE_STYLE: Record<BookGrade, string> = {
  MINT: 'bg-blue-100 text-blue-700 border border-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-900',
  EXCELLENT: 'bg-sky-100 text-sky-700 border border-sky-200 dark:bg-sky-900/40 dark:text-sky-300 dark:border-sky-900',
  NORMAL: 'bg-amber-100 text-amber-700 border border-amber-200 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-900',
  REJECT: 'bg-red-100 text-red-700 border border-red-200 dark:bg-red-900/40 dark:text-red-300 dark:border-red-900',
};

// 등록되지 않은 등급에 적용할 기본 색상
const DEFAULT_GRADE_BADGE_STYLE = 'bg-gray-100 text-gray-600 border border-gray-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700';

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