/**
 * AI 검수 작업 상태 추적 커스텀 훅
 *
 * jobId를 입력받아 SSE(Server-Sent Events) 실시간 스트림을 우선 연결하고,
 * SSE 오류 발생 시 1.5초 간격 Axios 폴링으로 자동 전환(Fallback)하여
 * PENDING → PROCESSING → COMPLETED/HITL_WAITING 상태 전이를 추적합니다.
 */
"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { getJobStatus, isMockMode } from "@/services/returnService";
import type { InspectionJobStatus, InspectionResult } from "@/types/returnTypes";

interface UseJobStatusReturn {
  jobStatus: InspectionJobStatus | null;
  result: InspectionResult | null;
  error: string | null;
  resetJobState: () => void;
  setResultDirectly: (newResult: InspectionResult) => void;
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

  const eventSourceRef = useRef<EventSource | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const cleanUpConnections = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
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

  // Polling Fallback 로직
  const startPolling = useCallback(
    (targetJobId: string) => {
      if (pollingIntervalRef.current) return;

      const fetchStatus = async () => {
        try {
          const data = await getJobStatus(targetJobId);
          setResult(data);
          setJobStatus(data.status);

          if (data.status === "COMPLETED" || data.status === "HITL_WAITING") {
            cleanUpConnections();
          }
        } catch (err: unknown) {
          console.error("[Polling Error]", err);
          setError("검수 진행 상황 조회 중 오류가 발생했습니다.");
          cleanUpConnections();
        }
      };

      fetchStatus();
      pollingIntervalRef.current = setInterval(fetchStatus, 1500);
    },
    [cleanUpConnections]
  );

  useEffect(() => {
    if (!jobId) return;

    // Mock 모드에서는 SSE 없이 곧바로 Polling
    if (isMockMode()) {
      startPolling(jobId);
    } else {
      // SSE 연결 시도
      try {
        const API_BASE_URL =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        const es = new EventSource(
          `${API_BASE_URL}/api/returns/stream/${jobId}`
        );
        eventSourceRef.current = es;

        es.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data) as InspectionResult;
            setResult(data);
            setJobStatus(data.status);

            if (
              data.status === "COMPLETED" ||
              data.status === "HITL_WAITING"
            ) {
              cleanUpConnections();
            }
          } catch (parseErr) {
            console.error("SSE 데이터 파싱 실패:", parseErr);
          }
        };

        es.onerror = () => {
          cleanUpConnections();
          // SSE 실패 시 Polling Fallback
          startPolling(jobId);
        };
      } catch {
        cleanUpConnections();
        startPolling(jobId);
      }
    }

    return () => {
      cleanUpConnections();
    };
  }, [jobId, cleanUpConnections, startPolling]);

  return {
    jobStatus,
    result,
    error,
    resetJobState,
    setResultDirectly,
  };
}
