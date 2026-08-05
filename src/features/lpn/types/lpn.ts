import type { BookGrade } from '@/features/inspections/types/inspection';
import type { PricingStatus } from '@/features/inventory/types/inventoryRow';

export type LpnInventoryStatus = 'AVAILABLE' | 'RESERVED' | 'SHIPPED';

export interface LpnBookDetail {
  id: string;
  isbn: string | null;
  title: string;
  publisher: string | null;
}

export interface LpnLocationDetail {
  id: string;
  barcode: string | null;
  zone: string;
  rack: string;
  shelf: string;
}

// GET /api/v1/lpn/{lpn_barcode} 응답
export interface LpnDetail {
  lpn_barcode: string;
  book: LpnBookDetail;
  inventory_status: LpnInventoryStatus;
  condition_grade: BookGrade;
  ubci_score: number | null;
  base_price: number;
  discount_rate: number | null;
  sale_price: number | null;
  // LPN은 AGENT_PRICED 또는 PENDING만 가능 (DEFAULT_POLICY 없음)
  pricing_status: Exclude<PricingStatus, 'DEFAULT_POLICY'>;
  location: LpnLocationDetail;
  stocked_at: string;
  certificate_url: string;
}

// POST /api/v1/internal/pricing/{lpn_barcode}/recalculate 응답
export interface DynamicPricingResult {
  inventory_used_item_id: string;
  lpn_barcode: string;
  base_price: number;
  discount_rate: number;
  sale_price: number;
  pricing_changed: boolean;
}
