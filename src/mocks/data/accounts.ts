import type { Role } from "@/features/auth/types/authTypes";

export interface MockAccount {
  employee_id: string;
  password: string;
  role: Role;
  name: string;
  must_change_password: boolean;
}

// 개발 환경 로그인 테스트용 계정 목록
// MSW 로그인 요청 시 입력한 사번과 비밀번호 확인에 사용
// role과 must_change_password는 화면 테스트를 위한 임시 값
export const MOCK_ACCOUNTS: MockAccount[] = [
  { employee_id: "M0001", password: "Master123!", role: "MASTER", name: "장문경", must_change_password: false },
  { employee_id: "A0001", password: "Admin123!", role: "ADMIN", name: "소한민", must_change_password: true },
  { employee_id: "W0001", password: "Worker123!", role: "WORKER", name: "박민우", must_change_password: true },
  { employee_id: "G0001", password: "Guest123!", role: "GUEST", name: "홍경표", must_change_password: false },
];
