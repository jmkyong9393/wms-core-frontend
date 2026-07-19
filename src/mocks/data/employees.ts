import type { EmployeeListItem } from "@/features/employees/types/employee";

// 개발 환경 직원 목록 화면 테스트용 시드 데이터
// EmployeeListItem에는 애초에 password 필드가 없으므로 이 배열에도 비밀번호를 저장하지 않는다
// 순수 인메모리(모듈 스코프 변수)이므로 새로고침/dev 서버 재시작 시 아래 시드로 초기화된다
// 실제 영속 저장은 백엔드 DB 연동 이후 지원 — 이 배열은 MSW 계층에서만 쓰이는 임시 수단
export const mockEmployees: EmployeeListItem[] = [
  { employee_id: "M0001", name: "장문경", role: "MASTER", status: "ACTIVE", created_at: "2025-01-06T09:00:00.000Z" },
  { employee_id: "A0001", name: "소한민", role: "ADMIN", status: "ACTIVE", created_at: "2025-01-10T09:00:00.000Z" },
  { employee_id: "A0002", name: "박준희", role: "ADMIN", status: "ACTIVE", created_at: "2025-02-03T09:00:00.000Z" },
  { employee_id: "W0001", name: "박민우", role: "WORKER", status: "ACTIVE", created_at: "2025-02-14T09:00:00.000Z" },
  { employee_id: "W0002", name: "서다은", role: "WORKER", status: "ACTIVE", created_at: "2025-02-20T09:00:00.000Z" },
  { employee_id: "W0003", name: "조동욱", role: "WORKER", status: "INACTIVE", created_at: "2025-03-02T09:00:00.000Z" },
  { employee_id: "W0004", name: "허인서", role: "WORKER", status: "ACTIVE", created_at: "2025-03-11T09:00:00.000Z" },
  { employee_id: "W0005", name: "김태연", role: "WORKER", status: "ACTIVE", created_at: "2025-03-18T09:00:00.000Z" },
  { employee_id: "W0006", name: "강백호", role: "WORKER", status: "ACTIVE", created_at: "2025-04-01T09:00:00.000Z" },
  { employee_id: "W0007", name: "문현빈", role: "WORKER", status: "INACTIVE", created_at: "2025-04-09T09:00:00.000Z" },
  { employee_id: "W0008", name: "심우준", role: "WORKER", status: "ACTIVE", created_at: "2025-04-22T09:00:00.000Z" },
  { employee_id: "W0009", name: "박준영", role: "WORKER", status: "ACTIVE", created_at: "2025-05-07T09:00:00.000Z" },
  { employee_id: "G0001", name: "홍경표", role: "GUEST", status: "ACTIVE", created_at: "2025-05-15T09:00:00.000Z" },
  { employee_id: "G0002", name: "정우주", role: "GUEST", status: "ACTIVE", created_at: "2025-05-28T09:00:00.000Z" },
  { employee_id: "G0003", name: "노시환", role: "GUEST", status: "INACTIVE", created_at: "2025-06-10T09:00:00.000Z" },
];
