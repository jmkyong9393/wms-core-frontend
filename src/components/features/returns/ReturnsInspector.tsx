"use client";

import React, { useState, useEffect } from "react";
import { useJobStatus } from "@/hooks/useJobStatus";
import {
  registerBook,
  createUsedItemInbound,
  startInspection,
  submitRecheck,
  isMockMode,
  setMockMode,
} from "@/services/returnService";
import {
  DETAIL_REQUIRED_STATUSES,
  type InspectionMode,
  type BookRegistrationResult,
  type UsedItemInboundResult,
} from "@/types/returnTypes";
import { getGradeLabel } from "@/features/inspections/utils/gradeBadge";
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
  ScanBarcode,
  Tag,
} from "lucide-react";
import { useS3Upload } from "@/features/inbound/hooks/useS3Upload";
import { useCamera } from "@/features/inbound/hooks/useCamera";
import { processImage } from "@/features/inbound/utils/image-processor";

type WizardStep = "select_mode" | "register" | "capture" | "analyzing" | "result";

/**
 * ReturnsInspector — 전체 AI 검수 위저드 오케스트레이터 (WebRTC 탑재)
 *
 * 실시간 가이드라인 오버레이, 볼륨/페달 단축키 촬영 및 흔들림(Blur) 판독 연산이 통합된 마스터 검수 흐름입니다.
 * 실제 검수 생성은 `inbound_item_id`/`book_id`가 필요하므로, 촬영 전에 도서 등록(ISBN) →
 * 입고 접수(LPN 발급) 단계를 먼저 거칩니다.
 */
export default function ReturnsInspector() {
  const [step, setStep] = useState<WizardStep>("select_mode");
  const [mode, setMode] = useState<InspectionMode>("NEW_RETURN");
  const [jobId, setJobId] = useState<string | null>(null);
  const [isRecheck, setIsRecheck] = useState(false);
  const [mockActive, setMockActive] = useState(isMockMode());
  const [localError, setLocalError] = useState<string | null>(null);
  const [isProcessingLocal, setIsProcessingLocal] = useState(false);

  // ─── 도서 등록 / 입고 접수 단계 상태 ───
  const [isbn, setIsbn] = useState("");
  const [supplierName, setSupplierName] = useState("");
  const [bookInfo, setBookInfo] = useState<BookRegistrationResult | null>(null);
  const [inboundInfo, setInboundInfo] = useState<UsedItemInboundResult | null>(null);
  const [idempotencyKey, setIdempotencyKey] = useState<string>("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [registerError, setRegisterError] = useState<string | null>(null);

  const {
    jobStatus,
    result,
    error: jobError,
    resetJobState,
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

  // 모드 선택 → 도서 등록 단계로 진입, 이번 등록 시도용 Idempotency-Key 신규 발급
  const handleSelectMode = (selectedMode: InspectionMode) => {
    setMode(selectedMode);
    setIsbn("");
    setSupplierName("");
    setBookInfo(null);
    setInboundInfo(null);
    setRegisterError(null);
    setIdempotencyKey(crypto.randomUUID());
    setStep("register");
  };

  // 도서 마스터 등록 + 입고 접수(LPN 발급)를 순차 수행
  const handleRegister = async () => {
    if (!isbn.trim() || isRegistering) return;
    setIsRegistering(true);
    setRegisterError(null);
    try {
      const book = bookInfo ?? (await registerBook(isbn.trim()));
      setBookInfo(book);

      const inbound = await createUsedItemInbound({
        mode,
        bookId: book.bookId,
        supplierName: mode === "USED_PURCHASE" ? supplierName.trim() || undefined : undefined,
        idempotencyKey,
      });
      setInboundInfo(inbound);
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "도서 등록/입고 접수에 실패했습니다.";
      setRegisterError(errMsg);
    } finally {
      setIsRegistering(false);
    }
  };

  // 비디오 프레임 캡처 및 전처리 파이프라인
  const handleCapture = async () => {
    if (!videoRef.current || isProcessingLocal || isCompressing || isUploading) return;
    if (!isRecheck && !inboundInfo) return;

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

      // 3) AI 검수 큐 진입 요청 (재촬영이면 동일 jobId로 recheck, 아니면 신규 생성)
      if (isRecheck && jobId) {
        await submitRecheck(jobId, [uploadResult.url]);
      } else if (inboundInfo && bookInfo) {
        const inspectResponse = await startInspection({
          inboundItemId: inboundInfo.inboundItemId,
          bookId: bookInfo.bookId,
          mode,
          imagePaths: [uploadResult.url],
        });
        setJobId(inspectResponse.jobId);
      }
      setIsRecheck(false);
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "AI 검수 요청 시작에 실패했습니다.";
      setLocalError(errMsg);
      setStep(isRecheck ? "result" : "capture");
    } finally {
      setIsProcessingLocal(false);
    }
  };

  // RECHECK_REQUIRED 상태에서 재촬영 진입 (동일 jobId 유지, SSE 구독은 끊기지 않음)
  const handleStartRecheck = () => {
    setIsRecheck(true);
    setLocalError(null);
    setStep("capture");
  };

  // 초기화
  const handleReset = () => {
    resetJobState();
    setJobId(null);
    setIsRecheck(false);
    setStep("select_mode");
    setLocalError(null);
    setBookInfo(null);
    setInboundInfo(null);
    setRegisterError(null);
  };

  // 결과/대기 화면 전이 조건: SSE 경량 payload로 채워지지 않는 상세가 필요한 상태에 도달하면 결과 단계로 전환
  if (
    step === "analyzing" &&
    jobStatus &&
    DETAIL_REQUIRED_STATUSES.includes(jobStatus) &&
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

      {/* ─── Step 2: 도서 등록 및 입고 접수(LPN 발급) ─── */}
      {step === "register" && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
            <ScanBarcode className="w-5 h-5 text-indigo-500" />
            도서 등록 및 입고 접수
          </h2>

          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block">
                ISBN
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={isbn}
                onChange={(e) => setIsbn(e.target.value)}
                disabled={!!bookInfo}
                placeholder="ISBN-10 또는 ISBN-13 입력"
                className="w-full text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 px-3 py-2.5 bg-white dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:opacity-60"
              />
            </div>

            {mode === "USED_PURCHASE" && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block">
                  매입처(선택)
                </label>
                <input
                  type="text"
                  value={supplierName}
                  onChange={(e) => setSupplierName(e.target.value)}
                  disabled={!!inboundInfo}
                  placeholder="매입처명을 입력하세요"
                  className="w-full text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 px-3 py-2.5 bg-white dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:opacity-60"
                />
              </div>
            )}

            {bookInfo && (
              <div className="p-3 bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30 rounded-2xl text-xs text-indigo-700 dark:text-indigo-400">
                {bookInfo.title} · {bookInfo.publisher ?? "출판사 미상"}
              </div>
            )}

            {inboundInfo && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 rounded-2xl text-xs text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5" />
                LPN 발급 완료: {inboundInfo.lpnBarcode}
              </div>
            )}

            {registerError && (
              <div className="p-2.5 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-xl text-center text-xs text-red-600 dark:text-red-400">
                <AlertCircle className="w-4 h-4 inline mr-1" />
                {registerError}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={handleReset}
              className="py-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-600 hover:bg-zinc-50 transition-colors"
            >
              뒤로 가기
            </button>
            {!inboundInfo ? (
              <button
                type="button"
                onClick={handleRegister}
                disabled={!isbn.trim() || isRegistering}
                className="py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/10 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isRegistering ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <ScanBarcode className="w-4 h-4" />
                )}
                등록 및 입고 접수
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setStep("capture")}
                className="py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/10 flex items-center justify-center gap-2"
              >
                <Camera className="w-4 h-4" />
                촬영 시작하기
              </button>
            )}
          </div>
        </div>
      )}

      {/* ─── Step 3: 실시간 WebRTC 촬영 ─── */}
      {step === "capture" && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
            <Camera className="w-5 h-5 text-indigo-500" />
            {isRecheck ? "재촬영하기" : mode === "NEW_RETURN" ? "신간 반품 촬영" : "중고 매입 촬영"}
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
              onClick={isRecheck ? () => setStep("result") : handleReset}
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

      {/* ─── Step 4: AI 분석 대기 ─── */}
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
            {isWorking ? "도서 이미지 처리 중..." : `AI 비전 판독 진행 중... (${result?.progress ?? 0}%)`}
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

      {/* ─── Step 5: 결과 리포트 / 대기·재촬영 안내 ─── */}
      {step === "result" && result && (
        <div className="space-y-4">
          {/* 관리자 판정 대기 안내 (읽기 전용) */}
          {jobStatus === "HITL_REQUIRED" && (
            <ReturnsHitlPanel
              jobId={result.jobId}
              conditionGrade={result.conditionGrade}
              ubciScore={result.ubciScore}
              finalReport={result.finalReport}
              onBack={handleReset}
            />
          )}

          {/* 재촬영 필요 안내 */}
          {jobStatus === "RECHECK_REQUIRED" && (
            <div className="bg-white dark:bg-zinc-900 border-2 border-amber-500/80 rounded-3xl p-6 text-center space-y-4">
              <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">
                재촬영이 필요합니다
              </h3>
              {result.finalReport && (
                <p className="text-xs text-zinc-500 dark:text-zinc-400">{result.finalReport}</p>
              )}
              <button
                type="button"
                onClick={handleStartRecheck}
                className="w-full rounded-2xl py-4 bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/10"
              >
                <Camera className="w-4 h-4" />
                재촬영하기
              </button>
            </div>
          )}

          {/* AI 리포트 문서 (종료 상태) */}
          {(jobStatus === "APPROVED" || jobStatus === "REJECTED" || jobStatus === "FAILED") && (
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-500" />
                  AI 품질 판독 명세서
                </h3>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    jobStatus === "APPROVED"
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400"
                      : "bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400"
                  }`}
                >
                  {jobStatus === "APPROVED" ? "승인 완료" : jobStatus === "REJECTED" ? "반려 확정" : "처리 실패"}
                </span>
              </div>

              {/* 품질 지표 명세 */}
              <div className="grid grid-cols-2 gap-2.5 mb-4">
                <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-900 rounded-2xl p-3 text-center">
                  <p className="text-[10px] text-zinc-400 mb-0.5">판독 등급</p>
                  <p className="text-base font-black text-zinc-900 dark:text-zinc-50">
                    {result.conditionGrade ? getGradeLabel(result.conditionGrade) : "—"}
                  </p>
                </div>
                <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-900 rounded-2xl p-3 text-center">
                  <p className="text-[10px] text-zinc-400 mb-0.5">UBCI 점수</p>
                  <p className="text-base font-black text-zinc-900 dark:text-zinc-50">
                    {result.ubciScore != null ? result.ubciScore.toFixed(0) : "—"}
                  </p>
                </div>
              </div>

              {result.finalReport && (
                <div className="space-y-2 mb-4">
                  <h4 className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1">
                    <ExternalLink className="w-3 h-3 text-indigo-500" />
                    AI 최종 리포트
                  </h4>
                  <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 p-3 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    {result.finalReport}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 text-xs text-zinc-400 mb-4">
                {jobStatus === "APPROVED" ? (
                  <FileCheck2 className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <FileX2 className="w-3.5 h-3.5 text-red-500" />
                )}
                검수 건 #{result.jobId.slice(0, 8)}
              </div>

              <button
                type="button"
                onClick={handleReset}
                className="w-full rounded-2xl py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/10"
              >
                <RotateCcw className="w-4 h-4" />
                검수 마감 및 신규 검수 시작
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
