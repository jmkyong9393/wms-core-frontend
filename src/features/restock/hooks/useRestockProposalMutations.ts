'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import {
  approveRestockProposal,
  rejectRestockProposal,
} from '@/features/restock/api/restockProposalService';
import { restockProposalKeys } from '@/features/restock/constants/queryKeys';
import { inventoryKeys } from '@/features/inventory/constants/queryKeys';
import type {
  ApproveRestockProposalRequest,
  RejectRestockProposalRequest,
} from '@/features/restock/types/restockProposal';

// 409(이미 처리됨)/404(대상 없음) 응답을 받으면 화면이 최신 상태를 반영하도록 재조회
function shouldRefetchOnError(error: unknown): boolean {
  return isAxiosError(error) && (error.response?.status === 409 || error.response?.status === 404);
}

// 발주 추천안 승인 요청
export function useApproveRestockProposalMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      proposalId,
      payload,
    }: {
      proposalId: string;
      payload: ApproveRestockProposalRequest;
    }) => approveRestockProposal(proposalId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: restockProposalKeys.all });
      // 승인 시 실제 재고가 증가하므로 통합 재고 조회도 최신 상태로 갱신
      queryClient.invalidateQueries({ queryKey: inventoryKeys.all });
    },
    onError: (error) => {
      if (shouldRefetchOnError(error)) {
        queryClient.invalidateQueries({ queryKey: restockProposalKeys.all });
      }
    },
  });
}

// 발주 추천안 반려 요청
export function useRejectRestockProposalMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      proposalId,
      payload,
    }: {
      proposalId: string;
      payload: RejectRestockProposalRequest;
    }) => rejectRestockProposal(proposalId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: restockProposalKeys.all });
    },
    onError: (error) => {
      if (shouldRefetchOnError(error)) {
        queryClient.invalidateQueries({ queryKey: restockProposalKeys.all });
      }
    },
  });
}
