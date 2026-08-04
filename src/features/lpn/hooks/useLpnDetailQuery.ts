'use client';

import { useQuery } from '@tanstack/react-query';
import { getLpnDetail } from '@/features/lpn/api/lpnService';
import { lpnKeys } from '@/features/lpn/constants/queryKeys';

// LPN 바코드로 단품 재고 상세 조회
export function useLpnDetailQuery(lpnBarcode: string) {
  return useQuery({
    queryKey: lpnKeys.detail(lpnBarcode),
    queryFn: () => getLpnDetail(lpnBarcode),
    enabled: lpnBarcode.length > 0,
  });
}
