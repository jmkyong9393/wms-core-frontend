"use client";

import { useState } from "react";
import Link from "next/link";
import { useAtomValue } from "jotai";
import { ChevronLeft, Barcode, Camera, Plus, Minus, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { BarcodeScanner } from "@/components/ui/barcode-scanner";
import { registerBook, createNewStockInbound } from "@/services/returnService";
import { currentUserAtom } from "@/features/auth/store/authAtoms";

interface BookInfo {
  bookId: string;
  isbn: string;
  title: string;
  originalPrice: string;
  publisher: string;
  category: string;
}

interface InboundResult {
  location: string;
  quantity: number;
}

export default function NewStockInboundPage() {
  const currentUser = useAtomValue(currentUserAtom);
  const [isbn, setIsbn] = useState("");
  const [isScannerActive, setIsScannerActive] = useState(false);
  const [isLoadingBook, setIsLoadingBook] = useState(false);
  const [bookInfo, setBookInfo] = useState<BookInfo | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inboundResult, setInboundResult] = useState<InboundResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleScan = async (scannedIsbn: string) => {
    setIsScannerActive(false);
    setIsbn(scannedIsbn);
    await fetchBook(scannedIsbn);
  };

  const fetchBook = async (targetIsbn: string) => {
    if (!targetIsbn.trim()) return;
    setIsLoadingBook(true);
    setErrorMsg(null);
    setBookInfo(null);
    setInboundResult(null);

    try {
      const book = await registerBook(targetIsbn.trim());
      setBookInfo({
        bookId: book.bookId,
        isbn: book.isbn,
        title: book.title,
        originalPrice: book.originalPrice || "15000",
        publisher: book.publisher || "알 수 없음",
        category: book.category || "NOVEL",
      });
    } catch (e: any) {
      console.error(e);
      setErrorMsg("도서 정보를 조회하지 못했습니다. ISBN을 다시 확인해 주세요.");
    } finally {
      setIsLoadingBook(false);
    }
  };

  const handleInbound = async () => {
    if (!bookInfo || !currentUser) return;
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await createNewStockInbound({
        isbn: bookInfo.isbn,
        title: bookInfo.title,
        publisher: bookInfo.publisher,
        category: bookInfo.category,
        basePrice: bookInfo.originalPrice,
        quantity: quantity,
      });

      const result: InboundResult = {
        location: res.locationBarcode || "LOC-A-NOVEL-01",
        quantity: quantity,
      };

      setInboundResult(result);

      // Save to worker history
      const storageKey = `wms_worker_processed_list_${currentUser.employeeId}`;
      const stored = localStorage.getItem(storageKey);
      const list = stored ? JSON.parse(stored) : [];
      list.unshift({
        id: `inbound_${Date.now()}`,
        title: bookInfo.title,
        publisher: bookInfo.publisher,
        isbn: bookInfo.isbn,
        lpn: "", // 신품의 경우 개별 LPN 바코드를 발급하지 않고 ISBN/도서코드로 식별합니다.
        type: "NEW",
        status: "APPROVED",
        timestamp: new Date().toISOString(),
      });
      localStorage.setItem(storageKey, JSON.stringify(list.slice(0, 10))); // Keep last 10
    } catch (e: any) {
      console.error(e);
      setErrorMsg("입고 처리 중 서버 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setIsbn("");
    setBookInfo(null);
    setQuantity(10);
    setInboundResult(null);
    setErrorMsg(null);
  };

  return (
    <div className="space-y-4 py-2 flex flex-col h-full max-w-md mx-auto">
      {/* Header back link */}
      <div className="flex items-center shrink-0">
        <Link
          href="/worker/inbound"
          className="inline-flex items-center gap-1 text-xs font-bold text-gray-500 hover:text-gray-700"
        >
          <ChevronLeft className="w-4 h-4" />
          입고 선택으로 돌아가기
        </Link>
      </div>

      <div className="space-y-1 shrink-0">
        <h2 className="text-lg font-extrabold text-gray-800 dark:text-zinc-50">
          신품 도서 즉시 입고
        </h2>
        <p className="text-xs text-gray-400 dark:text-zinc-500">
          신품은 품질 검수 단계 없이 지정된 로케이션으로 즉시 입고 처리됩니다.
        </p>
      </div>

      {/* Main Flow Content */}
      <div className="flex-1 flex flex-col justify-between space-y-4">
        {inboundResult ? (
          /* Success Screen */
          <div className="bg-white dark:bg-zinc-900 border border-emerald-100 dark:border-emerald-950/30 rounded-3xl p-6 shadow-sm flex-1 flex flex-col justify-between text-center space-y-6">
            <div className="space-y-4 my-auto">
              <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-500 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto animate-bounce">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-gray-800 dark:text-zinc-100">
                  신품 입고 완료!
                </h3>
                <p className="text-xs text-gray-400 dark:text-zinc-500">
                  도서 적치가 정상 완료되었습니다.
                </p>
              </div>

              {/* ISBN Barcode Visualizer */}
              <div className="bg-gray-50 dark:bg-zinc-800/40 rounded-2xl p-4 border border-gray-100 dark:border-zinc-800 space-y-3">
                <div className="space-y-0.5">
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">
                    도서 ISBN
                  </span>
                  <span className="text-sm font-mono font-extrabold text-indigo-600 dark:text-indigo-400">
                    {bookInfo?.isbn}
                  </span>
                </div>

                {/* Barcode graphic lines (Premium Aesthetic) */}
                <div className="h-10 w-44 bg-white dark:bg-zinc-950 mx-auto rounded-md flex items-center justify-center px-3 border border-gray-100 dark:border-zinc-900 overflow-hidden">
                  <div className="flex items-center space-x-[2px] h-8 shrink-0 opacity-80 dark:invert">
                    {[1, 3, 1, 2, 4, 1, 2, 1, 3, 2, 1, 4, 1, 2, 3, 1, 2, 4, 1, 2, 1, 3, 2].map((w, idx) => (
                      <div
                        key={idx}
                        className="bg-black h-full shrink-0"
                        style={{ width: `${w}px` }}
                      />
                    ))}
                  </div>
                </div>

                <div className="border-t border-dashed border-gray-200 dark:border-zinc-800 pt-2.5 grid grid-cols-2 gap-2 text-left">
                  <div>
                    <span className="text-[10px] text-gray-400 block">적재 로케이션</span>
                    <span className="text-xs font-extrabold text-gray-700 dark:text-zinc-200">
                      {inboundResult.location}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 block">입고 수량</span>
                    <span className="text-xs font-extrabold text-gray-700 dark:text-zinc-200">
                      {inboundResult.quantity} 권
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={handleReset}
              className="w-full bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white font-bold py-3.5 rounded-2xl shadow-sm shadow-emerald-500/10 transition-all cursor-pointer text-sm shrink-0"
            >
              다음 도서 스캔
            </button>
          </div>
        ) : (
          /* Input / Book Confirm Screen */
          <div className="flex-1 flex flex-col justify-between space-y-4">
            <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-3xl p-5 shadow-sm space-y-4">
              {/* ISBN Input Mode */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 dark:text-zinc-400">
                  도서 ISBN 바코드 스캔 또는 입력
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder="ISBN 번호 입력"
                      value={isbn}
                      onChange={(e) => setIsbn(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && fetchBook(isbn)}
                      className="w-full pl-9 pr-3 py-2.5 text-sm bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-800 rounded-xl focus:border-indigo-400 focus:outline-none dark:text-zinc-100"
                    />
                    <Barcode className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
                  </div>
                  <button
                    onClick={() => setIsScannerActive(!isScannerActive)}
                    className={`px-3.5 py-2.5 rounded-xl border font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer ${
                      isScannerActive
                        ? "bg-indigo-50 border-indigo-200 text-indigo-600"
                        : "bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 text-gray-600 dark:text-zinc-400 hover:bg-gray-50"
                    }`}
                  >
                    <Camera className="w-4 h-4" />
                    카메라
                  </button>
                </div>
              </div>

              {/* Camera Scanner View */}
              {isScannerActive && (
                <div className="mt-2">
                  <BarcodeScanner onScan={handleScan} isActive={isScannerActive} />
                </div>
              )}

              {/* Loader */}
              {isLoadingBook && (
                <div className="flex flex-col items-center justify-center py-8 space-y-2 text-xs text-gray-500">
                  <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
                  <span>도서 조회 중...</span>
                </div>
              )}

              {/* Book Details Confirmation Panel */}
              {bookInfo && (
                <div className="bg-indigo-50/40 dark:bg-indigo-950/10 border border-indigo-100/50 dark:border-indigo-950/20 rounded-2xl p-4 space-y-3 animate-fadeIn">
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-wider block">
                      조회된 신품 정보
                    </span>
                    <h4 className="text-sm font-extrabold text-gray-800 dark:text-zinc-200">
                      {bookInfo.title}
                    </h4>
                    <span className="text-xs text-gray-500 dark:text-zinc-400 block">
                      {bookInfo.publisher} | 정가 {Number(bookInfo.originalPrice).toLocaleString()} 원
                    </span>
                  </div>

                  {/* Quantity Control Panel (Large Touch Targets) */}
                  <div className="border-t border-dashed border-indigo-100/60 dark:border-indigo-950/20 pt-3 flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-500">입고 수량</span>
                    <div className="flex items-center gap-1.5">
                      {/* 수량 감산 퀵버튼 */}
                      <div className="flex gap-1 mr-1">
                        <button
                          onClick={() => setQuantity(Math.max(1, quantity - 10))}
                          className="px-1.5 py-1 text-[10px] font-bold bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-950/20 rounded-lg hover:bg-rose-100 transition-colors cursor-pointer"
                        >
                          -10
                        </button>
                        <button
                          onClick={() => setQuantity(Math.max(1, quantity - 5))}
                          className="px-1.5 py-1 text-[10px] font-bold bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-950/20 rounded-lg hover:bg-rose-100 transition-colors cursor-pointer"
                        >
                          -5
                        </button>
                      </div>

                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-8 h-8 rounded-full border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-center text-gray-600 dark:text-zinc-400 hover:bg-gray-50 transition-colors cursor-pointer"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-sm font-extrabold text-gray-800 dark:text-zinc-100 w-6 text-center">
                        {quantity}
                      </span>
                      <button
                        onClick={() => setQuantity(quantity + 1)}
                        className="w-8 h-8 rounded-full border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-center text-gray-600 dark:text-zinc-400 hover:bg-gray-50 transition-colors cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>

                      {/* 수량 가산 퀵버튼 */}
                      <div className="flex gap-1 ml-1">
                        <button
                          onClick={() => setQuantity(quantity + 5)}
                          className="px-1.5 py-1 text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-950/20 rounded-lg hover:bg-indigo-100 transition-colors cursor-pointer"
                        >
                          +5
                        </button>
                        <button
                          onClick={() => setQuantity(quantity + 10)}
                          className="px-1.5 py-1 text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-950/20 rounded-lg hover:bg-indigo-100 transition-colors cursor-pointer"
                        >
                          +10
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Error messages */}
              {errorMsg && (
                <div className="flex items-start gap-2 bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-950/20 p-3 rounded-2xl text-xs font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}
            </div>

            {/* Inbound Confirm Sticky Bar */}
            <button
              onClick={handleInbound}
              disabled={!bookInfo || isSubmitting}
              className={`w-full font-bold py-3.5 rounded-2xl shadow-sm text-sm shrink-0 flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                bookInfo
                  ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/15"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200 dark:bg-zinc-800 dark:border-zinc-800"
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  입고 처리 중...
                </>
              ) : (
                <>즉시 입고 확정</>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
