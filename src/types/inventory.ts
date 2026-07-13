import type { BookGrade } from '@/types/agentLog';

// 재고/출고 관리 - Dynamic Pricing 뷰 (Mock 전용)
// REJECT 등급은 판매 불가로 간주해 재고 화면에 노출하지 않음
export type SellableGrade = Extract<BookGrade, 'MINT' | 'GOOD' | 'NORMAL'>;

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