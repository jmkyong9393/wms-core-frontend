import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useJobStatus } from "./useJobStatus";
import { getJobStatus, isMockMode } from "@/services/returnService";

vi.mock("@/services/returnService", () => {
  return {
    getJobStatus: vi.fn(),
    isMockMode: vi.fn(),
  };
});

describe("useJobStatus Hook", () => {
  let mockEventSourceInstance: {
    close: ReturnType<typeof vi.fn>;
    onmessage: ((event: MessageEvent) => void) | null;
    onerror: (() => void) | null;
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();

    // Mock EventSource globally
    class MockEventSource {
      close = vi.fn();
      onmessage = null;
      onerror = null;
      constructor() {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        mockEventSourceInstance = this;
      }
    }
    vi.stubGlobal("EventSource", MockEventSource);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("should initialize with null state if jobId is null", () => {
    const { result } = renderHook(() => useJobStatus(null));

    expect(result.current.jobStatus).toBeNull();
    expect(result.current.result).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it("should sync state to PENDING and trigger SSE/polling when jobId is set", () => {
    vi.mocked(isMockMode).mockReturnValue(true); // Let's use mock mode for simpler polling check
    vi.mocked(getJobStatus).mockResolvedValue({
      jobId: "job-1",
      status: "PROCESSING",
      bookTitle: "Test Book",
      grade: null,
      confidenceScore: null,
      reasons: [],
      wmsDecision: null,
      processedCoverImageUrl: "",
      processedDefectImageUrls: [],
      ubciScore: null,
      completedAt: null,
    });

    const { result } = renderHook(() => useJobStatus("job-1"));

    // Check initial render phase synchronization
    expect(result.current.jobStatus).toBe("PENDING");

    // Fast-forward timers to run polling
    act(() => {
      vi.advanceTimersByTime(0);
    });

    // Check if getJobStatus was called
    expect(getJobStatus).toHaveBeenCalledWith("job-1");
  });

  it("should reset job state when resetJobState is called", () => {
    const { result } = renderHook(() => useJobStatus("job-1"));

    act(() => {
      result.current.resetJobState();
    });

    expect(result.current.jobStatus).toBeNull();
    expect(result.current.result).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it("should set result directly and update status when setResultDirectly is called", () => {
    const { result } = renderHook(() => useJobStatus("job-1"));

    const mockResult = {
      jobId: "job-1",
      status: "COMPLETED" as const,
      bookTitle: "Manual Override",
      grade: "MINT" as const,
      confidenceScore: 1.0,
      reasons: [],
      wmsDecision: "RESTOCKED" as const,
      processedCoverImageUrl: "cover-url",
      processedDefectImageUrls: [],
      ubciScore: 90,
      completedAt: new Date().toISOString(),
    };

    act(() => {
      result.current.setResultDirectly(mockResult);
    });

    expect(result.current.jobStatus).toBe("COMPLETED");
    expect(result.current.result).toEqual(mockResult);
  });

  it("should use EventSource SSE when not in mock mode", () => {
    vi.mocked(isMockMode).mockReturnValue(false);

    renderHook(() => useJobStatus("job-1"));

    expect(mockEventSourceInstance).toBeDefined();
  });

  it("should fallback to polling when EventSource triggers error", () => {
    vi.mocked(isMockMode).mockReturnValue(false);
    vi.mocked(getJobStatus).mockResolvedValue({
      jobId: "job-1",
      status: "COMPLETED",
      bookTitle: "Fallback Polled",
      grade: "NORMAL",
      confidenceScore: 0.8,
      reasons: [],
      wmsDecision: "RESTOCKED",
      processedCoverImageUrl: "",
      processedDefectImageUrls: [],
      ubciScore: null,
      completedAt: null,
    });

    renderHook(() => useJobStatus("job-1"));

    // Simulate EventSource onerror triggering fallback
    act(() => {
      if (mockEventSourceInstance.onerror) {
        mockEventSourceInstance.onerror();
      }
    });

    act(() => {
      vi.advanceTimersByTime(0);
    });

    expect(getJobStatus).toHaveBeenCalledWith("job-1");
  });
});
