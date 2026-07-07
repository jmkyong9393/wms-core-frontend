"use client";

import { useRef, useState } from "react";
import { useSetAtom } from "jotai";
import { useS3Upload } from "@/hooks/useS3Upload";
import { uploadQueueAtom, type UploadTask } from "@/stores/atoms";
import { Camera, Loader2, CheckCircle2 } from "lucide-react";

/**
 * CameraScanner — HTML5 native 카메라 캡처 기반 도서 촬영 컴포넌트
 *
 * iOS Safari 호환성을 위해 getUserMedia(WebRTC) 대신
 * <input type="file" capture="environment"> 방식을 사용합니다.
 * 촬영된 이미지는 browser-image-compression으로 Web Worker 압축 후
 * Jotai uploadQueueAtom에 낙관적 UI 패턴으로 적재됩니다.
 */
export default function CameraScanner() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const setUploadQueue = useSetAtom(uploadQueueAtom);
  const {
    isCompressing,
    isUploading,
    uploadProgress,
    error,
    uploadImage,
    resetUploadState,
  } = useS3Upload();

  const [lastPreview, setLastPreview] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const triggerCapture = () => {
    resetUploadState();
    fileInputRef.current?.click();
  };

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const selectedFile = files[0];
    setToastMsg(null);

    // 로컬 프리뷰 즉시 생성 (낙관적 UI)
    const previewUrl = URL.createObjectURL(selectedFile);
    setLastPreview(previewUrl);

    // 압축 + S3 업로드
    const uploadResult = await uploadImage(selectedFile);

    if (!uploadResult) {
      setToastMsg("❌ 이미지 업로드에 실패했습니다.");
      return;
    }

    // Jotai 큐에 적재
    const newTask: UploadTask = {
      id: `local_${Date.now()}`,
      blob: selectedFile,
      previewUrl,
      status: "COMPLETED",
    };

    setUploadQueue((prev) => [...prev, newTask]);
    setToastMsg("✅ 촬영 완료! 업로드되었습니다.");

    // Toast 자동 해제
    setTimeout(() => setToastMsg(null), 2500);

    // input 초기화 (같은 파일 재선택 허용)
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const isProcessing = isCompressing || isUploading;

  return (
    <div className="relative w-full max-w-md mx-auto bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-xl overflow-hidden p-6">
      {/* 히든 파일 인풋 (Native Camera 호출 연동) */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* 촬영 영역 */}
      <div className="space-y-4">
        {lastPreview ? (
          <div className="relative rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 aspect-video bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={lastPreview}
              alt="최근 촬영 이미지"
              className="w-full h-full object-contain"
            />
            <div className="absolute top-2 right-2 bg-emerald-500 text-white rounded-full p-1 shadow-md">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border-2 border-dashed border-zinc-300 dark:border-zinc-700 aspect-video flex flex-col items-center justify-center text-zinc-400 dark:text-zinc-600 bg-zinc-50 dark:bg-zinc-950/40">
            <Camera className="w-10 h-10 mb-2 text-zinc-400" />
            <span className="text-sm font-medium">
              아래 버튼을 눌러 촬영하세요
            </span>
          </div>
        )}

        {/* 압축/업로드 진행 상태 */}
        {isProcessing && (
          <div className="bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30 rounded-xl p-3 flex items-center gap-3">
            <Loader2 className="w-5 h-5 text-indigo-500 animate-spin" />
            <div className="flex-1">
              <p className="text-xs font-semibold text-indigo-700 dark:text-indigo-400">
                {isCompressing ? "이미지 압축 중..." : "S3 업로드 중..."}
              </p>
              <div className="w-full bg-indigo-100 dark:bg-indigo-900/30 rounded-full h-1.5 mt-1">
                <div
                  className="bg-indigo-500 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* 에러 표시 */}
        {error && (
          <div className="p-2.5 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-xl text-center text-xs text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        {/* 토스트 메시지 */}
        {toastMsg && (
          <div
            className={`p-3 rounded-xl text-center text-sm font-medium ${
              toastMsg.includes("❌")
                ? "bg-red-50 dark:bg-red-950/20 text-red-600"
                : "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600"
            }`}
          >
            {toastMsg}
          </div>
        )}

        {/* 촬영 버튼 */}
        <button
          type="button"
          onClick={triggerCapture}
          disabled={isProcessing}
          className={`w-full py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
            isProcessing
              ? "bg-zinc-200 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed"
              : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/10 active:scale-[0.98]"
          }`}
        >
          <Camera className="w-5 h-5" />
          {isProcessing ? "처리 중..." : "도서 촬영하기"}
        </button>
      </div>
    </div>
  );
}
