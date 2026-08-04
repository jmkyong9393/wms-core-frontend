'use client';

import { ShoppingCart, Truck, ExternalLink, AlertTriangle, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { useOutboundDashboardSummaryQuery } from '@/features/dashboard/hooks/useOutboundDashboardSummaryQuery';
import { getOrderStatusLabel } from '@/features/orders/utils/orderStatusLabel';

// 출고 관리자 대시보드 - 출고 탭 (실 API 연동, Mock 폴백 없음)
export default function OutboundSummaryTab() {
  const { data: summary, isLoading, isError, refetch, isFetching } = useOutboundDashboardSummaryQuery();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] gap-3">
        <RefreshCw className="animate-spin text-orange-600 w-8 h-8" />
        <p className="text-gray-500 font-medium text-sm">출고 현황을 불러오는 중...</p>
      </div>
    );
  }

  if (isError || !summary) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] gap-3 text-center">
        <AlertTriangle className="w-8 h-8 text-red-500" />
        <p className="text-sm text-gray-600">출고 현황을 불러오지 못했습니다.</p>
        <button
          type="button"
          onClick={() => refetch()}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-orange-600 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          다시 시도
        </button>
      </div>
    );
  }

  const recentOrders = summary.recent_orders;

  return (
    <div className="flex-1 flex flex-col space-y-4 min-h-0">
      {/* Outbound KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 shrink-0">
        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-3xl p-4 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-[11px] font-bold text-gray-400 uppercase">진행 중 피킹 주문</span>
            <span className="p-1.5 bg-orange-50 dark:bg-orange-950/20 text-orange-600 dark:text-orange-400 rounded-lg">
              <Truck className="w-3.5 h-3.5" />
            </span>
          </div>
          <div>
            <span className="text-xl font-black text-gray-800 dark:text-zinc-100">
              {summary.active_picking_order_count} 건
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-3xl p-4 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-[11px] font-bold text-gray-400 uppercase">당일 피킹 완료율</span>
            <span className="p-1.5 bg-orange-50 dark:bg-orange-950/20 text-orange-600 dark:text-orange-400 rounded-lg">
              <ShoppingCart className="w-3.5 h-3.5" />
            </span>
          </div>
          <div>
            <span className="text-xl font-black text-gray-800 dark:text-zinc-100">
              {summary.picking_completion_rate.toFixed(1)} %
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-3xl p-4 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-[11px] font-bold text-gray-400 uppercase">금일 송장 발급 완료</span>
            <span className="p-1.5 bg-orange-50 dark:bg-orange-950/20 text-orange-600 dark:text-orange-400 rounded-lg">
              <Truck className="w-3.5 h-3.5" />
            </span>
          </div>
          <div>
            <span className="text-xl font-black text-gray-800 dark:text-zinc-100">
              {summary.today_shipping_label_issued_count} 건
            </span>
          </div>
        </div>
      </div>

      {/* Quick links & Outbound order table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1 min-h-0">
        {/* Table */}
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-3xl p-4 flex flex-col min-h-0 overflow-y-auto">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold text-gray-700 dark:text-zinc-300 uppercase tracking-wider">
              실시간 출고 주문 배차 목록
            </h4>
            {isFetching && <RefreshCw className="w-3.5 h-3.5 animate-spin text-gray-400" />}
          </div>
          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 dark:border-zinc-800 text-gray-400 font-bold">
                  <th className="py-2 px-1">송장번호</th>
                  <th className="py-2 px-1">공급처/고객사</th>
                  <th className="py-2 px-1">주문 유형</th>
                  <th className="py-2 px-1">총금액</th>
                  <th className="py-2 px-1">상태</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-zinc-800/30">
                {recentOrders.length > 0 ? (
                  recentOrders.map((order) => (
                    <tr key={order.id} className="text-gray-600 dark:text-zinc-300">
                      <td className="py-3 px-1 font-mono font-bold">
                        {order.waybill_number ?? '송장 미발급'}
                      </td>
                      <td className="py-3 px-1 font-medium">{order.customer_name ?? '미지정 고객'}</td>
                      <td className="py-3 px-1">{order.order_type}</td>
                      <td className="py-3 px-1 font-semibold">{order.total_price.toLocaleString()}원</td>
                      <td className="py-3 px-1">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            order.status === 'SHIPPED'
                              ? 'bg-green-50 text-green-600 dark:bg-green-950/20 dark:text-green-400'
                              : order.status === 'PICKING'
                              ? 'bg-orange-50 text-orange-600 dark:bg-orange-950/20 dark:text-orange-400'
                              : 'bg-yellow-50 text-yellow-600'
                          }`}
                        >
                          {getOrderStatusLabel(order.status)}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-400 text-sm">
                      최근 출고 주문이 없습니다.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Action links */}
        <div className="lg:col-span-1 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-3xl p-4 flex flex-col space-y-3 justify-center">
          <h4 className="text-xs font-bold text-gray-700 dark:text-zinc-300 mb-1 uppercase tracking-wider">
            출고 바로가기 링크
          </h4>

          <Link
            href="/outbound/picking"
            className="group flex items-center justify-between p-3.5 bg-orange-50/50 hover:bg-orange-50 dark:bg-zinc-950 dark:hover:bg-zinc-800/40 border border-orange-100 dark:border-zinc-800 rounded-2xl transition-all"
          >
            <div>
              <h5 className="text-xs font-bold text-gray-800 dark:text-zinc-200">출고 피킹 작업 지시</h5>
              <p className="text-[10px] text-gray-400 mt-0.5">할당 주문 도서 선별 피킹 진행</p>
            </div>
            <ExternalLink className="w-4 h-4 text-orange-500" />
          </Link>
        </div>
      </div>
    </div>
  );
}
