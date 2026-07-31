import { isAxiosError } from 'axios';

// 상태 코드별 사용자 안내 문구
const STATUS_MESSAGE: Record<number, string> = {
  401: '로그인이 만료되었습니다. 다시 로그인해 주세요.',
  403: '권한이 없습니다.',
  404: '추천안을 찾을 수 없습니다. 목록을 새로고침해 주세요.',
  409: '이미 처리된 추천안입니다. 최신 상태를 반영했습니다.',
  422: '입력값을 확인해 주세요.',
};

const DEFAULT_MESSAGE = '요청 처리 중 오류가 발생했습니다. 다시 시도해 주세요.';

// 발주 추천안 API 오류를 사용자 안내 문구로 변환
export function getRestockErrorMessage(error: unknown): string {
  if (isAxiosError(error) && error.response?.status) {
    return STATUS_MESSAGE[error.response.status] ?? DEFAULT_MESSAGE;
  }
  return DEFAULT_MESSAGE;
}
