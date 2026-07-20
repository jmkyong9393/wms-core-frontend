import type { MockAccount } from "@/mocks/data/accounts";
import type { JwtClaims } from "@/features/auth/types/authTypes";

const MOCK_TOKEN_TTL_SECONDS = 3600;

// 문자열을 JWT용 Base64URL 형식으로 변환
function base64url(input: string): string {
  const bytes = new TextEncoder().encode(input);
  let binary = "";
  bytes.forEach((b) => {
    binary += String.fromCharCode(b);
  });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

// 실제 백엔드 JWT 구조를 따르는 개발용 토큰 생성
// 서명 검증이 없는 Mock 전용 토큰
export function buildMockJwt(account: MockAccount): string {
  const header = base64url(JSON.stringify({ alg: "none", typ: "JWT" }));
  const claims: JwtClaims = {
    sub: account.id,
    role: account.role,
    tenant_id: "wms-local",
    type: "access",
    exp: Math.floor(Date.now() / 1000) + MOCK_TOKEN_TTL_SECONDS,
  };
  const payload = base64url(JSON.stringify(claims));
  return `${header}.${payload}.mock-signature`;
}
