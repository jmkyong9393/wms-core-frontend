// SSE 연동 전 알림 UI 테스트용 Mock 훅
'use client';

import { useEffect, useRef } from 'react';
import { useSetAtom } from 'jotai';
import { pushNotificationAtom } from '@/features/notifications/store/notificationAtoms';
import { mockNotificationTemplates } from '@/features/notifications/mocks/mockNotificationTemplates';
import {
  MOCK_INTERVAL_MIN_MS,
  MOCK_INTERVAL_MAX_MS,
} from '@/features/notifications/constants/notificationConfig';

export function useMockNotificationSimulator(enabled: boolean) {
  const pushNotification = useSetAtom(pushNotificationAtom);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!enabled) return;

    // 다음 Mock 알림 예약
    const scheduleNext = () => {
      const delay = MOCK_INTERVAL_MIN_MS + Math.random() * (MOCK_INTERVAL_MAX_MS - MOCK_INTERVAL_MIN_MS);
      timerRef.current = setTimeout(() => {
        const template =
          mockNotificationTemplates[Math.floor(Math.random() * mockNotificationTemplates.length)];
        pushNotification(template);
        scheduleNext();
      }, delay);
    };

    scheduleNext();

    // 컴포넌트 종료 시 타이머 제거
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [enabled, pushNotification]);
}
