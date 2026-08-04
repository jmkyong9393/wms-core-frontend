// LPN 단품 재고 상세 조회 API 주소
export const lpnDetailEndpoint = (lpnBarcode: string) => `/api/v1/lpn/${encodeURIComponent(lpnBarcode)}`;

// LPN 동적 가격 재산정 API 주소
export const lpnRecalculatePricingEndpoint = (lpnBarcode: string) =>
  `/api/v1/internal/pricing/${encodeURIComponent(lpnBarcode)}/recalculate`;
