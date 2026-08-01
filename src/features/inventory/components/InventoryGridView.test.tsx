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

import { listInventory } from "@/features/inventory/api/inventoryService";
import { exportRowsToCsv } from "@/lib/export/tableExport";
import { InventoryGridView } from "./InventoryGridView";

function makeRow(id: string, title: string, overrides: Partial<InventoryRow> = {}): InventoryRow {
  return {
    id,
    stock_type: "USED_ITEM",
    book: { title, isbn: "9780000000000" },
    grade: "EXCELLENT",
    zone: "A-1-1",
    quantity: 5,
    reserved_quantity: 2,
    available_quantity: 3,
    lpn_status: "RESERVED",
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

    // 페이지 크기 Select(DataGrid 내부, size="sm")만 활성화되어 있고 나머지 필터 Select는 비활성화되어 있음
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
      // 2페이지 이동 후에는 데이터가 줄어들어 total_pages가 1로 축소된 상황을 재현
      if (callCount === 1) return gridPage([makeRow("1", "도서-1")], 1, 3, 50);
      return gridPage([makeRow("1", "도서-1")], 1, 1, 1);
    });

    renderGrid();
    await waitFor(() => expect(screen.getByText("도서-1")).toBeInTheDocument());

    await user.click(screen.getByRole("button", { name: "다음" }));

    // 화면이 깨지지 않고 1페이지 데이터로 안정적으로 수렴한다
    await waitFor(() => expect(screen.getByText("1 / 1")).toBeInTheDocument());
  });

  it("미지원 필터(키워드/등급/구역) 컨트롤은 비활성화되어 렌더된다", async () => {
    vi.mocked(listInventory).mockResolvedValue(gridPage([], 1, 0, 0));

    renderGrid();
    await waitFor(() => expect(listInventory).toHaveBeenCalled());

    expect(screen.getByPlaceholderText("도서명 또는 ISBN 검색")).toBeDisabled();
    expect(screen.getByPlaceholderText("구역 검색")).toBeDisabled();
    expect(screen.getAllByText("현재 조회 API에서 지원하지 않는 필터입니다").length).toBeGreaterThan(0);
  });

  it("재고 유형과 출고가능수량(available_quantity)을 기준으로 표시한다", async () => {
    vi.mocked(listInventory).mockResolvedValue(
      gridPage(
        [
          makeRow("1", "사피엔스", {
            stock_type: "NEW_STOCK",
            grade: null,
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
});
