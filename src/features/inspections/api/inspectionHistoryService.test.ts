import { describe, it, expect, beforeEach, vi } from "vitest";
import { apiClient } from "@/lib/api-client";
import { listInspectionHistory } from "./inspectionHistoryService";

vi.mock("@/lib/api-client", () => ({
  apiClient: {
    get: vi.fn(),
  },
}));

describe("inspectionHistoryService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("listInspectionHistory calls GET /api/v1/admin/inspections with query params", async () => {
    const response = { items: [], total: 0, page: 1, size: 20, total_pages: 0 };
    vi.mocked(apiClient.get).mockResolvedValueOnce({ data: response });

    const params = { keyword: "해리포터", status: "APPROVED" as const, page: 1, size: 20 };
    const res = await listInspectionHistory(params);

    expect(apiClient.get).toHaveBeenCalledWith("/api/v1/admin/inspections", { params });
    expect(res).toEqual(response);
  });

  it("listInspectionHistory passes the grade filter through to the query params", async () => {
    const response = { items: [], total: 0, page: 1, size: 20, total_pages: 0 };
    vi.mocked(apiClient.get).mockResolvedValueOnce({ data: response });

    const params = { grade: "MINT" as const, page: 1, size: 20 };
    await listInspectionHistory(params);

    expect(apiClient.get).toHaveBeenCalledWith("/api/v1/admin/inspections", { params });
  });
});
