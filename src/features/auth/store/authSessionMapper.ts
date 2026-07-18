import { decodeJwt } from "@/features/auth/utils/jwt";
import { isRole, type CurrentUser } from "@/features/auth/types/authTypes";
import type { LoginResponse } from "@/features/auth/types/authApiTypes";

// 토큰을 사용자 정보로 변환
// JWT 안의 사번, 이름, 역할, 비밀번호 변경 여부 확인
// 필요한 정보가 없거나 알 수 없는 역할인 경우 null 반환
export function mapTokenToSession(token: string): CurrentUser | null {
  const claims = decodeJwt<{
    employee_id?: string;
    name?: string;
    role?: string;
    must_change_password?: boolean;
    tenant_id?: string;
  }>(token);

  if (!claims || !claims.employee_id || !isRole(claims.role)) return null;

  return {
    employeeId: claims.employee_id,
    name: claims.name ?? claims.employee_id,
    role: claims.role,
    mustChangePassword: claims.must_change_password === true,
    tenantId: claims.tenant_id,
  };
}

// 로그인 응답의 토큰을 사용자 정보로 변환
export function mapLoginResponseToSession(
  response: LoginResponse
): CurrentUser | null {
  return mapTokenToSession(response.access_token);
}
