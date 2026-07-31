'use client';

import { useQuery } from '@tanstack/react-query';
import { getRestockProposal } from '@/features/restock/api/restockProposalService';
import { restockProposalKeys } from '@/features/restock/constants/queryKeys';

// 발주 추천안 하나에 대한 상세 조회
export function useRestockProposalQuery(proposalId: string | null) {
  return useQuery({
    queryKey: restockProposalKeys.detail(proposalId ?? ''),
    queryFn: () => getRestockProposal(proposalId as string),
    enabled: !!proposalId,
  });
}
