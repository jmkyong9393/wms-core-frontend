import type { EmployeeListItem } from "@/features/employees/types/employee";

// 직원 관리 화면 테스트용 데이터
// 로그인 계정과 UUID를 맞춰 본인 계정 판별 가능
// 새로고침이나 개발 서버 재시작 시 초기 데이터로 복원
// 실제 백엔드 연동 전까지 MSW에서만 사용
export const mockEmployees: EmployeeListItem[] = [
  { id: "9c1f7e2a-1111-4a11-8a11-000000000001", employee_id: "M0001", email: "m0001@wms-local.test", name: "장문경", role: "MASTER", status: "ACTIVE", must_change_password: false, created_at: "2025-01-06T09:00:00.000Z" },
  { id: "9c1f7e2a-2222-4a11-8a11-000000000002", employee_id: "A0001", email: "a0001@wms-local.test", name: "소한민", role: "ADMIN", status: "ACTIVE", must_change_password: true, created_at: "2025-01-10T09:00:00.000Z" },
  { id: "00000000-0000-4000-8000-000000000003", employee_id: "A0002", email: null, name: "박준희", role: "ADMIN", status: "ACTIVE", must_change_password: false, created_at: "2025-02-03T09:00:00.000Z" },
  { id: "9c1f7e2a-3333-4a11-8a11-000000000003", employee_id: "W0001", email: "w0001@wms-local.test", name: "박민우", role: "WORKER", status: "ACTIVE", must_change_password: true, created_at: "2025-02-14T09:00:00.000Z" },
  { id: "00000000-0000-4000-8000-000000000005", employee_id: "W0002", email: null, name: "서다은", role: "WORKER", status: "ACTIVE", must_change_password: false, created_at: "2025-02-20T09:00:00.000Z" },
  { id: "00000000-0000-4000-8000-000000000006", employee_id: "W0003", email: null, name: "조동욱", role: "WORKER", status: "INACTIVE", must_change_password: false, created_at: "2025-03-02T09:00:00.000Z" },
  { id: "00000000-0000-4000-8000-000000000007", employee_id: "W0004", email: "worker04@example.com", name: "허인서", role: "WORKER", status: "ACTIVE", must_change_password: false, created_at: "2025-03-11T09:00:00.000Z" },
  { id: "00000000-0000-4000-8000-000000000008", employee_id: "W0005", email: null, name: "김태연", role: "WORKER", status: "ACTIVE", must_change_password: false, created_at: "2025-03-18T09:00:00.000Z" },
  { id: "00000000-0000-4000-8000-000000000009", employee_id: "W0006", email: null, name: "강백호", role: "WORKER", status: "ACTIVE", must_change_password: true, created_at: "2025-04-01T09:00:00.000Z" },
  { id: "00000000-0000-4000-8000-000000000010", employee_id: "W0007", email: null, name: "문현빈", role: "WORKER", status: "INACTIVE", must_change_password: false, created_at: "2025-04-09T09:00:00.000Z" },
  { id: "00000000-0000-4000-8000-000000000011", employee_id: "W0008", email: "worker08@example.com", name: "심우준", role: "WORKER", status: "ACTIVE", must_change_password: false, created_at: "2025-04-22T09:00:00.000Z" },
  { id: "00000000-0000-4000-8000-000000000012", employee_id: "W0009", email: null, name: "박준영", role: "WORKER", status: "ACTIVE", must_change_password: false, created_at: "2025-05-07T09:00:00.000Z" },
  { id: "9c1f7e2a-4444-4a11-8a11-000000000004", employee_id: "G0001", email: null, name: "홍경표", role: "GUEST", status: "ACTIVE", must_change_password: false, created_at: "2025-05-15T09:00:00.000Z" },
  { id: "00000000-0000-4000-8000-000000000014", employee_id: "G0002", email: null, name: "정우주", role: "GUEST", status: "ACTIVE", must_change_password: false, created_at: "2025-05-28T09:00:00.000Z" },
  { id: "00000000-0000-4000-8000-000000000015", employee_id: "G0003", email: null, name: "노시환", role: "GUEST", status: "INACTIVE", must_change_password: false, created_at: "2025-06-10T09:00:00.000Z" },
];
