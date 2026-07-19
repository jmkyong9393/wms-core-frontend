import { http, HttpResponse } from "msw";
import { API_BASE_URL } from "@/lib/api-client";
import {
  EMPLOYEE_LIST_ENDPOINT,
  EMPLOYEE_BULK_CREATE_ENDPOINT,
} from "@/features/employees/constants/employeeApi";
import type {
  BulkCreateEmployeeRequest,
  BulkCreateEmployeeResponse,
  BulkCreateEmployeeResult,
  EmployeeListResponse,
  UpdateEmployeeStatusRequest,
  UpdateEmployeeStatusResponse,
  UpdateEmployeeRoleRequest,
  UpdateEmployeeRoleResponse,
} from "@/features/employees/types/employee";
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
export const employeeHandlers = [

  /**
   * 직원 목록 조회
   *
   * 사번·이름 검색, 역할·상태 필터,
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
      const matchesKeyword =
        !keyword ||
        employee.employee_id.toLowerCase().includes(keyword.toLowerCase()) ||
        employee.name.toLowerCase().includes(keyword.toLowerCase());
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
    };
    return HttpResponse.json(response);
  }),

  /**
   * 직원 계정 일괄 생성
   *
   * 사번 중복과 비밀번호 길이를 확인한 뒤
   * 정상 직원만 mockEmployees에 추가
   *
   * 비밀번호는 검사에만 사용하고 저장하지 않음
   */
  http.post(`${API_BASE_URL}${EMPLOYEE_BULK_CREATE_ENDPOINT}`, async ({ request }) => {
    const body = (await request.json()) as BulkCreateEmployeeRequest;

    const results: BulkCreateEmployeeResult[] = body.employees.map((row) => {
      const isDuplicate = mockEmployees.some((e) => e.employee_id === row.employee_id);
      if (isDuplicate) {
        return { employee_id: row.employee_id, success: false, reason: "이미 존재하는 사번입니다." };
      }
      if (!row.password || row.password.length < 8) {
        return {
          employee_id: row.employee_id,
          success: false,
          reason: "비밀번호는 8자 이상이어야 합니다.",
        };
      }

      mockEmployees.push({
        employee_id: row.employee_id,
        name: row.name,
        role: row.role,
        status: "ACTIVE",
        created_at: new Date().toISOString(),
      });
      return { employee_id: row.employee_id, success: true };
    });

    const response: BulkCreateEmployeeResponse = { results };
    return HttpResponse.json(response);
  }),

  // 직원 상태(ACTIVE/INACTIVE) 변경
  http.patch(`${API_BASE_URL}/api/v1/users/admin/:employeeId/status`, async ({ request, params }) => {
    const employeeId = params.employeeId as string;
    const body = (await request.json()) as UpdateEmployeeStatusRequest;
    const target = mockEmployees.find((e) => e.employee_id === employeeId);
    if (!target) {
      return HttpResponse.json({ detail: "직원을 찾을 수 없습니다." }, { status: 404 });
    }
    target.status = body.status;
    const response: UpdateEmployeeStatusResponse = { employee_id: employeeId, status: target.status };
    return HttpResponse.json(response);
  }),

  // 직원 역할 변경
  http.patch(`${API_BASE_URL}/api/v1/users/admin/:employeeId/role`, async ({ request, params }) => {
    const employeeId = params.employeeId as string;
    const body = (await request.json()) as UpdateEmployeeRoleRequest;
    const target = mockEmployees.find((e) => e.employee_id === employeeId);
    if (!target) {
      return HttpResponse.json({ detail: "직원을 찾을 수 없습니다." }, { status: 404 });
    }
    target.role = body.role;
    const response: UpdateEmployeeRoleResponse = { employee_id: employeeId, role: target.role };
    return HttpResponse.json(response);
  }),
];
