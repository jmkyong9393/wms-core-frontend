import type { RestockProposalStatus } from "@/features/restock/types/restockProposal";

// 발주 추천안 Query key factory
export const restockProposalKeys = {
  all: ["restockProposals"] as const,
  list: (status?: RestockProposalStatus) => [...restockProposalKeys.all, "list", status ?? "ALL"] as const,
  detail: (proposalId: string) => [...restockProposalKeys.all, "detail", proposalId] as const,
};
