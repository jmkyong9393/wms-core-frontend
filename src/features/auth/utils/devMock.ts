/**
 * 백엔드 인증 API가 없는 동안 로그인 결과와 계정 상태를
 * 쿼리 파라미터로 테스트하기 위한 개발 환경 전용 유틸이다.
 *
 * 실제 인증 연동 후에는 로그인 API 응답으로 교체
 */
export type DevMockOutcome = "success" | "error";

// ?mock=success 또는 ?mock=error 값을 읽어 로그인 결과를 반환
export function resolveDevMockOutcome(): DevMockOutcome | null {
  if (process.env.NODE_ENV === "production") return null;
  if (typeof window === "undefined") return null;

  const params = new URLSearchParams(window.location.search);
  const mock = params.get("mock");
  return mock === "error" ? "error" : mock === "success" ? "success" : null;
}

export type DevMockRole = "MASTER" | "ADMIN" | "WORKER" | "GUEST";
const VALID_ROLES: readonly DevMockRole[] = ["MASTER", "ADMIN", "WORKER", "GUEST"];

// ?role= 값을 읽어 개발용 사용자 역할을 반환
export function resolveDevMockRole(): DevMockRole | null {
  if (process.env.NODE_ENV === "production") return null;
  if (typeof window === "undefined") return null;

  const params = new URLSearchParams(window.location.search);
  const role = params.get("role");
  return (VALID_ROLES as readonly string[]).includes(role ?? "")
    ? (role as DevMockRole)
    : null;
}

// 개발용 역할별 이동 경로. GUEST 화면은 아직 확정되지 않아 제외
export const DEV_MOCK_ROLE_ROUTE: Partial<Record<DevMockRole, string>> = {
  MASTER: "/admin",
  ADMIN: "/admin",
  WORKER: "/inbound",
};

 /*
 * must_change_password 
 * - true : 초기 비밀번호를 아직 변경하지 않은 상태 → 목적지 화면에서 변경 권장 팝업 표시
 * - false: 비밀번호 변경 완료 상태 → 팝업 미표시
 * 초기 비밀번호를 사용 중인 사용자에게 비밀번호 변경을 권장
 * 비밀번호 변경을 미뤄도 현재 화면은 계속 이용 가능
 */
export function resolveMustChangePassword(): boolean {
  if (process.env.NODE_ENV === "production") return false;
  if (typeof window === "undefined") return false;

  const params = new URLSearchParams(window.location.search);
  return params.get("must_change_password") === "true";
}
