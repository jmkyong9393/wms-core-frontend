// HITL 큐 액션 서비스
// 현재는 API 명세가 확정되지 않아 mock으로 동작
// 추후 각 함수 내부만 실제 apiClient 요청으로 교체
const MOCK_DELAY_MS = 400;
const mockDelay = () => new Promise<void>((resolve) => setTimeout(resolve, MOCK_DELAY_MS));

export type HitlQueueActionType = 'startReview' | 'approve' | 'reject' | 'reReview';

// TODO(backend): 실제 API 명세 확정 후 승인 요청으로 교체
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function approveHitlItem(id: string): Promise<void> {
  await mockDelay();
}

// TODO: 실제 API 명세 확정 후 반려 요청으로 교체
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function rejectHitlItem(id: string): Promise<void> {
  await mockDelay();
}

// TODO: 실제 API 명세 확정 후 검토 시작 요청으로 교체
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function startReviewHitlItem(id: string): Promise<void> {
  await mockDelay();
}

// TODO: 재검토에 대응하는 상태와 전이 규칙을 백엔드와 확인
// 명세 확정 전까지 특정 리소스에 임의로 연결하지 않고 mock 동작만 유지
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function requestReReviewHitlItem(id: string): Promise<void> {
  await mockDelay();
}
