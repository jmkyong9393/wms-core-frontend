import { atom } from "jotai";

// HITL(Human-in-the-Loop) 관리자 수동 승인 대기 큐
// AI 판단이 애매한 경우 관리자가 확인할 목록
export type HitlItemStatus = 'AWAITING_REVIEW' | 'IN_PROGRESS' | 'APPROVED' | 'REJECTED';

// 로그인 연동 전까지 사용하는 고정 mock 심사자 이름
export const MOCK_REVIEWER_NAME = '관리자A';

// return_jobs.agent_logs (JSONB)에 대응하는 에이전트 대화 한 줄
export interface AgentLogEntry {
  agent: 'Vision' | 'Policy' | 'Critic' | 'Report';
  message: string;
}

export interface HitlQueueItem {
  id: string;
  isbn?: string;
  title?: string;
  ubciScore?: number;
  status: HitlItemStatus;
  agentLogs?: AgentLogEntry[]; // return_jobs.agent_logs 대응
  finalReport?: string; // return_jobs.final_report 대응
  reviewer?: string; // 심사 중인 관리자 (동시 중복 심사 방지용 선점 표시)
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

// 대기 티켓을 검토중으로 드래그했을 때 IN_PROGRESS로 전환하고 심사자를 선점 등록
export const startReviewHitlItemAtom = atom(null, (get, set, id: string) => {
  set(hitlQueueAtom, (prev) =>
    prev.map((item) =>
      item.id === id ? { ...item, status: 'IN_PROGRESS', reviewer: MOCK_REVIEWER_NAME } : item
    )
  );
});

// 승인 버튼을 눌렀을 때 APPROVED 상태로 변경
export const approveHitlItemAtom = atom(null, (get, set, id: string) => {
  set(setHitlItemStatusAtom, { id, status: 'APPROVED' });
});

// 반려 버튼을 눌렀을 때 REJECTED 상태로 변경
export const rejectHitlItemAtom = atom(null, (get, set, id: string) => {
  set(setHitlItemStatusAtom, { id, status: 'REJECTED' });
});

// 재검토 버튼: 검토중 티켓을 다시 대기 상태로 되돌리고 리뷰어 선점 해제
export const requestReReviewHitlItemAtom = atom(null, (get, set, id: string) => {
  set(hitlQueueAtom, (prev) =>
    prev.map((item) =>
      item.id === id ? { ...item, status: 'AWAITING_REVIEW', reviewer: undefined } : item
    )
  );
});
