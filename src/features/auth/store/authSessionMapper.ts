import { decodeJwt } from "@/features/auth/utils/jwt";
import { isRole, type AuthSession, type CurrentUser, type JwtClaims } from "@/features/auth/types/authTypes";
import type { AuthMeResponse } from "@/features/auth/types/authApiTypes";

// JWT에서 세션 정보 추출. 서명 검증은 백엔드에서 처리
export function mapTokenToSession(token: string): AuthSession | null {
  const claims = decodeJwt<JwtClaims>(token);

  if (!claims || !claims.sub || !claims.tenant_id) return null;
  if (!isRole(claims.role)) return null;
  if (claims.type !== "access") return null;
  if (!claims.exp || claims.exp * 1000 <= Date.now()) return null;

  return {
    userId: claims.sub,
    role: claims.role,
    tenantId: claims.tenant_id,
  };
}

// 사용자 프로필과 세션 정보를 합쳐 현재 사용자 생성
export function mapMeResponseToCurrentUser(
  me: AuthMeResponse,
  session: AuthSession
): CurrentUser {
  return {
    employeeId: me.employee_id,
    name: me.name,
    role: me.role,
    mustChangePassword: me.must_change_password,
    tenantId: session.tenantId,
  };
}
