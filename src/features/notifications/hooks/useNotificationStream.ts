'use client';

import { useEffect } from 'react';
import { useMockNotificationSimulator } from '@/features/notifications/mocks/useMockNotificationSimulator';

// 알림 전용 Mock 모드 확인
const MOCK_MODE_KEY = 'wms_mock_mode';
function isMockMode(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(MOCK_MODE_KEY) === 'true';
}

// 알림 스트림 구독 진입점
export function useNotificationStream() {
  const mock = isMockMode();
  useMockNotificationSimulator(mock);

  useEffect(() => {
    if (mock) return;
    // TODO: SSE 명세 확정 후 실제 연결
    // endpoint, payload, 알림 분류, 인증 방식 확인 필요
    // useJobStatus.ts의 EventSource 연결 구조 참고
  }, [mock]);
}
