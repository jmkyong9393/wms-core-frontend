'use client';

import { useQuery } from '@tanstack/react-query';
import { getLpnScanDetail } from '@/features/lpnScan/api/lpnScanService';
import { lpnScanKeys } from '@/features/lpnScan/constants/lpnScanApi';

// 작업자용 LPN QR 스캔 상세 조회
export function useLpnScanQuery(token: string) {
  return useQuery({
    queryKey: lpnScanKeys.detail(token),
    queryFn: () => getLpnScanDetail(token),
  });
}
