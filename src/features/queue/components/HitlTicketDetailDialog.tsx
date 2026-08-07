'use client';
import { useEffect, useRef, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { HitlQueueItem } from '@/features/queue/api/hitlQueueService';
import HitlDecisionActions from './HitlDecisionActions';
import { AgentLogPanel } from './AgentConversationModal';
import { getHitlReasonLabel } from '@/features/queue/constants/hitlReasonCodes';
import { useQuery } from '@tanstack/react-query';
import { getInspectionDetail } from '@/features/inspections/api/inspectionHistoryService';
import { DefectBboxOverlay } from '@/features/inspections/components/DefectBboxOverlay';
import { DefectLayerToggle } from '@/features/inspections/components/DefectLayerToggle';
import { Button } from '@/components/ui/button';
import { Bot, Barcode, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';

interface HitlTicketDetailDialogProps {
  item: HitlQueueItem | null;
  onClose: () => void;
}

function formatDateTime(value: string | null) {
  if (!value) return '-';

  const hasTimezone = /(?:Z|[+-]\d{2}:\d{2})$/i.test(value);
  const date = new Date(hasTimezone ? value : `${value}Z`);

  return new Intl.DateTimeFormat('ko-KR', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Seoul',
  }).format(date);
}

export default function HitlTicketDetailDialog({
  item,
  onClose,
}: HitlTicketDetailDialogProps) {
  const isOpen = item !== null;

  const { data: detail, isLoading: isDetailLoading } = useQuery({
    queryKey: ['inspections', 'detail', item?.id],
    queryFn: () => getInspectionDetail(item!.id),
    enabled: item !== null,
  });

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showConfirmedDefects, setShowConfirmedDefects] = useState(true);
  const [showYoloCandidates, setShowYoloCandidates] = useState(false);
  const currentImgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    setCurrentImageIndex(0);
  }, [item?.id]);

  const images = detail?.originalImageUrls ?? [];
  const currentImageUrl = images[currentImageIndex];

  const isInReview =
    item?.status === 'HITL_REQUIRED' && item.reviewerId !== null;
  const displayedTime = isInReview
  ? item?.reviewStartedAt ?? item?.createdAt
  : item?.createdAt;
  const displayedTimeLabel = isInReview
    ? '검토 시작 시각'
    : '검수 요청 시각';
  const isRecheck = item?.status === 'RECHECK_REQUIRED';
  const isCompleted =
    item?.status === 'APPROVED' || item?.status === 'REJECTED';

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
        {item && (
          <>
            <DialogHeader>
              <DialogTitle>{item.bookTitle}</DialogTitle>
            </DialogHeader>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-border bg-muted/30 p-4 text-sm">
                <p className="flex items-center gap-1.5 text-muted-foreground">
                  <Barcode className="size-3.5" aria-hidden />
                  LPN 바코드
                </p>
                <p className="mt-1 break-all font-medium">
                  {item.lpnBarcode ?? '-'}
                </p>
              </div>

              <div className="rounded-xl border border-border bg-muted/30 p-4 text-sm">
                <p className="flex items-center gap-1.5 text-muted-foreground">
                  <MapPin className="size-3.5" aria-hidden />
                  보관 위치
                </p>
                <p className="mt-1 font-medium">
                  {item.locationBarcode ?? '-'}
                </p>
              </div>

              <div className="rounded-xl border border-border bg-muted/30 p-4 text-sm">
                <p className="text-muted-foreground">UBCI 점수 / 최종 등급</p>
                <p className="mt-1 font-medium">
                  {item.ubciScore ?? '-'}점 / {item.finalGrade ?? '-'}
                </p>
              </div>

              <div className="rounded-xl border border-border bg-muted/30 p-4 text-sm">
                <p className="text-muted-foreground">{displayedTimeLabel}</p>
                <p className="mt-1 font-medium">
                  {formatDateTime(displayedTime ?? null)}
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-muted/30 p-4 text-sm">
              <p className="text-muted-foreground">검토 사유</p>
              <p className="mt-1 font-medium">
                {item.reasonCodes.length > 0
                  ? item.reasonCodes.map(getHitlReasonLabel).join(', ')
                  : '등록된 사유 코드가 없습니다.'}
              </p>
            </div>
            
            <section className="rounded-xl border border-border p-4">
              <div className="mb-3 flex items-center justify-between gap-2">
                <p className="flex items-center gap-1.5 text-sm font-semibold">
                  <span className="size-1.5 rounded-full bg-ai" aria-hidden />
                  검수 사진 및 AI 결함 위치
                </p>

                <div className="flex items-center gap-3">
                  <DefectLayerToggle
                    showConfirmed={showConfirmedDefects}
                    showYolo={showYoloCandidates}
                    onToggleConfirmed={() => setShowConfirmedDefects((v) => !v)}
                    onToggleYolo={() => setShowYoloCandidates((v) => !v)}
                  />
                  {images.length > 0 && (
                    <span className="text-xs text-muted-foreground">
                      {currentImageIndex + 1} / {images.length}
                    </span>
                  )}
                </div>
              </div>

              {isDetailLoading ? (
                <p className="py-10 text-center text-sm text-muted-foreground">
                  검수 사진을 불러오는 중입니다.
                </p>
              ) : currentImageUrl ? (
                <>
                  <div className="relative overflow-hidden rounded-lg bg-muted">
                    <img
                      ref={currentImgRef}
                      src={currentImageUrl}
                      alt="검수 원본 사진"
                      className="block h-auto w-full"
                    />

                    <DefectBboxOverlay
                      confirmedDefects={detail?.confirmedDefects ?? []}
                      yoloCandidates={detail?.yoloCandidates ?? []}
                      currentImageIndex={currentImageIndex}
                      currentImageUrl={currentImageUrl}
                      imgRef={currentImgRef}
                      showConfirmed={showConfirmedDefects}
                      showYolo={showYoloCandidates}
                    />
                  </div>

                  {images.length > 1 && (
                    <div className="mt-3 flex justify-end gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setCurrentImageIndex((index) =>
                            index === 0 ? images.length - 1 : index - 1
                          )
                        }
                      >
                        <ChevronLeft className="size-3.5" aria-hidden />
                        이전 사진
                      </Button>

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setCurrentImageIndex((index) =>
                            index === images.length - 1 ? 0 : index + 1
                          )
                        }
                      >
                        다음 사진
                        <ChevronRight className="size-3.5" aria-hidden />
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <p className="py-10 text-center text-sm text-muted-foreground">
                  등록된 검수 원본 사진이 없습니다.
                </p>
              )}
            </section>

            <section className="rounded-xl border border-ai-border bg-ai-muted/40 p-4">
            <p className="mb-3 flex items-center gap-1.5 text-sm font-semibold">
              <Bot className="size-4 text-ai" aria-hidden />
              Agent 실행 로그
            </p>
            <div className="max-h-72 overflow-y-auto">
              <AgentLogPanel inspectionId={item.id} />
            </div>
          </section>

            {isInReview && (
              <section className="rounded-xl border border-primary/30 bg-primary/5 p-4">
                <p className="mb-3 text-sm font-semibold">
                  관리자 검토 결과 처리
                </p>
                <HitlDecisionActions
                  item={item}
                  onCompleted={onClose}
                />
              </section>
            )}

            {isRecheck && (
              <section className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm dark:border-amber-900 dark:bg-amber-950/30">
                재촬영 요청 상태입니다. 작업자가 해당 LPN을 스캔해 사진을 다시 등록하면
                재검수가 시작됩니다.
              </section>
            )}

            {isCompleted && (
              <section className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm dark:border-emerald-900 dark:bg-emerald-950/30">
                처리 완료된 검수 건입니다.
              </section>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}