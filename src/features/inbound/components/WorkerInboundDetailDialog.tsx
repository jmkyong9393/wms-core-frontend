"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { QRCodeSVG } from "qrcode.react";
import { ImageOff, ChevronLeft, ChevronRight, Loader2, BookOpen, Tag, Award, Calendar, QrCode } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getJobStatus } from "@/services/returnService";

interface ProcessedBook {
  id: string;
  jobId?: string;
  title: string;
  publisher: string;
  isbn: string;
  lpn: string;
  labelScanUrl?: string;
  type: "NEW" | "RETURNS";
  status: "APPROVED" | "REJECTED" | "PROCESSING";
  timestamp: string;
}

interface WorkerInboundDetailDialogProps {
  row: ProcessedBook | null;
  onClose: () => void;
}

const PHOTO_LABELS = ["도서 앞면(대표)", "도서 뒷면", "도서 속지(오염/결함)"];

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

export function WorkerInboundDetailDialog({ row, onClose }: WorkerInboundDetailDialogProps) {
  const [currentImgIdx, setCurrentImgIdx] = useState(0);

  useEffect(() => {
    setCurrentImgIdx(0);
  }, [row]);

  // 중고/반품(RETURNS) 도서인 경우에만 AI 검수 결과를 가져옴
  const { data: detail, isLoading, error } = useQuery({
    queryKey: ["workerInboundDetail", row?.jobId],
    queryFn: () => getJobStatus(row!.jobId!),
    enabled: !!(row && row.type === "RETURNS" && row.jobId),
  });

  if (!row) return null;

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
    <Dialog open={row !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[92vw] max-w-md max-h-[85vh] overflow-y-auto overflow-x-hidden rounded-3xl border border-gray-100 bg-white/95 p-5 sm:p-6 shadow-xl backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-900/95 font-sans">
        {/* Header */}
        <DialogHeader className="space-y-2 text-left border-b border-gray-100 dark:border-zinc-800/80 pb-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className={`inline-flex px-2 py-0.5 rounded-full font-bold text-[9px] uppercase tracking-wider ${
              row.type === "NEW"
                ? "bg-blue-50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400"
                : "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400"
            }`}>
              {row.type === "NEW" ? "신품" : "중고/반품"}
            </span>
            <span className={`inline-flex px-2 py-0.5 rounded-full font-bold text-[9px] ${
              row.status === "APPROVED"
                ? "bg-green-50 text-green-600 dark:bg-green-950/20 dark:text-green-400"
                : row.status === "REJECTED"
                ? "bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400"
                : "bg-yellow-50 text-yellow-600 dark:bg-yellow-950/20 dark:text-yellow-400"
            }`}>
              {row.status === "APPROVED" ? "입고 완료" : row.status === "REJECTED" ? "반려" : "검수 중"}
            </span>
          </div>
          <DialogTitle className="text-base font-bold text-gray-800 dark:text-zinc-50 leading-tight">
            {row.title}
          </DialogTitle>
          <p className="text-[11px] text-gray-400 dark:text-zinc-500 font-medium">
            {row.publisher} | ISBN: {row.isbn}
          </p>
        </DialogHeader>

        {/* 1. 신품(NEW) 도서 모달 뷰 */}
        {row.type === "NEW" && (
          <div className="space-y-4 pt-3">
            <div className="bg-gray-50/50 dark:bg-zinc-800/10 border border-gray-100 dark:border-zinc-800/40 rounded-2xl p-3.5 space-y-2 text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-dashed border-gray-200 dark:border-zinc-800">
                <span className="text-gray-400 dark:text-zinc-500 font-medium flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> 처리 시각</span>
                <span className="font-semibold text-gray-700 dark:text-zinc-300">{new Date(row.timestamp).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 dark:text-zinc-500 font-medium flex items-center gap-1"><Tag className="w-3.5 h-3.5" /> 바코드 (ISBN)</span>
                <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{row.isbn}</span>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800/10 p-6 text-center text-gray-400">
              <BookOpen className="mb-2 h-7 w-7 text-indigo-500/60 dark:text-indigo-400/40" />
              <p className="text-xs font-bold text-gray-600 dark:text-zinc-300 mb-1">
                신품 즉시 입고 도서
              </p>
              <span className="text-[10px] leading-relaxed text-gray-450 dark:text-zinc-550">
                신품 도서는 무검수 적치 방식으로 입고되므로,<br />
                AI 검수 이력(UBCI 점수 및 촬영 사진)이 존재하지 않습니다.
              </span>
            </div>
          </div>
        )}

        {/* 2. 중고/반품(RETURNS) 도서 모달 뷰 */}
        {row.type === "RETURNS" && (
          <div className="space-y-4 pt-3">
            {isLoading ? (
              <div className="flex h-44 flex-col items-center justify-center space-y-2">
                <Loader2 className="h-7 w-7 animate-spin text-indigo-500" />
                <p className="text-xs text-gray-400 dark:text-zinc-500">데이터를 가져오는 중입니다...</p>
              </div>
            ) : error || (!row.jobId) ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-red-200 dark:border-red-950/20 bg-red-50/40 dark:bg-red-950/10 p-5 text-center text-red-500">
                <ImageOff className="mb-1.5 h-7 w-7" />
                <span className="text-xs font-bold">검수 내역 유실</span>
                <span className="text-[10px] text-red-400 mt-0.5 leading-normal">
                  작업 정보가 만료되었거나 서버 데이터를 가져오지 못했습니다.
                </span>
              </div>
            ) : (
              <div className="space-y-4">
                {/* 메인 정보 카드 (UBCI & LPN QR 세로 배치로 겹침 완벽 방지) */}
                <div className="space-y-3">
                  {/* 1. UBCI 점수 카드 */}
                  <div className="bg-gradient-to-r from-indigo-50/40 to-indigo-100/10 dark:from-zinc-800/30 dark:to-zinc-800/10 border border-indigo-100/30 dark:border-zinc-850 rounded-2xl p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Award className="w-5 h-5 text-indigo-500" />
                      <div>
                        <span className="text-[9px] text-indigo-400 dark:text-indigo-400 font-bold uppercase tracking-wider block">UBCI AI 점수</span>
                        <span className="text-sm font-black text-gray-800 dark:text-zinc-100">
                          {detail?.ubciScore !== null ? `${detail?.ubciScore} 점` : "보류"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 2. LPN 바코드 카드 */}
                  <div className="bg-gray-50/50 dark:bg-zinc-800/20 border border-gray-100 dark:border-zinc-800/60 rounded-2xl p-4 flex flex-col items-center justify-center text-center space-y-3 w-full min-w-0">
                    <span className="text-[10px] text-gray-400 dark:text-zinc-500 font-bold uppercase tracking-wider flex items-center gap-1.5 justify-center">
                      <QrCode className="w-3.5 h-3.5 text-emerald-500" /> LPN 바코드
                    </span>
                    
                    {row.lpn ? (
                      <div className="flex flex-col items-center space-y-2.5 w-full">
                        {/* 스캔을 고려한 고대비 화이트 박스 QR (정사각형 고정) */}
                        <div className="p-1.5 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center w-[75px] h-[75px] flex-shrink-0">
                          <QRCodeSVG
                            value={row.labelScanUrl || (typeof window !== "undefined" ? `${window.location.origin}/scan/${row.lpn}` : "")}
                            size={62}
                            level="M"
                            includeMargin={false}
                            className="aspect-square flex-shrink-0 select-none"
                          />
                        </div>
                        {/* LPN 텍스트 (길어질 시 줄바꿈 처리 및 겹침 방지) */}
                        <span className="text-[11px] font-mono font-black text-indigo-600 dark:text-indigo-400 bg-white dark:bg-zinc-800 px-3 py-1 rounded-full border border-indigo-100/60 dark:border-zinc-800 shadow-sm tracking-wider break-all max-w-full block">
                          {row.lpn}
                        </span>
                        {/* QR 스캔 URL 이동 링크 */}
                        {(row.labelScanUrl || row.lpn) && (
                          <a
                            href={row.labelScanUrl || (typeof window !== "undefined" ? `${window.location.origin}/scan/${row.lpn}` : "#")}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[9px] text-indigo-500/80 hover:text-indigo-650 hover:underline transition-all tracking-tight break-all max-w-full block select-all mt-1.5"
                          >
                            🔗 QR 스캔 URL 접속하기
                          </a>
                        )}
                      </div>
                    ) : (
                      <span className="text-[10px] text-gray-450 dark:text-zinc-500">LPN 바코드가 발급되지 않았습니다.</span>
                    )}
                  </div>
                </div>

                {/* 촬영 도서 사진 캐러셀 */}
                <div className="space-y-1.5">
                  <span className="text-[10px] text-gray-400 dark:text-zinc-500 font-bold uppercase tracking-wider block">
                    촬영된 도서 분석 사진
                  </span>
                  {hasImages ? (
                    <div className="relative group overflow-hidden rounded-2xl border border-gray-150 dark:border-zinc-800 bg-zinc-950 flex items-center justify-center min-h-[220px] max-h-[240px] shadow-inner">
                      <img
                        src={images[currentImgIdx]}
                        alt={`촬영 사진 ${currentImgIdx + 1}`}
                        className="max-h-[240px] object-contain select-none transition-all duration-300"
                        loading="lazy"
                      />
                      
                      {images.length > 1 && (
                        <>
                          <button
                            onClick={handlePrevImg}
                            className="absolute left-2 p-1.5 rounded-full bg-black/60 hover:bg-indigo-600 active:scale-95 text-white transition-all cursor-pointer shadow-md"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </button>
                          <button
                            onClick={handleNextImg}
                            className="absolute right-2 p-1.5 rounded-full bg-black/60 hover:bg-indigo-600 active:scale-95 text-white transition-all cursor-pointer shadow-md"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </>
                      )}

                      <div className="absolute bottom-2.5 left-2.5 bg-black/85 px-2 py-0.5 rounded-md text-white text-[9px] font-bold flex items-center gap-1.5 shadow-md">
                        <span className="bg-indigo-600 px-1 rounded-[3px] text-[8px] uppercase font-extrabold tracking-wider">
                          {PHOTO_LABELS[currentImgIdx] || `사진 ${currentImgIdx + 1}`}
                        </span>
                        {currentImgIdx + 1} / {images.length}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 dark:border-zinc-800 p-6 text-center text-gray-400">
                      <ImageOff className="mb-2 h-7 w-7 text-gray-300 dark:text-zinc-700" />
                      <span className="text-[10px]">촬영된 사진이 존재하지 않습니다.</span>
                    </div>
                  )}
                </div>

                {/* AI 최종 진단 리포트 */}
                {detail?.finalReport && (
                  <div className="space-y-1.5">
                    <span className="text-[10px] text-gray-400 dark:text-zinc-500 font-bold uppercase tracking-wider block">
                      AI 종합 진단 결과
                    </span>
                    <p className="text-xs leading-normal text-gray-655 dark:text-zinc-300 bg-gray-50/50 dark:bg-zinc-800/10 p-3 rounded-xl border border-gray-100 dark:border-zinc-800/40 shadow-inner whitespace-pre-line">
                      {parseFinalReport(detail.finalReport)}
                    </p>
                  </div>
                )}

                {/* 이력 기본 정보 */}
                <div className="bg-gray-50/50 dark:bg-zinc-850/10 rounded-2xl p-3 border border-gray-100/50 dark:border-zinc-800/40 space-y-1.5 text-[10px] text-gray-550 dark:text-zinc-400">
                  <div className="flex justify-between items-center">
                    <span>검수 상태 코드</span>
                    <span className="font-semibold text-gray-700 dark:text-zinc-300">{row.status}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>최종 입고 처리 시각</span>
                    <span>{new Date(row.timestamp).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}