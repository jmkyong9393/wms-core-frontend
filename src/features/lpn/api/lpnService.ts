import { apiClient } from '@/lib/api-client';
import { lpnDetailEndpoint, lpnRecalculatePricingEndpoint } from '@/features/lpn/constants/lpnApi';
import type { DynamicPricingResult, LpnDetail } from '@/features/lpn/types/lpn';

// LPN 바코드로 단품 재고 상세 조회
export async function getLpnDetail(lpnBarcode: string): Promise<LpnDetail> {
  const res = await apiClient.get<LpnDetail>(lpnDetailEndpoint(lpnBarcode));
  return res.data;
}

// LPN 동적 가격 재산정 (AVAILABLE 상태의 판매 가능 LPN만 가능)
export async function recalculateLpnPricing(lpnBarcode: string): Promise<DynamicPricingResult> {
  const res = await apiClient.post<DynamicPricingResult>(lpnRecalculatePricingEndpoint(lpnBarcode));
  return res.data;
}
