/**
 * AI 검수 작업 상태 추적 커스텀 훅
 *
 * jobId를 입력받아 SSE 구독 티켓을 발급하고 실시간 스트림(named event: progress/error)에 연결한다.
 * SSE는 progress/status/ubci_score 등 경량 필드만 실어 보내므로, 관리자 판정 대기·재촬영 필요·
 * 종료 상태에 진입하면 `GET /api/v1/inspections/{jobId}`로 condition_grade/final_report 등
 * 전체 상세를 한 번 더 조회해 채운다.
 *
 * 연결 복원력: SSE 재연결은 지수 백오프로 시도하고, 연속 실패가 일정 횟수를 넘으면
 * 저빈도 폴링을 안전망으로 병행 가동한다(SSE가 onopen으로 복구되면 폴링은 즉시 정리).
 * 티켓 발급 401은 axios 계층에서만 판별 가능하므로(EventSource는 상태 코드를 노출하지 않음)
 * 알림센터 SSE(useNotificationStream.ts)와 동일하게 토큰 갱신 → 티켓 재발급 순으로 복구한다.
 */
"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { isAxiosError } from "axios";
import { useStore } from "jotai";
import { getJobStatus, issueStreamTicket, isMockMode } from "@/services/returnService";
import { API_BASE_URL } from "@/lib/api-client";
import { getOrRefreshAccessToken } from "@/features/auth/api/tokenRefresh";
import { logoutAtom } from "@/features/auth/store/authAtoms";
import {
  isTerminalJobStatus,
  DETAIL_REQUIRED_STATUSES,
  type InspectionJobStatus,
  type InspectionResult,
} from "@/types/returnTypes";

interface UseJobStatusReturn {
  jobStatus: InspectionJobStatus | null;
  result: InspectionResult | null;
  error: string | null;
  resetJobState: () => void;
  setResultDirectly: (newResult: InspectionResult) => void;
}

// SSE 재연결 설정 (useNotificationStream.ts와 동일한 백오프 정책)
const RECONNECT_BASE_DELAY_MS = 1000;
const RECONNECT_MAX_DELAY_MS = 15000;
const MAX_RECONNECT_ATTEMPTS = 5;

// 연속 재연결 실패가 이 횟수를 넘으면 폴링 안전망을 병행 가동
const POLLING_FALLBACK_AFTER_ATTEMPTS = 2;
const POLLING_INTERVAL_MS = 3000;

// SSE progress 이벤트의 경량 payload
interface ProgressEventData {
  job_id: string;
  task_id: string | null;
  status: InspectionJobStatus;
  progress: number;
  ubci_score: number | null;
}

function isUnauthorized(err: unknown): boolean {
  return isAxiosError(err) && err.response?.status === 401;
}

export function useJobStatus(jobId: string | null): UseJobStatusReturn {
  const [jobStatus, setJobStatus] = useState<InspectionJobStatus | null>(null);
  const [result, setResult] = useState<InspectionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [prevJobId, setPrevJobId] = useState<string | null>(null);

  /**
   * jobId 변경 시 렌더링 페이즈에서 직접 상태를 동기화.
   * useEffect 내 동기 setState 호출을 피해 react-hooks/set-state-in-effect 위반 방지.
   */
  if (jobId !== prevJobId) {
    setPrevJobId(jobId);
    setJobStatus(jobId ? "PENDING" : null);
    setResult(null);
    setError(null);
  }

  const store = useStore();

  const eventSourceRef = useRef<EventSource | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cleanUpConnections = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  }, []);

  const resetJobState = useCallback(() => {
    cleanUpConnections();
    setJobStatus(null);
    setResult(null);
    setError(null);
  }, [cleanUpConnections]);

  const setResultDirectly = (newResult: InspectionResult) => {
    setResult(newResult);
    setJobStatus(newResult.status);
  };

  useEffect(() => {
    if (!jobId) return;

    let cancelled = false;
    let retryCount = 0;
    const esRef: { current: EventSource | null } = { current: null };

    // 조회한 상세 결과를 상태에 반영하고, 종료 상태면 모든 연결을 정리
    const applyDetailResult = (detail: InspectionResult) => {
      if (cancelled) return;
      setResult(detail);
      setJobStatus(detail.status);
      if (isTerminalJobStatus(detail.status)) {
        cleanUpConnections();
      }
    };

    // 저빈도 폴링 안전망
    const startPolling = () => {
      if (pollingIntervalRef.current) return;

      const fetchStatus = async () => {
        try {
          const data = await getJobStatus(jobId);
          applyDetailResult(data);
        } catch (err: unknown) {
          console.error("[검수 상태 폴링 오류]", err);
        }
      };

      fetchStatus();
      pollingIntervalRef.current = setInterval(fetchStatus, POLLING_INTERVAL_MS);
    };

    const stopPolling = () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };

    // SSE 재연결 예약 + 반복 실패 시 폴링 안전망 가동
    const scheduleReconnect = () => {
      if (cancelled) return;

      if (retryCount >= POLLING_FALLBACK_AFTER_ATTEMPTS) {
        startPolling();
      }

      if (retryCount >= MAX_RECONNECT_ATTEMPTS) {
        console.error("[검수 SSE] 재연결 시도 횟수 초과 - 폴링 안전망으로만 유지");
        return;
      }

      const delay = Math.min(RECONNECT_BASE_DELAY_MS * 2 ** retryCount, RECONNECT_MAX_DELAY_MS);
      retryCount += 1;
      reconnectTimeoutRef.current = setTimeout(() => {
        reconnectTimeoutRef.current = null;
        if (!cancelled) connectStream();
      }, delay);
    };

    // progress 이벤트: 경량 필드는 즉시 반영, 상세 조회가 필요한 상태면 GET으로 보강
    const handleProgress = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data) as ProgressEventData;
        if (cancelled) return;

        setResult((prev) => ({
          jobId: data.job_id,
          taskId: data.task_id,
          status: data.status,
          progress: data.progress,
          ubciScore: data.ubci_score,
          conditionGrade: prev?.conditionGrade ?? null,
          finalReport: prev?.finalReport ?? null,
          originalImageUrls: prev?.originalImageUrls ?? [],
        }));
        setJobStatus(data.status);

        if (DETAIL_REQUIRED_STATUSES.includes(data.status)) {
          getJobStatus(jobId).then(applyDetailResult).catch((err) => {
            console.error("[검수 상세 조회 실패]", err);
          });
        }
      } catch (parseErr) {
        console.error("SSE progress 데이터 파싱 실패:", parseErr);
      }
    };

    // error 이벤트: 검수 작업을 찾을 수 없는 등 서버가 명시적으로 보낸 오류
    const handleServerError = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data) as { message: string };
        if (cancelled) return;
        setError(data.message);
      } catch {
        setError("검수 진행 상황 스트림에서 오류가 발생했습니다.");
      }
      cleanUpConnections();
    };

    const openEventSource = (streamUrl: string) => {
      esRef.current?.close();

      const es = new EventSource(`${API_BASE_URL}${streamUrl}`);
      eventSourceRef.current = es;
      esRef.current = es;

      es.onopen = () => {
        retryCount = 0;
        stopPolling();
      };

      es.addEventListener("progress", handleProgress);
      es.addEventListener("error", handleServerError);

      es.onerror = () => {
        es.close();
        if (eventSourceRef.current === es) eventSourceRef.current = null;
        if (esRef.current === es) esRef.current = null;
        scheduleReconnect();
      };
    };

    // 티켓 재발급 전 액세스 토큰을 갱신 (알림센터 SSE와 동일 패턴)
    const handleTicketUnauthorized = async () => {
      try {
        await getOrRefreshAccessToken();
      } catch (err) {
        if (cancelled) return;
        if (isUnauthorized(err)) {
          store.set(logoutAtom);
          return;
        }
        scheduleReconnect();
        return;
      }
      if (cancelled) return;
      connectStream();
    };

    // 티켓 발급 후 SSE 연결. 발급 자체의 401만 명시적으로 판별 가능하다
    // (EventSource는 HTTP 상태 코드를 노출하지 않으므로 스트림 연결 실패는 항상 scheduleReconnect로만 처리)
    const connectStream = async () => {
      try {
        const ticket = await issueStreamTicket(jobId!);
        if (cancelled) return;
        openEventSource(ticket.streamUrl);
      } catch (err) {
        if (cancelled) return;
        if (isUnauthorized(err)) {
          await handleTicketUnauthorized();
          return;
        }
        console.error("[검수 SSE] 티켓 발급 실패", err);
        scheduleReconnect();
      }
    };

    if (isMockMode()) {
      // Mock 모드에서는 SSE 없이 곧바로 폴링
      startPolling();
    } else {
      connectStream();
    }

    return () => {
      cancelled = true;
      cleanUpConnections();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId]);

  return {
    jobStatus,
    result,
    error,
    resetJobState,
    setResultDirectly,
  };
}
