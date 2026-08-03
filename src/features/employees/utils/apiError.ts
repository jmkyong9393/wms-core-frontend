import { isAxiosError } from "axios";
import type { ApiErrorBody, BulkEmployeeErrorBody } from "@/features/employees/types/employee";

const DEFAULT_ERROR_MESSAGE = "요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.";

// 백엔드가 준 detail 메시지를 우선 사용하고 없을 때만 일반 오류 문구로 대체
export function getApiErrorMessage(err: unknown): string {
  if (isAxiosError<ApiErrorBody>(err)) {
    return err.response?.data?.detail ?? DEFAULT_ERROR_MESSAGE;
  }
  return DEFAULT_ERROR_MESSAGE;
}

// 직원 일괄 생성 오류를 { message, errors[] } 형태로 변환
export async function parseBulkEmployeeError(
  err: unknown
): Promise<{ message: string; errors: string[] }> {
  const fallback = { message: DEFAULT_ERROR_MESSAGE, errors: [] as string[] };

  if (!isAxiosError(err)) return fallback;

  const data = err.response?.data;
  let body: BulkEmployeeErrorBody | null = null;

  if (data instanceof Blob) {
    try {
      body = JSON.parse(await data.text()) as BulkEmployeeErrorBody;
    } catch {
      return fallback;
    }
  } else if (data && typeof data === "object") {
    body = data as BulkEmployeeErrorBody;
  }

  if (
    !body?.detail ||
    typeof body.detail.message !== "string" ||
    !Array.isArray(body.detail.errors)
  ) {
    return fallback;
  }

  return body.detail;
}
