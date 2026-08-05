"use client";

import { Printer, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { QRCodeSVG } from "qrcode.react";

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

interface LabelPrintModalProps {
  book: ProcessedBook | null;
  workerId: string;
  onClose: () => void;
}

export function LabelPrintModal({ book, workerId, onClose }: LabelPrintModalProps) {
  if (!book) return null;

  const handlePrint = () => {
    // LAN+USB 연동을 위한 스켈레톤 함수
    alert("LAN+USB 프린터 출력 기능 연동 예정입니다. (LPN: " + book.lpn + ")");
  };

  const qrValue = book.labelScanUrl || (typeof window !== "undefined" ? `${window.location.origin}/scan/${book.lpn}` : "");

  return (
    <Dialog open={book !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[95vw] max-w-sm rounded-3xl border border-gray-100 bg-white p-6 shadow-xl font-sans">
        {/* Header */}
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 border-b border-gray-100 pb-4">
          <DialogTitle className="text-lg font-black text-gray-800 flex items-center gap-2">
            <Printer className="w-5 h-5 text-indigo-600" />
            50x30mm 열전사 라벨 프린터 출력
          </DialogTitle>
        </DialogHeader>

        {/* Content */}
        <div className="py-4 space-y-4">
          <div className="bg-gray-50/50 border border-gray-100 rounded-2xl p-4 flex flex-col items-center">
            <p className="text-[11px] font-bold text-gray-400 tracking-wide mb-3">
              실물 라벨 규격 (가로 50mm × 세로 30mm)
            </p>
            
            {/* Label Preview Box (Dashed) */}
            <div className="w-[280px] h-[168px] border-2 border-dashed border-gray-300 bg-white rounded flex items-center justify-center p-3 relative overflow-hidden">
              <div className="flex gap-3 w-full h-full items-center">
                {/* Left: QR Code */}
                <div className="flex-shrink-0 bg-white p-1 rounded">
                  <QRCodeSVG
                    value={qrValue}
                    size={80}
                    level="M"
                    includeMargin={false}
                  />
                </div>
                
                {/* Right: Info */}
                <div className="flex flex-col flex-1 min-w-0 justify-center gap-1.5 pt-1">
                  <span className="text-[14px] font-mono font-black text-black break-all leading-tight">
                    {book.lpn || book.isbn}
                  </span>
                  <div className="space-y-0.5 mt-1">
                    <p className="text-[10px] font-bold text-black truncate w-full">
                      {book.title}
                    </p>
                    <p className="text-[9px] font-medium text-black">
                      ISBN: {book.isbn}
                    </p>
                    <p className="text-[9px] font-medium text-black">
                      작업자: {workerId}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <button
            onClick={handlePrint}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 transition-colors"
          >
            <Printer className="w-4 h-4" />
            50x30mm 열전사 출력
          </button>
          <button
            onClick={onClose}
            className="px-6 border border-gray-200 text-gray-700 font-bold py-3.5 rounded-2xl hover:bg-gray-50 active:bg-gray-100 transition-colors"
          >
            닫기
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
