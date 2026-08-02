import { apiClient } from "@/lib/api-client";
import {
  EMPLOYEE_LIST_ENDPOINT,
  EMPLOYEE_CREATE_ENDPOINT,
  employeeStatusEndpoint,
  employeeRoleEndpoint,
} from "@/features/employees/constants/employeeApi";
import type {
  EmployeeListParams,
  EmployeeListResponse,
  CreateEmployeeRequest,
  CreateEmployeeResponse,
  AdminUserResponse,
  UpdateEmployeeStatusRequest,
  UpdateEmployeeRoleRequest,
} from "@/features/employees/types/employee";

// 직원 목록 조회 (검색/필터/페이지네이션)
export async function listEmployees(params: EmployeeListParams): Promise<EmployeeListResponse> {
  const res = await apiClient.get<EmployeeListResponse>(EMPLOYEE_LIST_ENDPOINT, { params });
  return res.data;
}

// 직원 계정 생성 (단건)
export async function createEmployee(
  payload: CreateEmployeeRequest
): Promise<CreateEmployeeResponse> {
  const res = await apiClient.post<CreateEmployeeResponse>(EMPLOYEE_CREATE_ENDPOINT, payload);
  return res.data;
}

// 직원 상태(ACTIVE/INACTIVE) 변경
export async function updateEmployeeStatus(
  userId: string,
  payload: UpdateEmployeeStatusRequest
): Promise<AdminUserResponse> {
  const res = await apiClient.patch<AdminUserResponse>(employeeStatusEndpoint(userId), payload);
  return res.data;
}

// 직원 역할 변경
export async function updateEmployeeRole(
  userId: string,
  payload: UpdateEmployeeRoleRequest
): Promise<AdminUserResponse> {
  const res = await apiClient.patch<AdminUserResponse>(employeeRoleEndpoint(userId), payload);
  return res.data;
}
