import type { InventoryGrade } from '@/features/inventory/constants/grades';

export interface InventoryBookRef {
  title: string;
  isbn: string | null;
}

export type InventoryStockType = 'NEW_STOCK' | 'USED_ITEM';

// 중고 단품 재고 상태
// 출고 완료된 재고는 목록에서 제외
export type InventoryLpnStatus = 'AVAILABLE' | 'RESERVED';

// 신간은 DEFAULT_POLICY(기본 할인 정책), 중고는 AGENT_PRICED(Agent 산정 완료)
// 가격이 아직 없으면 공통으로 PENDING
export type PricingStatus = 'DEFAULT_POLICY' | 'AGENT_PRICED' | 'PENDING';

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
  base_price: number;
  discount_rate: number | null;
  sale_price: number | null;
  pricing_status: PricingStatus;
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
