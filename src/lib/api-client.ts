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
    // TODO: 로컬 스토리지나 쿠키에서 토큰을 가져와 헤더에 주입
    // const token = localStorage.getItem("token");
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => Promise.reject(error)
);

// 인터셉터 (응답 후)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // TODO: 전역 에러 핸들링 (예: 401 인증 만료 시 로그인 페이지 리다이렉트)
    return Promise.reject(error);
  }
);
