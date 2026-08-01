import type { InventoryGrade } from '@/features/inventory/constants/grades';

export interface InventoryBookRef {
  title: string;
  isbn: string | null;
}

export type InventoryStockType = 'NEW_STOCK' | 'USED_ITEM';

// 중고 단품 재고 상태
// 출고 완료된 재고는 목록에서 제외
export type InventoryLpnStatus = 'AVAILABLE' | 'RESERVED';

// 통합 재고 목록 데이터
export interface InventoryRow {
  id: string;
  stock_type: InventoryStockType;
  book: InventoryBookRef;
  grade: InventoryGrade; 
  zone: string;
  quantity: number;
  reserved_quantity: number;
  available_quantity: number;
  lpn_status: InventoryLpnStatus | null; 
  date: string;
}

// 통합 재고 조회 조건
export interface InventoryListParams {
  page: number;
  size: number;
  isbn?: string;
  keyword?: string;
  grade?: InventoryGrade;
  zone?: string;
  start_date?: string;
  end_date?: string;
}
