import { apiClient } from "@/lib/api-client";
import {
  RESTOCK_PROPOSAL_LIST_ENDPOINT,
  restockProposalApproveEndpoint,
  restockProposalDetailEndpoint,
  restockProposalRejectEndpoint,
} from "@/features/restock/constants/restockProposalApi";
import type {
  ApproveRestockProposalRequest,
  RejectRestockProposalRequest,
  RestockProposalDecisionResponse,
  RestockProposalDetail,
  RestockProposalListItem,
  RestockProposalStatus,
} from "@/features/restock/types/restockProposal";

// 코멘트가 비어 있으면 요청 body에서 comment 필드 자체를 생략
function buildDecisionBody(comment?: string): { comment?: string } {
  const trimmed = comment?.trim();
  return trimmed ? { comment: trimmed } : {};
}

// 발주 추천안 목록 조회 (상태 필터 옵션)
export async function listRestockProposals(
  status?: RestockProposalStatus
): Promise<RestockProposalListItem[]> {
  const res = await apiClient.get<RestockProposalListItem[]>(RESTOCK_PROPOSAL_LIST_ENDPOINT, {
    params: status ? { status } : undefined,
  });
  return res.data;
}

// 발주 추천안 상세 조회
export async function getRestockProposal(proposalId: string): Promise<RestockProposalDetail> {
  const res = await apiClient.get<RestockProposalDetail>(restockProposalDetailEndpoint(proposalId));
  return res.data;
}

// 발주 추천안 승인
export async function approveRestockProposal(
  proposalId: string,
  payload: ApproveRestockProposalRequest
): Promise<RestockProposalDecisionResponse> {
  const res = await apiClient.post<RestockProposalDecisionResponse>(
    restockProposalApproveEndpoint(proposalId),
    buildDecisionBody(payload.comment)
  );
  return res.data;
}

// 발주 추천안 반려
export async function rejectRestockProposal(
  proposalId: string,
  payload: RejectRestockProposalRequest
): Promise<RestockProposalDecisionResponse> {
  const res = await apiClient.post<RestockProposalDecisionResponse>(
    restockProposalRejectEndpoint(proposalId),
    buildDecisionBody(payload.comment)
  );
  return res.data;
}
