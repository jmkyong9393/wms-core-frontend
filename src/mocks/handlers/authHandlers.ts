import { http, HttpResponse } from "msw";
import { API_BASE_URL } from "@/lib/api-client";
import { CHANGE_PASSWORD_ENDPOINT, LOGIN_ENDPOINT, ME_ENDPOINT } from "@/features/auth/constants/authApi";
import type {
  AuthMeResponse,
  ChangePasswordRequest,
  LoginRequest,
  LoginResponse,
} from "@/features/auth/types/authApiTypes";
import type { JwtClaims } from "@/features/auth/types/authTypes";
import { decodeJwt } from "@/features/auth/utils/jwt";
import { MOCK_ACCOUNTS } from "@/mocks/data/accounts";
import { buildMockJwt } from "@/mocks/mockJwt";

const MOCK_EXPIRES_IN_SECONDS = 3600;

function findAccountByRequest(request: Request) {
  const authorization = request.headers.get("authorization");
  const token = authorization?.replace(/^Bearer\s+/i, "");
  if (!token) return null;

  const claims = decodeJwt<JwtClaims>(token);
  if (!claims?.sub) return null;

  return MOCK_ACCOUNTS.find((account) => account.id === claims.sub) ?? null;
}

export const authHandlers = [
  http.post(`${API_BASE_URL}${LOGIN_ENDPOINT}`, async ({ request }) => {
    const body = (await request.json()) as LoginRequest;
    const account = MOCK_ACCOUNTS.find(
      (a) => a.employee_id === body.employee_id && a.password === body.password
    );

    if (!account) {
      return HttpResponse.json({ detail: "사번 또는 비밀번호가 올바르지 않습니다." }, { status: 401 });
    }

    const response: LoginResponse = {
      access_token: buildMockJwt(account),
      token_type: "bearer",
      expires_in: MOCK_EXPIRES_IN_SECONDS,
      must_change_password: account.must_change_password,
    };
    return HttpResponse.json(response);
  }),

  http.get(`${API_BASE_URL}${ME_ENDPOINT}`, ({ request }) => {
    const account = findAccountByRequest(request);
    if (!account) {
      return HttpResponse.json({ detail: "인증 정보가 유효하지 않습니다." }, { status: 401 });
    }

    const response: AuthMeResponse = {
      id: account.id,
      employee_id: account.employee_id,
      email: account.email,
      name: account.name,
      role: account.role,
      status: account.status,
      must_change_password: account.must_change_password,
    };
    return HttpResponse.json(response);
  }),

  http.patch(`${API_BASE_URL}${CHANGE_PASSWORD_ENDPOINT}`, async ({ request }) => {
    const account = findAccountByRequest(request);
    if (!account) {
      return HttpResponse.json({ detail: "인증 정보가 유효하지 않습니다." }, { status: 401 });
    }

    const body = (await request.json()) as ChangePasswordRequest;
    if (body.current_password !== account.password) {
      return HttpResponse.json({ detail: "현재 비밀번호가 일치하지 않습니다." }, { status: 401 });
    }

    account.password = body.new_password;
    account.must_change_password = false;
    return new HttpResponse(null, { status: 204 });
  }),
];
