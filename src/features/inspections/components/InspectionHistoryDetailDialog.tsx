import { Suspense, useState, useEffect } from 'react';

import { QRCodeSVG } from 'qrcode.react';
import { ImageOff, ChevronLeft, ChevronRight, Loader2, Award, QrCode, Calendar, Info, ShieldCheck, Printer } from 'lucide-react';
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
import type { InspectionHistoryRow } from '@/features/inspections/types/inspectionHistory';

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
          .map((d: any) => `${d.type || '결함'} (감점: ${d.ratio ?? 0}%)`)
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
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto overflow-x-hidden rounded-3xl border border-gray-150 bg-white/95 p-6 shadow-xl backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-900/95 font-sans">
          {row && (
          <>
            {/* Header */}
            <DialogHeader className="border-b border-gray-100 dark:border-zinc-800/80 pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="space-y-1">
                  <span className="text-[10px] text-indigo-500 dark:text-indigo-400 font-bold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/30 px-2 py-0.5 rounded-md">
                    검수 이력 상세 조회
                  </span>
                  <DialogTitle className="text-xl font-extrabold text-gray-800 dark:text-zinc-50 leading-tight">
                    {row.bookTitle}
                  </DialogTitle>
                </div>
                <div className="shrink-0 flex items-center gap-2">
                  {row.finalGrade ? (
                    <InspectionBadges isFastTrack={row.isFastTrack} finalGrade={row.finalGrade} />
                  ) : (
                    <span className="text-xs font-semibold text-gray-400 bg-gray-100 dark:bg-zinc-800 px-2 py-1 rounded-md">
                      판정 대기
                    </span>
                  )}
                </div>
              </div>
            </DialogHeader>

            {isLoading ? (
              <div className="flex h-64 flex-col items-center justify-center space-y-3">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
                <p className="text-xs text-gray-400 dark:text-zinc-500 font-medium">데이터를 분석 및 패치하는 중입니다...</p>
              </div>
            ) : (
              <div className="space-y-4 mt-4">
                {/* 1. UBCI 점수 카드 */}
                <div className="bg-gradient-to-r from-indigo-50/40 to-indigo-100/10 dark:from-zinc-800/30 dark:to-zinc-800/10 border border-indigo-100/30 dark:border-zinc-850 rounded-2xl p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-indigo-500" />
                    <div>
                      <span className="text-[9px] text-indigo-400 dark:text-indigo-400 font-bold uppercase tracking-wider block">UBCI AI 점수</span>
                      <span className="text-sm font-black text-gray-800 dark:text-zinc-100">
                        {row.ubciScore === null ? '판독 보류' : `${row.ubciScore} 점`}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 2. LPN 바코드 카드 (정사각형 QR코드 & 겹침 방지 세로 레이아웃) */}
                <div className="bg-gray-50/50 dark:bg-zinc-800/20 border border-gray-100 dark:border-zinc-800/60 rounded-2xl p-4 flex flex-col items-center justify-center text-center space-y-3 w-full min-w-0">
                  <span className="text-[10px] text-gray-400 dark:text-zinc-500 font-bold uppercase tracking-wider flex items-center gap-1.5 justify-center">
                    <QrCode className="w-3.5 h-3.5 text-emerald-500" /> LPN 바코드
                  </span>
                  
                  {detail?.lpnBarcode ? (
                    <div className="flex flex-col items-center space-y-2.5 w-full">
                      {/* 스캔을 고려한 고대비 화이트 박스 QR (정사각형 고정) */}
                      <div className="p-1.5 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center w-[75px] h-[75px] flex-shrink-0">
                        <QRCodeSVG
                          value={detail.labelScanUrl || (typeof window !== "undefined" ? `${window.location.origin}/scan/${detail.lpnBarcode}` : "")}
                          size={62}
                          level="M"
                          includeMargin={false}
                          className="aspect-square flex-shrink-0 select-none"
                        />
                      </div>
                      {/* LPN 텍스트 */}
                      <span className="text-[11px] font-mono font-black text-indigo-600 dark:text-indigo-400 bg-white dark:bg-zinc-800 px-3 py-1 rounded-full border border-indigo-100/60 dark:border-zinc-800 shadow-sm tracking-wider break-all max-w-full block">
                        {detail.lpnBarcode}
                      </span>
                      {/* QR 스캔 URL 이동 링크 */}
                      {(detail.labelScanUrl || detail.lpnBarcode) && (
                        <div className="flex flex-col items-center gap-2 w-full mt-1.5">
                          {row.status === 'PENDING' ? (
                            <span className="text-[10px] text-gray-400 mt-2">검수 완료 후 표시됩니다.</span>
                          ) : (
                            <a
                              href={detail.labelScanUrl || (typeof window !== "undefined" ? `${window.location.origin}/scan/${detail.lpnBarcode}` : "#")}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[9px] text-indigo-500/80 hover:text-indigo-650 hover:underline transition-all tracking-tight break-all max-w-full block select-all text-center"
                            >
                              🔗 QR 스캔 URL 접속하기
                            </a>
                          )}
                          <button
                            onClick={() => setIsPrintModalOpen(true)}
                            disabled={row.status === 'PENDING'}
                            className={`flex items-center justify-center gap-1.5 rounded-xl border px-4 py-2 text-xs font-bold w-full transition-colors ${
                              row.status === 'PENDING'
                                ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                                : 'border-indigo-200 dark:border-indigo-900 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 cursor-pointer'
                            }`}
                          >
                            <Printer className="w-3.5 h-3.5" />
                            {row.status === 'PENDING' ? '검수 중 인쇄 불가' : '라벨 출력'}
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <span className="text-[10px] text-gray-450 dark:text-zinc-500">LPN 바코드가 발급되지 않았습니다.</span>
                  )}
                </div>

                {/* 3. 어드민 전용 상세 정보 카드 */}
                <div className="bg-gray-50/50 dark:bg-zinc-800/10 border border-gray-100 dark:border-zinc-800/40 rounded-2xl p-3.5 space-y-2 text-xs">
                  <div className="flex justify-between items-center pb-2 border-b border-dashed border-gray-250 dark:border-zinc-800/50">
                    <span className="text-gray-400 dark:text-zinc-500 font-medium flex items-center gap-1"><Info className="w-3.5 h-3.5" /> 도서 식별 ID</span>
                    <span className="font-mono text-gray-700 dark:text-zinc-300 select-all">{row.bookId}</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-dashed border-gray-250 dark:border-zinc-800/50">
                    <span className="text-gray-400 dark:text-zinc-500 font-medium flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5" /> 진행 현황</span>
                    <span className="font-extrabold text-indigo-600 dark:text-indigo-400">{getStatusLabel(row.status)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 dark:text-zinc-500 font-medium flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> 검수 요청일시</span>
                    <span className="font-semibold text-gray-700 dark:text-zinc-300">{formatKstDateTime(row.inspectedAt)}</span>
                  </div>
                </div>

                {/* 촬영 사진 3장 캐러셀 갤러리 */}
                <section className="space-y-2">
                  <h4 className="text-xs font-extrabold text-gray-400 dark:text-zinc-500 uppercase tracking-wider">도서 촬영 원본 분석 사진</h4>
                  {hasImages ? (
                    <div className="relative group overflow-hidden rounded-2xl border border-gray-150 dark:border-zinc-800/80 bg-zinc-950 flex items-center justify-center min-h-[300px] max-h-[340px] shadow-inner">
                      <img
                        src={images[currentImgIdx]}
                        alt={`도서 촬영 사진 ${currentImgIdx + 1}`}
                        className="max-h-[340px] object-contain select-none transition-all duration-300"
                        loading="lazy"
                      />
                      
                      {images.length > 1 && (
                        <>
                          <button
                            onClick={handlePrevImg}
                            className="absolute left-3 p-2 rounded-full bg-black/60 hover:bg-indigo-600 text-white transition-all active:scale-90 cursor-pointer shadow-md"
                            title="이전 사진"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </button>
                          <button
                            onClick={handleNextImg}
                            className="absolute right-3 p-2 rounded-full bg-black/60 hover:bg-indigo-600 text-white transition-all active:scale-90 cursor-pointer shadow-md"
                            title="다음 사진"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </>
                      )}

                      <div className="absolute bottom-3 left-3 bg-black/85 px-2.5 py-1 rounded-lg text-white text-[10px] font-bold flex items-center gap-1.5 shadow-md">
                        <span className="bg-indigo-600 px-1 rounded-[3px] text-[8px] uppercase tracking-wider font-extrabold">
                          {PHOTO_LABELS[currentImgIdx] || `슬라이드 ${currentImgIdx + 1}`}
                        </span>
                        {currentImgIdx + 1} / {images.length}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-250 dark:border-zinc-800 p-8 text-center text-gray-400">
                      <ImageOff className="mb-2 h-7 w-7 text-gray-300 dark:text-zinc-700" />
                      <span className="text-xs">촬영된 도서 사진이 존재하지 않습니다.</span>
                    </div>
                  )}
                </section>

                {/* AI 판정 결과 */}
                <section className="space-y-2">
                  <h4 className="text-xs font-extrabold text-gray-400 dark:text-zinc-500 uppercase tracking-wider">AI 분석 종합 진단 리포트</h4>
                  <div className="text-xs leading-relaxed text-gray-600 dark:text-zinc-300 bg-gray-55/50 dark:bg-zinc-800/10 p-3.5 rounded-2xl border border-gray-100 dark:border-zinc-800/60 shadow-inner whitespace-pre-line">
                    {parseFinalReport(row.finalReport)}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {row.reasonCodes && row.reasonCodes.length > 0 ? (
                      row.reasonCodes.map((code) => (
                        <span
                          key={code}
                          className="rounded-full bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 px-2.5 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-400"
                        >
                          {code}
                        </span>
                      ))
                    ) : (
                      <span className="text-[10px] text-gray-400">분석 예외 사유 없음</span>
                    )}
                  </div>
                </section>

                {/* Agent 로그 */}
                <section className="space-y-2 border-t border-gray-100 dark:border-zinc-800 pt-4">
                  <h4 className="text-xs font-extrabold text-gray-400 dark:text-zinc-500 uppercase tracking-wider">Agent 실시간 의사결정 추적 (Chain-of-Thought)</h4>
                  <ErrorBoundary
                    key={row.id}
                    fallback={<p className="text-xs text-red-500">Agent 로그를 불러오는데 실패했습니다.</p>}
                  >
                    <Suspense fallback={<p className="text-xs text-gray-400">Agent 로그 분석 불러오는 중...</p>}>
                      <AgentLogSection inspectionId={row.id} />
                    </Suspense>
                  </ErrorBoundary>
                </section>

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