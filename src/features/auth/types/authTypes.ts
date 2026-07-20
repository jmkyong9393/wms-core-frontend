export type Role = "MASTER" | "ADMIN" | "WORKER" | "GUEST";

export const VALID_ROLES: readonly Role[] = ["MASTER", "ADMIN", "WORKER", "GUEST"];

export function isRole(value: unknown): value is Role {
  return typeof value === "string" && (VALID_ROLES as readonly string[]).includes(value);
}

export type UserStatus = "ACTIVE" | "INACTIVE";


// 백엔드 Access Token의 JWT Payload
export interface JwtClaims {
  sub: string;
  role: string;
  tenant_id: string;
  type: string;
  exp: number;
}

// JWT에서 추출한 최소 세션 정보
export interface AuthSession {
  userId: string;
  role: Role;
  tenantId: string;
}

// /auth/me 기반 로그인 사용자 정보
export interface CurrentUser {
  employeeId: string;
  name: string;
  role: Role;
  mustChangePassword: boolean;
  tenantId?: string;
}
