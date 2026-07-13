import { atom } from "jotai";

// === 전역 상태 (Global State) ===

// 1. 테마 상태 (Dark/Light Mode)
export const themeAtom = atom<"light" | "dark">("light");

// 2. 사이드바 열림/닫힘 상태
export const isSidebarOpenAtom = atom<boolean>(true);

// 3. 사용자 정보 및 인증 상태 (Supabase users 테이블 매핑)
export interface UserInfo {
  id: string;
  employee_id: string;
  name: string;
  email: string | null;
  role: "MASTER" | "WORKER" | "GUEST" | "PENDING";
  status: string | null;
}

export const userAtom = atom<UserInfo | null>(null);

// 4. 인증 토큰 (localStorage 저장)
export const tokenAtom = atom<string | null>(null);

// 5. 로그인 여부 판별 (derived read-only atom)
export const isAuthenticatedAtom = atom((get) => !!get(tokenAtom));

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
// AI 판단이 애매한 경우 관리자가 확인할 목록
export type HitlItemStatus = 'AWAITING_REVIEW' | 'APPROVED' | 'REJECTED';

export interface HitlQueueItem {
  id: string;
  isbn?: string;
  title?: string;
  ubciScore?: number;
  status: HitlItemStatus;
}

// 관리자가 확인해야 하는 검수 목록
export const hitlQueueAtom = atom<HitlQueueItem[]>([]);

// 아직 검토하지 않은 항목 개수
// 대시보드에 검토 대기 건수를 보여줄 때 사용
export const pendingHitlCountAtom = atom((get) =>
  get(hitlQueueAtom).filter((item) => item.status === 'AWAITING_REVIEW').length
);

// 전달받은 id와 같은 항목의 상태만 변경
export const setHitlItemStatusAtom = atom(
  null,
  (get, set, update: { id: string; status: HitlItemStatus }) => {
    set(hitlQueueAtom, (prev) =>
      prev.map((item) => (item.id === update.id ? { ...item, status: update.status } : item))
    );
  }
);

// 승인 버튼을 눌렀을 때 APPROVED 상태로 변경
export const approveHitlItemAtom = atom(null, (get, set, id: string) => {
  set(setHitlItemStatusAtom, { id, status: 'APPROVED' });
});

// 반려 버튼을 눌렀을 때 REJECTED 상태로 변경
export const rejectHitlItemAtom = atom(null, (get, set, id: string) => {
  set(setHitlItemStatusAtom, { id, status: 'REJECTED' });
});