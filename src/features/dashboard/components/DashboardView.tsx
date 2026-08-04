'use client';

import { useState } from 'react';
import ComprehensiveStatsTab from './ComprehensiveStatsTab';
import { ShoppingCart, Package, Truck, ExternalLink, Activity } from 'lucide-react';
import Link from 'next/link';

export default function DashboardView() {
  const [mainTab, setMainTab] = useState<'inbound' | 'outbound'>('inbound');

  return (
    <div className="max-w-[1600px] mx-auto space-y-4 h-full flex flex-col font-sans">
      {/* Header Section with Master Tab Separation */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 shrink-0 bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 p-4 rounded-3xl">
        <div className="space-y-1">
          <h2 className="text-xl font-black text-gray-800 dark:text-zinc-100 flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-500" />
            물류 센터 통합 대시보드
          </h2>
          <p className="text-xs text-gray-400 dark:text-zinc-500">
            입고/출고 모니터링 및 FDS 분석 정보를 조회합니다.
          </p>
        </div>

        {/* Top-level Master Tab Switcher */}
        <div className="flex bg-gray-100 dark:bg-zinc-800 p-1.5 rounded-2xl self-start lg:self-center gap-1.5">
          <button
            onClick={() => setMainTab('inbound')}
            className={`px-5 py-2.5 font-bold text-xs rounded-xl transition-all cursor-pointer ${
              mainTab === 'inbound'
                ? 'bg-white dark:bg-zinc-950 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-gray-500 dark:text-zinc-400 hover:text-gray-800'
            }`}
          >
            입고 현황 (Inbound)
          </button>
          <button
            onClick={() => setMainTab('outbound')}
            className={`px-5 py-2.5 font-bold text-xs rounded-xl transition-all cursor-pointer ${
              mainTab === 'outbound'
                ? 'bg-white dark:bg-zinc-950 text-orange-600 dark:text-orange-400 shadow-sm'
                : 'text-gray-500 dark:text-zinc-400 hover:text-gray-800'
            }`}
          >
            출고 현황 (Outbound)
          </button>
        </div>
      </div>

      {/* Main Tab Views */}
      {mainTab === 'inbound' ? (
        /* Inbound Dashboard View */
        <div className="flex-1 flex flex-col space-y-4 min-h-0">
          <h3 className="text-sm font-bold text-gray-700 dark:text-zinc-300 shrink-0">
            종합 통계 & FDS 리포트
          </h3>
          <div className="flex-1 overflow-y-auto min-h-0">
            <ComprehensiveStatsTab />
          </div>
        </div>
      ) : (
        /* Outbound Dashboard View (NEW) */
        <div className="flex-1 flex flex-col space-y-4 min-h-0">
          <h3 className="text-sm font-bold text-gray-700 dark:text-zinc-300 shrink-0">
            출고 적치 & 스마트 포장 종합 현황
          </h3>

          {/* Outbound KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 shrink-0">
            <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-3xl p-4 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[11px] font-bold text-gray-400 uppercase">금일 출고 지시 건수</span>
                <span className="p-1.5 bg-orange-50 dark:bg-orange-950/20 text-orange-600 dark:text-orange-400 rounded-lg"><Truck className="w-3.5 h-3.5" /></span>
              </div>
              <div>
                <span className="text-xl font-black text-gray-800 dark:text-zinc-100">128 건</span>
                <span className="text-[10px] text-green-500 font-bold ml-1.5">▲ 8.6%</span>
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-3xl p-4 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[11px] font-bold text-gray-400 uppercase">도서 피킹 완료율</span>
                <span className="p-1.5 bg-orange-50 dark:bg-orange-950/20 text-orange-600 dark:text-orange-400 rounded-lg"><ShoppingCart className="w-3.5 h-3.5" /></span>
              </div>
              <div>
                <span className="text-xl font-black text-gray-800 dark:text-zinc-100">87.5 %</span>
                <span className="text-[10px] text-green-500 font-bold ml-1.5">▲ 2.1%</span>
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-3xl p-4 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[11px] font-bold text-gray-400 uppercase">스마트 패킹 진행률</span>
                <span className="p-1.5 bg-orange-50 dark:bg-orange-950/20 text-orange-600 dark:text-orange-400 rounded-lg"><Package className="w-3.5 h-3.5" /></span>
              </div>
              <div>
                <span className="text-xl font-black text-gray-800 dark:text-zinc-100">79.2 %</span>
                <span className="text-[10px] text-green-500 font-bold ml-1.5">▲ 4.5%</span>
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-3xl p-4 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[11px] font-bold text-gray-400 uppercase">송장 출력 완료건</span>
                <span className="p-1.5 bg-orange-50 dark:bg-orange-950/20 text-orange-600 dark:text-orange-400 rounded-lg"><Truck className="w-3.5 h-3.5" /></span>
              </div>
              <div>
                <span className="text-xl font-black text-gray-800 dark:text-zinc-100">112 건</span>
                <span className="text-[10px] text-red-500 font-bold ml-1.5">▼ 1.3%</span>
              </div>
            </div>
          </div>

          {/* Quick links & Outbound order table */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1 min-h-0">
            {/* Table */}
            <div className="lg:col-span-2 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-3xl p-4 flex flex-col min-h-0 overflow-y-auto">
              <h4 className="text-xs font-bold text-gray-700 dark:text-zinc-300 mb-3 uppercase tracking-wider">
                실시간 출고 주문 배차 목록
              </h4>
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
                    {[
                      { waybill: "WB-9908122", name: "한빛미디어", type: "B2B_ORDER", price: "240,000원", status: "SHIPPED" },
                      { waybill: "WB-9908123", name: "교보문고", type: "B2B_ORDER", price: "185,000원", status: "PICKING" },
                      { waybill: "WB-9908124", name: "예스24", type: "B2B_ORDER", price: "1,200,000원", status: "PENDING" },
                      { waybill: "WB-9908125", name: "한빛미디어", type: "AUTO_PO", price: "98,000원", status: "SHIPPED" },
                    ].map((order, idx) => (
                      <tr key={idx} className="text-gray-600 dark:text-zinc-300">
                        <td className="py-3 px-1 font-mono font-bold">{order.waybill}</td>
                        <td className="py-3 px-1 font-medium">{order.name}</td>
                        <td className="py-3 px-1">{order.type}</td>
                        <td className="py-3 px-1 font-semibold">{order.price}</td>
                        <td className="py-3 px-1">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            order.status === "SHIPPED"
                              ? "bg-green-50 text-green-600 dark:bg-green-950/20 dark:text-green-400"
                              : order.status === "PICKING"
                              ? "bg-orange-50 text-orange-600 dark:bg-orange-950/20 dark:text-orange-400"
                              : "bg-yellow-50 text-yellow-600"
                          }`}>
                            {order.status === "SHIPPED" ? "배송 완료" : order.status === "PICKING" ? "피킹 중" : "대기 중"}
                          </span>
                        </td>
                      </tr>
                    ))}
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

              <Link
                href="/outbound/packing"
                className="group flex items-center justify-between p-3.5 bg-orange-50/50 hover:bg-orange-50 dark:bg-zinc-950 dark:hover:bg-zinc-800/40 border border-orange-100 dark:border-zinc-800 rounded-2xl transition-all"
              >
                <div>
                  <h5 className="text-xs font-bold text-gray-800 dark:text-zinc-200">스마트 패킹 검수</h5>
                  <p className="text-[10px] text-gray-400 mt-0.5">박스 3D Packing 및 패킹 완성</p>
                </div>
                <ExternalLink className="w-4 h-4 text-orange-500" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

