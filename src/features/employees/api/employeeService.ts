import { apiClient } from "@/lib/api-client";
import { parseContentDispositionFilename } from "@/lib/download";
import {
  EMPLOYEE_LIST_ENDPOINT,
  EMPLOYEE_CREATE_ENDPOINT,
  EMPLOYEE_BULK_TEMPLATE_ENDPOINT,
  EMPLOYEE_BULK_CREATE_ENDPOINT,
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

export interface DownloadedFile {
  blob: Blob;
  filename: string;
}

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

// 직원 일괄 생성용 엑셀 양식 다운로드
export async function downloadEmployeeBulkTemplate(): Promise<DownloadedFile> {
  const res = await apiClient.get(EMPLOYEE_BULK_TEMPLATE_ENDPOINT, {
    responseType: "blob",
  });
  return {
    blob: res.data,
    filename: parseContentDispositionFilename(
      res.headers["content-disposition"],
      "신규직원_등록양식.xlsx"
    ),
  };
}

// 직원 계정 일괄 생성 (엑셀 업로드)
// 성공 시 사번·초기 비밀번호가 담긴 결과 엑셀을 응답으로 받음
export async function bulkCreateEmployees(file: File): Promise<DownloadedFile> {
  const formData = new FormData();
  formData.append("file", file);

  // apiClient 인스턴스 기본 Content-Type이 application/json이라 그대로 두면
  // axios가 FormData를 JSON 문자열로 바꿔 보내버림 -> 요청 단위로 덮어써서 방지
  const res = await apiClient.post(EMPLOYEE_BULK_CREATE_ENDPOINT, formData, {
    responseType: "blob",
    headers: { "Content-Type": "multipart/form-data" },
  });
  return {
    blob: res.data,
    filename: parseContentDispositionFilename(
      res.headers["content-disposition"],
      "신규직원_초기비밀번호.xlsx"
    ),
  };
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
