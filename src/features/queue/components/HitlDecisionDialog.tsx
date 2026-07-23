'use client';

import { useState } from 'react';
import { type HitlQueueItem } from '@/features/queue/store/queueAtoms';
import type { HitlDecisionPayload } from '@/features/queue/api/hitlQueueService';
import {
  HITL_REASON_CODES_BY_ACTION,
  DOWNGRADE_GRADE_OPTIONS,
  type HitlDecisionAction,
} from '@/features/queue/constants/hitlReasonCodes';
import { getGradeLabel } from '@/features/inspections/utils/gradeBadge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

export type HitlDecisionMode = 'approve' | 'reject' | 'recheck';

interface HitlDecisionDialogProps {
  item: HitlQueueItem;
  mode: HitlDecisionMode;
  onClose: () => void;
  onSubmit: (payload: HitlDecisionPayload) => Promise<void>;
}

const MODE_TITLE: Record<HitlDecisionMode, string> = {
  approve: '승인 판정',
  reject: '반려 판정',
  recheck: '재검토 요청',
};

// 모달 유형별 초기 판정값
function getInitialAction(mode: HitlDecisionMode): HitlDecisionAction {
  if (mode === 'approve') return 'APPROVE_NORMAL';
  if (mode === 'reject') return 'REJECT_RETURN';
  return 'RE_CHECK';
}

// 관리자 HITL 판정 입력창
export default function HitlDecisionDialog({ item, mode, onClose, onSubmit }: HitlDecisionDialogProps) {
  const [action, setAction] = useState<HitlDecisionAction>(() => getInitialAction(mode));
  const [reasonCode, setReasonCode] = useState('');
  const [targetGrade, setTargetGrade] = useState<'EXCELLENT' | 'NORMAL' | ''>('');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isDowngrade = action === 'APPROVE_DOWNGRADE';
  const reasonOptions = HITL_REASON_CODES_BY_ACTION[action];
  // "기타" 사유 코드는 구체적인 근거를 담지 못하므로 의견 입력을 필수로 요구
  const isOtherReason = reasonCode.endsWith('_OTHER');
  // 필수값 입력 여부 확인
  const canSubmit =
    reasonCode !== '' &&
    (!isDowngrade || targetGrade !== '') &&
    (!isOtherReason || comment.trim() !== '') &&
    !isSubmitting;

  // 판정 유형 변경 시 기존 선택값 초기화
  const handleActionChange = (nextAction: HitlDecisionAction) => {
    setAction(nextAction);
    setReasonCode('');
    setTargetGrade('');
  };

  // 관리자 판정 제출
  const handleSubmit = async () => {
    if (!canSubmit) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await onSubmit({
        action,
        reviewerReasonCode: reasonCode,
        ...(isDowngrade ? { targetGrade: targetGrade as 'EXCELLENT' | 'NORMAL' } : {}),
        ...(comment.trim() ? { comment: comment.trim() } : {}),
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : '요청 처리 중 오류가 발생했습니다. 다시 시도해 주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open
      onOpenChange={(next) => {
        if (!next && !isSubmitting) onClose();
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{MODE_TITLE[mode]}</DialogTitle>
          <DialogDescription>{item.title ?? item.id} · 사유 코드를 선택해 주세요.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {mode === 'approve' && (
            <div className="space-y-1.5">
              <Label>승인 유형</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant={action === 'APPROVE_NORMAL' ? 'default' : 'outline'}
                  onClick={() => handleActionChange('APPROVE_NORMAL')}
                >
                  정상 승인
                </Button>
                <Button
                  type="button"
                  variant={action === 'APPROVE_DOWNGRADE' ? 'default' : 'outline'}
                  onClick={() => handleActionChange('APPROVE_DOWNGRADE')}
                >
                  하향 승인
                </Button>
              </div>
            </div>
          )}

          {mode === 'reject' && (
            <div className="space-y-1.5">
              <Label>반려 유형</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant={action === 'REJECT_RETURN' ? 'default' : 'outline'}
                  onClick={() => handleActionChange('REJECT_RETURN')}
                >
                  반송
                </Button>
                <Button
                  type="button"
                  variant={action === 'REJECT_DISCARD' ? 'default' : 'outline'}
                  onClick={() => handleActionChange('REJECT_DISCARD')}
                >
                  폐기
                </Button>
              </div>
            </div>
          )}

          {isDowngrade && (
            <div className="space-y-1.5">
              <Label htmlFor="hitl-target-grade">조정 등급</Label>
              <Select
                value={targetGrade}
                onValueChange={(value) => setTargetGrade((value as 'EXCELLENT' | 'NORMAL' | null) ?? '')}
              >
                <SelectTrigger id="hitl-target-grade" className="w-full">
                  <SelectValue placeholder="등급 선택">
                    {(value: string | null) => (value ? getGradeLabel(value) : '등급 선택')}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {DOWNGRADE_GRADE_OPTIONS.map((grade) => (
                    <SelectItem key={grade} value={grade}>
                      {getGradeLabel(grade)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="hitl-reason-code">사유 코드</Label>
            <Select value={reasonCode} onValueChange={(value) => setReasonCode(value ?? '')}>
              <SelectTrigger id="hitl-reason-code" className="w-full">
                <SelectValue placeholder="사유 코드 선택">
                  {(value: string | null) => reasonOptions.find((r) => r.code === value)?.label ?? '사유 코드 선택'}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {reasonOptions.map((reason) => (
                  <SelectItem key={reason.code} value={reason.code}>
                    {reason.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="hitl-comment">{isOtherReason ? '의견 (필수)' : '의견 (선택)'}</Label>
            <textarea
              id="hitl-comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="추가로 남길 의견이 있다면 입력해 주세요."
              rows={3}
              className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            />
          </div>

          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            취소
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={!canSubmit}>
            {isSubmitting ? '제출 중...' : '제출'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
