'use client';

import { useState } from 'react';
import ComprehensiveStatsTab from './ComprehensiveStatsTab';
import OutboundSummaryTab from './OutboundSummaryTab';
import { Activity } from 'lucide-react';

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
        /* Outbound Dashboard View */
        <div className="flex-1 flex flex-col space-y-4 min-h-0">
          <h3 className="text-sm font-bold text-gray-700 dark:text-zinc-300 shrink-0">
            출고 피킹 종합 현황
          </h3>
          <OutboundSummaryTab />
        </div>
      )}
    </div>
  );
}

