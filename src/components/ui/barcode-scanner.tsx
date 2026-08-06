'use client';

import { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader, HTMLCanvasElementLuminanceSource, BinaryBitmap, HybridBinarizer } from '@zxing/library';
import { Loader2 } from 'lucide-react';

interface BarcodeScannerProps {
  onScan: (result: string) => void;
  isActive?: boolean;
}

// React 엔진(Turbopack 버그 등)이 뻗었을 때도 스캔 성공 여부를 시각적으로 증명하기 위한 순수 DOM 토스트 함수
const showNativeToast = (message: string) => {
  const div = document.createElement('div');
  div.textContent = message;
  Object.assign(div.style, {
    position: 'fixed',
    top: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    background: 'rgba(16, 185, 129, 0.95)',
    color: 'white',
    padding: '12px 24px',
    borderRadius: '999px',
    zIndex: '99999',
    fontSize: '14px',
    fontWeight: 'bold',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    transition: 'opacity 0.3s ease-out'
  });
  document.body.appendChild(div);
  
  setTimeout(() => {
    div.style.opacity = '0';
    setTimeout(() => div.remove(), 300);
  }, 2000);
};

export function BarcodeScanner({ onScan, isActive = true }: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');
  
  const lastScannedRef = useRef<string | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const onScanRef = useRef(onScan);
  
  // onScan 함수 참조가 변경되어도 카메라 재시작(useEffect)이 일어나지 않도록 최신 콜백을 Ref에 저장
  useEffect(() => {
    onScanRef.current = onScan;
  }, [onScan]);

  useEffect(() => {
    if (!isActive || !videoRef.current) return;

    let isDecoding = true;
    const codeReader = new BrowserMultiFormatReader(); // 힌트 주입 시 발생하는 JS 내부 충돌 버그 방지

    const startCamera = async () => {
      try {
        // 1. Strict Mode 더블 렌더링 충돌 완화를 위한 약간의 딜레이
        await new Promise(resolve => setTimeout(resolve, 300));
        if (!isDecoding) return;

        let stream: MediaStream | null = null;

        // 2. 카메라 하드웨어 락 재시도 로직 (페이지 전환 시 앞 페이지 락 해제 대기)
        for (let i = 0; i < 10; i++) {
          try {
            const constraints = i < 5 
              ? { 
                  video: { 
                    facingMode: 'environment', 
                    width: { ideal: 1280 }, 
                    height: { ideal: 720 },
                    // 안드로이드 크롬 등에서 카메라를 이동했을 때 초점이 흐려지는 현상(오토포커스 고장) 방지
                    advanced: [{ focusMode: 'continuous' } as any]
                  } 
                }
              : { video: { facingMode: 'environment' } }; // 기기 호환성을 위한 폴백

            stream = await navigator.mediaDevices.getUserMedia(constraints);
            break;
          } catch (specificErr: any) {
            if (specificErr?.name === 'NotAllowedError') {
              throw specificErr; // 권한 거부 시 즉시 포기
            }
            // 그 외 에러(NotReadableError 등)는 하드웨어 락 충돌로 간주하고 0.5초 대기 후 재시도
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        }

        if (!stream) {
          throw new Error('카메라 락을 해제할 수 없습니다. 열려 있는 다른 앱이나 브라우저 탭을 확인해주세요.');
        }

        // 스트림을 획득하는 동안(약 1~3초) 컴포넌트가 언마운트되었다면 즉시 스트림 해제 (좀비 방지)
        if (!isDecoding) {
          stream.getTracks().forEach(track => track.stop());
          return;
        }

        streamRef.current = stream;
        setHasPermission(true);

        const videoEl = videoRef.current;
        if (!videoEl) return;

        videoEl.srcObject = stream;

        // 3. 비디오 준비 완료 후 스캔 루프 시작
        const startDecodingLoop = async () => {
          if (!isDecoding) return;

          // 0x0 캔버스 무한 캐싱 버그 방어
          if (videoEl.videoWidth === 0 || videoEl.videoHeight === 0) {
            setTimeout(startDecodingLoop, 100);
            return;
          }

          // 네이티브 바코드 스캐너 API (지원 기기 한정)
          let nativeDetector: any = null;
          if ('BarcodeDetector' in window) {
            try {
              const supportedFormats = await (window as any).BarcodeDetector.getSupportedFormats();
              if (supportedFormats && supportedFormats.length > 0) {
                nativeDetector = new (window as any).BarcodeDetector({ formats: supportedFormats });
              }
            } catch (e) {
              console.warn("Native BarcodeDetector 초기화 실패", e);
            }
          }

          // 비디오 프레임을 안전하게 캡처할 숨김 캔버스 (스캐너 엔진들이 라이브 비디오 스트림을 건드려 멈추는 현상 원천 차단)
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d', { willReadFrequently: true });

          const scanFrame = async () => {
            if (!isDecoding) return;

            try {
              let text = null;

              // 1. 비디오의 현재 프레임을 캔버스에 복사 (스냅샷)
              if (ctx && canvas.width !== videoEl.videoWidth) {
                canvas.width = videoEl.videoWidth;
                canvas.height = videoEl.videoHeight;
              }
              if (ctx && canvas.width > 0) {
                ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);
              }

              // 2. 1순위: 네이티브 스캐너 (비디오 대신 정적인 캔버스를 넘겨 엔진 다운 현상 방지)
              if (nativeDetector && ctx && canvas.width > 0) {
                try {
                  const barcodes = await nativeDetector.detect(canvas);
                  if (barcodes && barcodes.length > 0) {
                    text = barcodes[0].rawValue;
                  }
                } catch (e) {
                  // 네이티브 스캐너 에러 무시
                }
              }

              // 3. 2순위: Zxing 스캐너 폴백 (PC 등 네이티브 스캐너 미지원 환경)
              if (!text && ctx && canvas.width > 0) {
                try {
                  // 라이브 비디오(HTMLVideoElement)를 Zxing에 넘기면 엔진이 멈추는 버그 방지용
                  // 캔버스 픽셀 데이터를 Zxing 전용 특수 포맷(BinaryBitmap)으로 수동 변환하여 판독
                  const luminanceSource = new HTMLCanvasElementLuminanceSource(canvas);
                  const bitmap = new BinaryBitmap(new HybridBinarizer(luminanceSource));
                  const result = codeReader.decodeBitmap(bitmap);
                  if (result) {
                    text = result.getText();
                  }
                } catch (e) {
                  // 바코드가 없는 프레임(NotFoundException) 무시
                }
              }

              // 바코드 인식 성공 시
              if (text) {
                if (lastScannedRef.current !== text) {
                  lastScannedRef.current = text;
                  if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
                  
                  // 순수 DOM 알림 (React 엔진 정지 상태에서도 확인 가능)
                  showNativeToast(`스캔 완료: ${text}`);
                  
                  onScanRef.current(text);

                  setTimeout(() => {
                    lastScannedRef.current = null;
                  }, 1500);
                }
              }
            } catch (err) {
              // 치명적 에러 무시 (루프 유지)
            }

            // 발열 방지를 위한 200ms 딜레이
            if (isDecoding) {
              setTimeout(scanFrame, 200);
            }
          };

          scanFrame(); // 최초 실행
        };

        // 모바일 브라우저(WebRTC)에서 비디오 이벤트(onloadeddata 등)가 씹히는 버그 방지
        // 확실하게 비디오 프레임이 렌더링(readyState >= 2)되었는지 0.1초 단위로 폴링하여 확인 후 루프 시작
        const checkVideoReady = () => {
          if (!isDecoding) return;
          if (videoEl.readyState >= 2 && videoEl.videoWidth > 0) {
            // 엔진 기동 확인용 (디버깅)
            // showNativeToast("렌즈 초점 조정 완료!");
            startDecodingLoop();
          } else {
            setTimeout(checkVideoReady, 100);
          }
        };
        checkVideoReady();

        // iOS 비디오 자동재생 버그 방어
        videoEl.play().catch(e => console.warn("Video play interrupted", e));

      } catch (err: any) {
        setHasPermission(false);
        const exactError = err?.message || err?.name || String(err);
        if (!navigator.mediaDevices) {
          setErrorMsg('보안 연결(HTTPS)이 아니어서 브라우저가 카메라를 차단했습니다.');
        } else if (err?.name === 'NotAllowedError') {
          setErrorMsg('카메라 권한을 허용해주세요.');
        } else {
          setErrorMsg(`카메라 연결 실패: ${exactError}`);
        }
      }
    };

    startCamera();

    // 5. 완벽한 메모리 해제 (Cleanup)
    return () => {
      isDecoding = false;
      codeReader.reset();
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => {
          track.stop();
        });
        streamRef.current = null;
      }
      
      if (videoRef.current) {
        videoRef.current.srcObject = null;
        videoRef.current.onloadeddata = null;
      }
    };
  }, [isActive]);

  if (hasPermission === false) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-gray-100 dark:bg-zinc-800 rounded-xl border-2 border-dashed border-gray-300 dark:border-zinc-700">
        <p className="text-red-500 dark:text-red-400 font-medium text-sm text-center px-4">{errorMsg}</p>
      </div>
    );
  }

  return (
    <div className="relative w-full overflow-hidden rounded-xl bg-black aspect-[4/3] sm:aspect-video flex items-center justify-center group">
      {hasPermission === null && (
        <div className="absolute flex flex-col items-center justify-center text-white/70 z-10">
          <Loader2 className="h-8 w-8 animate-spin mb-2" />
          <p className="text-sm">렌즈 최적화 중...</p>
        </div>
      )}
      
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        muted
        autoPlay
        playsInline // iOS에서 자동 전체화면 방지
      />
      
      {/* 저격 스코프 가이드라인 */}
      <div className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center">
        <div className="w-3/4 h-1/3 sm:h-1/2 border-2 border-green-500/50 rounded-lg shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]">
          <div className="w-full h-[1px] bg-red-500/60 absolute top-1/2 shadow-[0_0_10px_rgba(239,68,68,1)] animate-pulse" />
        </div>
      </div>
    </div>
  );
}
