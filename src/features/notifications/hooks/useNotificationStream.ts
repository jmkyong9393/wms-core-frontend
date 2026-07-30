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

// SSE 재연결 설정
export const RECONNECT_BASE_DELAY_MS = 1000;
export const RECONNECT_MAX_DELAY_MS = 30000;
export const MAX_RECONNECT_ATTEMPTS = 5;

// 알림 목록 조회 및 SSE 연결
export function useNotificationStream() {
  const mock = isMockMode();
  useMockNotificationSimulator(mock);

  const setNotificationList = useSetAtom(setNotificationListAtom);
  const pushRealNotification = useSetAtom(pushRealNotificationAtom);

  useEffect(() => {
    if (mock) return;

    let cancelled = false;
    let retryCount = 0;
    const esRef: { current: EventSource | null } = { current: null };
    const retryTimeoutRef: { current: ReturnType<typeof setTimeout> | null } = { current: null };

    // 알림 목록 동기화
    async function loadInitialList() {
      try {
        const result = await listNotifications(NOTIFICATION_LIST_LIMIT);
        if (!cancelled) setNotificationList(result);
      } catch (err) {
        console.error('[Notification] 목록 조회 실패', err);
      }
    }

    // 재연결 예약
    function scheduleReconnect() {
      if (cancelled) return;
      if (retryCount >= MAX_RECONNECT_ATTEMPTS) {
        console.error('[Notification SSE] 재연결 시도 횟수 초과 - 재연결 중단');
        return;
      }
      // 실패할수록 재연결 대기시간 증가
      const delay = Math.min(RECONNECT_BASE_DELAY_MS * 2 ** retryCount, RECONNECT_MAX_DELAY_MS);
      retryCount += 1;
      retryTimeoutRef.current = setTimeout(() => {
        retryTimeoutRef.current = null;
        if (!cancelled) startConnection();
      }, delay);
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

        // 연결 성공 시 재시도 횟수 초기화
        es.onopen = () => {
          retryCount = 0;
        };

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

        // 오류 발생 시 현재 연결 종료 후 재연결
        es.onerror = (err) => {
          console.error('[Notification SSE] 연결 오류', err);
          esRef.current?.close();
          esRef.current = null;
          scheduleReconnect();
        };
      } catch (err) {
        console.error('[Notification] SSE 연결 시작 실패', err);
        scheduleReconnect();
      }
    }

    // 목록 동기화 후 SSE 연결
    function startConnection() {
      loadInitialList().then(() => {
        if (!cancelled) connectStream();
      });
    }

    startConnection();

    return () => {
      cancelled = true;
      // 예약된 재연결 취소
      if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current);
      // SSE 연결 종료
      esRef.current?.close();
      esRef.current = null;
    };
  }, [mock, setNotificationList, pushRealNotification]);
}
