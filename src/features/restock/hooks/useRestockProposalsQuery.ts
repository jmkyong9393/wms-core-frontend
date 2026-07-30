'use client';

import { useQuery } from '@tanstack/react-query';
import { listRestockProposals } from '@/features/restock/api/restockProposalService';
import { restockProposalKeys } from '@/features/restock/constants/queryKeys';
import type { RestockProposalStatus } from '@/features/restock/types/restockProposal';

// 발주 추천안 목록 조회 (상태 필터 옵션)
export function useRestockProposalsQuery(status?: RestockProposalStatus) {
  return useQuery({
    queryKey: restockProposalKeys.list(status),
    queryFn: () => listRestockProposals(status),
  });
}
