import axios from "axios";

// 환경변수에서 백엔드 API 주소를 가져옵니다. 기본값은 로컬호스트.
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  // 타임아웃 10초 설정 (비전 검수 등 오래 걸리는 작업은 별도 처리 요망)
  timeout: 10000, 
});

// 인터셉터 (요청 전)
apiClient.interceptors.request.use(
  (config) => {
    // SSR 환경 오류 방지를 위한 클라이언트 환경 체크
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("wms_token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 인터셉터 (응답 후)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // 401 인증 만료 에러 발생 시 세션 만료 처리 및 로그인 화면 강제 유도
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("wms_token");
        localStorage.removeItem("wms_user");
        // 강제로 새로고침하여 레이아웃 인증 가드 발동 유도
        window.location.reload();
      }
    }
    return Promise.reject(error);
  }
);
