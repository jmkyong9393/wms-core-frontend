import type { EmployeeListItem } from "@/features/employees/types/employee";
import { ROLE_LABEL, STATUS_LABEL } from "@/features/employees/utils/badges";
import { formatKstDate } from "@/lib/date";

// 직원 데이터를 엑셀 내보내기 형식으로 변환
export function toEmployeeExportRow(employee: EmployeeListItem): Record<string, string | number> {
  return {
    사번: employee.employee_id,
    이름: employee.name,
    이메일: employee.email ?? "-",
    역할: ROLE_LABEL[employee.role],
    상태: STATUS_LABEL[employee.status],
    초기비밀번호변경필요: employee.must_change_password ? "예" : "아니오",
    가입일: formatKstDate(employee.created_at),
  };
}
