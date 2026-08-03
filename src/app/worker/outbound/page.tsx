"use client";

import Link from "next/link";
import { ChevronLeft, ShoppingCart, Package } from "lucide-react";

export default function WorkerOutboundPage() {
  return (
    <div className="space-y-4 py-2 flex flex-col h-full max-w-md mx-auto font-sans">
      <div className="flex items-center shrink-0">
        <Link
          href="/worker"
          className="inline-flex items-center gap-1 text-xs font-bold text-gray-500 hover:text-gray-700"
        >
          <ChevronLeft className="w-4 h-4" />
          작업 선택으로 돌아가기
        </Link>
      </div>

      <div className="space-y-1 shrink-0">
        <h2 className="text-lg font-extrabold text-gray-800 dark:text-zinc-50">
          출고 프로세스 선택
        </h2>
        <p className="text-xs text-gray-400 dark:text-zinc-500">
          진행할 출고 작업 단계(피킹 혹은 스마트 패킹)를 선택해 주십시오.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 flex-1 my-auto justify-center">
        {/* Picking Redirect Card */}
        <Link
          href="/outbound/picking"
          className="group block relative overflow-hidden bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 hover:border-orange-400 dark:hover:border-orange-500 rounded-3xl p-5 hover:shadow-md transition-all active:scale-[0.98]"
        >
          <div className="flex items-center space-x-4">
            <div className="bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 p-3.5 rounded-2xl group-hover:scale-110 transition-transform">
              <ShoppingCart className="w-6 h-6" />
            </div>
            <div className="flex-1 space-y-0.5">
              <h3 className="text-sm font-bold text-gray-800 dark:text-zinc-100">
                출고 도서 피킹 (Picking)
              </h3>
              <p className="text-[11px] text-gray-400 dark:text-zinc-500">
                할당된 출고 주문 리스트를 확인하고 피킹 완료 처리
              </p>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-16 h-16 bg-orange-500/5 rounded-full -mr-6 -mt-6" />
        </Link>

        {/* Packing Redirect Card */}
        <Link
          href="/outbound/packing"
          className="group block relative overflow-hidden bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 hover:border-orange-400 dark:hover:border-orange-500 rounded-3xl p-5 hover:shadow-md transition-all active:scale-[0.98]"
        >
          <div className="flex items-center space-x-4">
            <div className="bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 p-3.5 rounded-2xl group-hover:scale-110 transition-transform">
              <Package className="w-6 h-6" />
            </div>
            <div className="flex-1 space-y-0.5">
              <h3 className="text-sm font-bold text-gray-800 dark:text-zinc-100">
                스마트 검수 패킹 (Packing)
              </h3>
              <p className="text-[11px] text-gray-400 dark:text-zinc-500">
                도서 박스 추천 매핑 및 포장 운송장 발급 단계 진입
              </p>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-16 h-16 bg-orange-500/5 rounded-full -mr-6 -mt-6" />
        </Link>
      </div>
    </div>
  );
}
