export const LPN_SCAN_ENDPOINT = (token: string) => `/api/v1/lpn/scan/${token}`;

// LPN 스캔 상세 Query key factory
export const lpnScanKeys = {
  detail: (token: string) => ['lpnScan', token] as const,
};
