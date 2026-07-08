import { atom } from "jotai";

// === 전역 상태 (Global State) ===

// 1. 테마 상태 (Dark/Light Mode)
export const themeAtom = atom<"light" | "dark">("light");

// 2. 사이드바 열림/닫힘 상태
export const isSidebarOpenAtom = atom<boolean>(true);

// 3. 사용자 정보 (간단한 예시)
export const userAtom = atom<{ name: string; role: string } | null>(null);

// === 도메인 상태 (Domain State - WMS 전용) ===

// 1. 현재 선택된 검수 도서 ID
export const selectedBookIdAtom = atom<string | null>(null);

// 2. AI가 찾아낸 BBox 좌표 리스트 상태 (실시간 조작용)
export interface BBox {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
}
export const bookDefectBoxesAtom = atom<BBox[]>([]);

// 3. 낙관적 UI를 위한 백그라운드 업로드 큐 (Queue)
export interface UploadTask {
  id: string; // 로컬 고유 ID (uuid 등)
  blob: Blob;
  previewUrl: string;
  status: 'PENDING' | 'UPLOADING' | 'COMPLETED' | 'FAILED';
  isbn?: string;
}
export const uploadQueueAtom = atom<UploadTask[]>([]);

// 4. HITL(Human-in-the-Loop) 관리자 수동 승인 대기 큐
// uploadQueueAtom(촬영/업로드 진행 상태)과는 별개로,
// AI 검수 신뢰도가 낮아 관리자 승인이 필요한 반품 작업(return_job) 단위를 관리한다.
export type HitlItemStatus = 'AWAITING_REVIEW' | 'APPROVED' | 'REJECTED';

export interface HitlQueueItem {
  id: string;
  isbn?: string;
  title?: string;
  ubciScore?: number;
  confidence?: number;
  status: HitlItemStatus;
}

export const hitlQueueAtom = atom<HitlQueueItem[]>([]);

// 승인 대기 중인 항목 수 (Header 등에서 배지 표시용)
export const pendingHitlCountAtom = atom((get) =>
  get(hitlQueueAtom).filter((item) => item.status === 'AWAITING_REVIEW').length
);

// id의 status만 갱신하는 단순 setter.
// rollback은 별도 구조 없이, 호출부가 이전 status로 이 atom을 다시 호출하는 것으로 처리한다.
export const setHitlItemStatusAtom = atom(
  null,
  (get, set, update: { id: string; status: HitlItemStatus }) => {
    set(hitlQueueAtom, (prev) =>
      prev.map((item) => (item.id === update.id ? { ...item, status: update.status } : item))
    );
  }
);

export const approveHitlItemAtom = atom(null, (get, set, id: string) => {
  set(setHitlItemStatusAtom, { id, status: 'APPROVED' });
});

export const rejectHitlItemAtom = atom(null, (get, set, id: string) => {
  set(setHitlItemStatusAtom, { id, status: 'REJECTED' });
});
