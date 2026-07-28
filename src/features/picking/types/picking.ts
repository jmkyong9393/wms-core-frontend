import type { BookGrade } from '@/features/inspections/types/inspection';

// 피킹 대상 도서 정보
export interface PickingListItem {
  id: string;

  // 도서 기본 정보
  bookId: string; 
  bookTitle: string;
  isbn: string;

  // 신품은 단품 LPN 없음
  lpnBarcode: string | null; 
  conditionGrade: BookGrade; 
  quantity: number;

  // 피킹 위치
  zone: string;
  rack: string;
  shelf: string;
}

// 주문별 피킹 지시서
export interface PickingSession {
  orderId: string;
  recommendedBox: string | null;
  items: PickingListItem[];
}
