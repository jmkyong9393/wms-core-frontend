export type Role = "MASTER" | "ADMIN" | "WORKER" | "GUEST";

export const VALID_ROLES: readonly Role[] = ["MASTER", "ADMIN", "WORKER", "GUEST"];

export function isRole(value: unknown): value is Role {
  return typeof value === "string" && (VALID_ROLES as readonly string[]).includes(value);
}

export type UserStatus = "ACTIVE" | "INACTIVE";

// JWT 토큰 내부 데이터 형식
// tenant_id 외 사용자 관련 필드는 현재 Mock 테스트용 임시 값
export interface JwtClaims {
  sub?: string;
  employee_id?: string;
  name?: string;
  role?: string;
  must_change_password?: boolean;
  tenant_id?: string;
  iat?: number;
  exp?: number;
}

// 프론트에서 사용하는 로그인 사용자 정보
export interface CurrentUser {
  employeeId: string;
  name: string;
  role: Role;
  mustChangePassword: boolean;
  tenantId?: string;
}
