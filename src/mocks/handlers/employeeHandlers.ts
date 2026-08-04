import { http, HttpResponse } from "msw";
import { API_BASE_URL } from "@/lib/api-client";
import {
  EMPLOYEE_LIST_ENDPOINT,
  EMPLOYEE_CREATE_ENDPOINT,
} from "@/features/employees/constants/employeeApi";
import type {
  AdminUserResponse,
  CreateEmployeeRequest,
  CreateEmployeeResponse,
  EmployeeListResponse,
  UpdateEmployeeStatusRequest,
  UpdateEmployeeRoleRequest,
} from "@/features/employees/types/employee";
import type { JwtClaims } from "@/features/auth/types/authTypes";
import { decodeJwt } from "@/features/auth/utils/jwt";
import { mockEmployees } from "@/mocks/data/employees";

/**
 * 직원 관리 API Mock
 *
 * 백엔드가 없는 개발 환경에서
 * 직원 목록 조회, 계정 생성, 상태 및 역할 변경 요청 처리
 *
 * 모든 변경 내용은 mockEmployees에만 임시 저장
 * 실제 데이터베이스에는 저장되지 않음
 */

function getRequesterId(request: Request): string | null {
  const authorization = request.headers.get("authorization");
  const token = authorization?.replace(/^Bearer\s+/i, "");
  if (!token) return null;
  const claims = decodeJwt<JwtClaims>(token);
  return claims?.sub ?? null;
}

function countActiveMasters(): number {
  return mockEmployees.filter((e) => e.role === "MASTER" && e.status === "ACTIVE").length;
}

function generateMockEmployeeId(): string {
  const today = new Date();
  const yy = String(today.getFullYear()).slice(2);
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  const prefix = `NZ${yy}${mm}${dd}`;
  const todayCount = mockEmployees.filter((e) => e.employee_id.startsWith(prefix)).length;
  return `${prefix}${String(todayCount + 1).padStart(2, "0")}`;
}

function generateMockTemporaryPassword(): string {
  return Math.random().toString(36).slice(2, 10) + "Aa1!";
}

function toAdminUserResponse(employee: (typeof mockEmployees)[number]): AdminUserResponse {
  return {
    id: employee.id,
    employee_id: employee.employee_id,
    email: employee.email,
    name: employee.name,
    role: employee.role,
    status: employee.status,
    must_change_password: employee.must_change_password,
  };
}

export const employeeHandlers = [

  /**
   * 직원 목록 조회
   *
   * 사번·이름·이메일 검색, 역할·상태 필터,
   * 페이지 조건에 맞는 직원 목록 반환
   */
  http.get(`${API_BASE_URL}${EMPLOYEE_LIST_ENDPOINT}`, ({ request }) => {
    const url = new URL(request.url);
    const keyword = url.searchParams.get("keyword")?.trim();
    const role = url.searchParams.get("role");
    const status = url.searchParams.get("status");
    const page = Number(url.searchParams.get("page") ?? "1");
    const size = Number(url.searchParams.get("size") ?? "20");

    const filtered = mockEmployees.filter((employee) => {
      const lowerKeyword = keyword?.toLowerCase();
      const matchesKeyword =
        !lowerKeyword ||
        employee.employee_id.toLowerCase().includes(lowerKeyword) ||
        employee.name.toLowerCase().includes(lowerKeyword) ||
        (employee.email?.toLowerCase().includes(lowerKeyword) ?? false);
      const matchesRole = !role || employee.role === role;
      const matchesStatus = !status || employee.status === status;
      return matchesKeyword && matchesRole && matchesStatus;
    });

    const start = (page - 1) * size;
    const items = filtered.slice(start, start + size);

    const response: EmployeeListResponse = {
      items,
      total: filtered.length,
      page,
      size,
      total_pages: Math.max(1, Math.ceil(filtered.length / size)),
    };
    return HttpResponse.json(response);
  }),

  /**
   * 직원 계정 생성 (단건)
   *
   * 이메일 중복을 확인한 뒤 employee_id/임시 비밀번호를 발급해 mockEmployees에 추가
   */
  http.post(`${API_BASE_URL}${EMPLOYEE_CREATE_ENDPOINT}`, async ({ request }) => {
    const body = (await request.json()) as CreateEmployeeRequest;

    if (body.email && mockEmployees.some((e) => e.email === body.email)) {
      return HttpResponse.json(
        { detail: "이미 사용 중인 이메일입니다.", error_code: "DUPLICATE_EMAIL" },
        { status: 409 }
      );
    }

    const newEmployee = {
      id: crypto.randomUUID(),
      employee_id: generateMockEmployeeId(),
      email: body.email ?? null,
      name: body.name,
      role: body.role,
      status: "ACTIVE" as const,
      must_change_password: true,
      created_at: new Date().toISOString(),
    };
    mockEmployees.push(newEmployee);

    const temporaryPassword = generateMockTemporaryPassword();
    const response: CreateEmployeeResponse = {
      ...toAdminUserResponse(newEmployee),
      temporary_password: temporaryPassword,
    };
    return HttpResponse.json(response, { status: 201 });
  }),

  // 직원 상태(ACTIVE/INACTIVE) 변경
  http.patch(`${API_BASE_URL}/api/v1/users/admin/:userId/status`, async ({ request, params }) => {
    const userId = params.userId as string;
    const body = (await request.json()) as UpdateEmployeeStatusRequest;
    const target = mockEmployees.find((e) => e.id === userId);
    if (!target) {
      return HttpResponse.json({ detail: "직원을 찾을 수 없습니다." }, { status: 404 });
    }

    const requesterId = getRequesterId(request);
    if (requesterId && requesterId === target.id) {
      return HttpResponse.json(
        { detail: "본인의 계정 상태는 직접 변경할 수 없습니다.", error_code: "SELF_STATUS_CHANGE_NOT_ALLOWED" },
        { status: 409 }
      );
    }
    if (target.role === "MASTER" && target.status === "ACTIVE" && body.status === "INACTIVE" && countActiveMasters() <= 1) {
      return HttpResponse.json(
        { detail: "마지막 활성 MASTER 계정은 강등하거나 비활성화할 수 없습니다.", error_code: "LAST_ACTIVE_MASTER" },
        { status: 409 }
      );
    }

    target.status = body.status;
    return HttpResponse.json(toAdminUserResponse(target));
  }),

  // 직원 역할 변경
  http.patch(`${API_BASE_URL}/api/v1/users/admin/:userId/role`, async ({ request, params }) => {
    const userId = params.userId as string;
    const body = (await request.json()) as UpdateEmployeeRoleRequest;
    const target = mockEmployees.find((e) => e.id === userId);
    if (!target) {
      return HttpResponse.json({ detail: "직원을 찾을 수 없습니다." }, { status: 404 });
    }

    const requesterId = getRequesterId(request);
    if (requesterId && requesterId === target.id) {
      return HttpResponse.json(
        { detail: "본인의 권한은 직접 변경할 수 없습니다.", error_code: "SELF_ROLE_CHANGE_NOT_ALLOWED" },
        { status: 409 }
      );
    }
    if (target.role === "MASTER" && target.status === "ACTIVE" && countActiveMasters() <= 1) {
      return HttpResponse.json(
        { detail: "마지막 활성 MASTER 계정은 강등하거나 비활성화할 수 없습니다.", error_code: "LAST_ACTIVE_MASTER" },
        { status: 409 }
      );
    }

    target.role = body.role;
    return HttpResponse.json(toAdminUserResponse(target));
  }),
];
