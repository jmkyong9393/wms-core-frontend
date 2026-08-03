/**
 * 직원 관리 API 주소
 *
 * 직원 목록 조회, 계정 생성(단건/일괄), 상태 변경, 역할 변경에 사용
 */
export const EMPLOYEE_LIST_ENDPOINT = "/api/v1/users/admin";
export const EMPLOYEE_CREATE_ENDPOINT = "/api/v1/users/admin/create-accounts";
export const EMPLOYEE_BULK_TEMPLATE_ENDPOINT = "/api/v1/users/admin/bulk-template";
export const EMPLOYEE_BULK_CREATE_ENDPOINT = "/api/v1/users/admin/bulk-create";
export const employeeStatusEndpoint = (userId: string) =>
  `/api/v1/users/admin/${userId}/status`;
export const employeeRoleEndpoint = (userId: string) =>
  `/api/v1/users/admin/${userId}/role`;
