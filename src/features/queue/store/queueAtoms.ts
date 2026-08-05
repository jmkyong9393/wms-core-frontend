import { atom } from "jotai";
import type { HitlDecisionAction } from "@/features/queue/constants/hitlReasonCodes";
import { currentUserAtom } from "@/features/auth/store/authAtoms";
import { maskName } from "@/features/auth/utils/maskName";

// HITL 티켓 상태
export type HitlItemStatus =
  | 'AWAITING_REVIEW'
  | 'IN_PROGRESS'
  | 'PROCESSING'
  | 'RECHECK_REQUIRED'
  | 'APPROVED'
  | 'REJECTED';

// id는 검수 이력 API 응답의 return_job_id와 동일 — 상세/Agent 로그/판정 제출에 그대로 사용
export interface HitlQueueItem {
  id: string;
  isbn?: string;
  title?: string;
  ubciScore?: number;
  status: HitlItemStatus;
  reviewer?: string;
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

// 대기 티켓을 검토중으로 드래그했을 때 IN_PROGRESS로 전환하고 담당자를 로그인한 관리자로 선점 등록
// AuthGuard가 로그인 완료(currentUser 확정) 후에만 이 액션에 닿는 화면을 렌더링하므로 currentUser는 항상 존재
export const startReviewHitlItemAtom = atom(null, (get, set, id: string) => {
  const reviewer = maskName(get(currentUserAtom)!.name);
  set(hitlQueueAtom, (prev) =>
    prev.map((item) => (item.id === id ? { ...item, status: 'IN_PROGRESS', reviewer } : item))
  );
});

// 관리자 판정 결과를 먼저 화면에 반영
export const applyHitlDecisionAtom = atom(
  null,
  (get, set, update: { id: string; action: HitlDecisionAction }) => {
    const status: HitlItemStatus = update.action === 'RE_CHECK' ? 'RECHECK_REQUIRED' : 'PROCESSING';
    set(setHitlItemStatusAtom, { id: update.id, status });
  }
);

// 검수 이력 API(status=HITL_REQUIRED)에서 새로 받아온 목록
export interface HitlQueueServerRow {
  id: string;
  title?: string;
  ubciScore?: number;
}

// 목록 재조회 결과를 큐에 반영 — 이미 로컬에서 진행 중이거나(IN_PROGRESS/PROCESSING/RECHECK_REQUIRED)
// 완료된(APPROVED/REJECTED) 항목은 서버 응답에 여전히 HITL_REQUIRED로 남아있어도(비동기 처리 지연)
// 혹은 응답에서 빠져도(실제로 상태 전이 완료) 로컬 상태를 그대로 유지한다.
// AWAITING_REVIEW였는데 이번 응답에 없는 항목만 제거 대상(다른 관리자 처리, 페이지 이동 등).
export const mergeHitlQueueFromServerAtom = atom(null, (get, set, rows: HitlQueueServerRow[]) => {
  const prev = get(hitlQueueAtom);
  const prevById = new Map(prev.map((item) => [item.id, item]));
  const incomingIds = new Set(rows.map((row) => row.id));

  const merged = rows.map((row): HitlQueueItem => {
    const existing = prevById.get(row.id);
    if (existing && existing.status !== 'AWAITING_REVIEW') return existing;
    return { id: row.id, title: row.title, ubciScore: row.ubciScore, status: 'AWAITING_REVIEW' };
  });

  const keptLocalOnly = prev.filter(
    (item) =>
      !incomingIds.has(item.id) &&
      (item.status === 'IN_PROGRESS' ||
        item.status === 'PROCESSING' ||
        item.status === 'RECHECK_REQUIRED' ||
        item.status === 'APPROVED' ||
        item.status === 'REJECTED')
  );

  set(hitlQueueAtom, [...merged, ...keptLocalOnly]);
});

// API 처리 실패 시 티켓을 버튼 클릭 전 상태로 복구
// 상태와 담당 관리자 정보를 함께 되돌림
export const restoreHitlItemAtom = atom(null, (get, set, previousItem: HitlQueueItem) => {
  set(hitlQueueAtom, (prev) =>
    prev.map((item) => (item.id === previousItem.id ? previousItem : item))
  );
});

// HITL 처리 실패 시 보여줄 오류 메시지
// 카드가 화면에서 사라져도 메시지가 유지되도록 전역에서 관리
export const hitlActionErrorAtom = atom<string | null>(null);
