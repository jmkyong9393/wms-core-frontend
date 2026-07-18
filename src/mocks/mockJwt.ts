import type { MockAccount } from "@/mocks/data/accounts";

function base64url(input: string): string {
  // 문자열을 JWT에서 사용하는 Base64URL 형식으로 변환
  // 한글이 포함된 문자열 처리를 위한 UTF-8 인코딩 적용
  const bytes = new TextEncoder().encode(input);
  let binary = "";
  bytes.forEach((b) => {
    binary += String.fromCharCode(b);
  });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/**
 * 개발 환경 로그인 테스트용 Mock JWT 생성
 * 실제 서명과 보안 검증이 없는 테스트용 토큰
 * 프론트의 사용자 역할 및 화면 이동 확인에만 사용
 * role, employee_id, must_change_password는 임시 테스트 값
 */
export function buildMockJwt(account: MockAccount): string {
  const header = base64url(JSON.stringify({ alg: "none", typ: "JWT" }));
  const payload = base64url(
    JSON.stringify({
      sub: account.employee_id,
      employee_id: account.employee_id,
      name: account.name,
      role: account.role,
      must_change_password: account.must_change_password,
      tenant_id: "wms-local",
      iat: Math.floor(Date.now() / 1000),
    })
  );
  return `${header}.${payload}.mock-signature`;
}
