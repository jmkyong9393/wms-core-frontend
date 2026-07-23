import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  isMockMode,
  setMockMode,
  startInspection,
  getJobStatus,
  submitHitlOverride,
} from "./returnService";
import { apiClient } from "@/lib/api-client";

// Mock apiClient
vi.mock("@/lib/api-client", () => {
  return {
    apiClient: {
      post: vi.fn(),
      get: vi.fn(),
    },
  };
});

// Mock localStorage globally
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    clear: () => {
      store = {};
    },
    removeItem: (key: string) => {
      delete store[key];
    },
  };
})();
vi.stubGlobal("localStorage", localStorageMock);

describe("returnService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe("Mock Mode Toggle", () => {
    it("isMockMode should return false by default", () => {
      expect(isMockMode()).toBe(false);
    });

    it("should allow setting mock mode to true", () => {
      setMockMode(true);
      expect(isMockMode()).toBe(true);
      expect(localStorage.getItem("wms_mock_mode")).toBe("true");
    });

    it("should allow setting mock mode to false", () => {
      setMockMode(false);
      expect(isMockMode()).toBe(false);
      expect(localStorage.getItem("wms_mock_mode")).toBe("false");
    });
  });

  describe("startInspection", () => {
    it("should return mock jobId and save job in mock mode", async () => {
      setMockMode(true);
      const payload = {
        mode: "NEW_RETURN" as const,
        coverImageUrl: "cover-url",
        defectImageUrls: [],
        bookTitle: "Test Book",
      };

      const res = await startInspection(payload);
      expect(res.jobId).toContain("mock_job_");
      
      const stored = localStorage.getItem(`wms_job_${res.jobId}`);
      expect(stored).not.toBeNull();
      const parsed = JSON.parse(stored!);
      expect(parsed.payload).toEqual(payload);
      expect(parsed.status).toBe("PENDING");
      expect(apiClient.post).not.toHaveBeenCalled();
    });

    it("should call apiClient in real mode", async () => {
      setMockMode(false);
      const mockRes = { jobId: "real_job_123" };
      vi.mocked(apiClient.post).mockResolvedValueOnce({ data: mockRes });

      const payload = {
        mode: "NEW_RETURN" as const,
        coverImageUrl: "cover-url",
        defectImageUrls: [],
        bookTitle: "Test Book",
      };

      const res = await startInspection(payload);
      expect(apiClient.post).toHaveBeenCalledWith("/api/returns/inspect", payload);
      expect(res).toEqual(mockRes);
    });
  });

  describe("getJobStatus", () => {
    it("should simulate status transition based on elapsed time in mock mode", async () => {
      setMockMode(true);
      const jobId = "mock_job_test";
      const payload = {
        mode: "NEW_RETURN" as const,
        coverImageUrl: "cover-url",
        defectImageUrls: [],
        bookTitle: "Test Book",
      };

      // 1. PENDING (created just now)
      localStorage.setItem(
        `wms_job_${jobId}`,
        JSON.stringify({
          createdAt: Date.now(),
          payload,
          status: "PENDING",
        })
      );

      let statusRes = await getJobStatus(jobId);
      expect(statusRes.status).toBe("PENDING");

      // 2. PROCESSING (created 3 seconds ago)
      localStorage.setItem(
        `wms_job_${jobId}`,
        JSON.stringify({
          createdAt: Date.now() - 3000,
          payload,
          status: "PENDING",
        })
      );

      statusRes = await getJobStatus(jobId);
      expect(statusRes.status).toBe("PROCESSING");

      // 3. COMPLETED / HITL_WAITING (created 6 seconds ago)
      localStorage.setItem(
        `wms_job_${jobId}`,
        JSON.stringify({
          createdAt: Date.now() - 6000,
          payload,
          status: "PENDING",
        })
      );

      statusRes = await getJobStatus(jobId);
      expect(["COMPLETED", "HITL_WAITING"]).toContain(statusRes.status);
      expect(statusRes.grade).toBe("NORMAL");
      expect(statusRes.ubciScore).toBe(78);
    });

    it("should call apiClient in real mode", async () => {
      setMockMode(false);
      const mockResult = { jobId: "job_123", status: "COMPLETED" };
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockResult });

      const res = await getJobStatus("job_123");
      expect(apiClient.get).toHaveBeenCalledWith("/api/returns/status/job_123");
      expect(res).toEqual(mockResult);
    });
  });

  describe("submitHitlOverride", () => {
    it("should return mock success in mock mode", async () => {
      setMockMode(true);
      const payload = {
        grade: "MINT" as const,
        reasons: [],
        decision: "RESTOCKED" as const,
      };

      const res = await submitHitlOverride("mock_job_123", payload);
      expect(res.success).toBe(true);
      expect(res.result.grade).toBe("MINT");
      expect(res.result.wmsDecision).toBe("RESTOCKED");
      expect(apiClient.post).not.toHaveBeenCalled();
    });

    it("should call apiClient in real mode", async () => {
      setMockMode(false);
      const mockRes = { success: true, result: { jobId: "job_123", status: "COMPLETED" } };
      vi.mocked(apiClient.post).mockResolvedValueOnce({ data: mockRes });

      const payload = {
        grade: "MINT" as const,
        reasons: [],
        decision: "RESTOCKED" as const,
      };

      const res = await submitHitlOverride("job_123", payload);
      expect(apiClient.post).toHaveBeenCalledWith("/api/returns/hitl/job_123", payload);
      expect(res).toEqual(mockRes);
    });
  });
});
