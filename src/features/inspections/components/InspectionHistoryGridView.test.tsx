import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { InspectionHistoryRow } from "@/features/inspections/types/inspectionHistory";
import type { PaginatedResponse } from "@/types/pagination";

// 테스트용 localStorage 설정
// 인증 관련 모듈을 불러오기 전에 등록해야 오류 없이 초기화됨
vi.hoisted(() => {
  const memoryStore: Record<string, string> = {};
  vi.stubGlobal("localStorage", {
    getItem: (key: string) => memoryStore[key] ?? null,
    setItem: (key: string, value: string) => {
      memoryStore[key] = String(value);
    },
    removeItem: (key: string) => {
      delete memoryStore[key];
    },
    clear: () => {
      Object.keys(memoryStore).forEach((key) => delete memoryStore[key]);
    },
  });
});

// 검수 이력 API 호출 Mock
vi.mock("@/features/inspections/api/inspectionHistoryService", () => ({
  listInspectionHistory: vi.fn(),
}));

// 파일 내보내기 함수 Mock
vi.mock("@/lib/export/tableExport", () => ({
  exportRowsToCsv: vi.fn(),
  exportRowsToXlsx: vi.fn(),
}));

import { listInspectionHistory } from "@/features/inspections/api/inspectionHistoryService";
import { exportRowsToCsv } from "@/lib/export/tableExport";
import { InspectionHistoryGridView } from "./InspectionHistoryGridView";

// 테스트용 검수 이력 생성
function makeRow(id: string, bookTitle: string): InspectionHistoryRow {
  return {
    id,
    bookId: `book-${id}`,
    bookTitle,
    finalGrade: "MINT",
    isFastTrack: false,
    status: "APPROVED",
    ubciScore: 95,
    finalReport: "판정 완료",
    reasonCodes: [],
    inspectedAt: "2026-07-01T09:00:00.000Z",
    updatedAt: "2026-07-01T09:00:00.000Z",
    steps: [],
  };
}

// 테스트용 페이지네이션 응답 생성
function gridPage(
  items: InspectionHistoryRow[],
  page: number,
  totalPages: number,
  total: number
): PaginatedResponse<InspectionHistoryRow> {
  return { items, total, page, size: 20, total_pages: totalPages };
}

// React Query 환경에서 그리드 렌더링
function renderGrid() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <InspectionHistoryGridView />
    </QueryClientProvider>
  );
}

describe("InspectionHistoryGridView", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("최초 렌더 시 page=1, size=20으로 조회한다", async () => {
    vi.mocked(listInspectionHistory).mockResolvedValue(
      gridPage([makeRow("1", "싯다르타")], 1, 1, 1)
    );

    renderGrid();

    await waitFor(() => expect(screen.getByText("싯다르타")).toBeInTheDocument());
    const firstCallParams = vi.mocked(listInspectionHistory).mock.calls[0][0];
    expect(firstCallParams).toMatchObject({ page: 1, size: 20 });
  });

  it("'다음' 클릭 시 page=2로 재조회한다", async () => {
    const user = userEvent.setup();
    vi.mocked(listInspectionHistory).mockImplementation(async (params) =>
      gridPage([makeRow(String(params.page), `도서-${params.page}`)], params.page, 3, 50)
    );

    renderGrid();
    await waitFor(() => expect(screen.getByText("도서-1")).toBeInTheDocument());

    await user.click(screen.getByRole("button", { name: "다음" }));

    await waitFor(() => expect(screen.getByText("도서-2")).toBeInTheDocument());
    const lastCallParams = vi.mocked(listInspectionHistory).mock.calls.at(-1)?.[0];
    expect(lastCallParams).toMatchObject({ page: 2 });
  });

  it("페이지 크기를 변경하면 1페이지로 초기화되어 재조회한다", async () => {
    const user = userEvent.setup();
    vi.mocked(listInspectionHistory).mockImplementation(async (params) =>
      gridPage([makeRow(String(params.page), `도서-${params.page}`)], params.page, 5, 100)
    );

    renderGrid();
    await waitFor(() => expect(screen.getByText("도서-1")).toBeInTheDocument());

    await user.click(screen.getByRole("button", { name: "다음" }));
    await waitFor(() =>
      expect(vi.mocked(listInspectionHistory).mock.calls.at(-1)?.[0]).toMatchObject({ page: 2 })
    );

    // 활성화된 페이지 크기 선택창 찾기
    const pageSizeTrigger = screen
      .getAllByRole("combobox")
      .find((el) => el.getAttribute("data-size") === "sm");
    if (!pageSizeTrigger) throw new Error("페이지 크기 Select를 찾지 못했습니다");
    await user.click(pageSizeTrigger);
    await user.click(await screen.findByRole("option", { name: "50개" }));

    await waitFor(() =>
      expect(vi.mocked(listInspectionHistory).mock.calls.at(-1)?.[0]).toMatchObject({
        page: 1,
        size: 50,
      })
    );
  });

  it("검색어를 변경하면 1페이지로 초기화되어 재조회한다", async () => {
    const user = userEvent.setup();
    vi.mocked(listInspectionHistory).mockImplementation(async (params) =>
      gridPage([makeRow("1", `결과-${params.keyword ?? "전체"}`)], params.page, 3, 50)
    );

    renderGrid();
    await waitFor(() => expect(screen.getByText("결과-전체")).toBeInTheDocument());

    await user.click(screen.getByRole("button", { name: "다음" }));
    await waitFor(() =>
      expect(vi.mocked(listInspectionHistory).mock.calls.at(-1)?.[0]).toMatchObject({ page: 2 })
    );

    const keywordInput = screen.getByPlaceholderText("도서명 검색");
    await user.type(keywordInput, "사피엔스");

    await waitFor(() =>
      expect(vi.mocked(listInspectionHistory).mock.calls.at(-1)?.[0]).toMatchObject({
        page: 1,
        keyword: "사피엔스",
      })
    );
  });

  it("조회 결과가 없으면 빈 상태를 보여주고 이전/다음이 비활성화된다", async () => {
    vi.mocked(listInspectionHistory).mockResolvedValue(gridPage([], 1, 0, 0));

    renderGrid();

    await waitFor(() => expect(screen.getByText("표시할 데이터가 없습니다.")).toBeInTheDocument());
    expect(screen.getByRole("button", { name: "이전" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "다음" })).toBeDisabled();
  });

  it("미지원 필터(등급) 컨트롤은 비활성화되어 렌더된다", async () => {
    vi.mocked(listInspectionHistory).mockResolvedValue(gridPage([], 1, 0, 0));

    renderGrid();
    await waitFor(() => expect(listInspectionHistory).toHaveBeenCalled());

    // 페이지 크기 Select(DataGrid 내부, size="sm")를 제외한 나머지 비활성 필터 Select(등급)
    const gradeTrigger = screen
      .getAllByRole("combobox")
      .find((el) => el.getAttribute("data-size") !== "sm" && el.hasAttribute("disabled"));
    expect(gradeTrigger).toBeDefined();
    expect(screen.getAllByText("현재 조회 API에서 지원하지 않는 필터입니다").length).toBeGreaterThan(0);
  });

  it("전체 내보내기 중 일부 페이지 조회가 실패하면 파일을 만들지 않고 오류를 표시한다", async () => {
    const user = userEvent.setup();
    vi.mocked(listInspectionHistory).mockImplementation(async (params) => {
      if (params.size === 100) {
        if (params.page === 1) {
          return gridPage([makeRow("1", "싯다르타")], 1, 2, 150);
        }
        throw new Error("network error");
      }
      return gridPage([makeRow("1", "싯다르타")], 1, 1, 1);
    });

    renderGrid();
    await waitFor(() => expect(screen.getByText("싯다르타")).toBeInTheDocument());

    await user.click(screen.getByRole("button", { name: "CSV 내보내기" }));

    await waitFor(() =>
      expect(screen.getByText("내보내기에 실패했습니다. 다시 시도해 주세요.")).toBeInTheDocument()
    );
    // 일부 데이터만 파일로 만들지 않는지 확인
    expect(exportRowsToCsv).not.toHaveBeenCalled();
    // 실패 후 버튼이 다시 활성화되는지 확인
    expect(screen.getByRole("button", { name: "CSV 내보내기" })).not.toBeDisabled();
  });
});
