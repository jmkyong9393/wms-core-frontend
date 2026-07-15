"use client";

import React, { useState, useEffect } from "react";
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
import { useS3Upload } from "@/features/inbound/hooks/useS3Upload";
import { useCamera } from "@/features/inbound/hooks/useCamera";
import { processImage } from "@/features/inbound/utils/image-processor";

/**
 * ReturnsInspector — 전체 AI 검수 위저드 오케스트레이터 (WebRTC 탑재)
 *
 * 실시간 가이드라인 오버레이, 볼륨/페달 단축키 촬영 및 흔들림(Blur) 판독 연산이 통합된 마스터 검수 흐름입니다.
 */
export default function ReturnsInspector() {
  const [step, setStep] = useState<
    "select_mode" | "capture" | "analyzing" | "result"
  >("select_mode");
  const [mode, setMode] = useState<InspectionMode>("NEW_RETURN");
  const [jobId, setJobId] = useState<string | null>(null);
  const [mockActive, setMockActive] = useState(isMockMode());
  const [localError, setLocalError] = useState<string | null>(null);
  const [isProcessingLocal, setIsProcessingLocal] = useState(false);

  const {
    jobStatus,
    result,
    error: jobError,
    resetJobState,
    setResultDirectly,
  } = useJobStatus(jobId);

  const { uploadImage, isCompressing, isUploading, uploadProgress, error: uploadError } = useS3Upload();
  const { videoRef, startCamera, stopCamera, error: cameraError } = useCamera();

  // 1. 촬영 단계("capture") 진입 시에만 카메라 가동 시작
  useEffect(() => {
    if (step === "capture") {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [step, startCamera, stopCamera]);

  // 2. 물리 풋페달 단축키 바인딩
  useEffect(() => {
    if (step !== "capture") return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        ["AudioVolumeUp", "AudioVolumeDown", "VolumeUp", "VolumeDown", " ", "Enter"].includes(e.key) ||
        e.keyCode === 24 ||
        e.keyCode === 25
      ) {
        const btn = document.getElementById("capture-btn");
        if (btn && !btn.hasAttribute("disabled")) {
          e.preventDefault();
          btn.click();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [step]);

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

  // 비디오 프레임 캡처 및 전처리 파이프라인
  const handleCapture = async () => {
    if (!videoRef.current || isProcessingLocal || isCompressing || isUploading) return;

    setLocalError(null);
    setIsProcessingLocal(true);

    try {
      // 1) 흔들림 검사 및 캔버스 스케일링
      const processed = await processImage(videoRef.current);
      if (processed.isBlurred) {
        setLocalError("⚠️ 사진이 너무 흔들렸습니다. 구도를 고정한 채 다시 촬영해 주세요.");
        setIsProcessingLocal(false);
        return;
      }

      setStep("analyzing");

      // 2) S3 업로드 진행
      const filePayload = new File([processed.blob], `inspect_${Date.now()}.jpg`, { type: "image/jpeg" });
      const uploadResult = await uploadImage(filePayload);
      if (!uploadResult) {
        throw new Error("이미지 서버 전송에 실패했습니다.");
      }

      // 3) AI 검수 큐 진입 요청
      const inspectResponse = await startInspection({
        mode,
        coverImageUrl: uploadResult.url,
        defectImageUrls: [],
        bookTitle: mode === "NEW_RETURN" ? "반품 신간 도서" : "매입 중고 도서",
      });

      setJobId(inspectResponse.jobId);
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "AI 검수 요청 시작에 실패했습니다.";
      setLocalError(errMsg);
      setStep("capture");
    } finally {
      setIsProcessingLocal(false);
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

  // 완료 전이 조건
  if (
    step === "analyzing" &&
    (jobStatus === "COMPLETED" || jobStatus === "HITL_WAITING") &&
    result
  ) {
    setStep("result");
  }

  const isWorking = isProcessingLocal || isCompressing || isUploading;

  return (
    <div className="w-full max-w-md mx-auto space-y-4">
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

      {/* ─── Step 2: 실시간 WebRTC 촬영 ─── */}
      {step === "capture" && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
            <Camera className="w-5 h-5 text-indigo-500" />
            {mode === "NEW_RETURN" ? "신간 반품 촬영" : "중고 매입 촬영"}
          </h2>

          <div className="relative w-full aspect-[4/3] bg-black rounded-3xl overflow-hidden shadow-md">
            {cameraError && (
              <div className="absolute inset-0 bg-zinc-950 text-white flex items-center justify-center p-4 text-center text-xs z-20">
                {cameraError}
              </div>
            )}
            
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />

            {/* 도서 정렬 가이드라인 박스 */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-6 z-10">
              <div className="w-full h-[80%] border-2 border-dashed border-white/60 rounded-xl relative flex items-center justify-center">
                <span className="absolute top-2 text-white/80 text-[10px] bg-black/40 px-2 py-0.5 rounded-full">
                  도서를 선 안에 정렬하세요
                </span>
                <div className="w-6 h-[2px] bg-white/40 absolute" />
                <div className="w-[2px] h-6 bg-white/40 absolute" />
              </div>
            </div>

            {/* 흔들림 연산 및 로컬 전처리 처리 중 오버레이 */}
            {isProcessingLocal && (
              <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white text-xs z-20">
                <Loader2 className="w-8 h-8 text-indigo-400 animate-spin mb-2" />
                <span>흔들림 감지 판독 중...</span>
              </div>
            )}
          </div>

          {(localError || uploadError) && (
            <div className="p-2.5 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-xl text-center text-xs text-red-600">
              <AlertCircle className="w-4 h-4 inline mr-1" />
              {localError || uploadError}
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
              id="capture-btn"
              type="button"
              onClick={handleCapture}
              disabled={isWorking}
              className="py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/10 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Camera className="w-4 h-4" />
              촬영하기
            </button>
          </div>
        </div>
      )}

      {/* ─── Step 3: AI 분석 대기 ─── */}
      {step === "analyzing" && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-center">
            {isWorking ? (
              <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
            ) : (
              <Sparkles className="w-8 h-8 text-indigo-500 animate-pulse" />
            )}
          </div>
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 mb-1">
            {isWorking ? "도서 이미지 처리 중..." : "AI 비전 판독 진행 중..."}
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4">
            {isWorking
              ? isCompressing
                ? "고효율 Web Worker 이미지 압축 실행 중"
                : `S3 Direct 업로드 중... (${uploadProgress}%)`
              : jobStatus === "PENDING"
                ? "검수 대기열에서 가용한 LangGraph 에이전트를 매칭하는 중입니다."
                : "OpenCV를 통한 픽셀 BBox 피팅 및 UBCI 상태 수치를 취합하고 있습니다."}
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

      {/* ─── Step 4: 결과 리포트 ─── */}
      {step === "result" && result && (
        <div className="space-y-4">
          {/* HITL 수동 결정 차단 장벽 */}
          {jobStatus === "HITL_WAITING" && (
            <ReturnsHitlPanel
              jobId={result.jobId}
              initialGrade={result.grade}
              initialReasons={result.reasons}
              onOverrideComplete={handleHitlOverrideComplete}
              onCancel={handleReset}
            />
          )}

          {/* AI 리포트 문서 */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-500" />
                AI 품질 판독 명세서
              </h3>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  jobStatus === "COMPLETED"
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400"
                    : "bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400"
                }`}
              >
                {jobStatus === "COMPLETED" ? "자동 판정 완료" : "수동 승인 필요"}
              </span>
            </div>

            {/* 품질 지표 명세 */}
            <div className="grid grid-cols-3 gap-2.5 mb-4">
              <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-900 rounded-2xl p-3 text-center">
                <p className="text-[10px] text-zinc-400 mb-0.5">판독 등급</p>
                <p className="text-base font-black text-zinc-900 dark:text-zinc-50">
                  {result.grade || "—"}
                </p>
              </div>
              <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-900 rounded-2xl p-3 text-center">
                <p className="text-[10px] text-zinc-400 mb-0.5">AI 신뢰도</p>
                <p className="text-base font-black text-zinc-900 dark:text-zinc-50">
                  {result.confidenceScore != null
                    ? `${(result.confidenceScore * 100).toFixed(0)}%`
                    : "—"}
                </p>
              </div>
              <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-900 rounded-2xl p-3 text-center">
                <p className="text-[10px] text-zinc-400 mb-0.5">WMS 적재</p>
                <p className="text-xs font-bold pt-0.5">
                  {result.wmsDecision === "RESTOCKED" ? (
                    <span className="text-emerald-600 flex items-center justify-center gap-0.5">
                      <FileCheck2 className="w-3.5 h-3.5" /> 가용입고
                    </span>
                  ) : result.wmsDecision === "REJECTED" ? (
                    <span className="text-red-600 flex items-center justify-center gap-0.5">
                      <FileX2 className="w-3.5 h-3.5" /> 불합반려
                    </span>
                  ) : (
                    "—"
                  )}
                </p>
              </div>
            </div>

            {/* OpenCV 검수 캔버스 피드백 */}
            {result.processedCoverImageUrl && (
              <div className="space-y-2 mb-4">
                <h4 className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1">
                  <ExternalLink className="w-3 h-3 text-indigo-500" />
                  AI 판독 검출본 (BBox 맵핑)
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

            {/* 검수 마감 및 리셋 */}
            {jobStatus === "COMPLETED" && (
              <button
                type="button"
                onClick={handleReset}
                className="w-full rounded-2xl py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/10"
              >
                <RotateCcw className="w-4 h-4" />
                검수 마감 및 신규 검수 시작
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
