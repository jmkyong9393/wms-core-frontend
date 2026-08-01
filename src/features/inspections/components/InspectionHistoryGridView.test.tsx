import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
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

  it("등급 필터를 변경하면 grade 파라미터로 조회하고 1페이지로 초기화한다", async () => {
    const user = userEvent.setup();
    vi.mocked(listInspectionHistory).mockImplementation(async (params) =>
      gridPage([makeRow("1", `등급-${params.grade ?? "전체"}`)], params.page, 3, 50)
    );

    renderGrid();
    await waitFor(() => expect(screen.getByText("등급-전체")).toBeInTheDocument());

    await user.click(screen.getByRole("button", { name: "다음" }));
    await waitFor(() =>
      expect(vi.mocked(listInspectionHistory).mock.calls.at(-1)?.[0]).toMatchObject({ page: 2 })
    );

    const gradeTrigger = screen
      .getAllByRole("combobox")
      .find((el) => el.getAttribute("data-size") !== "sm");
    if (!gradeTrigger) throw new Error("등급 Select를 찾지 못했습니다");
    await user.click(gradeTrigger);
    await user.click(await screen.findByRole("option", { name: "S등급" }));

    await waitFor(() =>
      expect(vi.mocked(listInspectionHistory).mock.calls.at(-1)?.[0]).toMatchObject({
        page: 1,
        grade: "MINT",
      })
    );
  });

  it("종료일을 선택하면 end_date에 하루 끝 시각을 붙여 전달한다", async () => {
    vi.mocked(listInspectionHistory).mockImplementation(async (params) =>
      gridPage([makeRow("1", `종료일-${params.end_date ?? "없음"}`)], params.page, 1, 1)
    );

    renderGrid();
    await waitFor(() => expect(screen.getByText("종료일-없음")).toBeInTheDocument());

    const dateInputs = document.querySelectorAll('input[type="date"]');
    const endDateInput = dateInputs[1] as HTMLInputElement;
    fireEvent.change(endDateInput, { target: { value: "2026-07-31" } });

    await waitFor(() =>
      expect(vi.mocked(listInspectionHistory).mock.calls.at(-1)?.[0]).toMatchObject({
        end_date: "2026-07-31T23:59:59",
      })
    );
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
