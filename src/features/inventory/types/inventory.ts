import type { BookGrade } from '@/features/inspections/types/inspection';

// 재고/출고 관리 - Dynamic Pricing 뷰 (Mock 전용)
export type SellableGrade = Extract<BookGrade, 'MINT' | 'EXCELLENT' | 'NORMAL'>;

export interface InventoryItem {
  id: string;
  bookTitle: string;
  grade: SellableGrade;
  ubciScore: number;
  virtualStock: number;
  location: string;
  basePrice: number;
  dynamicPrice: number;
}