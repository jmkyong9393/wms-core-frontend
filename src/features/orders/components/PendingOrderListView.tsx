'use client';

import { useRouter } from 'next/navigation';
import { Loader2, ChevronRight, PackageSearch } from 'lucide-react';
import { useOrderListQuery } from '@/features/orders/hooks/useOrderListQuery';
import { useCreatePickingInstructionMutation } from '@/features/picking/hooks/useCreatePickingInstructionMutation';
import { getOrderStatusLabel } from '@/features/orders/utils/orderStatusLabel';
import { formatCurrencyKRW } from '@/lib/format';

// 피킹 가능한 PENDING 주문 목록 - 선택 시 피킹 지시서를 생성하고 세션 화면으로 이동
export function PendingOrderListView() {
  const router = useRouter();
  const { data, isLoading, isError } = useOrderListQuery({ status: 'PENDING' });
  const createMutation = useCreatePickingInstructionMutation();

  const handleSelect = (orderId: string) => {
    if (createMutation.isPending) return;
    createMutation.mutate(orderId, {
      onSettled: () => router.push(`/outbound/picking/${orderId}`),
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-400">
        <Loader2 className="h-8 w-8 animate-spin mb-2" />
        <p className="text-sm">출고 대상 주문을 불러오는 중...</p>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-red-500 text-sm text-center px-4">
        주문 목록을 불러오지 못했습니다.
      </div>
    );
  }

  if (data.items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-400 text-sm gap-2">
        <PackageSearch className="h-8 w-8" />
        피킹 가능한 대기 중 주문이 없습니다.
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto flex flex-col gap-3">
      <h1 className="text-xl font-bold text-gray-900 px-1">출고 대상 주문 선택</h1>
      {data.items.map((order) => (
        <button
          key={order.id}
          type="button"
          onClick={() => handleSelect(order.id)}
          disabled={createMutation.isPending}
          className="w-full flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:border-orange-300 transition-colors disabled:opacity-60 text-left"
        >
          <div className="min-w-0">
            <p className="font-semibold text-gray-900 truncate">{order.customer_name}</p>
            <p className="text-xs text-gray-500 mt-0.5">
              {formatCurrencyKRW(order.total_price)} · {order.logistics_center ?? '물류센터 미지정'}
            </p>
            <p className="text-[11px] text-gray-400 mt-0.5">{new Date(order.created_at).toLocaleString()}</p>
          </div>
          <div className="flex items-center gap-1.5 shrink-0 pl-3">
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-yellow-50 text-yellow-600">
              {getOrderStatusLabel(order.status)}
            </span>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </div>
        </button>
      ))}
    </div>
  );
}
