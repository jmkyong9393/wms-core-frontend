import { describe, it, expect, beforeEach, vi } from "vitest";
import { apiClient } from "@/lib/api-client";
import {
  listEmployees,
  createEmployee,
  updateEmployeeStatus,
  updateEmployeeRole,
  downloadEmployeeBulkTemplate,
  bulkCreateEmployees,
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
        employee_id: "NZ26080201",
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
    expect(res.employee_id).toBe("NZ26080201");
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

  it("downloadEmployeeBulkTemplate calls GET /bulk-template as a blob and reads the filename", async () => {
    const blob = new Blob(["dummy"]);
    vi.mocked(apiClient.get).mockResolvedValueOnce({
      data: blob,
      headers: { "content-disposition": 'attachment; filename="employee_bulk_template.xlsx"' },
    });

    const res = await downloadEmployeeBulkTemplate();

    expect(apiClient.get).toHaveBeenCalledWith("/api/v1/users/admin/bulk-template", {
      responseType: "blob",
    });
    expect(res.blob).toBe(blob);
    expect(res.filename).toBe("employee_bulk_template.xlsx");
  });

  it("downloadEmployeeBulkTemplate falls back to a default filename when the header is missing", async () => {
    const blob = new Blob(["dummy"]);
    vi.mocked(apiClient.get).mockResolvedValueOnce({ data: blob, headers: {} });

    const res = await downloadEmployeeBulkTemplate();

    expect(res.filename).toBe("신규직원_등록양식.xlsx");
  });

  it("bulkCreateEmployees calls POST /bulk-create with the file as multipart form-data", async () => {
    const file = new File(["dummy"], "employees.xlsx", {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const blob = new Blob(["result"]);
    vi.mocked(apiClient.post).mockResolvedValueOnce({
      data: blob,
      headers: { "content-disposition": 'attachment; filename="employee_accounts_20260803_120000.xlsx"' },
    });

    const res = await bulkCreateEmployees(file);

    expect(apiClient.post).toHaveBeenCalledTimes(1);
    const [url, body, config] = vi.mocked(apiClient.post).mock.calls[0];
    expect(url).toBe("/api/v1/users/admin/bulk-create");
    expect(body).toBeInstanceOf(FormData);
    expect((body as FormData).get("file")).toBe(file);
    expect(config).toEqual({
      responseType: "blob",
      headers: { "Content-Type": "multipart/form-data" },
    });
    expect(res.blob).toBe(blob);
    expect(res.filename).toBe("employee_accounts_20260803_120000.xlsx");
  });
});
