/**
 * AI 검수 진행 상태 관리
 *
 * SSE로 검수 진행 상황을 실시간으로 받음
 * 상세 결과가 필요한 상태에서는 검수 상세 API를 추가로 호출
 *
 * SSE 연결 실패 시 자동 재연결하고
 * 반복 실패하면 폴링으로 상태를 확인
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

// SSE 재연결 설정 
const RECONNECT_BASE_DELAY_MS = 1000;
const RECONNECT_MAX_DELAY_MS = 15000;
const MAX_RECONNECT_ATTEMPTS = 5;

// SSE가 반복해서 실패하면 폴링 시작
const POLLING_FALLBACK_AFTER_ATTEMPTS = 2;
const POLLING_INTERVAL_MS = 3000;

// SSE 진행 상태 데이터
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

  // 새 검수 작업으로 바뀌면 기존 상태 초기화
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

    // 상세 결과 적용 후 검수가 끝났으면 연결 정리
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

    // SSE로 받은 진행 상태 적용
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

    const handleServerError = (event: MessageEvent) => {
      if (!event.data) return; // Ignore browser native connection close events
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

    // 토큰 갱신 후 SSE 티켓 다시 발급
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

    // SSE 티켓 발급 후 스트림 연결
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
      // Mock 모드는 SSE 대신 폴링 사용
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
