import type { Role, UserStatus } from "@/features/auth/types/authTypes";

export interface MockAccount {
  id: string;
  employee_id: string;
  password: string;
  role: Role;
  name: string;
  email: string | null;
  status: UserStatus;
  must_change_password: boolean;
}

// MSW 인증 테스트용 계정
// 비밀번호 변경 테스트 시 password와 must_change_password 값이 갱신될 수 있음
export const MOCK_ACCOUNTS: MockAccount[] = [
  {
    id: "9c1f7e2a-1111-4a11-8a11-000000000001",
    employee_id: "M0001",
    password: "Master123!",
    role: "MASTER",
    name: "장문경",
    email: "m0001@wms-local.test",
    status: "ACTIVE",
    must_change_password: false,
  },
  {
    id: "9c1f7e2a-2222-4a11-8a11-000000000002",
    employee_id: "A0001",
    password: "Admin123!",
    role: "ADMIN",
    name: "소한민",
    email: "a0001@wms-local.test",
    status: "ACTIVE",
    must_change_password: true,
  },
  {
    id: "9c1f7e2a-3333-4a11-8a11-000000000003",
    employee_id: "W0001",
    password: "Worker123!",
    role: "WORKER",
    name: "박민우",
    email: "w0001@wms-local.test",
    status: "ACTIVE",
    must_change_password: true,
  },
  {
    id: "9c1f7e2a-4444-4a11-8a11-000000000004",
    employee_id: "G0001",
    password: "Guest123!",
    role: "GUEST",
    name: "홍경표",
    email: null,
    status: "ACTIVE",
    must_change_password: false,
  },
];
