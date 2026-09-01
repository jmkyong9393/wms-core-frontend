import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { InventoryRow } from "@/features/inventory/types/inventoryRow";
import type { PaginatedResponse } from "@/types/pagination";

vi.mock("@/features/inventory/api/inventoryService", () => ({
  listInventory: vi.fn(),
}));

vi.mock("@/lib/export/tableExport", () => ({
  exportRowsToCsv: vi.fn(),
  exportRowsToXlsx: vi.fn(),
}));

const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

import { listInventory } from "@/features/inventory/api/inventoryService";
import { exportRowsToCsv } from "@/lib/export/tableExport";
import { InventoryGridView } from "./InventoryGridView";

function makeRow(id: string, title: string, overrides: Partial<InventoryRow> = {}): InventoryRow {
  return {
    id,
    stock_type: "USED_ITEM",
    book: { title, isbn: "9780000000000", cover_image_url: null },
    grade: "EXCELLENT",
    zone: "A-1-1",
    quantity: 5,
    reserved_quantity: 2,
    available_quantity: 3,
    lpn_status: "RESERVED",
    lpn_barcode: "LPN-TEST0000000000000000000000001",
    base_price: 15000,
    discount_rate: 0.3,
    sale_price: 10500,
    pricing_status: "AGENT_PRICED",
    date: "2026-07-01T09:00:00.000Z",
    ...overrides,
  };
}

function gridPage(
  items: InventoryRow[],
  page: number,
  totalPages: number,
  total: number
): PaginatedResponse<InventoryRow> {
  return { items, total, page, size: 20, total_pages: totalPages };
}

function renderGrid() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <InventoryGridView />
    </QueryClientProvider>
  );
}

describe("InventoryGridView", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("최초 렌더 시 page=1, size=20으로 조회한다", async () => {
    vi.mocked(listInventory).mockResolvedValue(gridPage([makeRow("1", "사피엔스")], 1, 1, 1));

    renderGrid();

    await waitFor(() => expect(screen.getByText("사피엔스")).toBeInTheDocument());
    expect(vi.mocked(listInventory).mock.calls[0][0]).toEqual({ page: 1, size: 20 });
  });

  it("'다음' 클릭 시 page=2로 재조회한다", async () => {
    const user = userEvent.setup();
    vi.mocked(listInventory).mockImplementation(async (params) =>
      gridPage([makeRow(String(params.page), `도서-${params.page}`)], params.page, 3, 50)
    );

    renderGrid();
    await waitFor(() => expect(screen.getByText("도서-1")).toBeInTheDocument());

    await user.click(screen.getByRole("button", { name: "다음" }));

    await waitFor(() => expect(screen.getByText("도서-2")).toBeInTheDocument());
    expect(vi.mocked(listInventory).mock.calls.at(-1)?.[0]).toMatchObject({ page: 2 });
  });

  it("페이지 크기를 변경하면 1페이지로 초기화되어 재조회한다", async () => {
    const user = userEvent.setup();
    vi.mocked(listInventory).mockImplementation(async (params) =>
      gridPage([makeRow(String(params.page), `도서-${params.page}`)], params.page, 5, 100)
    );

    renderGrid();
    await waitFor(() => expect(screen.getByText("도서-1")).toBeInTheDocument());

    await user.click(screen.getByRole("button", { name: "다음" }));
    await waitFor(() =>
      expect(vi.mocked(listInventory).mock.calls.at(-1)?.[0]).toMatchObject({ page: 2 })
    );

    // 페이지 크기 선택창 찾기
    const pageSizeTrigger = screen
      .getAllByRole("combobox")
      .find((el) => el.getAttribute("data-size") === "sm");
    if (!pageSizeTrigger) throw new Error("페이지 크기 Select를 찾지 못했습니다");
    await user.click(pageSizeTrigger);
    await user.click(await screen.findByRole("option", { name: "50개" }));

    await waitFor(() =>
      expect(vi.mocked(listInventory).mock.calls.at(-1)?.[0]).toEqual({ page: 1, size: 50 })
    );
  });

  it("조회 결과가 없으면 빈 상태를 보여주고 이전/다음이 비활성화된다", async () => {
    vi.mocked(listInventory).mockResolvedValue(gridPage([], 1, 0, 0));

    renderGrid();

    await waitFor(() => expect(screen.getByText("표시할 데이터가 없습니다.")).toBeInTheDocument());
    expect(screen.getByRole("button", { name: "이전" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "다음" })).toBeDisabled();
  });

  it("total_pages가 현재 페이지보다 작아지면 범위 안으로 보정한다", async () => {
    const user = userEvent.setup();
    let callCount = 0;
    vi.mocked(listInventory).mockImplementation(async () => {
      callCount += 1;
      // 페이지 이동 후 전체 페이지 수가 1로 줄어든 상황
      if (callCount === 1) return gridPage([makeRow("1", "도서-1")], 1, 3, 50);
      return gridPage([makeRow("1", "도서-1")], 1, 1, 1);
    });

    renderGrid();
    await waitFor(() => expect(screen.getByText("도서-1")).toBeInTheDocument());

    await user.click(screen.getByRole("button", { name: "다음" }));

    // 줄어든 전체 페이지 수에 맞춰 1페이지로 이동하는지 확인
    await waitFor(() => expect(screen.getByText("1 / 1")).toBeInTheDocument());
  });

  it("키워드/등급/구역/날짜 필터를 조합하면 각 파라미터가 조회에 반영되고 1페이지로 초기화된다", async () => {
    const user = userEvent.setup();
    vi.mocked(listInventory).mockImplementation(async (params) =>
      gridPage([makeRow("1", `결과-${params.grade ?? "전체"}`)], params.page, 3, 50)
    );

    renderGrid();
    await waitFor(() => expect(screen.getByText("결과-전체")).toBeInTheDocument());

    await user.click(screen.getByRole("button", { name: "다음" }));
    await waitFor(() =>
      expect(vi.mocked(listInventory).mock.calls.at(-1)?.[0]).toMatchObject({ page: 2 })
    );

    const keywordInput = screen.getByPlaceholderText("도서명, ISBN, LPN 검색");
    await user.type(keywordInput, "사피엔스");
    await waitFor(() =>
      expect(vi.mocked(listInventory).mock.calls.at(-1)?.[0]).toMatchObject({
        page: 1,
        keyword: "사피엔스",
      })
    );

    // 필터 Select 순서: 등급 → 구역
    const gradeTrigger = screen
      .getAllByRole("combobox")
      .filter((el) => el.getAttribute("data-size") !== "sm")[0];
    await user.click(gradeTrigger);
    await user.click(await screen.findByRole("option", { name: "S등급" }));
    await waitFor(() =>
      expect(vi.mocked(listInventory).mock.calls.at(-1)?.[0]).toMatchObject({
        page: 1,
        grade: "MINT",
      })
    );

    const zoneTrigger = screen
      .getAllByRole("combobox")
      .filter((el) => el.getAttribute("data-size") !== "sm")[1];
    await user.click(zoneTrigger);
    await user.click(await screen.findByRole("option", { name: "A구역" }));
    await waitFor(() =>
      expect(vi.mocked(listInventory).mock.calls.at(-1)?.[0]).toMatchObject({
        page: 1,
        zone: "A",
      })
    );
  });

  it("전체 내보내기는 현재 활성 필터를 포함해 조회한다", async () => {
    const user = userEvent.setup();
    vi.mocked(listInventory).mockResolvedValue(gridPage([makeRow("1", "사피엔스")], 1, 1, 1));

    renderGrid();
    await waitFor(() => expect(screen.getByText("사피엔스")).toBeInTheDocument());

    const keywordInput = screen.getByPlaceholderText("도서명, ISBN, LPN 검색");
    await user.type(keywordInput, "사피엔스");
    await waitFor(() =>
      expect(vi.mocked(listInventory).mock.calls.at(-1)?.[0]).toMatchObject({ keyword: "사피엔스" })
    );

    vi.mocked(listInventory).mockClear();
    await user.click(screen.getByRole("button", { name: "CSV 내보내기" }));

    await waitFor(() => expect(listInventory).toHaveBeenCalled());
    expect(vi.mocked(listInventory).mock.calls[0][0]).toMatchObject({
      keyword: "사피엔스",
      page: 1,
      size: 100,
    });
  });

  it("재고 유형과 출고가능수량(available_quantity)을 기준으로 표시한다", async () => {
    vi.mocked(listInventory).mockResolvedValue(
      gridPage(
        [
          makeRow("1", "사피엔스", {
            stock_type: "NEW_STOCK",
            grade: "MINT",
            quantity: 20,
            reserved_quantity: 5,
            available_quantity: 15,
          }),
        ],
        1,
        1,
        1
      )
    );

    renderGrid();

    await waitFor(() => expect(screen.getByText("사피엔스")).toBeInTheDocument());
    expect(screen.getByText("신간 묶음")).toBeInTheDocument();
    expect(screen.getByText("15권")).toBeInTheDocument();
    expect(screen.queryByText("20권")).not.toBeInTheDocument();
  });

  it("전체 내보내기 중 일부 페이지 조회가 실패하면 파일을 만들지 않고 오류를 표시한다", async () => {
    const user = userEvent.setup();
    vi.mocked(listInventory).mockImplementation(async (params) => {
      if (params.size === 100) {
        if (params.page === 1) {
          return gridPage([makeRow("1", "사피엔스")], 1, 2, 150);
        }
        throw new Error("network error");
      }
      return gridPage([makeRow("1", "사피엔스")], 1, 1, 1);
    });

    renderGrid();
    await waitFor(() => expect(screen.getByText("사피엔스")).toBeInTheDocument());

    await user.click(screen.getByRole("button", { name: "CSV 내보내기" }));

    await waitFor(() =>
      expect(screen.getByText("내보내기에 실패했습니다. 다시 시도해 주세요.")).toBeInTheDocument()
    );
    expect(exportRowsToCsv).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "CSV 내보내기" })).not.toBeDisabled();
  });

  it("중고 단품 행을 클릭하면 LPN 상세로 이동한다", async () => {
    const user = userEvent.setup();
    vi.mocked(listInventory).mockResolvedValue(
      gridPage(
        [makeRow("1", "사피엔스", { stock_type: "USED_ITEM", lpn_barcode: "LPN-ABC123" })],
        1,
        1,
        1
      )
    );

    renderGrid();
    await waitFor(() => expect(screen.getByText("사피엔스")).toBeInTheDocument());

    await user.click(screen.getByText("사피엔스"));

    expect(mockPush).toHaveBeenCalledWith("/admin/lpn/LPN-ABC123");
  });

  it("신간 묶음 행을 클릭하면 재고 상세로 이동한다", async () => {
    const user = userEvent.setup();
    vi.mocked(listInventory).mockResolvedValue(
      gridPage(
        [makeRow("inv-1", "사피엔스", { stock_type: "NEW_STOCK", lpn_barcode: null })],
        1,
        1,
        1
      )
    );

    renderGrid();
    await waitFor(() => expect(screen.getByText("사피엔스")).toBeInTheDocument());

    await user.click(screen.getByText("사피엔스"));

    expect(mockPush).toHaveBeenCalledWith("/admin/inventory/inv-1");
  });
});
