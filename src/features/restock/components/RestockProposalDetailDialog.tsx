'use client';

import { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useRestockProposalQuery } from '@/features/restock/hooks/useRestockProposalQuery';
import { formatKstDateTime } from '@/lib/date';
import {
  getRestockStatusBadgeStyle,
  getRestockStatusLabel,
} from '@/features/restock/utils/statusBadge';
import {
  RestockDecisionConfirmDialog,
  type RestockDecisionMode,
} from '@/features/restock/components/RestockDecisionConfirmDialog';

interface RestockProposalDetailDialogProps {
  proposalId: string | null;
  onClose: () => void;
}

function getProposalTypeLabel(proposalSource: string) {
  return proposalSource === 'SAFETY_STOCK'
    ? '재고 부족'
    : '반품 대체 검토';
}

function getRejectionReasonLabel(reasonCode?: string | null) {
  const labels: Record<string, string> = {
    DMG_EXT_WET: '외관 습기·오염',
    DMG_EXT_CRUSH: '외관 눌림·파손',
    DMG_EXT_TEAR: '외관 찢김',
    DMG_INT_MISSING: '구성품 또는 내지 누락',
  };

  return labels[reasonCode ?? ''] ?? '상품 상태 이슈';
}

export function RestockProposalDetailDialog({
  proposalId,
  onClose,
}: RestockProposalDetailDialogProps) {
  const { data, isLoading, isError } = useRestockProposalQuery(proposalId);
  const [decisionMode, setDecisionMode] =
    useState<RestockDecisionMode | null>(null);

  const isNotRequired =
    data?.status === 'NOT_REQUIRED' ||
    data?.recommendedOrderQuantity === 0;

  const canDecide =
    data?.status === 'PENDING' && !isNotRequired;

  return (
    <>
      <Dialog
        open={proposalId !== null}
        onOpenChange={(open) => !open && onClose()}
      >
        <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
          {isLoading && (
            <p className="text-sm text-muted-foreground">
              발주 추천안을 불러오는 중입니다.
            </p>
          )}

          {isError && (
            <p className="text-sm text-red-600 dark:text-red-400">
              발주 추천안을 불러오지 못했습니다.
            </p>
          )}

          {data && (
            <>
              <DialogHeader>
                <div className="flex items-start gap-3 pr-8">
                  {data.book.coverImageUrl ? (
                    <img
                      src={data.book.coverImageUrl}
                      alt={`${data.book.title} 표지`}
                      className="h-28 w-20 shrink-0 rounded-md border border-border bg-muted object-cover shadow-sm"
                    />
                  ) : (
                    <div className="flex h-28 w-20 shrink-0 items-center justify-center rounded-md border border-border bg-muted text-xs font-semibold text-muted-foreground">
                      BOOK
                    </div>
                  )}

                  <div className="min-w-0">
                    <DialogTitle className="line-clamp-2">
                      {data.book.title}
                    </DialogTitle>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {data.book.publisher ?? '출판사 정보 없음'} · ISBN {data.book.isbn}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${getRestockStatusBadgeStyle(data.status)}`}
                  >
                    {isNotRequired
                      ? '추가 발주 불필요'
                      : getRestockStatusLabel(data.status)}
                  </span>

                  <span className="rounded-full border border-ai-border bg-ai-muted px-2 py-0.5 text-xs font-semibold text-ai">
                    {getProposalTypeLabel(data.proposalSource)}
                  </span>
                </div>
              </DialogHeader>

              <div className="space-y-5">
                <section className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border bg-muted/30 p-3">
                    <p className="text-xs text-muted-foreground">
                      판매 가능한 재고
                    </p>
                    <p className="mt-1 text-xl font-bold">
                      {data.currentStock}권
                    </p>
                  </div>

                  <div className="rounded-xl border bg-muted/30 p-3">
                    <p className="text-xs text-muted-foreground">
                      최근 판매량
                    </p>
                    <p className="mt-1 text-xl font-bold">
                      {data.recentSalesQuantity}권
                    </p>
                  </div>

                  <div className="rounded-xl border bg-muted/30 p-3">
                    <p className="text-xs text-muted-foreground">
                      입고 예정 수량
                    </p>
                    <p className="mt-1 text-xl font-bold">
                      {data.pendingAutoPoQuantity}권
                    </p>
                  </div>

                  <div className="rounded-xl border bg-primary/10 p-3">
                    <p className="text-xs text-muted-foreground">
                      권장 발주 수량
                    </p>
                    <p className="mt-1 text-xl font-bold text-primary">
                      {data.recommendedOrderQuantity}권
                    </p>
                  </div>
                </section>

                {data.proposalSource === 'RETURN_REJECTION' &&
                  data.rejectedQuantity > 0 && (
                    <section className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm dark:border-amber-950/60 dark:bg-amber-950/20">
                      <p className="font-semibold text-amber-900 dark:text-amber-300">
                        반품 발생 정보
                      </p>
                      <p className="mt-1 text-amber-800 dark:text-amber-400">
                        판매 불가 반품 {data.rejectedQuantity}권이 발생했습니다.
                        {' '}사유: {getRejectionReasonLabel(data.rejectionReasonCode)}
                      </p>
                    </section>
                  )}

                <section className="space-y-3 border-t border-border pt-4">
                  <h4 className="text-sm font-semibold text-foreground">
                    발주 검토 결과
                  </h4>

                  <div className="rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm leading-relaxed text-indigo-900 dark:border-indigo-950/50 dark:bg-indigo-950/20 dark:text-indigo-300">
                    {data.reasonSummary}
                  </div>

                  {data.evidence.length > 0 && (
                    <ul className="space-y-2">
                      {data.evidence.map((line) => (
                        <li
                          key={line}
                          className="flex items-start gap-2 text-sm text-muted-foreground"
                        >
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                          <span>{line.replace(/^계산[:\s]*/, '')}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>

                <section className="border-t border-border pt-4">
                  {canDecide && (
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setDecisionMode('approve')}
                        className="rounded-lg border border-green-100 bg-green-50 px-2 py-2.5 text-xs font-semibold text-green-700 transition-colors hover:bg-green-100 dark:border-green-950/50 dark:bg-green-950/20 dark:text-green-400"
                      >
                        발주 승인
                      </button>

                      <button
                        type="button"
                        onClick={() => setDecisionMode('reject')}
                        className="rounded-lg border border-gray-200 bg-white px-2 py-2.5 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
                      >
                        발주 미진행
                      </button>
                    </div>
                  )}

                  {isNotRequired && (
                    <div className="rounded-xl bg-muted/50 p-4">
                      <p className="text-sm font-semibold text-foreground">
                        현재 추가 발주가 필요하지 않습니다.
                      </p>
                      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                        현재 재고와 입고 예정 수량을 고려했을 때 판매 수요를 충족할 수 있습니다.
                      </p>
                    </div>
                  )}

                  {data.status === 'APPROVED' && (
                    <div className="rounded-xl bg-emerald-50 p-4 dark:bg-emerald-950/20">
                      <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">
                        발주 승인이 완료되었습니다.
                      </p>
                    </div>
                  )}

                  {data.status === 'REJECTED' && (
                    <div className="rounded-xl bg-muted/50 p-4">
                      <p className="text-sm font-semibold text-foreground">
                        이번 발주는 진행하지 않기로 처리되었습니다.
                      </p>
                    </div>
                  )}
                </section>

                <section className="border-t border-border pt-4 text-xs text-muted-foreground">
                  <p>ISBN: {data.book.isbn}</p>
                  <p className="mt-1">
                    추천안 생성: {formatKstDateTime(data.createdAt)}
                  </p>
                </section>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {decisionMode && proposalId && (
        <RestockDecisionConfirmDialog
          proposalId={proposalId}
          mode={decisionMode}
          onClose={() => setDecisionMode(null)}
        />
      )}
    </>
  );
}