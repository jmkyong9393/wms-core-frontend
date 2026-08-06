'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  useApproveRestockProposalMutation,
  useRejectRestockProposalMutation,
} from '@/features/restock/hooks/useRestockProposalMutations';
import { getRestockErrorMessage } from '@/features/restock/utils/restockErrorMessage';
import type { RestockProposalStatus } from '@/features/restock/types/restockProposal';

export type RestockDecisionMode = 'approve' | 'reject';

interface RestockDecisionConfirmDialogProps {
  proposalId: string;
  mode: RestockDecisionMode;
  onClose: () => void;
}

const MODE_TITLE: Record<RestockDecisionMode, string> = {
  approve: '발주 추천안 승인',
  reject: '발주 추천안 반려',
};

const MODE_DESCRIPTION: Record<RestockDecisionMode, string> = {
  approve: '승인하면 발주가 생성되거나, 이미 충분한 발주가 진행 중이면 추가 발주 없이 처리됩니다.',
  reject: '반려하면 이 추천안에 대한 대체 발주를 진행하지 않습니다.',
};

// 승인/반려 응답으로 실제 나올 수 있는 상태 (PENDING은 결과로 나오지 않음)
type RestockDecisionResultStatus = Exclude<RestockProposalStatus, 'PENDING'>;

// 백엔드 message 원문에는 AUTO_PO 등 내부 용어가 섞여 있어 그대로 노출하지 않고, status만 보고 프론트에서 자체 문구를 정한다
const RESULT_MESSAGE: Record<RestockDecisionResultStatus, string> = {
  APPROVED: '승인되었습니다. 발주가 생성되었습니다.',
  NOT_REQUIRED: '이미 진행 중인 발주 수량으로 충분해 추가 발주 없이 처리되었습니다.',
  REJECTED: '반려되었습니다.',
};

// 발주 추천안 승인·반려 확인 모달
export function RestockDecisionConfirmDialog({ proposalId, mode, onClose }: RestockDecisionConfirmDialogProps) {
  const [comment, setComment] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [resultStatus, setResultStatus] = useState<RestockDecisionResultStatus | null>(null);
  // 선택한 처리 방식에 맞는 요청 사용
  const approveMutation = useApproveRestockProposalMutation();
  const rejectMutation = useRejectRestockProposalMutation();
  const mutation = mode === 'approve' ? approveMutation : rejectMutation;

  // 승인 또는 반려 요청
  const handleSubmit = async () => {
    setError(null);
    try {
      const result = await mutation.mutateAsync({ proposalId, payload: { comment } });
      // 승인 응답도 PENDING으로 돌아오지 않으므로 결과 상태로 좁혀서 저장
      setResultStatus(result.status as RestockDecisionResultStatus);
    } catch (err) {
      setError(getRestockErrorMessage(err));
    }
  };

  return (
    <Dialog
      open
      onOpenChange={(next) => {
        // 요청 중에는 모달 닫기 방지
        if (!next && !mutation.isPending) onClose();
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{MODE_TITLE[mode]}</DialogTitle>
          {!resultStatus && <DialogDescription>{MODE_DESCRIPTION[mode]}</DialogDescription>}
        </DialogHeader>

        {resultStatus ? (
          <>
            <p className="text-sm text-muted-foreground">{RESULT_MESSAGE[resultStatus]}</p>
            <DialogFooter>
              <Button type="button" onClick={onClose}>
                확인
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <div className="space-y-1.5">
              <Label htmlFor="restock-decision-comment">의견 (선택, 최대 1,000자)</Label>
              <textarea
                id="restock-decision-comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                maxLength={1000}
                rows={3}
                placeholder="추가로 남길 의견이 있다면 입력해 주세요."
                className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              />
            </div>

            {error && <p className="text-xs text-destructive">{error}</p>}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose} disabled={mutation.isPending}>
                취소
              </Button>
              <Button type="button" onClick={handleSubmit} disabled={mutation.isPending}>
                {mutation.isPending ? '처리 중...' : mode === 'approve' ? '승인' : '반려'}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
