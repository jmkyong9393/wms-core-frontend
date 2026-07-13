import type { BookGrade } from '@/types/agentLog';

// 도서 등급별 배지 색상
export const GRADE_BADGE_STYLE: Record<BookGrade, string> = {
  MINT: 'bg-blue-100 text-blue-700',
  GOOD: 'bg-green-100 text-green-700',
  NORMAL: 'bg-yellow-100 text-yellow-700',
  REJECT: 'bg-red-100 text-red-700',
};