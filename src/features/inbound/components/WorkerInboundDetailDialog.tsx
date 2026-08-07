"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { QRCodeSVG } from "qrcode.react";
import { ImageOff, ChevronLeft, ChevronRight, Loader2, BookOpen, Tag, Calendar, QrCode } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
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
  status:
    | "APPROVED"
    | "REJECTED"
    | "PROCESSING"
    | "RECHECK_REQUIRED";
  timestamp: string;
}

interface WorkerInboundDetailDialogProps {
  row: ProcessedBook | null;
  onClose: () => void;
}

const PHOTO_LABELS = ["도서 앞면(대표)", "도서 뒷면", "도서 속지(오염/결함)"];

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
      <DialogContent className="w-[92vw] max-w-md max-h-[85vh] overflow-y-auto overflow-x-hidden rounded-xl border border-gray-100 bg-white/95 p-5 sm:p-6 shadow-xl backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-900/95 font-sans">
        {/* Header */}
        <DialogHeader className="space-y-2 text-left border-b border-gray-100 dark:border-zinc-800/80 pb-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            {row.type === "NEW" ? (
              <Badge variant="default">신품</Badge>
            ) : (
              <Badge
                variant="outline"
                className="border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-900/30 dark:text-emerald-400"
              >
                중고/반품
              </Badge>
            )}
            <Badge
              variant={
                row.status === "APPROVED"
                  ? "success"
                  : row.status === "REJECTED"
                  ? "destructive"
                  : "warning"
              }
            >
              {row.status === "APPROVED"
                ? "입고 완료"
                : row.status === "REJECTED"
                  ? "반려"
                  : row.status === "RECHECK_REQUIRED"
                    ? "재촬영 요청"
                    : "검수 중"}
            </Badge>
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
            <div className="bg-gray-50/50 dark:bg-zinc-800/10 border border-gray-100 dark:border-zinc-800/40 rounded-xl p-3.5 space-y-2 text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-dashed border-gray-200 dark:border-zinc-800">
                <span className="text-gray-400 dark:text-zinc-500 font-medium flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> 처리 시각</span>
                <span className="font-semibold text-gray-700 dark:text-zinc-300">{new Date(row.timestamp).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 dark:text-zinc-500 font-medium flex items-center gap-1"><Tag className="w-3.5 h-3.5" /> 바코드 (ISBN)</span>
                <span className="font-mono font-bold text-primary">{row.isbn}</span>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800/10 p-6 text-center text-gray-400">
              <BookOpen className="mb-2 h-7 w-7 text-primary/60" />
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
                <Loader2 className="h-7 w-7 animate-spin text-primary" />
                <p className="text-xs text-gray-400 dark:text-zinc-500">데이터를 가져오는 중입니다...</p>
              </div>
            ) : error || (!row.jobId) ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-red-200 dark:border-red-950/20 bg-red-50/40 dark:bg-red-950/10 p-5 text-center text-red-500">
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

                  {/* 2. LPN 바코드 카드 */}
                  <div className="bg-gray-50/50 dark:bg-zinc-800/20 border border-gray-100 dark:border-zinc-800/60 rounded-xl p-4 flex flex-col items-center justify-center text-center space-y-3 w-full min-w-0">
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
                        <span className="text-[11px] font-mono font-black text-primary bg-white dark:bg-zinc-800 px-3 py-1 rounded-full border border-primary/20 shadow-sm tracking-wider break-all max-w-full block">
                          {row.lpn}
                        </span>
                        {/* QR 스캔 URL 이동 링크 */}
                        {(row.labelScanUrl || row.lpn) && (
                          <a
                            href={row.labelScanUrl || (typeof window !== "undefined" ? `${window.location.origin}/scan/${row.lpn}` : "#")}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[9px] text-primary/80 hover:text-primary hover:underline transition-colors duration-200 tracking-tight break-all max-w-full block select-all mt-1.5"
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
                    등록한 검수 사진
                  </span>
                  {hasImages ? (
                    <div className="relative group overflow-hidden rounded-xl border border-gray-150 dark:border-zinc-800 bg-zinc-950 flex items-center justify-center min-h-[220px] max-h-[240px] shadow-inner">
                      <img
                        src={images[currentImgIdx]}
                        alt={`촬영 사진 ${currentImgIdx + 1}`}
                        className="max-h-[240px] object-contain select-none transition-opacity duration-300"
                        loading="lazy"
                      />

                      {images.length > 1 && (
                        <>
                          <button
                            onClick={handlePrevImg}
                            className="absolute left-2 p-1.5 rounded-full bg-black/60 hover:bg-primary active:scale-95 text-white transition-colors duration-200 cursor-pointer shadow-md"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </button>
                          <button
                            onClick={handleNextImg}
                            className="absolute right-2 p-1.5 rounded-full bg-black/60 hover:bg-primary active:scale-95 text-white transition-colors duration-200 cursor-pointer shadow-md"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </>
                      )}

                      <div className="absolute bottom-2.5 left-2.5 bg-black/85 px-2 py-0.5 rounded-md text-white text-[9px] font-bold flex items-center gap-1.5 shadow-md">
                        <span className="bg-primary px-1 rounded-[3px] text-[8px] uppercase font-extrabold tracking-wider">
                          {PHOTO_LABELS[currentImgIdx] || `사진 ${currentImgIdx + 1}`}
                        </span>
                        {currentImgIdx + 1} / {images.length}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 dark:border-zinc-800 p-6 text-center text-gray-400">
                      <ImageOff className="mb-2 h-7 w-7 text-gray-300 dark:text-zinc-700" />
                      <span className="text-[10px]">촬영된 사진이 존재하지 않습니다.</span>
                    </div>
                  )}
                </div>
                <section className="space-y-2">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-gray-400 dark:text-zinc-500">
                    처리 결과
                  </h4>

                  <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-3.5 text-sm leading-relaxed text-gray-700 dark:border-zinc-800 dark:bg-zinc-800/20 dark:text-zinc-200">
                    {row.status === 'APPROVED'
                      ? '검수가 완료되어 입고 처리되었습니다.'
                      : row.status === 'REJECTED'
                        ? '판매 보류로 처리되었습니다. 관리자 안내에 따라 분류해 주세요.'
                        : row.status === 'RECHECK_REQUIRED'
                          ? '재촬영이 필요합니다. 동일한 LPN을 스캔한 뒤 사진을 다시 등록해 주세요.'
                          : '처리 결과를 확인 중입니다.'}
                  </div>
                </section>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}