import { isAxiosError } from 'axios';

// HTTP 상태별 기본 오류 문구
const STATUS_MESSAGE: Record<number, string> = {
  401: '로그인이 만료되었습니다. 다시 로그인해 주세요.',
  403: '권한이 없습니다.',
  404: '주문 또는 예약 항목을 찾을 수 없습니다. 지시서를 새로고침해 주세요.',
  409: '바코드가 일치하지 않거나 이미 처리된 항목입니다.',
};

const DEFAULT_MESSAGE = '요청 처리 중 오류가 발생했습니다. 다시 시도해 주세요.';

// 서버 오류 응답을 사용자 안내 문구로 변환
export function getPickingErrorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    const detail = error.response?.data?.detail;
    if (typeof detail === 'string') return detail;
    if (detail && typeof detail === 'object' && typeof detail.message === 'string') {
      return detail.message;
    }
    if (error.response?.status) {
      return STATUS_MESSAGE[error.response.status] ?? DEFAULT_MESSAGE;
    }
  }
  return DEFAULT_MESSAGE;
}
