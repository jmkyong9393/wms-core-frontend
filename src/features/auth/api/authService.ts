import { apiClient } from "@/lib/api-client";
import { LOGIN_ENDPOINT } from "@/features/auth/constants/authApi";
import type { LoginRequest, LoginResponse } from "@/features/auth/types/authApiTypes";

// 로그인 요청을 보내고 받은 응답 데이터를 반환
export async function login(payload: LoginRequest): Promise<LoginResponse> {
  const res = await apiClient.post<LoginResponse>(LOGIN_ENDPOINT, payload);
  return res.data;
}
