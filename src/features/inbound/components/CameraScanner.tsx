"use client";

import { useEffect, useState } from "react";
import { useSetAtom } from "jotai";
import { useCamera } from "@/features/inbound/hooks/useCamera";
import { useS3Upload } from "@/features/inbound/hooks/useS3Upload";
import { processImage } from "@/features/inbound/utils/image-processor";
import { uploadQueueAtom, type UploadTask } from "@/features/inbound/store/uploadQueueAtoms";
import { Loader2 } from "lucide-react";

/**
 * CameraScanner — WebRTC 실시간 프리뷰 기반의 도서 촬영 컴포넌트
 *
 * iOS Safari 대응을 위한 playsInline, muted, autoPlay 설정 및 생명주기가 내장되어 있습니다.
 * 물리 볼륨 버튼 및 스페이스바/엔터 키 입력을 감지해 풋페달 촬영을 지원하고,
 * 캡처 즉시 중앙 픽셀을 활용한 Laplacian Variance 흔들림 감지를 수행합니다.
 */
export default function CameraScanner() {
  const { videoRef, startCamera, stopCamera, error } = useCamera();
  const setUploadQueue = useSetAtom(uploadQueueAtom);
  const {
    isCompressing,
    isUploading,
    uploadProgress,
    error: uploadError,
    uploadImage,
    resetUploadState,
  } = useS3Upload();

  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [isProcessingLocal, setIsProcessingLocal] = useState(false);

  // 1. 컴포넌트 생명주기에 맞게 카메라 작동 관리
  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, [startCamera, stopCamera]);

  // 2. 물리 풋페달(볼륨키, 키보드) 이벤트 핸들러 등록
  useEffect(() => {
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
  }, []);

  // 3. 사진 캡처 및 흔들림 검사 + S3 업로드 파이프라인
  const handleCapture = async () => {
    if (!videoRef.current || isProcessingLocal || isCompressing || isUploading) return;

    setIsProcessingLocal(true);
    setToastMsg(null);
    resetUploadState();

    try {
      // 흔들림 감지 및 1차 해상도 가공 (Canvas)
      const processed = await processImage(videoRef.current);

      if (processed.isBlurred) {
        setToastMsg("⚠️ 사진이 너무 흔들렸습니다. 다시 촬영해 주세요.");
        setIsProcessingLocal(false);
        return;
      }

      // browser-image-compression 기반 Web Worker 비동기 압축 및 S3 Direct Upload
      const uploadResult = await uploadImage(new File([processed.blob], `book_${Date.now()}.jpg`, { type: "image/jpeg" }));

      if (!uploadResult) {
        setToastMsg("❌ 이미지 업로드에 실패했습니다.");
        setIsProcessingLocal(false);
        return;
      }

      // Jotai 큐 적재 (낙관적 UI 반영)
      const newTask: UploadTask = {
        id: `local_${Date.now()}`,
        blob: processed.blob,
        previewUrl: processed.previewUrl,
        status: "COMPLETED",
      };

      setUploadQueue((prev) => [...prev, newTask]);
      setToastMsg("✅ 촬영 완료! 업로드되었습니다.");
      setTimeout(() => setToastMsg(null), 2000);
    } catch (err) {
      console.error(err);
      setToastMsg("❌ 촬영 중 오류가 발생했습니다.");
    } finally {
      setIsProcessingLocal(false);
    }
  };

  const isWorking = isProcessingLocal || isCompressing || isUploading;

  return (
    <div className="relative w-full max-w-md mx-auto aspect-[3/4] bg-black border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-none overflow-hidden font-mono">
      {/* 카메라 에러 처리 */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-zinc-900 text-white p-4 text-center z-20">
          {error}
        </div>
      )}

      {/* 실시간 비디오 프리뷰 (iOS playsInline 필수) */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover"
      />

      {/* 도서 정렬용 BBox 가이드라인 오버레이 (둥글기 엄격 배제) */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-8 z-10">
        <div className="w-full h-[70%] border-4 border-dashed border-white flex flex-col items-center justify-center relative rounded-none">
          <div className="absolute -top-8 text-white text-[10px] font-black uppercase tracking-wider bg-black border-2 border-white px-3 py-1 rounded-none">
            ALIGN BOOK WITHIN GUIDE
          </div>
          <div className="w-8 h-1 bg-white/50 absolute" />
          <div className="w-1 h-8 bg-white/50 absolute" />
        </div>
      </div>

      {/* 프로세싱 상태 표시 */}
      {isWorking && (
        <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-white z-20 p-4">
          <Loader2 className="w-10 h-10 text-white animate-spin mb-3" />
          <span className="text-xs font-black uppercase tracking-widest text-center">
            {isProcessingLocal ? "Blur check running..." : isCompressing ? "Compressing frame..." : `UPLOADING STREAM (${uploadProgress}%)`}
          </span>
        </div>
      )}

      {/* 경고 및 성공 토스트 메시지 (브루탈리즘 스타일) */}
      {toastMsg && (
        <div className="absolute top-4 left-4 right-4 z-30">
          <div
            className={`px-4 py-3 rounded-none border-2 border-black font-black text-xs text-center uppercase tracking-wider ${
              toastMsg.includes("⚠️") || toastMsg.includes("❌")
                ? "bg-[#E60012] text-white"
                : "bg-white text-black"
            }`}
          >
            {toastMsg}
          </div>
        </div>
      )}

      {/* 에러 */}
      {uploadError && (
        <div className="absolute top-16 left-4 right-4 z-30 px-4 py-3 rounded-none border-2 border-black bg-[#E60012] text-white text-xs text-center font-black uppercase tracking-wider">
          {uploadError}
        </div>
      )}

      {/* 하단 촬영 컨트롤 영역: 셔터 역시 사각형으로 브루탈리즘화 */}
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent flex justify-center items-end h-32 z-10">
        <button
          id="capture-btn"
          type="button"
          onClick={handleCapture}
          disabled={isWorking}
          className={`w-14 h-14 rounded-none border-4 border-white flex items-center justify-center transition-transform active:scale-90 ${
            isWorking ? "opacity-50 cursor-not-allowed" : "hover:bg-white/20"
          }`}
        >
          <div className="w-10 h-10 bg-white rounded-none" />
        </button>
      </div>
    </div>
  );
}
