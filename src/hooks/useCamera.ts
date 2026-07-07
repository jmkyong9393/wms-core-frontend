import { useState, useEffect, useRef, useCallback } from "react";

interface UseCameraOptions {
  idealFacingMode?: "environment" | "user";
}

/**
 * useCamera — iOS Safari 안정성을 극대화한 WebRTC 카메라 제어 훅
 *
 * visibilitychange 및 focus 이벤트를 감지하여
 * 백그라운드 전환 시 카메라 스트림을 자동으로 닫고, 복귀 시 재시작함으로써
 * WebKit 엔진 특유의 카메라 프리징/락 현상을 방지합니다.
 */
export function useCamera({ idealFacingMode = "environment" }: UseCameraOptions = {}) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const activeStreamRef = useRef<MediaStream | null>(null);

  const stopCamera = useCallback(() => {
    if (activeStreamRef.current) {
      activeStreamRef.current.getTracks().forEach((track) => track.stop());
      activeStreamRef.current = null;
    }
    setStream(null);
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const startCamera = useCallback(async () => {
    // 이미 켜져 있다면 이전 스트림 정리
    stopCamera();

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: idealFacingMode,
          width: { ideal: 4096 },
          height: { ideal: 2160 },
        },
        audio: false, // iOS 사파리 팝업 중복 방지 및 마이크 권한 요청 제거
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      activeStreamRef.current = mediaStream;
      setStream(mediaStream);
      setError(null);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err: unknown) {
      console.error("Camera start failed:", err);
      setError("카메라 접근 권한이 없거나, 지원하지 않는 브라우저입니다.");
    }
  }, [idealFacingMode, stopCamera]);

  // iOS Safari 탭 전환 / 화면 잠금 대응을 위한 생명주기 리스너
  useEffect(() => {
    const handleVisibilityOrFocus = () => {
      if (document.visibilityState === "visible") {
        console.log("[useCamera] App focused/visible. Restarting camera stream.");
        startCamera();
      } else {
        console.log("[useCamera] App backgrounded. Stopping camera stream to prevent WebKit Lock.");
        stopCamera();
      }
    };

    window.addEventListener("focus", handleVisibilityOrFocus);
    document.addEventListener("visibilitychange", handleVisibilityOrFocus);

    return () => {
      window.removeEventListener("focus", handleVisibilityOrFocus);
      document.removeEventListener("visibilitychange", handleVisibilityOrFocus);
    };
  }, [startCamera, stopCamera]);

  // 마운트 시 최초 기동 및 언마운트 시 자동 정지
  useEffect(() => {
    // requestAnimationFrame을 통해 useEffect 본문 내부의 동기적인 setState 호출(cascading render)을 우회합니다.
    const frameId = requestAnimationFrame(() => {
      startCamera();
    });
    return () => {
      cancelAnimationFrame(frameId);
      stopCamera();
    };
  }, [startCamera, stopCamera]);

  return { stream, error, videoRef, startCamera, stopCamera };
}
