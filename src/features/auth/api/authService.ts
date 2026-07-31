import { apiClient } from "@/lib/api-client";
import {
  CHANGE_PASSWORD_ENDPOINT,
  LOGIN_ENDPOINT,
  LOGOUT_ENDPOINT,
  ME_ENDPOINT,
  REFRESH_ENDPOINT,
} from "@/features/auth/constants/authApi";
import type {
  AuthMeResponse,
  ChangePasswordRequest,
  LoginRequest,
  LoginResponse,
  RefreshResponse,
} from "@/features/auth/types/authApiTypes";

// 로그인 요청을 보내고 받은 응답 데이터를 반환
// Refresh Token은 HttpOnly Cookie로 내려오므로 credentials 포함, 만료된 토큰을 헤더로 보내지 않도록 skipAuth
export async function login(payload: LoginRequest): Promise<LoginResponse> {
  const res = await apiClient.post<LoginResponse>(LOGIN_ENDPOINT, payload, {
    withCredentials: true,
    skipAuth: true,
  });
  return res.data;
}

// Refresh Token Cookie로 새 Access Token 발급 (요청 본문·Authorization 헤더 불필요)
export async function refreshAccessToken(): Promise<RefreshResponse> {
  const res = await apiClient.post<RefreshResponse>(REFRESH_ENDPOINT, undefined, {
    withCredentials: true,
    skipAuth: true,
  });
  return res.data;
}

// 로그아웃 - Refresh Token Cookie 무효화
export async function logout(): Promise<void> {
  await apiClient.post(LOGOUT_ENDPOINT, undefined, {
    withCredentials: true,
    skipAuth: true,
  });
}

// 현재 로그인된 사용자의 프로필 조회
export async function getMe(): Promise<AuthMeResponse> {
  const res = await apiClient.get<AuthMeResponse>(ME_ENDPOINT);
  return res.data;
}

// 비밀번호 변경 요청 (성공 시 204 No Content)
export async function changePassword(payload: ChangePasswordRequest): Promise<void> {
  await apiClient.patch(CHANGE_PASSWORD_ENDPOINT, payload);
}
