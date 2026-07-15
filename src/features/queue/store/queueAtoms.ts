import { atom } from "jotai";

// HITL(Human-in-the-Loop) 관리자 수동 승인 대기 큐
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
