import type { ReactNode } from "react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { createStore, Provider as JotaiProvider } from "jotai";
import { useJobStatus } from "./useJobStatus";
import { getJobStatus, issueStreamTicket, isMockMode } from "@/services/returnService";
import { getOrRefreshAccessToken } from "@/features/auth/api/tokenRefresh";
import { authTokenAtom } from "@/features/auth/store/authAtoms";
import type { InspectionResult } from "@/types/returnTypes";

vi.mock("@/services/returnService", () => ({
  getJobStatus: vi.fn(),
  issueStreamTicket: vi.fn(),
  isMockMode: vi.fn(),
}));

vi.mock("@/features/auth/api/tokenRefresh", () => ({
  getOrRefreshAccessToken: vi.fn(),
}));

// 테스트용 localStorage 설정 (authAtoms.ts의 atomWithStorage가 모듈 평가 시점에 접근하므로
// import보다 먼저 전역에 스텁을 올려야 한다 — useNotificationStream.test.tsx와 동일 패턴)
vi.hoisted(() => {
  const store: Record<string, string> = {};
  vi.stubGlobal("localStorage", {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = String(value);
    },
    clear: () => {
      Object.keys(store).forEach((key) => delete store[key]);
    },
    removeItem: (key: string) => {
      delete store[key];
    },
  });
});

const baseResult: InspectionResult = {
  jobId: "job-1",
  taskId: null,
  status: "PROCESSING",
  progress: 50,
  ubciScore: null,
  conditionGrade: null,
  finalReport: null,
  originalImageUrls: [],
};

class MockEventSource {
  static instances: MockEventSource[] = [];
  url: string;
  close = vi.fn();
  onopen: (() => void) | null = null;
  onerror: ((event: Event) => void) | null = null;
  private listeners: Record<string, Array<(event: MessageEvent) => void>> = {};

  constructor(url: string) {
    this.url = url;
    MockEventSource.instances.push(this);
  }

  addEventListener(type: string, cb: (event: MessageEvent) => void) {
    (this.listeners[type] ??= []).push(cb);
  }

  dispatch(type: string, data: unknown) {
    const event = { data: JSON.stringify(data) } as MessageEvent;
    (this.listeners[type] ?? []).forEach((cb) => cb(event));
  }

  triggerError() {
    this.onerror?.(new Event("error"));
  }
}

async function flushMicrotasks(times = 6) {
  for (let i = 0; i < times; i += 1) {
    await Promise.resolve();
  }
}

// 타이머 진행 후 비동기 처리까지 완료 (useNotificationStream.test.tsx와 동일 패턴)
async function advanceAndFlush(ms: number) {
  await act(async () => {
    vi.advanceTimersByTime(ms);
    await flushMicrotasks();
  });
}

function setupHook(jobId: string | null) {
  const store = createStore();
  store.set(authTokenAtom, "seeded-token");
  const wrapper = ({ children }: { children: ReactNode }) => (
    <JotaiProvider store={store}>{children}</JotaiProvider>
  );
  const rendered = renderHook(() => useJobStatus(jobId), { wrapper });
  return { ...rendered, store };
}

describe("useJobStatus Hook", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
    vi.clearAllMocks();
    MockEventSource.instances = [];
    vi.stubGlobal("EventSource", MockEventSource as unknown as typeof EventSource);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should initialize with null state if jobId is null", () => {
    const { result } = setupHook(null);

    expect(result.current.jobStatus).toBeNull();
    expect(result.current.result).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it("should sync state to PENDING immediately when jobId is set", () => {
    vi.mocked(isMockMode).mockReturnValue(true);
    vi.mocked(getJobStatus).mockResolvedValue(baseResult);

    const { result } = setupHook("job-1");

    expect(result.current.jobStatus).toBe("PENDING");
  });

  it("should poll getJobStatus in mock mode instead of opening SSE", async () => {
    vi.mocked(isMockMode).mockReturnValue(true);
    vi.mocked(getJobStatus).mockResolvedValue(baseResult);

    setupHook("job-1");
    await advanceAndFlush(0);

    expect(getJobStatus).toHaveBeenCalledWith("job-1");
    expect(issueStreamTicket).not.toHaveBeenCalled();
  });

  it("should reset job state when resetJobState is called", () => {
    vi.mocked(isMockMode).mockReturnValue(true);
    vi.mocked(getJobStatus).mockResolvedValue(baseResult);

    const { result } = setupHook("job-1");

    act(() => {
      result.current.resetJobState();
    });

    expect(result.current.jobStatus).toBeNull();
    expect(result.current.result).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it("should set result directly and update status when setResultDirectly is called", () => {
    vi.mocked(isMockMode).mockReturnValue(true);
    vi.mocked(getJobStatus).mockResolvedValue(baseResult);

    const { result } = setupHook("job-1");

    const mockResult: InspectionResult = {
      jobId: "job-1",
      taskId: "task-1",
      status: "APPROVED",
      progress: 100,
      ubciScore: 90,
      conditionGrade: "MINT",
      finalReport: "정상 승인",
      originalImageUrls: [],
    };

    act(() => {
      result.current.setResultDirectly(mockResult);
    });

    expect(result.current.jobStatus).toBe("APPROVED");
    expect(result.current.result).toEqual(mockResult);
  });

  it("should issue a stream ticket and open EventSource at the returned stream_url in real mode", async () => {
    vi.mocked(isMockMode).mockReturnValue(false);
    vi.mocked(issueStreamTicket).mockResolvedValue({
      ticket: "ticket-1",
      streamUrl: "/api/v1/inspections/job-1/stream?ticket=ticket-1",
      expiresIn: 60,
    });

    setupHook("job-1");
    await advanceAndFlush(0);

    expect(issueStreamTicket).toHaveBeenCalledWith("job-1");
    expect(MockEventSource.instances).toHaveLength(1);
    expect(MockEventSource.instances[0].url).toContain(
      "/api/v1/inspections/job-1/stream?ticket=ticket-1"
    );
  });

  it("should update progress from the SSE progress event without an extra GET for PROCESSING", async () => {
    vi.mocked(isMockMode).mockReturnValue(false);
    vi.mocked(issueStreamTicket).mockResolvedValue({
      ticket: "ticket-1",
      streamUrl: "/api/v1/inspections/job-1/stream?ticket=ticket-1",
      expiresIn: 60,
    });

    const { result } = setupHook("job-1");
    await advanceAndFlush(0);

    act(() => {
      MockEventSource.instances[0].dispatch("progress", {
        job_id: "job-1",
        task_id: "task-1",
        status: "PROCESSING",
        progress: 50,
        ubci_score: null,
      });
    });

    expect(result.current.jobStatus).toBe("PROCESSING");
    expect(result.current.result?.progress).toBe(50);
    expect(getJobStatus).not.toHaveBeenCalled();
  });

  it("should fetch full detail via GET when the SSE event reaches HITL_REQUIRED", async () => {
    vi.mocked(isMockMode).mockReturnValue(false);
    vi.mocked(issueStreamTicket).mockResolvedValue({
      ticket: "ticket-1",
      streamUrl: "/api/v1/inspections/job-1/stream?ticket=ticket-1",
      expiresIn: 60,
    });
    vi.mocked(getJobStatus).mockResolvedValue({
      jobId: "job-1",
      taskId: "task-1",
      status: "HITL_REQUIRED",
      progress: 70,
      ubciScore: 45,
      conditionGrade: "NORMAL",
      finalReport: "표지 얼룩 오염",
      originalImageUrls: [],
    });

    const { result } = setupHook("job-1");
    await advanceAndFlush(0);

    act(() => {
      MockEventSource.instances[0].dispatch("progress", {
        job_id: "job-1",
        task_id: "task-1",
        status: "HITL_REQUIRED",
        progress: 70,
        ubci_score: 45,
      });
    });
    await advanceAndFlush(0);

    expect(getJobStatus).toHaveBeenCalledWith("job-1");
    expect(result.current.result?.finalReport).toBe("표지 얼룩 오염");
    expect(result.current.jobStatus).toBe("HITL_REQUIRED");
  });

  it("should refresh the access token and retry when ticket issuance returns 401", async () => {
    vi.mocked(isMockMode).mockReturnValue(false);
    const unauthorizedError = Object.assign(new Error("Unauthorized"), {
      isAxiosError: true,
      response: { status: 401 },
    });
    vi.mocked(issueStreamTicket)
      .mockRejectedValueOnce(unauthorizedError)
      .mockResolvedValueOnce({
        ticket: "ticket-2",
        streamUrl: "/api/v1/inspections/job-1/stream?ticket=ticket-2",
        expiresIn: 60,
      });
    vi.mocked(getOrRefreshAccessToken).mockResolvedValue("new-access-token");

    setupHook("job-1");
    await advanceAndFlush(0);

    expect(getOrRefreshAccessToken).toHaveBeenCalled();
    expect(issueStreamTicket).toHaveBeenCalledTimes(2);
    expect(MockEventSource.instances[0].url).toContain("ticket=ticket-2");
  });

  it("should engage the polling fallback after repeated SSE reconnect failures", async () => {
    vi.mocked(isMockMode).mockReturnValue(false);
    vi.mocked(issueStreamTicket).mockResolvedValue({
      ticket: "ticket-1",
      streamUrl: "/api/v1/inspections/job-1/stream?ticket=ticket-1",
      expiresIn: 60,
    });
    vi.mocked(getJobStatus).mockResolvedValue(baseResult);

    setupHook("job-1");
    await advanceAndFlush(0);

    // 연속으로 SSE 연결을 실패시켜 재연결 백오프를 소진하고 폴링 안전망을 유도한다
    for (let i = 0; i < 3; i += 1) {
      const latest = MockEventSource.instances[MockEventSource.instances.length - 1];
      act(() => {
        latest.triggerError();
      });
      await advanceAndFlush(20000);
    }

    expect(getJobStatus).toHaveBeenCalledWith("job-1");
  });
});
