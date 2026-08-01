import axios, { isAxiosError } from "axios";
import { AUTH_TOKEN_STORAGE_KEY } from "@/features/auth/store/authAtoms";
import { getOrRefreshAccessToken } from "@/features/auth/api/tokenRefresh";

declare module "axios" {
  export interface AxiosRequestConfig {
    // true면 요청 인터셉터가 Authorization 헤더를 붙이지 않음 (로그인/Refresh/로그아웃 전용)
    skipAuth?: boolean;
    // 401 재시도를 한 번만 수행하기 위한 내부 플래그
    _retry?: boolean;
  }
}

// Refresh Token 만료가 확인되어 로그인 세션이 끊어졌음을 알리는 이벤트
// axios 인터셉터(비-React 모듈)에서 React 트리의 기존 로그아웃 흐름(logoutAtom)으로 연결하는 용도
export const AUTH_SESSION_EXPIRED_EVENT = "wms:auth-session-expired";

function isUnauthorized(err: unknown): boolean {
  return isAxiosError(err) && err.response?.status === 401;
}

// 백엔드 API 기본 주소
// 환경변수 미설정 시 로컬 백엔드 주소 사용 
// Axios 요청과 MSW Mock에서 동일한 주소 공유
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  // API 응답 대기 시간 10초
  timeout: 10000,
});

// API 요청 전 실행되는 공통 처리
apiClient.interceptors.request.use(
  (config) => {
    const token =
      !config.skipAuth && typeof window !== "undefined"
        ? localStorage.getItem(AUTH_TOKEN_STORAGE_KEY)
        : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// API 응답 후 실행되는 공통 처리
// 401 발생 시 Access Token을 한 번 갱신해 원 요청을 재시도
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    if (
      error.response?.status !== 401 ||
      !original ||
      original.skipAuth ||
      original._retry
    ) {
      return Promise.reject(error);
    }

    original._retry = true;

    try {
      const newToken = await getOrRefreshAccessToken();
      if (typeof window !== "undefined") {
        localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, newToken);
      }
      original.headers = original.headers ?? {};
      original.headers.Authorization = `Bearer ${newToken}`;
      return apiClient(original);
    } catch (refreshError) {
      // Refresh Token 만료/무효로 확인된 경우에만 토큰을 정리하고 로그아웃 흐름에 연결
      // 네트워크 오류·5xx 등 일시적 실패는 로그인 세션을 유지
      if (isUnauthorized(refreshError) && typeof window !== "undefined") {
        localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
        window.dispatchEvent(new Event(AUTH_SESSION_EXPIRED_EVENT));
      }
      return Promise.reject(refreshError);
    }
  }
);
