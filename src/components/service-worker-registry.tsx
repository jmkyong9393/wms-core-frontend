'use client';

import { useEffect } from 'react';

export function ServiceWorkerRegistry() {
  useEffect(() => {
    // 운영 환경(Production)에서만 서비스 워커 등록 (MSW 충돌 방지 및 HMR 캐싱 방지)
    if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
      // useEffect 자체가 클라이언트 마운트 이후에 실행되므로 window.onload 대기 불필요
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registered successfully:', registration.scope);
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error);
        });
    }
  }, []);

  return null;
}
