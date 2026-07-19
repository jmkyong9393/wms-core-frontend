import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createStore, Provider as JotaiProvider } from "jotai";
import type { Role } from "@/features/auth/types/authTypes";
import type { MockAccount } from "@/mocks/data/accounts";

// jsdom/Node의 localStorage 충돌을 피하기 위해 returnService.test.ts / getPresignedUrl.test.ts와
// 동일하게 in-memory mock으로 전역 localStorage를 stub한다.
// authAtoms.ts는 모듈 로드 시점에 atomWithStorage(...)를 즉시 실행하므로,
// 이 stub이 먼저 걸려 있어야 하고 EmployeeManagementView는 동적 import로 그 이후에 불러온다.
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

vi.mock("@/features/employees/api/employeeService", () => ({
  listEmployees: vi.fn().mockResolvedValue({
    items: [
      {
        employee_id: "W0001",
        name: "박민우",
        role: "WORKER",
        status: "ACTIVE",
        created_at: "2025-01-01T00:00:00.000Z",
      },
    ],
    total: 1,
    page: 1,
    size: 20,
  }),
  bulkCreateEmployees: vi.fn(),
  updateEmployeeStatus: vi.fn(),
  updateEmployeeRole: vi.fn(),
}));

async function renderAs(role: Role) {
  const { EmployeeManagementView } = await import("./EmployeeManagementView");
  const { authTokenAtom } = await import("@/features/auth/store/authAtoms");
  const { buildMockJwt } = await import("@/mocks/mockJwt");

  const account: MockAccount = {
    employee_id: role === "MASTER" ? "M0001" : "A0001",
    password: "irrelevant",
    role,
    name: role === "MASTER" ? "장문경" : "소한민",
    must_change_password: false,
  };

  const store = createStore();
  store.set(authTokenAtom, buildMockJwt(account));

  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

  return render(
    <QueryClientProvider client={queryClient}>
      <JotaiProvider store={store}>
        <EmployeeManagementView />
      </JotaiProvider>
    </QueryClientProvider>
  );
}

describe("EmployeeManagementView", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it("MASTER 로그인 시 '직원 일괄 생성' 버튼이 노출된다", async () => {
    await renderAs("MASTER");

    expect(screen.getByRole("button", { name: /직원 일괄 생성/ })).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText("박민우")).toBeInTheDocument());
  });

  it("ADMIN 로그인 시 '직원 일괄 생성' 버튼이 노출되지 않는다 (조회 전용)", async () => {
    await renderAs("ADMIN");

    await waitFor(() => expect(screen.getByText("박민우")).toBeInTheDocument());
    expect(screen.queryByRole("button", { name: /직원 일괄 생성/ })).not.toBeInTheDocument();
  });
});
