import { describe, it, expect, vi } from "vitest";
import { fetchAllPages } from "./fetchAllPages";
import type { PaginatedResponse } from "@/types/pagination";

function page(items: number[], page: number, totalPages: number): PaginatedResponse<number> {
  return { items, total: totalPages * items.length, page, size: items.length, total_pages: totalPages };
}

describe("fetchAllPages", () => {
  it("total_pages가 1이면 1회만 호출하고 해당 페이지 데이터를 반환한다", async () => {
    const fetchPage = vi.fn().mockResolvedValue(page([1, 2, 3], 1, 1));

    const result = await fetchAllPages(fetchPage);

    expect(fetchPage).toHaveBeenCalledTimes(1);
    expect(result).toEqual([1, 2, 3]);
  });

  it("여러 페이지를 순서대로 모두 조회해 하나의 배열로 병합한다", async () => {
    const fetchPage = vi
      .fn()
      .mockResolvedValueOnce(page([1, 2], 1, 3))
      .mockResolvedValueOnce(page([3, 4], 2, 3))
      .mockResolvedValueOnce(page([5, 6], 3, 3));

    const result = await fetchAllPages(fetchPage);

    expect(fetchPage).toHaveBeenCalledTimes(3);
    expect(result).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it("중간 페이지 조회가 실패하면 reject되고 부분 데이터를 반환하지 않는다", async () => {
    const error = new Error("network error");
    const fetchPage = vi
      .fn()
      .mockResolvedValueOnce(page([1, 2], 1, 3))
      .mockRejectedValueOnce(error);

    await expect(fetchAllPages(fetchPage)).rejects.toBe(error);
  });
});
