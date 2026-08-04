import { isAxiosError } from 'axios';

// 상태 코드별 사용자 안내 문구
const STATUS_MESSAGE: Record<number, string> = {
  401: '로그인이 만료되었습니다. 다시 로그인해 주세요.',
  403: '권한이 없습니다.',
  404: '등록된 LPN 단품 재고를 찾을 수 없습니다. 바코드를 다시 확인해 주세요.',
  409: '판매 불가능한 상태이거나 정가·UBCI 점수가 확정되지 않아 재산정할 수 없습니다.',
};

const DEFAULT_MESSAGE = '요청 처리 중 오류가 발생했습니다. 다시 시도해 주세요.';

export function getLpnErrorMessage(error: unknown): string {
  if (isAxiosError(error) && error.response?.status) {
    return STATUS_MESSAGE[error.response.status] ?? DEFAULT_MESSAGE;
  }
  return DEFAULT_MESSAGE;
}
