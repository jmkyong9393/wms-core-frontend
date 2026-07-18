// 로그인 API 요청 데이터
export interface LoginRequest {
  employee_id: string;
  password: string;
}

// 로그인 API 응답 데이터
export interface LoginResponse {
  access_token: string;
  token_type: string;
}
