import { http, HttpResponse } from "msw";
import { API_BASE_URL } from "@/lib/api-client";
import { LOGIN_ENDPOINT } from "@/features/auth/constants/authApi";
import type { LoginRequest, LoginResponse } from "@/features/auth/types/authApiTypes";
import { MOCK_ACCOUNTS } from "@/mocks/data/accounts";
import { buildMockJwt } from "@/mocks/mockJwt";

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
    };
    return HttpResponse.json(response);
  }),
];
