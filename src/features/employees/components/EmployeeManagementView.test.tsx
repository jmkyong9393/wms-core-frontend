import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createStore, Provider as JotaiProvider } from "jotai";
import type { CurrentUser, Role } from "@/features/auth/types/authTypes";
import type { MockAccount } from "@/mocks/data/accounts";

// 테스트용 메모리 localStorage
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
        id: "employee-uuid-1",
        employee_id: "W0001",
        email: null,
        name: "박민우",
        role: "WORKER",
        status: "ACTIVE",
        must_change_password: false,
        created_at: "2025-01-01T00:00:00.000Z",
      },
    ],
    total: 1,
    page: 1,
    size: 20,
    total_pages: 1,
  }),
  createEmployee: vi.fn(),
  updateEmployeeStatus: vi.fn(),
  updateEmployeeRole: vi.fn(),
  downloadEmployeeBulkTemplate: vi.fn(),
  bulkCreateEmployees: vi.fn(),
}));

// 역할별 인증 상태로 직원 관리 화면 렌더링
async function renderAs(role: Role) {
  const { EmployeeManagementView } = await import("./EmployeeManagementView");
  const { authTokenAtom, currentUserAtom } = await import("@/features/auth/store/authAtoms");
  const { buildMockJwt } = await import("@/mocks/mockJwt");

  const employeeId = role === "MASTER" ? "M0001" : "A0001";
  const name = role === "MASTER" ? "장문경" : "소한민";
  const id = role === "MASTER" ? "test-master-id" : "test-admin-id";

  const account: MockAccount = {
    id,
    employee_id: employeeId,
    password: "irrelevant",
    role,
    name,
    email: null,
    status: "ACTIVE",
    must_change_password: false,
  };

  const currentUser: CurrentUser = {
    id,
    employeeId,
    name,
    role,
    mustChangePassword: false,
    tenantId: "wms-local",
  };

  const store = createStore();
  // JWT 세션과 사용자 프로필 설정
  store.set(authTokenAtom, buildMockJwt(account));
  store.set(currentUserAtom, currentUser);

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

  it("MASTER 로그인 시 '직원 추가' 버튼이 노출된다", async () => {
    await renderAs("MASTER");

    // 부하가 큰 환경에서는 렌더 커밋이 지연될 수 있어 동기 getByRole 대신 findByRole로 재시도 허용
    expect(await screen.findByRole("button", { name: /직원 추가/ })).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText("박민우")).toBeInTheDocument());
  });

  it("ADMIN 로그인 시 '직원 추가' 버튼이 노출되지 않는다 (조회 전용)", async () => {
    await renderAs("ADMIN");

    await waitFor(() => expect(screen.getByText("박민우")).toBeInTheDocument());
    expect(screen.queryByRole("button", { name: /직원 추가/ })).not.toBeInTheDocument();
  });
});
