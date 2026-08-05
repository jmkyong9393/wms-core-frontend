'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { confirmShipment, scanPickingAllocation } from '@/features/picking/api/pickingService';
import { pickingKeys } from '@/features/picking/constants/queryKeys';
import { orderKeys } from '@/features/orders/constants/queryKeys';
import type { PickingScanRequest } from '@/features/picking/types/picking';

// 404/409 응답을 받으면 화면이 최신 상태를 반영하도록 재조회
function shouldRefetchOnError(error: unknown): boolean {
  return isAxiosError(error) && (error.response?.status === 409 || error.response?.status === 404);
}

// 바코드 스캔으로 예약 항목 검증 요청
export function useScanPickingAllocationMutation(orderId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: PickingScanRequest) => scanPickingAllocation(orderId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pickingKeys.detail(orderId) });
    },
    onError: (error) => {
      if (shouldRefetchOnError(error)) {
        queryClient.invalidateQueries({ queryKey: pickingKeys.detail(orderId) });
      }
    },
  });
}

// 출고 확정 요청
export function useConfirmShipmentMutation(orderId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => confirmShipment(orderId),
    onSuccess: (data) => {
      queryClient.setQueryData(pickingKeys.detail(orderId), (prev: unknown) =>
        prev && typeof prev === 'object'
          ? { ...prev, status: data.status, is_picking_completed: true }
          : prev
      );
      // 출고 확정으로 PICKING → SHIPPED 전환 - 주문 목록(피킹 진행 중)에서 즉시 제외되도록 갱신
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
    },
    onError: (error) => {
      if (shouldRefetchOnError(error)) {
        queryClient.invalidateQueries({ queryKey: pickingKeys.detail(orderId) });
      }
    },
  });
}
