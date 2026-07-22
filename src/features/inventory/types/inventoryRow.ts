import type { InventoryGrade } from '@/features/inventory/constants/grades';

export interface InventoryBookRef {
  title: string;
  isbn: string;
}

// 재고 목록 API에서 받는 데이터 형식
// 신간 재고와 중고·반품 재고를 합쳐서 조회
export interface InventoryRow {
  id: string;
  book: InventoryBookRef;
  grade: InventoryGrade;
  zone: string;
  quantity: number;
  date: string;
}
