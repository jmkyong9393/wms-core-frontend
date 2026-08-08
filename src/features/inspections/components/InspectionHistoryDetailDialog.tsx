import { Suspense, useState, useEffect, useRef } from 'react';

import { QRCodeSVG } from 'qrcode.react';
import { ImageOff, ChevronLeft, ChevronRight, Loader2, Award, QrCode, Calendar, Info, ShieldCheck, Printer, ExternalLink, Bot } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { LabelPrintModal } from '@/features/inbound/components/LabelPrintModal';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ErrorBoundary } from '@/components/error-boundary';
import { formatKstDateTime } from '@/lib/date';
import AgentLogSection from '@/features/inspections/components/AgentLogSection';
import InspectionBadges from '@/features/inspections/components/InspectionBadges';
import { getStatusLabel } from '@/features/inspections/utils/statusBadge';
import { getInspectionDetail } from '@/features/inspections/api/inspectionHistoryService';
import { DefectBboxOverlay } from '@/features/inspections/components/DefectBboxOverlay';
import { DefectLayerToggle } from '@/features/inspections/components/DefectLayerToggle';
import type { InspectionHistoryRow } from '@/features/inspections/types/inspectionHistory';
import { getHitlReasonLabel } from '@/features/queue/constants/hitlReasonCodes';

interface InspectionHistoryDetailDialogProps {
  row: InspectionHistoryRow | null;
  onClose: () => void;
}

const PHOTO_LABELS = ['도서 앞면(대표)', '도서 뒷면', '도서 속지(오염/결함)'];

export function parseFinalReport(report: string | null): string {
  if (!report) return '아직 최종 검수 결과가 산출되지 않았습니다.';
  try {
    const parsed = JSON.parse(report);
    if (parsed && typeof parsed === 'object') {
      const parts: string[] = [];
      if (parsed.message) {
        parts.push(`📢 진단: ${parsed.message}`);
      }
      if (parsed.result) {
        parts.push(`📌 결과: ${parsed.result === 'INSPECTION_COMPLETED' ? '검수 완료' : parsed.result}`);
      }
      if (parsed.defects && Array.isArray(parsed.defects) && parsed.defects.length > 0) {
        const defectsStr = parsed.defects
          .map(
            (d: { type?: string; ratio?: number }) =>
              `${d.type ? getHitlReasonLabel(d.type) : '결함'} (감점: ${d.ratio ?? 0}%)`,
          )
          .join(', ');
        parts.push(`⚠️ 결함 내역: ${defectsStr}`);
      }
      if (parsed.ubci_score !== undefined) {
        parts.push(`💯 UBCI 계산 점수: ${parsed.ubci_score}점`);
      }
      if (parsed.rule_reference) {
        parts.push(`📜 적용 규정: ${parsed.rule_reference}`);
      }
      if (parsed.overall_confidence) {
        parts.push(`🎯 종합 신뢰도: ${(parsed.overall_confidence * 100).toFixed(0)}%`);
      }
      return parts.join('\n');
    }
  } catch (e) {
    return report;
  }
  return report;
}

export function InspectionHistoryDetailDialog({ row, onClose }: InspectionHistoryDetailDialogProps) {
  const [currentImgIdx, setCurrentImgIdx] = useState(0);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [showConfirmedDefects, setShowConfirmedDefects] = useState(true);
  const [showYoloCandidates, setShowYoloCandidates] = useState(false);
  const currentImgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    setCurrentImgIdx(0);
  }, [row]);

  const { data: detail, isLoading } = useQuery({
    queryKey: ['inspections', 'detail', row?.id],
    queryFn: () => getInspectionDetail(row!.id),
    enabled: row !== null,
  });

  const images = detail?.originalImageUrls || [];
  const hasImages = images.length > 0;

  const handlePrevImg = () => {
    if (!hasImages) return;
    setCurrentImgIdx((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImg = () => {
    if (!hasImages) return;
    setCurrentImgIdx((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <>
      <Dialog open={row !== null} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto overflow-x-hidden rounded-xl border border-border bg-card/95 p-6 shadow-xl backdrop-blur-md font-sans">
          {row && (
          <>
            {/* Header */}
            <DialogHeader className="border-b border-border pb-4">
              <div className="space-y-3">
                <div className="flex min-w-0 items-start gap-3">
                  {row.coverImageUrl ? (
                    <img
                      src={row.coverImageUrl}
                      alt={`${row.bookTitle} 표지`}
                      className="h-28 w-20 shrink-0 rounded-md border border-border bg-muted object-cover shadow-sm"
                    />
                  ) : (
                    <div className="flex h-28 w-20 shrink-0 items-center justify-center rounded-md border border-border bg-muted text-[10px] font-semibold text-muted-foreground">
                      BOOK
                    </div>
                  )}

                  <div className="min-w-0 flex-1 space-y-2">
                    <span className="inline-flex rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-bold tracking-wider text-primary">
                      검수 이력 상세
                    </span>

                    <DialogTitle className="line-clamp-2 text-xl font-extrabold leading-tight text-foreground">
                      {row.bookTitle}
                    </DialogTitle>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full border border-border bg-muted px-2.5 py-1 text-xs font-semibold text-foreground">
                    {getStatusLabel(row.status)}
                  </span>

                  {row.finalGrade ? (
                    <InspectionBadges
                      isFastTrack={row.isFastTrack}
                      finalGrade={row.finalGrade}
                    />
                  ) : (
                    <span className="rounded-full border border-border bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground">
                      판정 대기
                    </span>
                  )}
                </div>
              </div>
            </DialogHeader>

            {isLoading ? (
              <div className="flex h-64 flex-col items-center justify-center space-y-3">
                <Loader2 className="h-8 w-8 animate-spin text-ai" />
                <p className="text-xs text-muted-foreground font-medium">데이터를 분석 및 패치하는 중입니다...</p>
              </div>
            ) : (
              <div className="space-y-4 mt-4">
                <section className="grid grid-cols-1 gap-2 rounded-xl border border-border bg-muted/30 p-3 text-xs sm:grid-cols-2">
                  <div>
                    <p className="text-muted-foreground">검수 요청 일시</p>
                    <p className="mt-1 font-semibold text-foreground">
                      {formatKstDateTime(row.inspectedAt)}
                    </p>
                  </div>

                  <div>
                    <p className="text-muted-foreground">검수 참고 점수</p>
                    <p className="mt-1 font-semibold text-foreground">
                      {row.ubciScore === null ? '판정 보류' : `${row.ubciScore}점`}
                    </p>
                  </div>
                </section>

                <details className="rounded-xl border border-border bg-muted/30 p-4">
                  <summary className="cursor-pointer text-sm font-bold text-foreground">
                    라벨 및 LPN 정보
                  </summary>

                  <div className="mt-4">
                {/* 2. LPN 바코드 카드 (정사각형 QR코드 & 겹침 방지 세로 레이아웃) */}
                <div className="bg-muted/30 border border-border rounded-xl p-4 flex flex-col items-center justify-center text-center space-y-3 w-full min-w-0">
                  <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider flex items-center gap-1.5 justify-center">
                    <QrCode className="w-3.5 h-3.5 text-emerald-500" /> LPN 바코드
                  </span>

                  {detail?.lpnBarcode ? (
                    <div className="flex flex-col items-center space-y-2.5 w-full">
                      {/* 스캔을 고려한 고대비 화이트 박스 QR (정사각형 고정) */}
                      <div className="p-1.5 bg-white rounded-xl shadow-sm border border-border flex items-center justify-center w-[75px] h-[75px] flex-shrink-0">
                        <QRCodeSVG
                          value={detail.labelScanUrl || (typeof window !== "undefined" ? `${window.location.origin}/scan/${detail.lpnBarcode}` : "")}
                          size={62}
                          level="M"
                          includeMargin={false}
                          className="aspect-square flex-shrink-0 select-none"
                        />
                      </div>
                      {/* LPN 텍스트 */}
                      <span className="text-[11px] font-mono font-black text-primary bg-card px-3 py-1 rounded-full border border-primary/20 shadow-sm tracking-wider break-all max-w-full block">
                        {detail.lpnBarcode}
                      </span>
                      {/* QR 스캔 URL 이동 링크 */}
                      {(detail.labelScanUrl || detail.lpnBarcode) && (
                        <div className="flex flex-col items-center gap-2 w-full mt-1.5">
                          {row.status === 'PENDING' ? (
                            <span className="text-[10px] text-muted-foreground mt-2">검수 완료 후 표시됩니다.</span>
                          ) : (
                            <a
                              href={detail.labelScanUrl || (typeof window !== "undefined" ? `${window.location.origin}/scan/${detail.lpnBarcode}` : "#")}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[9px] text-primary/80 hover:text-primary hover:underline transition-all tracking-tight break-all max-w-full select-all text-center"
                            >
                              <ExternalLink className="size-2.5 shrink-0" aria-hidden />
                              QR 스캔 URL 접속하기
                            </a>
                          )}
                          <button
                            onClick={() => setIsPrintModalOpen(true)}
                            disabled={row.status === 'PENDING'}
                            className={`flex items-center justify-center gap-1.5 rounded-xl border px-4 py-2 text-xs font-bold w-full transition-colors duration-200 ${
                              row.status === 'PENDING'
                                ? 'bg-muted text-muted-foreground border-border cursor-not-allowed'
                                : 'border-primary/20 bg-primary/10 text-primary hover:bg-primary/15 cursor-pointer'
                            }`}
                          >
                            <Printer className="w-3.5 h-3.5" />
                            {row.status === 'PENDING' ? '검수 중 인쇄 불가' : '라벨 출력'}
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <span className="text-[10px] text-muted-foreground">LPN 바코드가 발급되지 않았습니다.</span>
                  )}
                </div>
                  </div>
                </details>


                {/* 촬영 사진 3장 캐러셀 갤러리 */}
                <section className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-xs font-extrabold text-muted-foreground uppercase tracking-wider">도서 촬영 원본 분석 사진</h4>
                    <DefectLayerToggle
                      showConfirmed={showConfirmedDefects}
                      showYolo={showYoloCandidates}
                      onToggleConfirmed={() => setShowConfirmedDefects((v) => !v)}
                      onToggleYolo={() => setShowYoloCandidates((v) => !v)}
                    />
                  </div>
                  {hasImages ? (
                    <div className="relative group overflow-hidden rounded-xl border border-border bg-zinc-950 flex items-center justify-center min-h-[300px] max-h-[340px] shadow-inner">
                      <img
                        ref={currentImgRef}
                        src={images[currentImgIdx]}
                        alt={`도서 촬영 사진 ${currentImgIdx + 1}`}
                        className="max-h-[340px] object-contain select-none transition-all duration-300"
                        loading="lazy"
                      />
                      <DefectBboxOverlay
                        confirmedDefects={detail?.confirmedDefects ?? []}
                        yoloCandidates={detail?.yoloCandidates ?? []}
                        currentImageIndex={currentImgIdx}
                        currentImageUrl={images[currentImgIdx]}
                        imgRef={currentImgRef}
                        showConfirmed={showConfirmedDefects}
                        showYolo={showYoloCandidates}
                      />

                      {images.length > 1 && (
                        <>
                          <button
                            onClick={handlePrevImg}
                            className="absolute left-3 p-2 rounded-full bg-black/60 hover:bg-primary text-white transition-all active:scale-90 cursor-pointer shadow-md"
                            title="이전 사진"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </button>
                          <button
                            onClick={handleNextImg}
                            className="absolute right-3 p-2 rounded-full bg-black/60 hover:bg-primary text-white transition-all active:scale-90 cursor-pointer shadow-md"
                            title="다음 사진"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </>
                      )}

                      <div className="absolute bottom-3 left-3 bg-black/85 px-2.5 py-1 rounded-lg text-white text-[10px] font-bold flex items-center gap-1.5 shadow-md">
                        <span className="bg-primary px-1 rounded-[3px] text-[8px] uppercase tracking-wider font-extrabold">
                          {PHOTO_LABELS[currentImgIdx] || `슬라이드 ${currentImgIdx + 1}`}
                        </span>
                        {currentImgIdx + 1} / {images.length}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border p-8 text-center text-muted-foreground">
                      <ImageOff className="mb-2 h-7 w-7 text-muted-foreground/50" />
                      <span className="text-xs">촬영된 도서 사진이 존재하지 않습니다.</span>
                    </div>
                  )}
                </section>

                {/* AI 판정 결과 */}
                <section className="space-y-2">
                  <h4 className="flex items-center gap-1.5 text-xs font-extrabold text-muted-foreground uppercase tracking-wider">
                    <span className="size-1.5 rounded-full bg-ai" aria-hidden />
                    AI 분석 종합 진단 리포트
                  </h4>
                  <div className="text-xs leading-relaxed text-foreground bg-ai-muted/40 p-3.5 rounded-xl border border-ai-border shadow-inner whitespace-pre-line">
                    {parseFinalReport(row.finalReport)}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {row.reasonCodes && row.reasonCodes.length > 0 ? (
                      row.reasonCodes.map((code) => (
                        <span
                          key={code}
                          className="rounded-full bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 px-2.5 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-400"
                        >
                          {getHitlReasonLabel(code)}
                        </span>
                      ))
                    ) : (
                      <span className="text-[10px] text-muted-foreground">분석 예외 사유 없음</span>
                    )}
                  </div>
                </section>

                {/* Agent 로그 */}
                <details className="border-t border-border pt-4">
                  <summary className="cursor-pointer flex items-center gap-1.5 text-sm font-bold text-foreground">
                    <Bot className="size-4 text-ai" aria-hidden />
                    AI 검수 처리 기록
                  </summary>

                  <section className="mt-4 space-y-2">
                  <ErrorBoundary
                    key={row.id}
                    fallback={<p className="text-xs text-red-500 dark:text-red-400">Agent 로그를 불러오는데 실패했습니다.</p>}
                  >
                    <Suspense fallback={<p className="text-xs text-muted-foreground">Agent 로그 분석 불러오는 중...</p>}>
                      <AgentLogSection inspectionId={row.id} />
                    </Suspense>
                  </ErrorBoundary>
                </section>
                </details>

              </div>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
    {detail && isPrintModalOpen && (
      <LabelPrintModal
        book={{
          id: detail.id,
          title: detail.book.title,
          publisher: '정보 없음',
          isbn: detail.book.isbn || '미상',
          lpn: detail.lpnBarcode || '미발급',
          labelScanUrl: detail.labelScanUrl || undefined,
          type: 'RETURNS',
          status: detail.status === 'APPROVED' ? 'APPROVED' : detail.status === 'REJECTED' ? 'REJECTED' : 'PROCESSING',
          timestamp: detail.inspectedAt,
        }}
        workerId="ADMIN"
        onClose={() => setIsPrintModalOpen(false)}
      />
    )}
    </>
  );
}