'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { recalculateLpnPricing } from '@/features/lpn/api/lpnService';
import { lpnKeys } from '@/features/lpn/constants/queryKeys';
import { inventoryKeys } from '@/features/inventory/constants/queryKeys';

// LPN 동적 가격 재산정 요청
export function useRecalculateLpnPricingMutation(lpnBarcode: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => recalculateLpnPricing(lpnBarcode),
    onSuccess: (result) => {
      queryClient.setQueryData(lpnKeys.detail(lpnBarcode), (prev: unknown) =>
        prev && typeof prev === 'object'
          ? { ...prev, discount_rate: result.discount_rate, sale_price: result.sale_price, pricing_status: 'AGENT_PRICED' }
          : prev
      );
      // 통합 재고 목록에도 동일 재고가 노출되므로 최신 가격이 반영되도록 무효화
      queryClient.invalidateQueries({ queryKey: inventoryKeys.all });
    },
  });
}
