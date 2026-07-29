'use client';

import { useEffect } from 'react';
import { useSetAtom } from 'jotai';
import { API_BASE_URL } from '@/lib/api-client';
import { useMockNotificationSimulator } from '@/features/notifications/mocks/useMockNotificationSimulator';
import {
  listNotifications,
  issueNotificationStreamTicket,
} from '@/features/notifications/api/notificationService';
import {
  setNotificationListAtom,
  pushRealNotificationAtom,
} from '@/features/notifications/store/notificationAtoms';
import {
  NOTIFICATION_STREAM_ENDPOINT,
  NOTIFICATION_LIST_LIMIT,
} from '@/features/notifications/constants/notificationApi';
import type { NotificationItem } from '@/features/notifications/types/notification';

// 알림 전용 Mock 모드 확인
const MOCK_MODE_KEY = 'wms_mock_mode';
function isMockMode(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(MOCK_MODE_KEY) === 'true';
}

// 알림 목록 조회 및 SSE 연결
export function useNotificationStream() {
  const mock = isMockMode();
  useMockNotificationSimulator(mock);

  const setNotificationList = useSetAtom(setNotificationListAtom);
  const pushRealNotification = useSetAtom(pushRealNotificationAtom);

  useEffect(() => {
    if (mock) return;

    let cancelled = false;
    const esRef: { current: EventSource | null } = { current: null };

    // 기존 알림 목록 조회
    async function loadInitialList() {
      try {
        const result = await listNotifications(NOTIFICATION_LIST_LIMIT);
        if (!cancelled) setNotificationList(result);
      } catch (err) {
        console.error('[Notification] 초기 목록 조회 실패', err);
      }
    }

    // 티켓 발급 후 SSE 연결
    async function connectStream() {
      try {
        const { ticket } = await issueNotificationStreamTicket();
        if (cancelled) return;

        // 기존 연결 종료
        esRef.current?.close();

        const url = `${API_BASE_URL}${NOTIFICATION_STREAM_ENDPOINT}?ticket=${encodeURIComponent(ticket)}`;
        const es = new EventSource(url);
        esRef.current = es;

        // SSE 연결 확인
        es.addEventListener('connected', () => {
          // 별도 상태 처리 없음
        });

        // 실시간 알림 추가
        es.addEventListener('notification', (event: MessageEvent) => {
          try {
            const data = JSON.parse(event.data) as NotificationItem;
            pushRealNotification(data);
          } catch (parseErr) {
            console.error('[Notification SSE] 알림 데이터 파싱 실패', parseErr);
          }
        });

        // 연결 오류 시 종료
        es.onerror = (err) => {
          console.error('[Notification SSE] 연결 오류', err);
        
          esRef.current?.close();
          esRef.current = null;
        };
      } catch (err) {
        console.error('[Notification] SSE 연결 시작 실패', err);
      }
    }

    loadInitialList().then(() => {
      if (!cancelled) connectStream();
    });

    return () => {
      cancelled = true;
      esRef.current?.close();
      esRef.current = null;
    };
  }, [mock, setNotificationList, pushRealNotification]);
}
