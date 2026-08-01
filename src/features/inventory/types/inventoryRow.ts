import type { InventoryGrade } from '@/features/inventory/constants/grades';

export interface InventoryBookRef {
  title: string;
  isbn: string | null;
}

export type InventoryStockType = 'NEW_STOCK' | 'USED_ITEM';

// 중고 LPN 상태 - SHIPPED(출고 완료)는 통합 재고 목록에서 제외되어 응답에 나타나지 않음
export type InventoryLpnStatus = 'AVAILABLE' | 'RESERVED';

// 재고 목록 API에서 받는 데이터 형식
// 신간 재고와 중고·반품 재고를 합쳐서 조회
export interface InventoryRow {
  id: string;
  stock_type: InventoryStockType;
  book: InventoryBookRef;
  grade: InventoryGrade | null; // 신간 재고는 null
  zone: string;
  quantity: number;
  reserved_quantity: number;
  available_quantity: number;
  lpn_status: InventoryLpnStatus | null; // 신간 재고는 null
  date: string;
}
