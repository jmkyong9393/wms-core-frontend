import type { Role, UserStatus } from "@/features/auth/types/authTypes";

// 직원 생성과 역할 변경 시 선택 가능한 역할
// 백엔드가 생성·역할변경 API 모두 ADMIN/WORKER만 Literal로 허용 (MASTER, GUEST 선택 불가)
export type AssignableRole = "ADMIN" | "WORKER";
export const ASSIGNABLE_ROLES: readonly AssignableRole[] = ["ADMIN", "WORKER"];

// 직원 목록의 직원 한 명 정보
// role은 목록에 MASTER/GUEST도 내려오므로 전체 Role 타입 사용
// 비밀번호는 직원 목록에 포함하지 않음
export interface EmployeeListItem {
  id: string; // 사용자 UUID, 권한·상태 변경 API 경로에 사용
  employee_id: string;
  email: string | null;
  name: string;
  role: Role;
  status: UserStatus;
  must_change_password: boolean;
  created_at: string;
}

export interface EmployeeListParams {
  keyword?: string;
  role?: Role;
  status?: UserStatus;
  page?: number;
  size?: number;
}

export interface EmployeeListResponse {
  items: EmployeeListItem[];
  total: number;
  page: number;
  size: number;
  total_pages: number;
}

// 생성할 직원 한 명의 입력 정보
export interface CreateEmployeeRequest {
  name: string;
  email?: string;
  hire_date: string; // ISO date (YYYY-MM-DD)
  role: AssignableRole;
}

// 역할·상태 변경 API 성공 응답 공통 형태 
export interface AdminUserResponse {
  id: string;
  employee_id: string;
  email: string | null;
  name: string;
  role: Role;
  status: UserStatus;
  must_change_password: boolean;
}

// 직원 생성 요청
export interface CreateEmployeeResponse extends AdminUserResponse {
  temporary_password: string;
}

// 직원 생성·수정 공통 응답
export interface UpdateEmployeeStatusRequest {
  status: UserStatus;
}

// 직원 역할 변경 요청
export interface UpdateEmployeeRoleRequest {
  role: AssignableRole;
}

// 백엔드 오류 응답
export interface ApiErrorBody {
  detail: string;
  error_code?: string;
}

// 직원 일괄 생성 오류 응답
export interface BulkEmployeeErrorBody {
  detail: {
    message: string;
    errors: string[];
  };
}
