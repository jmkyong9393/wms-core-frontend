'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAxiosError } from 'axios';
import { Loader2, ChevronRight, PackageSearch } from 'lucide-react';
import { useOrderListQuery } from '@/features/orders/hooks/useOrderListQuery';
import { useCreatePickingInstructionMutation } from '@/features/picking/hooks/useCreatePickingInstructionMutation';
import { getOrderStatusLabel } from '@/features/orders/utils/orderStatusLabel';
import { formatCurrencyKRW } from '@/lib/format';
import { formatKstDateTime } from '@/lib/date';
import type { OrderListItem } from '@/features/orders/types/order';

// 이미 피킹이 시작된 주문에 지시서 생성을 재요청했을 때(409)의 안내 문구
const ALREADY_PICKING_MESSAGE = '이미 피킹이 시작된 주문입니다. 아래 "피킹 진행 중" 목록에서 이어서 진행해 주세요.';
const GENERIC_ERROR_MESSAGE = '피킹 지시서 생성에 실패했습니다. 다시 시도해 주세요.';

function getCreateErrorMessage(error: unknown): string {
  if (isAxiosError(error) && error.response?.status === 409) {
    return ALREADY_PICKING_MESSAGE;
  }
  return GENERIC_ERROR_MESSAGE;
}

interface OrderRowProps {
  order: OrderListItem;
  actionLabel: string;
  disabled: boolean;
  onSelect: (orderId: string) => void;
  errorMessage?: string;
}

function OrderRow({ order, actionLabel, disabled, onSelect, errorMessage }: OrderRowProps) {
  return (
    <div>
      <button
        type="button"
        onClick={() => onSelect(order.id)}
        disabled={disabled}
        className="w-full flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:border-orange-300 transition-colors disabled:opacity-60 text-left"
      >
        <div className="min-w-0">
          <p className="font-semibold text-gray-900 truncate">{order.customer_name}</p>
          <p className="text-xs text-gray-500 mt-0.5">
            {formatCurrencyKRW(order.total_price)} · {order.logistics_center ?? '물류센터 미지정'}
          </p>
          <p className="text-[11px] text-gray-400 mt-0.5">{formatKstDateTime(order.created_at)}</p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0 pl-3">
          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-yellow-50 text-yellow-600">
            {getOrderStatusLabel(order.status)}
          </span>
          <span className="text-[11px] font-bold text-orange-600 whitespace-nowrap">{actionLabel}</span>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </div>
      </button>
      {errorMessage && (
        <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mt-1.5">
          {errorMessage}
        </p>
      )}
    </div>
  );
}

// 출고 대상 주문 목록 - 피킹 대기(PENDING)와 피킹 진행 중(PICKING)을 구분해 보여준다.
// PENDING 선택 시 피킹 지시서를 생성하고 세션 화면으로 이동, PICKING 선택 시 생성 없이 바로 이어서 진행한다.
export function OutboundOrderListView() {
  const router = useRouter();
  const pendingQuery = useOrderListQuery({ status: 'PENDING' });
  const pickingQuery = useOrderListQuery({ status: 'PICKING' });
  const createMutation = useCreatePickingInstructionMutation();

  const [failedOrderId, setFailedOrderId] = useState<string | null>(null);
  const [failedMessage, setFailedMessage] = useState<string | null>(null);

  const handleStart = (orderId: string) => {
    if (createMutation.isPending) return;
    setFailedOrderId(null);
    setFailedMessage(null);
    createMutation.mutate(orderId, {
      onSuccess: () => router.push(`/outbound/picking/${orderId}`),
      onError: (error) => {
        setFailedOrderId(orderId);
        setFailedMessage(getCreateErrorMessage(error));
      },
    });
  };

  const handleResume = (orderId: string) => {
    router.push(`/outbound/picking/${orderId}`);
  };

  if (pendingQuery.isLoading || pickingQuery.isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-400">
        <Loader2 className="h-8 w-8 animate-spin mb-2" />
        <p className="text-sm">출고 대상 주문을 불러오는 중...</p>
      </div>
    );
  }

  if (pendingQuery.isError || pickingQuery.isError || !pendingQuery.data || !pickingQuery.data) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-red-500 text-sm text-center px-4">
        주문 목록을 불러오지 못했습니다.
      </div>
    );
  }

  const pendingOrders = pendingQuery.data.items;
  const pickingOrders = pickingQuery.data.items;

  if (pendingOrders.length === 0 && pickingOrders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-400 text-sm gap-2">
        <PackageSearch className="h-8 w-8" />
        피킹 가능한 주문이 없습니다.
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <h1 className="text-xl font-bold text-gray-900 px-1">피킹 대기</h1>
        {pendingOrders.length === 0 ? (
          <p className="text-sm text-gray-400 px-1">대기 중인 주문이 없습니다.</p>
        ) : (
          pendingOrders.map((order) => (
            <OrderRow
              key={order.id}
              order={order}
              actionLabel="피킹 시작"
              disabled={createMutation.isPending}
              onSelect={handleStart}
              errorMessage={failedOrderId === order.id ? (failedMessage ?? undefined) : undefined}
            />
          ))
        )}
      </div>

      <div className="flex flex-col gap-3">
        <h1 className="text-xl font-bold text-gray-900 px-1">피킹 진행 중</h1>
        {pickingOrders.length === 0 ? (
          <p className="text-sm text-gray-400 px-1">진행 중인 피킹이 없습니다.</p>
        ) : (
          pickingOrders.map((order) => (
            <OrderRow key={order.id} order={order} actionLabel="이어하기" disabled={false} onSelect={handleResume} />
          ))
        )}
      </div>
    </div>
  );
}
