"use client";

import React, { useState } from "react";
import type { BookGrade, WmsDecision, DefectReason, InspectionResult } from "@/types/returnTypes";
import { submitHitlOverride } from "@/services/returnService";
import { Check, X, ShieldAlert, Plus, HelpCircle } from "lucide-react";

interface ReturnsHitlPanelProps {
  jobId: string;
  initialGrade: BookGrade | null;
  initialReasons: DefectReason[];
  onOverrideComplete: (updatedResult: InspectionResult) => void;
  onCancel: () => void;
}

const GRADES: BookGrade[] = ["MINT", "EXCELLENT", "GOOD", "FAIR", "SCRAP"];
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
    initialGrade || "GOOD"
  );
  const [decision, setDecision] = useState<WmsDecision>("RESTOCKED");
  const [reasons, setReasons] = useState<DefectReason[]>(initialReasons);
  const [customReasonDesc, setCustomReasonDesc] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /** 등급 변경 시 WMS Decision 자동 매칭 (악성 재고 방지) */
  const handleGradeChange = (grade: BookGrade) => {
    setSelectedGrade(grade);
    if (grade === "FAIR" || grade === "SCRAP") {
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
    <div className="w-full max-w-md mx-auto bg-white border-2 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-none transition-all relative overflow-hidden font-mono text-black">
      {/* 관리자 대기 장벽 가이드 헤더 */}
      <div className="flex items-start gap-3 bg-[#E60012]/10 border-2 border-black rounded-none p-4 mb-6">
        <ShieldAlert className="w-6 h-6 text-black shrink-0 mt-0.5" />
        <div>
          <h3 className="text-xs font-black text-black uppercase tracking-wider">
            HUMAN-IN-THE-LOOP INTERVENTION
          </h3>
          <p className="text-[10px] font-bold text-black uppercase mt-1 leading-relaxed">
            AI confidence score is low. Automatic routing is halted. Align physical book state and confirm final decision override.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* 1. 등급 보정 */}
        <div className="space-y-2">
          <label className="text-[10px] font-black text-black uppercase tracking-widest block">
            FORCE GRADE OVERRIDE *
          </label>
          <div className="grid grid-cols-5 gap-1.5" role="radiogroup" aria-label="도서 등급 선택">
            {GRADES.map((grade) => {
              const isSelected = selectedGrade === grade;
              return (
                <button
                  key={grade}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  onClick={() => handleGradeChange(grade)}
                  className={`py-2 px-1 text-[10px] font-black rounded-none border-2 border-black transition-all ${
                    isSelected
                      ? "bg-black text-white"
                      : "bg-white text-black hover:bg-black hover:text-white"
                  }`}
                >
                  {grade}
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. WMS 라우팅 결정 */}
        <div className="space-y-2">
          <label className="text-[10px] font-black text-black uppercase tracking-widest block">
            WMS STORAGE DECISION *
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setDecision("RESTOCKED")}
              className={`py-3 px-4 rounded-none flex items-center justify-center gap-2 border-2 border-black font-black text-[10px] transition-all uppercase shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none cursor-pointer ${
                decision === "RESTOCKED"
                  ? "bg-black text-white"
                  : "bg-white text-black"
              }`}
            >
              <Check className="w-4 h-4" />
              RESTOCK ITEM
            </button>

            <button
              type="button"
              onClick={() => setDecision("REJECTED")}
              className={`py-3 px-4 rounded-none flex items-center justify-center gap-2 border-2 border-black font-black text-[10px] transition-all uppercase shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none cursor-pointer ${
                decision === "REJECTED"
                  ? "bg-[#E60012] text-white"
                  : "bg-white text-black"
              }`}
            >
              <X className="w-4 h-4" />
              SCRAP / REJECT
            </button>
          </div>
        </div>

        {/* 3. 훼손 사유 관리 */}
        <div className="space-y-3">
          <label className="text-[10px] font-black text-black uppercase tracking-widest block">
            DEFECT REASON CODES
          </label>

          {/* 활성 사유 태그 */}
          {reasons.length > 0 ? (
            <div className="flex flex-wrap gap-1.5 p-3 bg-white border-2 border-black rounded-none min-h-[50px]">
              {reasons.map((r) => (
                <span
                  key={r.code}
                  className="inline-flex items-center gap-1.5 bg-white text-black text-[10px] font-black px-2.5 py-1 rounded-none border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                >
                  {r.description}
                  <button
                    type="button"
                    onClick={() => removeReason(r.code)}
                    aria-label={`${r.description} 사유 삭제`}
                    className="cursor-pointer text-black hover:text-[#E60012]"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 border-2 border-dashed border-black rounded-none text-gray-400 text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 bg-[#F9F9F7]">
              <HelpCircle className="w-3.5 h-3.5" /> NO ACTIVE DEFECT CODES (PASSED)
            </div>
          )}

          {/* 표준 사유 빠른 선택 */}
          <div className="space-y-1.5">
            <span className="text-[9px] text-gray-400 block font-black uppercase tracking-widest">
              FAST-SELECT STANDARD CODES
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
                    className={`text-[9px] font-black px-2 py-1 rounded-none border-2 border-black transition-all ${
                      isActive
                        ? "bg-black text-white"
                        : "bg-white text-black hover:bg-black hover:text-white"
                    }`}
                  >
                    {r.description}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 직접 사유 입력 */}
          <form onSubmit={addCustomReason} className="flex gap-2 pt-2">
            <input
              type="text"
              value={customReasonDesc}
              onChange={(e) => setCustomReasonDesc(e.target.value)}
              placeholder="직접 입력..."
              className="flex-1 text-[10px] rounded-none border-b-2 border-black px-3 py-2 bg-transparent text-black font-bold focus:outline-none placeholder-gray-300"
            />
            <button
              type="submit"
              className="rounded-none border-2 border-black bg-white px-3 py-2 hover:bg-black hover:text-white transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none cursor-pointer"
              aria-label="사유 추가"
            >
              <Plus className="w-4 h-4 text-current" />
            </button>
          </form>
        </div>
      </div>

      {/* 로딩 오버레이 */}
      {isSubmitting && (
        <div className="absolute inset-0 bg-white/95 border-2 border-black flex flex-col items-center justify-center text-center">
          <ShieldAlert className="w-10 h-10 text-black animate-pulse mb-3" />
          <span className="text-[10px] font-black uppercase tracking-widest text-black p-4 leading-relaxed">
            COMMITING WMS ROUTING TRANSACTION OVERRIDE...
          </span>
        </div>
      )}

      {/* 에러 */}
      {error && (
        <div className="mt-4 p-2.5 bg-[#E60012]/10 border-2 border-black rounded-none text-center text-xs font-black text-black uppercase tracking-wider">
          {error}
        </div>
      )}

      {/* 하단 버튼 */}
      <div className="mt-8 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="rounded-none py-4 font-black text-xs border-2 border-black bg-white text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none hover:bg-black hover:text-white transition-all cursor-pointer uppercase disabled:opacity-50"
        >
          CANCEL
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="rounded-none py-4 font-black text-xs border-2 border-black bg-[#E60012] text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none hover:bg-white hover:text-black transition-all cursor-pointer uppercase disabled:opacity-50"
        >
          CONFIRM DECISION
        </button>
      </div>
    </div>
  );
}
