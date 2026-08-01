import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  isMockMode,
  setMockMode,
  registerBook,
  createUsedItemInbound,
  startInspection,
  submitRecheck,
  getJobStatus,
  issueStreamTicket,
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

  describe("registerBook", () => {
    it("should return a mock book in mock mode without calling apiClient", async () => {
      setMockMode(true);
      const res = await registerBook("9788912345678");
      expect(res.bookId).toBe("mock_book_9788912345678");
      expect(res.isbn).toBe("9788912345678");
      expect(apiClient.post).not.toHaveBeenCalled();
    });

    it("should call apiClient.post and adapt snake_case response in real mode", async () => {
      setMockMode(false);
      vi.mocked(apiClient.post).mockResolvedValueOnce({
        data: {
          book_id: "book-1",
          isbn: "9788912345678",
          title: "해리포터와 마법사의 돌",
          original_price: "15000.00",
          publisher: "문학수첩",
          category: "NOVEL",
          created: true,
        },
      });

      const res = await registerBook("9788912345678");
      expect(apiClient.post).toHaveBeenCalledWith("/api/v1/books/register", {
        isbn: "9788912345678",
      });
      expect(res).toEqual({
        bookId: "book-1",
        isbn: "9788912345678",
        title: "해리포터와 마법사의 돌",
        originalPrice: "15000.00",
        publisher: "문학수첩",
        category: "NOVEL",
        created: true,
      });
    });
  });

  describe("createUsedItemInbound", () => {
    it("should map NEW_RETURN mode to CUSTOMER_RETURN inbound_type and send Idempotency-Key header", async () => {
      setMockMode(false);
      vi.mocked(apiClient.post).mockResolvedValueOnce({
        data: {
          inbound_id: "inbound-1",
          inbound_item_id: "item-1",
          inbound_type: "CUSTOMER_RETURN",
          status: "CHECKING",
          book_id: "book-1",
          lpn_barcode: "LPN123",
          certificate_url: "https://example.com/cert",
          label_scan_url: "https://example.com/scan",
          label_print_status: "SENT",
          label_print_error: null,
        },
      });

      const res = await createUsedItemInbound({
        mode: "NEW_RETURN",
        bookId: "book-1",
        idempotencyKey: "idem-key-1",
      });

      expect(apiClient.post).toHaveBeenCalledWith(
        "/api/v1/inbound/used-item",
        { inbound_type: "CUSTOMER_RETURN", book_id: "book-1", supplier_name: undefined },
        { headers: { "Idempotency-Key": "idem-key-1" } }
      );
      expect(res.inboundItemId).toBe("item-1");
      expect(res.lpnBarcode).toBe("LPN123");
    });

    it("should map USED_PURCHASE mode to USED_PURCHASE inbound_type and forward supplierName", async () => {
      setMockMode(false);
      vi.mocked(apiClient.post).mockResolvedValueOnce({
        data: {
          inbound_id: "inbound-2",
          inbound_item_id: "item-2",
          inbound_type: "USED_PURCHASE",
          status: "CHECKING",
          book_id: "book-2",
          lpn_barcode: "LPN456",
          certificate_url: "https://example.com/cert2",
          label_scan_url: "https://example.com/scan2",
          label_print_status: "SKIPPED",
          label_print_error: null,
        },
      });

      await createUsedItemInbound({
        mode: "USED_PURCHASE",
        bookId: "book-2",
        supplierName: "홍길동",
        idempotencyKey: "idem-key-2",
      });

      expect(apiClient.post).toHaveBeenCalledWith(
        "/api/v1/inbound/used-item",
        { inbound_type: "USED_PURCHASE", book_id: "book-2", supplier_name: "홍길동" },
        { headers: { "Idempotency-Key": "idem-key-2" } }
      );
    });

    it("should return mock inbound result in mock mode without calling apiClient", async () => {
      setMockMode(true);
      const res = await createUsedItemInbound({
        mode: "USED_PURCHASE",
        bookId: "book-1",
        idempotencyKey: "idem-1",
      });
      expect(res.inboundItemId).toBe("mock_item_idem-1");
      expect(apiClient.post).not.toHaveBeenCalled();
    });
  });

  describe("startInspection", () => {
    const payload = {
      inboundItemId: "item-1",
      bookId: "book-1",
      mode: "NEW_RETURN" as const,
      imagePaths: ["https://cdn.example.com/uploads/cover.jpg"],
    };

    it("should return mock jobId and save job in mock mode", async () => {
      setMockMode(true);
      const res = await startInspection(payload);
      expect(res.jobId).toContain("mock_job_");
      expect(res.status).toBe("PENDING");

      const stored = localStorage.getItem(`wms_job_${res.jobId}`);
      expect(stored).not.toBeNull();
      const parsed = JSON.parse(stored!);
      expect(parsed.payload).toEqual(payload);
      expect(apiClient.post).not.toHaveBeenCalled();
    });

    it("should call apiClient with mapped mode/snake_case body in real mode", async () => {
      setMockMode(false);
      vi.mocked(apiClient.post).mockResolvedValueOnce({
        data: {
          job_id: "job-1",
          task_id: "task-1",
          status: "PENDING",
          message: "검수 파이프라인 가동 시작",
          stream_ticket_url: "/api/v1/inspections/job-1/stream-ticket",
        },
      });

      const res = await startInspection(payload);
      expect(apiClient.post).toHaveBeenCalledWith("/api/v1/inspections", {
        inbound_item_id: "item-1",
        book_id: "book-1",
        mode: "RETURN",
        image_paths: payload.imagePaths,
      });
      expect(res).toEqual({
        jobId: "job-1",
        taskId: "task-1",
        status: "PENDING",
        message: "검수 파이프라인 가동 시작",
        streamTicketUrl: "/api/v1/inspections/job-1/stream-ticket",
      });
    });
  });

  describe("submitRecheck", () => {
    it("should call the recheck endpoint with image paths in real mode", async () => {
      setMockMode(false);
      vi.mocked(apiClient.post).mockResolvedValueOnce({
        data: {
          job_id: "job-1",
          task_id: "task-2",
          status: "PENDING",
          message: "재검수 시작",
          stream_ticket_url: "/api/v1/inspections/job-1/stream-ticket",
        },
      });

      const res = await submitRecheck("job-1", ["https://cdn.example.com/uploads/recheck.jpg"]);
      expect(apiClient.post).toHaveBeenCalledWith("/api/v1/inspections/job-1/recheck", {
        image_paths: ["https://cdn.example.com/uploads/recheck.jpg"],
      });
      expect(res.status).toBe("PENDING");
    });

    it("should reset the mock job to PENDING in mock mode", async () => {
      setMockMode(true);
      localStorage.setItem(
        "wms_job_mock_job_1",
        JSON.stringify({ createdAt: Date.now() - 6000, payload: {}, status: "RECHECK_REQUIRED" })
      );

      const res = await submitRecheck("mock_job_1", ["new-image-url"]);
      expect(res.status).toBe("PENDING");
      const stored = JSON.parse(localStorage.getItem("wms_job_mock_job_1")!);
      expect(stored.payload.imagePaths).toEqual(["new-image-url"]);
    });
  });

  describe("getJobStatus", () => {
    it("should simulate status transition based on elapsed time in mock mode", async () => {
      setMockMode(true);
      const jobId = "mock_job_test";

      // 1. PENDING (created just now)
      localStorage.setItem(
        `wms_job_${jobId}`,
        JSON.stringify({ createdAt: Date.now(), payload: {}, status: "PENDING" })
      );
      let statusRes = await getJobStatus(jobId);
      expect(statusRes.status).toBe("PENDING");

      // 2. PROCESSING (created 3 seconds ago)
      localStorage.setItem(
        `wms_job_${jobId}`,
        JSON.stringify({ createdAt: Date.now() - 3000, payload: {}, status: "PENDING" })
      );
      statusRes = await getJobStatus(jobId);
      expect(statusRes.status).toBe("PROCESSING");

      // 3. APPROVED / HITL_REQUIRED (created 6 seconds ago)
      localStorage.setItem(
        `wms_job_${jobId}`,
        JSON.stringify({ createdAt: Date.now() - 6000, payload: {}, status: "PENDING" })
      );
      statusRes = await getJobStatus(jobId);
      expect(["APPROVED", "HITL_REQUIRED"]).toContain(statusRes.status);
      expect(statusRes.conditionGrade).toBe("NORMAL");
    });

    it("should call apiClient.get and adapt snake_case response in real mode", async () => {
      setMockMode(false);
      vi.mocked(apiClient.get).mockResolvedValueOnce({
        data: {
          job_id: "job-1",
          task_id: "task-1",
          status: "APPROVED",
          progress: 100,
          ubci_score: 92,
          condition_grade: "MINT",
          final_report: "정상 승인",
          original_image_urls: ["https://cdn.example.com/uploads/cover.jpg"],
        },
      });

      const res = await getJobStatus("job-1");
      expect(apiClient.get).toHaveBeenCalledWith("/api/v1/inspections/job-1");
      expect(res).toEqual({
        jobId: "job-1",
        taskId: "task-1",
        status: "APPROVED",
        progress: 100,
        ubciScore: 92,
        conditionGrade: "MINT",
        finalReport: "정상 승인",
        originalImageUrls: ["https://cdn.example.com/uploads/cover.jpg"],
      });
    });
  });

  describe("issueStreamTicket", () => {
    it("should call the stream-ticket endpoint and adapt snake_case response", async () => {
      vi.mocked(apiClient.post).mockResolvedValueOnce({
        data: {
          ticket: "ticket-abc",
          stream_url: "/api/v1/inspections/job-1/stream?ticket=ticket-abc",
          expires_in: 60,
        },
      });

      const res = await issueStreamTicket("job-1");
      expect(apiClient.post).toHaveBeenCalledWith("/api/v1/inspections/job-1/stream-ticket");
      expect(res).toEqual({
        ticket: "ticket-abc",
        streamUrl: "/api/v1/inspections/job-1/stream?ticket=ticket-abc",
        expiresIn: 60,
      });
    });
  });
});
