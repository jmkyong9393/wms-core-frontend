import { describe, it, expect, beforeEach, vi } from "vitest";
import { apiClient } from "@/lib/api-client";
import { listInventory } from "./inventoryService";

vi.mock("@/lib/api-client", () => ({
  apiClient: {
    get: vi.fn(),
  },
}));

describe("inventoryService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("listInventory calls GET /api/v1/inventory with only page and size", async () => {
    const response = { items: [], total: 0, page: 1, size: 20, total_pages: 0 };
    vi.mocked(apiClient.get).mockResolvedValueOnce({ data: response });

    const params = { page: 1, size: 20 };
    const res = await listInventory(params);

    expect(apiClient.get).toHaveBeenCalledWith("/api/v1/inventory", { params });
    expect(res).toEqual(response);
  });

  it("listInventory passes isbn/keyword/grade/zone/date filters through to the query params", async () => {
    const response = { items: [], total: 0, page: 1, size: 20, total_pages: 0 };
    vi.mocked(apiClient.get).mockResolvedValueOnce({ data: response });

    const params = {
      isbn: "9788912345678",
      keyword: "사피엔스",
      grade: "MINT" as const,
      zone: "A",
      start_date: "2026-07-01",
      end_date: "2026-07-31",
      page: 1,
      size: 20,
    };
    await listInventory(params);

    expect(apiClient.get).toHaveBeenCalledWith("/api/v1/inventory", { params });
  });
});
