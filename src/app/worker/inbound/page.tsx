"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAtomValue } from "jotai";
import { BookOpen, RefreshCw, Trash2, ClipboardList, BookMarked, History, Printer } from "lucide-react";
import { currentUserAtom } from "@/features/auth/store/authAtoms";
import { WorkerInboundDetailDialog } from "@/features/inbound/components/WorkerInboundDetailDialog";
import { LabelPrintModal } from "@/features/inbound/components/LabelPrintModal";
import { getJobStatus } from "@/services/returnService";

interface ProcessedBook {
  id: string;
  jobId?: string;
  title: string;
  publisher: string;
  isbn: string;
  lpn: string;
  type: "NEW" | "RETURNS";
  status: "APPROVED" | "REJECTED" | "PROCESSING";
  timestamp: string;
}

export default function WorkerInboundPage() {
  const currentUser = useAtomValue(currentUserAtom);
  const [processedBooks, setProcessedBooks] = useState<ProcessedBook[]>([]);
  const [selectedBook, setSelectedBook] = useState<ProcessedBook | null>(null);
  const [printingBook, setPrintingBook] = useState<ProcessedBook | null>(null);
  const [mounted, setMounted] = useState(false);

  const storageKey = currentUser
    ? `wms_worker_processed_list_${currentUser.employeeId}`
    : null;

  useEffect(() => {
    setMounted(true);
    if (!storageKey) return;
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      try {
        setProcessedBooks(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse stored processed books", e);
      }
    }
  }, [storageKey]);

  // 주기적으로 PROCESSING 상태인 내역의 최신 상태를 서버에서 확인하여 업데이트 (폴링)
  useEffect(() => {
    if (!mounted || !storageKey || processedBooks.length === 0) return;

    const checkPendingJobs = async () => {
      let hasChanges = false;
      const updatedBooks = await Promise.all(
        processedBooks.map(async (book) => {
          if (book.status === "PROCESSING" && book.jobId) {
            try {
              const res = await getJobStatus(book.jobId);
              // "PENDING" | "PROCESSING" 이 아니면 (APPROVED, REJECTED 등) 상태 변경
              if (res.status === "APPROVED" || res.status === "REJECTED") {
                hasChanges = true;
                return { ...book, status: res.status };
              }
            } catch (error) {
              console.error("Failed to check job status", error);
            }
          }
          return book;
        })
      );

      if (hasChanges) {
        setProcessedBooks(updatedBooks);
        localStorage.setItem(storageKey, JSON.stringify(updatedBooks));
      }
    };

    const interval = setInterval(checkPendingJobs, 5000);
    return () => clearInterval(interval);
  }, [mounted, storageKey, processedBooks]);

  const handleClearHistory = () => {
    if (!storageKey) return;
    if (confirm("오늘 처리한 입고 내역을 모두 비우시겠습니까?")) {
      localStorage.removeItem(storageKey);
      setProcessedBooks([]);
    }
  };

  return (
    <div className="space-y-6 py-4 flex flex-col h-full">
      {/* Header */}
      <div className="space-y-1">
        <h2 className="text-xl font-extrabold text-gray-800 dark:text-zinc-50 flex items-center gap-2">
          <BookMarked className="w-5 h-5 text-indigo-500" />
          입고 프로세스 선택
        </h2>
        <p className="text-xs text-gray-400 dark:text-zinc-500">
          신품 도서와 중고 및 반품 도서의 입고 방식이 다르게 진행됩니다.
        </p>
      </div>

      {/* Mode Selection Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* New Stock Card */}
        <Link
          href="/worker/inbound/new"
          className="group block relative overflow-hidden bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 hover:border-indigo-400 dark:hover:border-indigo-500 rounded-3xl p-5 hover:shadow-md transition-all active:scale-[0.98]"
        >
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 p-4 rounded-full group-hover:scale-110 transition-transform">
              <BookOpen className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-gray-800 dark:text-zinc-100">
                신품 도서 즉시 입고
              </h3>
              <p className="text-xs text-gray-400 dark:text-zinc-500">
                바코드(ISBN) 스캔 후 검수 없이 즉시 입고 처리
              </p>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-500/5 rounded-full -mr-6 -mt-6" />
        </Link>

        {/* Used & Returns Card */}
        <Link
          href="/worker/inbound/returns"
          className="group block relative overflow-hidden bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 hover:border-emerald-400 dark:hover:border-emerald-500 rounded-3xl p-5 hover:shadow-md transition-all active:scale-[0.98]"
        >
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 p-4 rounded-full group-hover:scale-110 transition-transform">
              <RefreshCw className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-gray-800 dark:text-zinc-100">
                중고·반품 AI 검수 입고
              </h3>
              <p className="text-xs text-gray-400 dark:text-zinc-500">
                바코드 ➡️ 3점 사진 촬영 ➡️ AI 분석 및 등급 판독 검수 입고
              </p>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/5 rounded-full -mr-6 -mt-6" />
        </Link>
      </div>

      {/* Worker Processed History List */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-gray-200 dark:border-zinc-800 p-4 flex-1 flex flex-col min-h-[300px]">
        <div className="flex items-center justify-between mb-4 shrink-0">
          <div className="flex items-center gap-1.5">
            <History className="w-4 h-4 text-gray-500" />
            <h3 className="text-sm font-bold text-gray-700 dark:text-zinc-300">
              오늘 내가 처리한 입고 내역
            </h3>
            {mounted && (
              <span className="text-xs bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-400 py-0.5 px-2 rounded-full font-bold">
                {processedBooks.length}건
              </span>
            )}
          </div>
          {mounted && processedBooks.length > 0 && (
            <button
              onClick={handleClearHistory}
              className="inline-flex items-center gap-1 text-xs font-semibold text-red-500 hover:text-red-700 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              내역 비우기
            </button>
          )}
        </div>

        {/* List Content */}
        <div className="flex-1 overflow-y-auto min-h-0 pr-1">
          {!mounted ? (
            <p className="text-xs text-gray-400 dark:text-zinc-600 text-center py-12">
              로딩 중...
            </p>
          ) : processedBooks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center space-y-2">
              <ClipboardList className="w-8 h-8 text-gray-300 dark:text-zinc-700" />
              <p className="text-xs text-gray-400 dark:text-zinc-500 font-medium">
                오늘 처리한 도서 내역이 없습니다.
              </p>
            </div>
          ) : (
            <>
              {/* Desktop Table View (hidden on mobile, block on md+) */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-zinc-800 text-gray-400 text-xs font-bold uppercase tracking-wider">
                      <th className="py-2.5 px-2">도서 정보</th>
                      <th className="py-2.5 px-2">식별자 (LPN / ISBN)</th>
                      <th className="py-2.5 px-2">구분</th>
                      <th className="py-2.5 px-2">상태</th>
                      <th className="py-2.5 px-2 text-right">처리 시각</th>
                      <th className="py-2.5 px-2 text-center w-12">라벨</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-zinc-800/50 text-xs">
                    {processedBooks.map((book) => (
                      <tr
                        key={book.id}
                        onClick={() => setSelectedBook(book)}
                        className="hover:bg-gray-100/50 dark:hover:bg-zinc-800/30 transition-colors cursor-pointer"
                      >
                        <td className="py-3 px-2 font-semibold text-gray-700 dark:text-zinc-200">
                          {book.title}
                          <span className="text-[10px] text-gray-400 block font-normal mt-0.5">
                            {book.publisher} | ISBN: {book.isbn}
                          </span>
                        </td>
                        <td className="py-3 px-2 font-mono text-zinc-600 dark:text-zinc-400 font-bold">
                          {book.lpn || book.isbn}
                        </td>
                        <td className="py-3 px-2">
                          <span className={`inline-flex px-2 py-0.5 rounded-full font-bold text-[10px] ${
                            book.type === "NEW"
                              ? "bg-blue-50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400"
                              : "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400"
                          }`}>
                            {book.type === "NEW" ? "신품" : "중고/반품"}
                          </span>
                        </td>
                        <td className="py-3 px-2">
                          <span className={`inline-flex px-2 py-0.5 rounded-full font-bold text-[10px] ${
                            book.status === "APPROVED"
                              ? "bg-green-50 text-green-600 dark:bg-green-950/20 dark:text-green-400"
                              : book.status === "REJECTED"
                              ? "bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400"
                              : "bg-yellow-50 text-yellow-600 dark:bg-yellow-950/20 dark:text-yellow-400"
                          }`}>
                            {book.status === "APPROVED" ? "입고 완료" : book.status === "REJECTED" ? "반려" : "검수 중"}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-right text-gray-400 dark:text-zinc-500 font-medium">
                          {new Date(book.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </td>
                        <td className="py-3 px-2 text-center">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (book.status !== "PROCESSING") {
                                setPrintingBook(book);
                              }
                            }}
                            disabled={book.status === "PROCESSING"}
                            className={`p-1.5 rounded-lg transition-colors inline-flex ${
                              book.status === "PROCESSING"
                                ? "text-gray-300 dark:text-zinc-700 cursor-not-allowed"
                                : "text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30"
                            }`}
                            title={book.status === "PROCESSING" ? "검수 진행 중에는 출력할 수 없습니다." : "라벨 출력"}
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card List View (block on mobile, hidden on md+) */}
              <div className="block md:hidden space-y-2">
                {processedBooks.map((book) => (
                  <div
                    key={book.id}
                    onClick={() => setSelectedBook(book)}
                    className="p-3 bg-gray-50/50 dark:bg-zinc-800/10 border border-gray-100 dark:border-zinc-800/40 rounded-2xl space-y-2 text-xs cursor-pointer active:scale-[0.99] hover:bg-gray-100/20 dark:hover:bg-zinc-800/30 transition-all"
                  >
                    <div className="flex justify-between items-start">
                      <div className="font-semibold text-gray-700 dark:text-zinc-200">
                        {book.title}
                        <span className="text-[10px] text-gray-400 block font-normal mt-0.5">
                          {book.publisher} | ISBN: {book.isbn}
                        </span>
                      </div>
                      <span className={`inline-flex px-2 py-0.5 rounded-full font-bold text-[10px] shrink-0 ${
                        book.type === "NEW"
                          ? "bg-blue-50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400"
                          : "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400"
                      }`}>
                        {book.type === "NEW" ? "신품" : "중고/반품"}
                      </span>
                    </div>

                    <div className="flex justify-between items-center pt-1.5 border-t border-dashed border-gray-200 dark:border-zinc-800 gap-2">
                      <div className="font-mono text-zinc-500 dark:text-zinc-500 font-medium min-w-0 flex-1 break-all text-[11px]">
                        {book.lpn || book.isbn}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`inline-flex px-2 py-0.5 rounded-full font-bold text-[10px] whitespace-nowrap shrink-0 ${
                          book.status === "APPROVED"
                            ? "bg-green-50 text-green-600 dark:bg-green-950/20 dark:text-green-400"
                            : book.status === "REJECTED"
                            ? "bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400"
                            : "bg-yellow-50 text-yellow-600 dark:bg-yellow-950/20 dark:text-yellow-400"
                        }`}>
                          {book.status === "APPROVED" ? "입고 완료" : book.status === "REJECTED" ? "반려" : "검수 중"}
                        </span>
                        <span className="text-[10px] text-gray-400 dark:text-zinc-500 whitespace-nowrap shrink-0">
                          {new Date(book.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (book.status !== "PROCESSING") {
                                setPrintingBook(book);
                              }
                            }}
                            disabled={book.status === "PROCESSING"}
                            className={`p-1.5 rounded-lg transition-colors ${
                              book.status === "PROCESSING"
                                ? "text-gray-300 dark:text-zinc-700 cursor-not-allowed"
                                : "text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30"
                            }`}
                            title={book.status === "PROCESSING" ? "검수 진행 중에는 출력할 수 없습니다." : "라벨 출력"}
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
      
      {/* Detail Dialog */}
      <WorkerInboundDetailDialog
        row={selectedBook}
        onClose={() => setSelectedBook(null)}
      />

      {/* Label Print Modal Skeleton */}
      <LabelPrintModal
        book={printingBook}
        workerId={currentUser?.employeeId || "UNKNOWN"}
        onClose={() => setPrintingBook(null)}
      />
    </div>
  );
}
