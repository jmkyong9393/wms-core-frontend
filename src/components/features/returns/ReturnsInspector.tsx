"use client";

import React, { useState } from "react";
import { useJobStatus } from "@/hooks/useJobStatus";
import {
  startInspection,
  isMockMode,
  setMockMode,
} from "@/services/returnService";
import type { InspectionMode, InspectionResult } from "@/types/returnTypes";
import ReturnsHitlPanel from "./ReturnsHitlPanel";
import {
  BookOpen,
  TrendingDown,
  RotateCcw,
  Sparkles,
  ClipboardList,
  AlertCircle,
  Clock,
  ToggleLeft,
  ToggleRight,
  FileCheck2,
  FileX2,
  ExternalLink,
  Camera,
  Loader2,
} from "lucide-react";
import { useS3Upload } from "@/hooks/useS3Upload";

/**
 * ReturnsInspector — 전체 AI 검수 위저드 오케스트레이터
 *
 * 모드 선택 → 촬영/업로드 → AI 비동기 대기 → 결과 리포팅/HITL 관리자 보정 전 단계를 조율합니다.
 * Mock 모드 토글 내장으로 백엔드 없이 전체 플로우 시연 가능.
 */
export default function ReturnsInspector() {
  const [step, setStep] = useState<
    "select_mode" | "capture" | "analyzing" | "result"
  >("select_mode");
  const [mode, setMode] = useState<InspectionMode>("NEW_RETURN");
  const [jobId, setJobId] = useState<string | null>(null);
  const [mockActive, setMockActive] = useState(isMockMode());
  const [localError, setLocalError] = useState<string | null>(null);

  const {
    jobStatus,
    result,
    error: jobError,
    resetJobState,
    setResultDirectly,
  } = useJobStatus(jobId);
  const { uploadImage, isCompressing, isUploading, uploadProgress } = useS3Upload();

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Mock 모드 토글
  const handleToggleMock = () => {
    const nextState = !mockActive;
    setMockActive(nextState);
    setMockMode(nextState);
  };

  // 모드 선택
  const handleSelectMode = (selectedMode: InspectionMode) => {
    setMode(selectedMode);
    setStep("capture");
  };

  // 촬영 트리거
  const triggerCapture = () => {
    fileInputRef.current?.click();
  };

  // 파일 선택 → 압축 → 업로드 → 검수 시작
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setLocalError(null);
    setStep("analyzing");

    try {
      const uploadResult = await uploadImage(files[0]);
      if (!uploadResult) {
        throw new Error("이미지 업로드에 실패했습니다.");
      }

      const inspectResponse = await startInspection({
        mode,
        coverImageUrl: uploadResult.url,
        defectImageUrls: [],
        bookTitle:
          mode === "NEW_RETURN" ? "반품 신간 도서" : "매입 중고 도서",
      });

      setJobId(inspectResponse.jobId);
    } catch (err: unknown) {
      const errMsg =
        err instanceof Error
          ? err.message
          : "AI 검수 요청 시작에 실패했습니다.";
      setLocalError(errMsg);
      setStep("capture");
    }

    // input 초기화
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // HITL 보정 완료
  const handleHitlOverrideComplete = (updatedResult: InspectionResult) => {
    setResultDirectly(updatedResult);
  };

  // 초기화
  const handleReset = () => {
    resetJobState();
    setJobId(null);
    setStep("select_mode");
    setLocalError(null);
  };

  // jobStatus 변경 시 result 스텝으로 자동 전이
  if (
    step === "analyzing" &&
    (jobStatus === "COMPLETED" || jobStatus === "HITL_WAITING") &&
    result
  ) {
    setStep("result");
  }

  const isProcessing = isCompressing || isUploading;

  return (
    <div className="w-full max-w-md mx-auto space-y-4">
      {/* 히든 파일 인풋 */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Mock 모드 토글 바 */}
      <div className="flex items-center justify-between bg-zinc-100 dark:bg-zinc-800/50 rounded-2xl px-4 py-2.5">
        <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
          Local Mock API 모사
        </span>
        <button
          type="button"
          onClick={handleToggleMock}
          className="flex items-center gap-1.5 text-xs font-bold"
        >
          {mockActive ? (
            <>
              <ToggleRight className="w-5 h-5 text-emerald-500" />
              <span className="text-emerald-600 dark:text-emerald-400">
                활성화
              </span>
            </>
          ) : (
            <>
              <ToggleLeft className="w-5 h-5 text-zinc-400" />
              <span className="text-zinc-500">비활성화</span>
            </>
          )}
        </button>
      </div>

      {/* ─── Step 1: 모드 선택 ─── */}
      {step === "select_mode" && (
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-indigo-500" />
            검수 유형 선택
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleSelectMode("NEW_RETURN")}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 text-center hover:border-indigo-500 dark:hover:border-indigo-400 transition-all hover:shadow-md group"
            >
              <BookOpen className="w-8 h-8 text-indigo-500 mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-bold text-zinc-800 dark:text-zinc-200 block">
                신간 반품
              </span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 block">
                표지 1장 촬영
              </span>
            </button>
            <button
              type="button"
              onClick={() => handleSelectMode("USED_PURCHASE")}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 text-center hover:border-indigo-500 dark:hover:border-indigo-400 transition-all hover:shadow-md group"
            >
              <TrendingDown className="w-8 h-8 text-amber-500 mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-bold text-zinc-800 dark:text-zinc-200 block">
                중고 매입
              </span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 block">
                표지 + 속지 촬영
              </span>
            </button>
          </div>
        </div>
      )}

      {/* ─── Step 2: 촬영 ─── */}
      {step === "capture" && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
            <Camera className="w-5 h-5 text-indigo-500" />
            {mode === "NEW_RETURN" ? "신간 반품 촬영" : "중고 매입 촬영"}
          </h2>

          <div className="rounded-2xl border-2 border-dashed border-zinc-300 dark:border-zinc-700 aspect-video flex flex-col items-center justify-center text-zinc-400 bg-zinc-50 dark:bg-zinc-950/40">
            <Camera className="w-10 h-10 mb-2" />
            <span className="text-sm font-medium">
              아래 버튼으로 촬영하세요
            </span>
          </div>

          {localError && (
            <div className="p-2.5 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-xl text-center text-xs text-red-600">
              <AlertCircle className="w-4 h-4 inline mr-1" />
              {localError}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={handleReset}
              className="py-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-600 hover:bg-zinc-50 transition-colors"
            >
              뒤로 가기
            </button>
            <button
              type="button"
              onClick={triggerCapture}
              disabled={isProcessing}
              className="py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/10 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Camera className="w-4 h-4" />
              촬영 시작
            </button>
          </div>
        </div>
      )}

      {/* ─── Step 3: AI 분석 대기 ─── */}
      {step === "analyzing" && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-center">
            {isProcessing ? (
              <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
            ) : (
              <Sparkles className="w-8 h-8 text-indigo-500 animate-pulse" />
            )}
          </div>
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 mb-1">
            {isProcessing
              ? "이미지 처리 중..."
              : "AI 멀티에이전트 비전 분석 중..."}
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4">
            {isProcessing
              ? `압축/업로드 진행률: ${uploadProgress}%`
              : jobStatus === "PENDING"
                ? "검수 대기열에서 순서를 기다리고 있습니다."
                : "OpenCV BBox 맵핑 및 UBCI 점수 산출 중..."}
          </p>

          {(jobError || localError) && (
            <div className="p-2.5 bg-red-50 dark:bg-red-950/20 rounded-xl text-xs text-red-600 mb-4">
              <AlertCircle className="w-4 h-4 inline mr-1" />
              {jobError || localError}
            </div>
          )}

          <div className="flex items-center justify-center gap-2 text-xs text-zinc-400">
            <Clock className="w-3.5 h-3.5" />
            {jobStatus || "CONNECTING"}
          </div>
        </div>
      )}

      {/* ─── Step 4: 결과 ─── */}
      {step === "result" && result && (
        <div className="space-y-4">
          {/* HITL 대기 시 관리자 보정 패널 표시 */}
          {jobStatus === "HITL_WAITING" && (
            <ReturnsHitlPanel
              jobId={result.jobId}
              initialGrade={result.grade}
              initialReasons={result.reasons}
              onOverrideComplete={handleHitlOverrideComplete}
              onCancel={handleReset}
            />
          )}

          {/* 결과 리포트 카드 */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-500" />
                AI 검수 최종 리포트
              </h3>
              <span
                className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                  jobStatus === "COMPLETED"
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400"
                    : "bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400"
                }`}
              >
                {jobStatus === "COMPLETED" ? "자동 판정 완료" : "보정 대기"}
              </span>
            </div>

            {/* 핵심 지표 */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="bg-zinc-50 dark:bg-zinc-950 rounded-xl p-3 text-center">
                <p className="text-xs text-zinc-500 mb-1">등급</p>
                <p className="text-lg font-black text-zinc-900 dark:text-zinc-50">
                  {result.grade || "—"}
                </p>
              </div>
              <div className="bg-zinc-50 dark:bg-zinc-950 rounded-xl p-3 text-center">
                <p className="text-xs text-zinc-500 mb-1">신뢰도</p>
                <p className="text-lg font-black text-zinc-900 dark:text-zinc-50">
                  {result.confidenceScore != null
                    ? `${(result.confidenceScore * 100).toFixed(0)}%`
                    : "—"}
                </p>
              </div>
              <div className="bg-zinc-50 dark:bg-zinc-950 rounded-xl p-3 text-center">
                <p className="text-xs text-zinc-500 mb-1">WMS</p>
                <p className="text-sm font-bold flex items-center justify-center gap-1">
                  {result.wmsDecision === "RESTOCKED" ? (
                    <span className="text-emerald-600 flex items-center gap-1">
                      <FileCheck2 className="w-3.5 h-3.5" /> 입고
                    </span>
                  ) : result.wmsDecision === "REJECTED" ? (
                    <span className="text-red-600 flex items-center gap-1">
                      <FileX2 className="w-3.5 h-3.5" /> 반려
                    </span>
                  ) : (
                    "—"
                  )}
                </p>
              </div>
            </div>

            {/* AI 분석 이미지 */}
            {result.processedCoverImageUrl && (
              <div className="space-y-2 mb-4">
                <h4 className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1">
                  <ExternalLink className="w-3 h-3" />
                  AI 결함 탐지 이미지
                </h4>
                <div className="rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 aspect-video flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={result.processedCoverImageUrl}
                    alt="AI 분석 결과물"
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
            )}

            {/* 완료 시 리셋 버튼 */}
            {jobStatus === "COMPLETED" && (
              <button
                type="button"
                onClick={handleReset}
                className="w-full rounded-2xl py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/10"
              >
                <RotateCcw className="w-5 h-5" />
                검수 마감 및 신규 검수 시작
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
