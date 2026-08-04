'use client';

import { Suspense, useState } from 'react';
import { CheckCircle2, Sparkles } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ErrorBoundary } from '@/components/error-boundary';
import { useRestockProposalQuery } from '@/features/restock/hooks/useRestockProposalQuery';
import {
  getProposalSourceBadgeStyle,
  getProposalSourceLabel,
  getRestockStatusBadgeStyle,
  getRestockStatusLabel,
  getRiskBadgeStyle,
  getRiskLabel,
} from '@/features/restock/utils/statusBadge';
import {
  RestockDecisionConfirmDialog,
  type RestockDecisionMode,
} from '@/features/restock/components/RestockDecisionConfirmDialog';
import AgentLogSection from '@/features/inspections/components/AgentLogSection';

interface RestockProposalDetailDialogProps {
  proposalId: string | null;
  onClose: () => void;
}

// 발주 추천안 상세 모달
export function RestockProposalDetailDialog({ proposalId, onClose }: RestockProposalDetailDialogProps) {
  const { data, isLoading, isError } = useRestockProposalQuery(proposalId);
  const [decisionMode, setDecisionMode] = useState<RestockDecisionMode | null>(null);

  return (
    <>
      <Dialog open={proposalId !== null} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
          {isLoading && <p className="text-sm text-gray-400">불러오는 중...</p>}
          {isError && <p className="text-sm text-red-600">추천안을 불러오지 못했습니다.</p>}
          {data && (
            <>
              <DialogHeader>
                <DialogTitle>{data.book.title}</DialogTitle>
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${getRestockStatusBadgeStyle(data.status)}`}
                  >
                    {getRestockStatusLabel(data.status)}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${getRiskBadgeStyle(data.riskLevel)}`}
                  >
                    위험도 {getRiskLabel(data.riskLevel)}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${getProposalSourceBadgeStyle(data.proposalSource)}`}
                  >
                    {getProposalSourceLabel(data.proposalSource)}
                  </span>
                </div>
              </DialogHeader>

              <div className="space-y-5">
                {/* 도서 및 발주 정보 */}
                <section className="space-y-1 text-sm text-gray-600">
                  <p>ISBN: {data.book.isbn}</p>
                  <p>
                    추천 발주 수량:{' '}
                    <span className="font-semibold text-gray-800">{data.recommendedOrderQuantity}권</span>
                  </p>
                  <p>
                    최근 판매량: {data.recentSalesQuantity}권 · 현재 재고: {data.currentStock}권
                  </p>
                  <p>
                    진행 중인 발주 수량: {data.pendingAutoPoQuantity}권 · 반려 수량: {data.rejectedQuantity}권
                  </p>
                  {data.rejectionReasonCode && <p>반려 사유 코드: {data.rejectionReasonCode}</p>}
                  <p>생성일시: {data.createdAt.slice(0, 10)}</p>
                </section>

                {/* Agent 추천 사유 */}
                <section className="space-y-3 border-t border-gray-100 pt-4">
                  <h4 className="flex items-center gap-1.5 text-sm font-semibold text-gray-800">
                    <Sparkles className="h-4 w-4 text-indigo-500" />
                    Agent 추천 사유
                  </h4>

                  {/* AI 판단 요약 */}
                  <div className="rounded-lg border border-indigo-100 bg-indigo-50 px-3 py-2.5 text-sm text-indigo-900">
                    {data.reasonSummary}
                  </div>

                  {/* 판단 근거: 계산식 줄은 별도 스타일로 강조 */}
                  <ul className="space-y-1.5">
                    {data.evidence.map((line) => {
                      const isCalculation = /^계산[:：]/.test(line);
                      return (
                        <li
                          key={line}
                          className={
                            isCalculation
                              ? 'rounded-md bg-gray-50 px-2.5 py-1.5 font-mono text-xs text-gray-700'
                              : 'flex items-start gap-1.5 text-xs text-gray-600'
                          }
                        >
                          {isCalculation ? (
                            line
                          ) : (
                            <>
                              <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
                              <span>{line}</span>
                            </>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </section>

                {/* 반려 대체 발주 건에만 존재하는 원본 검수의 Agent 로그 */}
                {data.returnJobId && (
                  <section className="space-y-2 border-t border-gray-100 pt-4">
                    <h4 className="text-sm font-semibold text-gray-800">관련 검수 Agent 로그</h4>
                    <ErrorBoundary
                      key={data.returnJobId}
                      fallback={<p className="text-sm text-red-500">Agent 로그를 불러오는데 실패했습니다.</p>}
                    >
                      <Suspense fallback={<p className="text-sm text-gray-400">Agent 로그 불러오는 중...</p>}>
                        <AgentLogSection inspectionId={data.returnJobId} />
                      </Suspense>
                    </ErrorBoundary>
                  </section>
                )}

                {/* 상태별 처리 영역 */}
                <section className="border-t border-gray-100 pt-4">
                  {data.status === 'PENDING' && (
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setDecisionMode('approve')}
                        className="rounded-lg border border-green-100 bg-green-50 py-2 px-2 text-xs font-semibold text-green-700 transition-colors hover:bg-green-100"
                      >
                        ✓ 승인
                      </button>
                      <button
                        type="button"
                        onClick={() => setDecisionMode('reject')}
                        className="rounded-lg border border-red-100 bg-red-50 py-2 px-2 text-xs font-semibold text-red-700 transition-colors hover:bg-red-100"
                      >
                        ✕ 반려
                      </button>
                    </div>
                  )}

                  {data.status === 'APPROVED' && (
                    <p className="text-sm text-gray-600">
                      승인 완료 · 생성된 발주 번호: {data.autoPoOrderId ?? '생성된 주문 없음'}
                    </p>
                  )}

                  {data.status === 'REJECTED' && (
                    <p className="text-sm text-gray-600">반려된 추천안입니다.</p>
                  )}

                  {data.status === 'NOT_REQUIRED' && (
                    <p className="text-sm text-gray-500">
                      진행 중인 발주 수량이 충분해 추가 발주가 필요하지 않습니다.
                    </p>
                  )}
                </section>

                {/* 검토 이력: 상태와 무관하게 검토가 이뤄졌으면(reviewedAt 존재) 공통으로 표시 */}
                {data.reviewedAt && (
                  <section className="space-y-1 border-t border-gray-100 pt-4 text-sm text-gray-600">
                    <h4 className="text-sm font-semibold text-gray-800">검토 이력</h4>
                    <p>검토자: {data.reviewerEmployeeId ?? '-'}</p>
                    <p>검토 시각: {data.reviewedAt.slice(0, 10)}</p>
                    {data.reviewComment && <p className="text-xs text-gray-500">코멘트: {data.reviewComment}</p>}
                  </section>
                )}
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
