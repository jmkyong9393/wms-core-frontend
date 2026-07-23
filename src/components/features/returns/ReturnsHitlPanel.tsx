"use client";

import React, { useState } from "react";
import type { BookGrade, WmsDecision, DefectReason, InspectionResult } from "@/types/returnTypes";
import { BOOK_GRADES } from "@/features/inspections/types/inspection";
import { getGradeLabel } from "@/features/inspections/utils/gradeBadge";
import { submitHitlOverride } from "@/services/returnService";
import { Check, X, ShieldAlert, Plus, HelpCircle } from "lucide-react";

interface ReturnsHitlPanelProps {
  jobId: string;
  initialGrade: BookGrade | null;
  initialReasons: DefectReason[];
  onOverrideComplete: (updatedResult: InspectionResult) => void;
  onCancel: () => void;
}

const GRADES: readonly BookGrade[] = BOOK_GRADES;
const STANDARD_REASONS: DefectReason[] = [
  { code: "STAIN_COVER", description: "표지 얼룩 오염" },
  { code: "SCRATCH_COVER", description: "표지 긁힘 스크래치" },
  { code: "PAGE_TORN", description: "속지 찢어짐" },
  { code: "PAGE_WRITTEN", description: "속지 낙서/필기" },
  { code: "CORNER_DAMAGED", description: "도서 모서리 파손" },
  { code: "BACK_BARCODE_ERROR", description: "후면 바코드 인식 불량" },
];

export default function ReturnsHitlPanel({
  jobId,
  initialGrade,
  initialReasons,
  onOverrideComplete,
  onCancel,
}: ReturnsHitlPanelProps) {
  const [selectedGrade, setSelectedGrade] = useState<BookGrade>(
    initialGrade || "NORMAL"
  );
  const [decision, setDecision] = useState<WmsDecision>("RESTOCKED");
  const [reasons, setReasons] = useState<DefectReason[]>(initialReasons);
  const [customReasonDesc, setCustomReasonDesc] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /** 등급 변경 시 WMS Decision 자동 매칭 (악성 재고 방지) */
  const handleGradeChange = (grade: BookGrade) => {
    setSelectedGrade(grade);
    if (grade === "REJECT") {
      setDecision("REJECTED");
    } else {
      setDecision("RESTOCKED");
    }
  };

  /** 표준 사유 코드 토글 */
  const toggleReason = (reason: DefectReason) => {
    if (reasons.some((r) => r.code === reason.code)) {
      setReasons(reasons.filter((r) => r.code !== reason.code));
    } else {
      setReasons([...reasons, reason]);
    }
  };

  /** 사용자 직접 사유 추가 */
  const addCustomReason = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customReasonDesc.trim()) return;

    const newReason: DefectReason = {
      code: `CUSTOM_${Date.now()}`,
      description: customReasonDesc.trim(),
    };
    setReasons([...reasons, newReason]);
    setCustomReasonDesc("");
  };

  /** 사유 삭제 */
  const removeReason = (code: string) => {
    setReasons(reasons.filter((r) => r.code !== code));
  };

  /** 최종 수동 승인 데이터 서버 전송 */
  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await submitHitlOverride(jobId, {
        grade: selectedGrade,
        reasons:
          reasons.length > 0
            ? reasons
            : [{ code: "NONE", description: "관리자 직권 무결 판정" }],
        decision,
      });

      if (response.success) {
        onOverrideComplete(response.result);
      } else {
        setError("수동 보정 최종 업데이트 처리에 실패했습니다.");
      }
    } catch (err: unknown) {
      const errMsg =
        err instanceof Error
          ? err.message
          : "네트워크 에러가 발생했습니다.";
      setError(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-zinc-50 dark:bg-zinc-900 border-2 border-amber-500/80 rounded-3xl p-6 shadow-2xl transition-all relative overflow-hidden">
      {/* 관리자 대기 장벽 가이드 헤더 */}
      <div className="flex items-start gap-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 rounded-2xl p-4 mb-6">
        <ShieldAlert className="w-6 h-6 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
        <div>
          <h3 className="text-sm font-bold text-amber-900 dark:text-amber-400">
            Human-in-the-Loop 관리자 보정 대기 중
          </h3>
          <p className="text-xs text-amber-700 dark:text-amber-500 mt-1 leading-normal">
            AI 신뢰 점수가 낮게 검측되어 자동 재고 입고/반출 라우팅이 일시
            정지되었습니다. 실제 도서 상태와 매치하여 최종 결정을 수동 승인해
            주십시오.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* 1. 등급 보정 */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block">
            도서 등급 강제 오버라이드
          </label>
          <div className="grid grid-cols-4 gap-1.5" role="radiogroup" aria-label="도서 등급 선택">
            {GRADES.map((grade) => {
              const isSelected = selectedGrade === grade;
              return (
                <button
                  key={grade}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  onClick={() => handleGradeChange(grade)}
                  className={`py-2 px-1 text-xs font-bold rounded-xl transition-all border ${
                    isSelected
                      ? "bg-amber-500 border-amber-500 text-white shadow-md shadow-amber-500/20 scale-105"
                      : "bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900"
                  }`}
                >
                  {getGradeLabel(grade)}
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. WMS 라우팅 결정 */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block">
            WMS 보관 정책 라우팅
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setDecision("RESTOCKED")}
              className={`py-3 px-4 rounded-2xl flex items-center justify-center gap-2 border font-semibold text-xs transition-all ${
                decision === "RESTOCKED"
                  ? "bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-500/10 scale-[1.02]"
                  : "bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-400"
              }`}
            >
              <Check className="w-4 h-4" />
              재고 적재 (+1 입고)
            </button>

            <button
              type="button"
              onClick={() => setDecision("REJECTED")}
              className={`py-3 px-4 rounded-2xl flex items-center justify-center gap-2 border font-semibold text-xs transition-all ${
                decision === "REJECTED"
                  ? "bg-red-500 border-red-500 text-white shadow-md shadow-red-500/10 scale-[1.02]"
                  : "bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-400"
              }`}
            >
              <X className="w-4 h-4" />
              매입 반려 (폐기)
            </button>
          </div>
        </div>

        {/* 3. 훼손 사유 관리 */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block">
            상태 훼손 사유 코드 관리
          </label>

          {/* 활성 사유 태그 */}
          {reasons.length > 0 ? (
            <div className="flex flex-wrap gap-1.5 p-3 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl min-h-[50px]">
              {reasons.map((r) => (
                <span
                  key={r.code}
                  className="inline-flex items-center gap-1 bg-amber-500/10 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 text-xs font-bold px-2 py-1 rounded-lg border border-amber-500/20"
                >
                  {r.description}
                  <button
                    type="button"
                    onClick={() => removeReason(r.code)}
                    aria-label={`${r.description} 사유 삭제`}
                  >
                    <X className="w-3 h-3 hover:text-amber-900 dark:hover:text-white" />
                  </button>
                </span>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl text-zinc-400 dark:text-zinc-600 text-xs flex items-center justify-center gap-1">
              <HelpCircle className="w-3.5 h-3.5" /> 훼손 코드 없음 (정상
              상태 판정 보정)
            </div>
          )}

          {/* 표준 사유 빠른 선택 */}
          <div className="space-y-1.5">
            <span className="text-xs text-zinc-500 dark:text-zinc-400 block font-semibold">
              자주 지정되는 표준 훼손 코드
            </span>
            <div className="flex flex-wrap gap-1">
              {STANDARD_REASONS.map((r) => {
                const isActive = reasons.some(
                  (existing) => existing.code === r.code
                );
                return (
                  <button
                    key={r.code}
                    type="button"
                    onClick={() => toggleReason(r)}
                    className={`text-xs font-semibold px-2 py-1 rounded-lg border transition-all ${
                      isActive
                        ? "bg-amber-500/20 border-amber-500 text-amber-700 dark:text-amber-300"
                        : "bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100"
                    }`}
                  >
                    {r.description}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 직접 사유 입력 */}
          <form onSubmit={addCustomReason} className="flex gap-2">
            <input
              type="text"
              value={customReasonDesc}
              onChange={(e) => setCustomReasonDesc(e.target.value)}
              placeholder="기타 사유를 직접 입력해 주세요..."
              className="flex-1 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 px-3 py-2 bg-white dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
            />
            <button
              type="submit"
              className="rounded-xl border border-zinc-200 dark:border-zinc-800 px-3 py-2 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
              aria-label="사유 추가"
            >
              <Plus className="w-4 h-4 text-zinc-500" />
            </button>
          </form>
        </div>
      </div>

      {/* 로딩 오버레이 */}
      {isSubmitting && (
        <div className="absolute inset-0 bg-white/90 dark:bg-zinc-900/90 flex flex-col items-center justify-center text-center">
          <ShieldAlert className="w-10 h-10 text-amber-500 animate-pulse mb-2" />
          <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
            WMS 코어 트랜잭션 적재 및 오버라이드 중...
          </span>
        </div>
      )}

      {/* 에러 */}
      {error && (
        <div className="mt-4 p-2.5 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-xl text-center text-xs text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {/* 하단 버튼 */}
      <div className="mt-8 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="rounded-xl py-4 font-semibold text-xs border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors disabled:opacity-50"
        >
          취소
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="rounded-xl py-4 font-bold text-xs bg-amber-500 hover:bg-amber-600 text-white shadow-md shadow-amber-500/10 disabled:opacity-50"
        >
          최종 결정 수동 승인
        </button>
      </div>
    </div>
  );
}
