import { describe, it, expect, beforeEach, vi } from "vitest";
import { apiClient } from "@/lib/api-client";
import {
  listEmployees,
  createEmployee,
  updateEmployeeStatus,
  updateEmployeeRole,
} from "./employeeService";

vi.mock("@/lib/api-client", () => {
  return {
    apiClient: {
      get: vi.fn(),
      post: vi.fn(),
      patch: vi.fn(),
    },
  };
});

describe("employeeService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("listEmployees calls GET /api/v1/users/admin with query params", async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce({
      data: { items: [], total: 0, page: 1, size: 20, total_pages: 1 },
    });

    const params = { keyword: "홍", page: 1, size: 20 };
    const res = await listEmployees(params);

    expect(apiClient.get).toHaveBeenCalledWith("/api/v1/users/admin", { params });
    expect(res).toEqual({ items: [], total: 0, page: 1, size: 20, total_pages: 1 });
  });

  it("createEmployee calls POST /api/v1/users/admin/create-accounts with the request body", async () => {
    const payload = {
      name: "홍길동",
      hire_date: "2026-08-02",
      role: "WORKER" as const,
    };
    vi.mocked(apiClient.post).mockResolvedValueOnce({
      data: {
        id: "uuid-1",
        employee_id: "AV26080201",
        email: null,
        name: "홍길동",
        role: "WORKER",
        status: "ACTIVE",
        must_change_password: true,
        temporary_password: "Temp1234!",
      },
    });

    const res = await createEmployee(payload);

    expect(apiClient.post).toHaveBeenCalledWith("/api/v1/users/admin/create-accounts", payload);
    expect(res.employee_id).toBe("AV26080201");
    expect(res.temporary_password).toBe("Temp1234!");
  });

  it("updateEmployeeStatus calls PATCH on the employee status endpoint with the user UUID", async () => {
    vi.mocked(apiClient.patch).mockResolvedValueOnce({
      data: {
        id: "uuid-1",
        employee_id: "W0001",
        email: null,
        name: "박민우",
        role: "WORKER",
        status: "INACTIVE",
        must_change_password: false,
      },
    });

    const res = await updateEmployeeStatus("uuid-1", { status: "INACTIVE" });

    expect(apiClient.patch).toHaveBeenCalledWith("/api/v1/users/admin/uuid-1/status", {
      status: "INACTIVE",
    });
    expect(res.status).toBe("INACTIVE");
  });

  it("updateEmployeeRole calls PATCH on the employee role endpoint with the user UUID", async () => {
    vi.mocked(apiClient.patch).mockResolvedValueOnce({
      data: {
        id: "uuid-1",
        employee_id: "W0001",
        email: null,
        name: "박민우",
        role: "ADMIN",
        status: "ACTIVE",
        must_change_password: false,
      },
    });

    const res = await updateEmployeeRole("uuid-1", { role: "ADMIN" });

    expect(apiClient.patch).toHaveBeenCalledWith("/api/v1/users/admin/uuid-1/role", {
      role: "ADMIN",
    });
    expect(res.role).toBe("ADMIN");
  });
});
