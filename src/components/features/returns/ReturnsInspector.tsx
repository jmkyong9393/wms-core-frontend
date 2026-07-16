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
  Clock,
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
    <div className="w-full max-w-md mx-auto space-y-4 font-mono">
      {/* Mock 모드 토글 바 (브루탈리즘화) */}
      <div className="flex items-center justify-between bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rounded-none px-4 py-2.5">
        <span className="text-[10px] font-black text-black uppercase tracking-wider">
          Local Mock API
        </span>
        <button
          type="button"
          onClick={handleToggleMock}
          className="flex items-center gap-1.5 text-xs font-bold font-mono"
        >
          {mockActive ? (
            <span className="bg-black text-white border-2 border-black px-2 py-0.5 text-[9px] font-black rounded-none">ACTIVE</span>
          ) : (
            <span className="bg-white text-black border-2 border-black px-2 py-0.5 text-[9px] font-black rounded-none">INACTIVE</span>
          )}
        </button>
      </div>

      {/* ─── Step 1: 모드 선택 ─── */}
      {step === "select_mode" && (
        <div className="space-y-3">
          <h2 className="text-sm font-black tracking-wider text-black uppercase border-b-2 border-black pb-2 mb-4 flex items-center gap-2">
            <ClipboardList className="w-4 h-4" />
            SELECT INSPECTION TYPE
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => handleSelectMode("NEW_RETURN")}
              className="bg-white border-2 border-black rounded-none p-5 text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none transition-all cursor-pointer group"
            >
              <BookOpen className="w-8 h-8 text-black mx-auto mb-2 group-hover:scale-105 transition-transform" />
              <span className="text-xs font-black text-black block uppercase tracking-wider">
                신간 반품
              </span>
              <span className="text-[10px] text-gray-400 mt-1 block uppercase tracking-widest font-semibold">
                FRONT COVER ONLY
              </span>
            </button>
            <button
              type="button"
              onClick={() => handleSelectMode("USED_PURCHASE")}
              className="bg-white border-2 border-black rounded-none p-5 text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none transition-all cursor-pointer group"
            >
              <TrendingDown className="w-8 h-8 text-black mx-auto mb-2 group-hover:scale-105 transition-transform" />
              <span className="text-xs font-black text-black block uppercase tracking-wider">
                중고 매입
              </span>
              <span className="text-[10px] text-gray-400 mt-1 block uppercase tracking-widest font-semibold">
                COVER + INSIDE PAGES
              </span>
            </button>
          </div>
        </div>
      )}

      {/* ─── Step 2: 실시간 WebRTC 촬영 ─── */}
      {step === "capture" && (
        <div className="space-y-4">
          <h2 className="text-sm font-black tracking-wider text-black uppercase border-b-2 border-black pb-2 mb-4 flex items-center gap-2">
            <Camera className="w-4 h-4" />
            {mode === "NEW_RETURN" ? "NEW BOOK SCAN" : "USED BOOK SCAN"}
          </h2>

          <div className="relative w-full aspect-[4/3] bg-black border-2 border-black rounded-none overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            {cameraError && (
              <div className="absolute inset-0 bg-zinc-950 text-white flex items-center justify-center p-4 text-center text-xs z-20 font-black uppercase">
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

            {/* 도서 정렬 가이드라인 박스 (둥글기 엄격 배제) */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-6 z-10">
              <div className="w-full h-[80%] border-2 border-dashed border-white rounded-none relative flex items-center justify-center">
                <span className="absolute top-2 text-white text-[9px] font-black uppercase tracking-wider bg-black border border-white px-2 py-0.5 rounded-none">
                  ALIGN BOOK WITHIN BOX
                </span>
                <div className="w-6 h-[2px] bg-white/40 absolute" />
                <div className="w-[2px] h-6 bg-white/40 absolute" />
              </div>
            </div>

            {/* 흔들림 연산 및 로컬 전처리 처리 중 오버레이 */}
            {isProcessingLocal && (
              <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-white text-xs z-20">
                <Loader2 className="w-8 h-8 text-white animate-spin mb-2" />
                <span className="font-black uppercase tracking-wider">BLUR CHECK RUNNING...</span>
              </div>
            )}
          </div>

          {(localError || uploadError) && (
            <div className="p-3 bg-[#E60012]/10 border-2 border-black rounded-none text-center text-xs font-black text-black uppercase tracking-wider shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              {localError || uploadError}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={handleReset}
              className="py-3 rounded-none border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none hover:bg-black hover:text-white transition-all bg-white text-black font-bold text-xs cursor-pointer uppercase"
            >
              BACK
            </button>
            <button
              id="capture-btn"
              type="button"
              onClick={handleCapture}
              disabled={isWorking}
              className="py-3 rounded-none bg-black text-white hover:bg-white hover:text-black border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all text-xs font-bold flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer uppercase"
            >
              <Camera className="w-4 h-4" />
              CAPTURE
            </button>
          </div>
        </div>
      )}

      {/* ─── Step 3: AI 분석 대기 ─── */}
      {step === "analyzing" && (
        <div className="bg-white border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-none p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-none border-2 border-black bg-black text-white flex items-center justify-center">
            {isWorking ? (
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            ) : (
              <Sparkles className="w-8 h-8 text-white animate-pulse" />
            )}
          </div>
          <h3 className="text-xs font-black text-black mb-2 uppercase tracking-widest">
            {isWorking ? "PROCESSING IMAGE..." : "AI AGENT RUNNING..."}
          </h3>
          <p className="text-[10px] text-gray-500 font-semibold mb-4 leading-relaxed uppercase">
            {isWorking
              ? isCompressing
                ? "COMPRESSING SOURCE IMAGE VIA WEB WORKER..."
                : `STREAMING TO S3 DIRECT UPLOAD... (${uploadProgress}%)`
              : jobStatus === "PENDING"
                ? "MATCHING AVAILABLE LANGGRAPH AGENT FROM WORK QUEUE..."
                : "COLLECTING OPENCV BBOX COORDINATES AND UBCI DEFECT METRICS..."}
          </p>

          {(jobError || localError) && (
            <div className="p-3 bg-[#E60012]/10 border-2 border-black rounded-none text-xs font-black text-black mb-4 uppercase tracking-wider shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              {jobError || localError}
            </div>
          )}

          <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            <Clock className="w-3.5 h-3.5 text-black" />
            STATUS: {jobStatus || "CONNECTING"}
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
          <div className="bg-white border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-none p-6">
            <div className="flex items-center justify-between mb-4 border-b-2 border-black pb-2">
              <h3 className="text-xs font-black text-black flex items-center gap-2 uppercase tracking-widest">
                <Sparkles className="w-4 h-4" />
                AI QUALITY MANIFEST
              </h3>
              <span
                className={`text-[9px] font-black px-2 py-0.5 border-2 border-black rounded-none uppercase tracking-wider ${
                  jobStatus === "COMPLETED"
                    ? "bg-black text-white"
                    : "bg-[#E60012] text-white"
                }`}
              >
                {jobStatus === "COMPLETED" ? "AUTO PASSED" : "HITL PENDING"}
              </span>
            </div>

            {/* 품질 지표 명세 */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="bg-white border-2 border-black rounded-none p-3 text-center shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mb-1">GRADE</p>
                <p className="text-sm font-black text-black uppercase">
                  {result.grade || "—"}
                </p>
              </div>
              <div className="bg-white border-2 border-black rounded-none p-3 text-center shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mb-1">CONFIDENCE</p>
                <p className="text-sm font-black text-black">
                  {result.confidenceScore != null
                    ? `${(result.confidenceScore * 100).toFixed(0)}%`
                    : "—"}
                </p>
              </div>
              <div className="bg-white border-2 border-black rounded-none p-3 text-center shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mb-1">DECISION</p>
                <p className="text-[10px] font-black uppercase">
                  {result.wmsDecision === "RESTOCKED" ? (
                    <span className="text-black flex items-center justify-center gap-0.5">
                      STOCKABLE
                    </span>
                  ) : result.wmsDecision === "REJECTED" ? (
                    <span className="text-[#E60012] flex items-center justify-center gap-0.5">
                      REJECTED
                    </span>
                  ) : (
                    "—"
                  )}
                </p>
              </div>
            </div>

            {/* OpenCV 검수 캔버스 피드백 */}
            {result.processedCoverImageUrl && (
              <div className="space-y-2 mb-6">
                <h4 className="text-[10px] font-black text-black flex items-center gap-1 uppercase tracking-widest">
                  <ExternalLink className="w-3.5 h-3.5" />
                  BBOX LOG VISUALIZATION
                </h4>
                <div className="rounded-none overflow-hidden border-2 border-black bg-white aspect-video flex items-center justify-center p-1">
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
