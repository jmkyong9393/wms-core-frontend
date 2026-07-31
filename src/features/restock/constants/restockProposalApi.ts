// Restock 발주 추천안 API 주소
export const RESTOCK_PROPOSAL_LIST_ENDPOINT = "/api/v1/admin/restock/proposals";
export const restockProposalDetailEndpoint = (proposalId: string) =>
  `/api/v1/admin/restock/proposals/${proposalId}`;
export const restockProposalApproveEndpoint = (proposalId: string) =>
  `/api/v1/admin/restock/proposals/${proposalId}/approve`;
export const restockProposalRejectEndpoint = (proposalId: string) =>
  `/api/v1/admin/restock/proposals/${proposalId}/reject`;
