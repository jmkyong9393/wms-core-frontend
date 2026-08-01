"use client";

import React from "react";
import type { BookGrade } from "@/types/returnTypes";
import { getGradeLabel } from "@/features/inspections/utils/gradeBadge";
import { ShieldAlert, Clock } from "lucide-react";

interface ReturnsHitlPanelProps {
  jobId: string;
  conditionGrade: BookGrade | null;
  ubciScore: number | null;
  finalReport: string | null;
  onBack: () => void;
}

/**
 * HITL_REQUIRED 상태 안내 카드 (읽기 전용)
 *
 * `POST /api/v1/inspections/{jobId}/hitl`은 ADMIN 역할만 호출할 수 있는 관리자 전용 API다.
 * 이 화면은 창고 작업자가 쓰는 모바일 촬영 위저드이므로 여기서 직접 판정을 제출하지 않는다.
 * 실제 승인/반려/재촬영 판정은 관리자 큐 화면(src/features/queue)에서 처리하며,
 * 이 작업이 완료되면 useJobStatus의 SSE/폴링이 최종 상태를 자동으로 반영한다.
 */
export default function ReturnsHitlPanel({
  jobId,
  conditionGrade,
  ubciScore,
  finalReport,
  onBack,
}: ReturnsHitlPanelProps) {
  return (
    <div className="w-full max-w-md mx-auto bg-zinc-50 dark:bg-zinc-900 border-2 border-amber-500/80 rounded-3xl p-6 shadow-2xl transition-all relative overflow-hidden">
      <div className="flex items-start gap-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 rounded-2xl p-4 mb-6">
        <ShieldAlert className="w-6 h-6 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
        <div>
          <h3 className="text-sm font-bold text-amber-900 dark:text-amber-400">
            관리자 검토 대기 중
          </h3>
          <p className="text-xs text-amber-700 dark:text-amber-500 mt-1 leading-normal">
            AI 신뢰 점수가 낮게 검측되어 관리자의 최종 판정이 필요합니다. 판정은
            관리자 검수 큐 화면에서 처리되며, 완료되면 이 화면이 자동으로 갱신됩니다.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2.5 mb-4">
        <div className="bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-900 rounded-2xl p-3 text-center">
          <p className="text-[10px] text-zinc-400 mb-0.5">AI 판독 등급</p>
          <p className="text-base font-black text-zinc-900 dark:text-zinc-50">
            {conditionGrade ? getGradeLabel(conditionGrade) : "—"}
          </p>
        </div>
        <div className="bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-900 rounded-2xl p-3 text-center">
          <p className="text-[10px] text-zinc-400 mb-0.5">UBCI 점수</p>
          <p className="text-base font-black text-zinc-900 dark:text-zinc-50">
            {ubciScore != null ? ubciScore.toFixed(0) : "—"}
          </p>
        </div>
      </div>

      {finalReport && (
        <div className="mb-4 p-3 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
          {finalReport}
        </div>
      )}

      <div className="flex items-center justify-center gap-2 text-xs text-zinc-400 mb-6">
        <Clock className="w-3.5 h-3.5 animate-pulse" />
        검수 건 #{jobId.slice(0, 8)} 관리자 판정 대기
      </div>

      <button
        type="button"
        onClick={onBack}
        className="w-full rounded-xl py-3 font-semibold text-xs border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
      >
        목록으로 돌아가기
      </button>
    </div>
  );
}
