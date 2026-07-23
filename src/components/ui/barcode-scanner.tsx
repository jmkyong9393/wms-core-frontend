'use client';

import { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader } from '@zxing/library';
import { Loader2 } from 'lucide-react';

interface BarcodeScannerProps {
  onScan: (result: string) => void;
  isActive?: boolean;
}

export function BarcodeScanner({ onScan, isActive = true }: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const lastScannedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isActive || !videoRef.current) return;

    const codeReader = new BrowserMultiFormatReader();
    let isDecoding = true;

    const startDecoding = async () => {
      try {
        setHasPermission(true);

        // Zxing 내장 함수로 제약조건(constraints)을 직접 넘겨 렌더링
        codeReader.decodeFromConstraints(
          { 
            video: { 
              facingMode: 'environment',
              width: { ideal: 1280 },
              height: { ideal: 720 },
            } 
          }, 
          videoRef.current!, 
          (result, err) => {
            if (!isDecoding) return;
            
            if (result) {
              const text = result.getText();
              // 동일 바코드 연속 중복 스캔 방지 (2초 딜레이)
              if (lastScannedRef.current !== text) {
                lastScannedRef.current = text;
                
                // 햅틱 진동 피드백 (모바일 전용)
                if (navigator.vibrate) navigator.vibrate(200);
                
                onScan(text);

                setTimeout(() => {
                  lastScannedRef.current = null;
                }, 2000);
              }
            }
            if (err && err.name !== 'NotFoundException') {
              // 바코드를 못찾는 에러는 무시하되, 그 외 치명적 에러는 로깅
              // console.warn(err);
            }
          }
        );
      } catch (err: any) {
        setHasPermission(false);
        setErrorMsg('카메라 권한을 허용해주세요. (HTTPS 환경 필수)');
        console.error('Camera Error:', err);
      }
    };

    startDecoding();

    // 언마운트 시 메모리(카메라 트랙) 완벽 해제
    return () => {
      isDecoding = false;
      codeReader.reset();
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isActive, onScan]);

  if (hasPermission === false) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-gray-100 rounded-xl border-2 border-dashed border-gray-300">
        <p className="text-red-500 font-medium text-sm text-center px-4">
          {errorMsg}
        </p>
      </div>
    );
  }

  return (
    <div className="relative w-full overflow-hidden rounded-xl bg-black aspect-[4/3] sm:aspect-video flex items-center justify-center">
      {hasPermission === null && (
        <div className="absolute flex flex-col items-center justify-center text-white/70 z-10">
          <Loader2 className="h-8 w-8 animate-spin mb-2" />
          <p className="text-sm">카메라를 불러오는 중...</p>
        </div>
      )}
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        muted
        autoPlay
        playsInline // iOS에서 자동 전체화면 방지
      />
      {/* 중앙 스캔 가이드라인 (스나이퍼 룩) */}
      <div className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center">
        <div className="w-3/4 h-1/3 border-2 border-green-500/50 rounded-lg shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]">
          <div className="w-full h-[1px] bg-red-500/50 absolute top-1/2 shadow-[0_0_8px_rgba(239,68,68,1)] animate-pulse" />
        </div>
      </div>
    </div>
  );
}
