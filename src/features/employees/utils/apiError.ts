import { isAxiosError } from "axios";
import type { ApiErrorBody } from "@/features/employees/types/employee";

const DEFAULT_ERROR_MESSAGE = "요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.";

// 백엔드가 준 detail 메시지를 우선 사용하고 없을 때만 일반 오류 문구로 대체
export function getApiErrorMessage(err: unknown): string {
  if (isAxiosError<ApiErrorBody>(err)) {
    return err.response?.data?.detail ?? DEFAULT_ERROR_MESSAGE;
  }
  return DEFAULT_ERROR_MESSAGE;
}
