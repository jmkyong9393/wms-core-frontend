"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useAtomValue } from "jotai";
import { 
  ChevronLeft, Barcode, Camera, Check, Loader2, AlertCircle, 
  QrCode, Sparkles, RotateCcw, AlertTriangle, RefreshCw, CheckCircle2 
} from "lucide-react";
import { useCamera } from "@/features/inbound/hooks/useCamera";
import { useS3Upload } from "@/features/inbound/hooks/useS3Upload";
import { toast } from "sonner";
import { useJobStatus } from "@/hooks/useJobStatus";
import { BarcodeScanner } from "@/components/ui/barcode-scanner";
import { 
  registerBook, 
  createUsedItemInbound, 
  startInspection, 
  submitRecheck,
  isMockMode 
} from "@/services/returnService";
import { currentUserAtom } from "@/features/auth/store/authAtoms";

interface BookInfo {
  bookId: string;
  isbn: string;
  title: string;
  originalPrice: string;
  publisher: string;
  category: string;
}

interface InboundInfo {
  inboundItemId: string;
  lpnBarcode: string;
  labelScanUrl?: string;
}

type PhotoType = "front" | "back" | "inside";

interface PhotoSlots {
  front: string | null;
  back: string | null;
  inside: string | null;
}

// Camera Capture Modal Component
interface CameraModalProps {
  photoType: PhotoType;
  onCapture: (dataUrl: string) => void;
  onClose: () => void;
}

function CameraModal({ photoType, onCapture, onClose }: CameraModalProps) {
  const { videoRef, error: cameraError, stopCamera } = useCamera({ idealFacingMode: "environment" });
  const [isCapturing, setIsCapturing] = useState(false);

  const labelMap = {
    front: "도서 앞면 (표지)",
    back: "도서 뒷면 (바코드 영역)",
    inside: "도서 속지 (도장/오염 확인)",
  };

  const handleCaptureClick = () => {
    if (!videoRef.current || isCapturing) return;
    setIsCapturing(true);
    try {
      const video = videoRef.current;
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      
      const ctx = canvas.getContext("2d");
      if (ctx) {
        // Mirror effect if using user camera, but typically environment is used
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
        onCapture(dataUrl);
      }
    } catch (e) {
      console.error("Capture failed:", e);
    } finally {
      setIsCapturing(false);
    }
  };

  const handleSimulateCapture = () => {
    // Generate colored placeholder dataUrl when camera is not available
    const canvas = document.createElement("canvas");
    canvas.width = 640;
    canvas.height = 480;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      // Background gradient
      const grad = ctx.createLinearGradient(0, 0, 640, 480);
      grad.addColorStop(0, photoType === "front" ? "#4f46e5" : photoType === "back" ? "#059669" : "#d97706");
      grad.addColorStop(1, "#1f2937");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 640, 480);
      
      // Text indicator
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 24px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(`MOCK ${photoType.toUpperCase()} CAPTURE`, 320, 240);
      
      const dataUrl = canvas.toDataURL("image/jpeg");
      onCapture(dataUrl);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex flex-col justify-between p-4 font-sans">
      <header className="flex justify-between items-center text-white py-2">
        <h4 className="text-sm font-bold">{labelMap[photoType]} 촬영</h4>
        <button 
          onClick={() => {
            stopCamera();
            onClose();
          }}
          className="text-xs font-semibold px-3 py-1.5 bg-zinc-800 rounded-lg hover:bg-zinc-700"
        >
          닫기
        </button>
      </header>

      {/* Camera Viewport */}
      <div className="flex-1 flex items-center justify-center relative bg-zinc-950 rounded-2xl overflow-hidden border border-zinc-800 my-4">
        {cameraError ? (
          <div className="text-center p-6 space-y-4 max-w-xs">
            <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto" />
            <p className="text-xs text-gray-400">
              실제 웹캠 장치가 감지되지 않습니다. 모의 테스트 데이터를 생성해 진행하시겠습니까?
            </p>
            <button
              onClick={handleSimulateCapture}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-md transition-colors cursor-pointer"
            >
              모의 사진 생성하기
            </button>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
            {/* Guide overlay */}
            <div className="absolute inset-4 border-2 border-dashed border-white/30 rounded-xl pointer-events-none flex items-center justify-center">
              <span className="text-[10px] text-white/50 bg-black/40 px-2 py-0.5 rounded font-medium">
                영역 안에 책을 맞춰주세요
              </span>
            </div>
          </>
        )}
      </div>

      {/* Capture Control Button */}
      <footer className="py-4 flex justify-center shrink-0">
        {!cameraError && (
          <button
            onClick={handleCaptureClick}
            disabled={isCapturing}
            className="w-16 h-16 bg-white active:bg-zinc-200 rounded-full border-4 border-zinc-700 flex items-center justify-center shadow-lg transition-transform active:scale-95 cursor-pointer"
            title="촬영"
          >
            <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center text-white">
              <Camera className="w-6 h-6" />
            </div>
          </button>
        )}
      </footer>
    </div>
  );
}

export default function UsedItemReturnsPage() {
  const currentUser = useAtomValue(currentUserAtom);
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [isbn, setIsbn] = useState("");
  const [isScannerActive, setIsScannerActive] = useState(false);
  const [isLoadingBook, setIsLoadingBook] = useState(false);
  const [bookInfo, setBookInfo] = useState<BookInfo | null>(null);
  const [inboundInfo, setInboundInfo] = useState<InboundInfo | null>(null);
  
  // Image Capture states
  const [photos, setPhotos] = useState<PhotoSlots>({ front: null, back: null, inside: null });
  const [activeCameraType, setActiveCameraType] = useState<PhotoType | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // AI Inspection states
  const [jobId, setJobId] = useState<string | null>(null);
  const { jobStatus, result, error: jobError, resetJobState } = useJobStatus(jobId);
  const [isInspectionTriggered, setIsInspectionTriggered] = useState(false);

  const { uploadImage, error: s3UploadError } = useS3Upload();

  const handleScan = async (scannedIsbn: string) => {
    setIsScannerActive(false);
    setIsbn(scannedIsbn);
    await fetchBook(scannedIsbn);
  };

  const fetchBook = async (targetIsbn: string) => {
    if (!targetIsbn.trim()) return;
    setIsLoadingBook(true);
    setUploadError(null);
    setBookInfo(null);
    setInboundInfo(null);

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

      // Generate LPN and register Used Inbound immediately to print label
      const idempotencyKey = crypto.randomUUID();
      const inbound = await createUsedItemInbound({
        mode: "NEW_RETURN",
        bookId: book.bookId,
        idempotencyKey,
      });

      setInboundInfo({
        inboundItemId: inbound.inboundItemId,
        lpnBarcode: inbound.lpnBarcode || `LPN-RET-${book.isbn}-${idempotencyKey.slice(0,4)}`,
        labelScanUrl: inbound.labelScanUrl,
      });

      // Advance to step 2 (photo taking)
      setCurrentStep(2);
    } catch (e: any) {
      console.error(e);
      setUploadError("도서 조회 및 입고 접수에 실패했습니다. 올바른 바코드를 사용했는지 확인해 주세요.");
    } finally {
      setIsLoadingBook(false);
    }
  };

  const handleCapturePhoto = (dataUrl: string) => {
    if (activeCameraType) {
      setPhotos((prev) => ({ ...prev, [activeCameraType]: dataUrl }));
      setActiveCameraType(null);
    }
  };

  // Convert base64 dataUrl to blob helper
  const dataUrlToBlob = (dataUrl: string): Blob => {
    const arr = dataUrl.split(",");
    const mime = arr[0].match(/:(.*?);/)?.[1] || "image/jpeg";
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  };

  const handleStartInspection = async () => {
    if (!bookInfo || !inboundInfo || !photos.front || !photos.back || !photos.inside) return;
    setIsUploading(true);
    setUploadError(null);
    setIsInspectionTriggered(false);

    try {
      let frontUrl = "https://placehold.co/front.jpg";
      let backUrl = "https://placehold.co/back.jpg";
      let insideUrl = "https://placehold.co/inside.jpg";

      if (!isMockMode()) {
        // Upload base64 files using useS3Upload
        const uploadResults = await Promise.all([
          (async () => {
            const blob = dataUrlToBlob(photos.front!);
            const file = new File([blob], `front_${Date.now()}.jpg`, { type: "image/jpeg" });
            const res = await uploadImage(file);
            if (!res) throw new Error(s3UploadError || "front 이미지 업로드에 실패했습니다.");
            return res.url;
          })(),
          (async () => {
            const blob = dataUrlToBlob(photos.back!);
            const file = new File([blob], `back_${Date.now()}.jpg`, { type: "image/jpeg" });
            const res = await uploadImage(file);
            if (!res) throw new Error(s3UploadError || "back 이미지 업로드에 실패했습니다.");
            return res.url;
          })(),
          (async () => {
            const blob = dataUrlToBlob(photos.inside!);
            const file = new File([blob], `inside_${Date.now()}.jpg`, { type: "image/jpeg" });
            const res = await uploadImage(file);
            if (!res) throw new Error(s3UploadError || "inside 이미지 업로드에 실패했습니다.");
            return res.url;
          })(),
        ]);

        frontUrl = uploadResults[0];
        backUrl = uploadResults[1];
        insideUrl = uploadResults[2];
      } else {
        // Simulate a small delay for S3 upload
        await new Promise((resolve) => setTimeout(resolve, 1500));
      }

      // Trigger AI multi-agent inspection
      const inspect = await startInspection({
        inboundItemId: inboundInfo.inboundItemId,
        bookId: bookInfo.bookId,
        mode: "NEW_RETURN",
        imagePaths: [frontUrl, backUrl, insideUrl],
      });

      // 즉시 PROCESSING 상태로 처리 리스트에 저장하고 다음 책으로 넘기기
      handleSaveToProcessedList("PROCESSING", inspect.jobId);
      toast.success("AI 검수 접수가 완료되었습니다. 다음 도서를 스캔해 주세요.");
    } catch (e: any) {
      console.error(e);
      setUploadError(e.message || "이미지 서버 전송 중 오류가 발생했습니다.");
    } finally {
      setIsUploading(false);
    }
  };

  // Re-check action triggered
  const handleStartRecheck = async () => {
    // Reset to step 2 to retake photos
    // Let's clear photos to let them retake
    setPhotos({ front: null, back: null, inside: null });
    setJobId(null);
    resetJobState();
    setIsInspectionTriggered(false);
    setCurrentStep(2);
  };

  // Final submit handler for processed books
  const handleSaveToProcessedList = (status: "APPROVED" | "REJECTED" | "PROCESSING", overrideJobId?: string) => {
    if (!bookInfo || !inboundInfo || !currentUser) return;
    const storageKey = `wms_worker_processed_list_${currentUser.employeeId}`;
    const stored = localStorage.getItem(storageKey);
    const list = stored ? JSON.parse(stored) : [];
    list.unshift({
      id: `inbound_${Date.now()}`,
      jobId: overrideJobId || jobId,
      title: bookInfo.title,
      publisher: bookInfo.publisher,
      isbn: bookInfo.isbn,
      lpn: inboundInfo.lpnBarcode,
      labelScanUrl: inboundInfo.labelScanUrl,
      type: "RETURNS",
      status: status,
      timestamp: new Date().toISOString(),
    });
    localStorage.setItem(storageKey, JSON.stringify(list.slice(0, 100)));
    handleReset();
  };

  const handleReset = () => {
    setIsbn("");
    setBookInfo(null);
    setInboundInfo(null);
    setPhotos({ front: null, back: null, inside: null });
    setJobId(null);
    resetJobState();
    setIsInspectionTriggered(false);
    setUploadError(null);
    setCurrentStep(1);
  };

  const isAllPhotosCaptured = !!(photos.front && photos.back && photos.inside);

  return (
    <div className="space-y-4 py-2 flex flex-col h-full max-w-md mx-auto font-sans">
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
        <h2 className="text-lg font-extrabold text-gray-800 dark:text-zinc-50 flex items-center gap-2">
          <RefreshCw className="w-5 h-5 text-emerald-500" />
          중고·반품 AI 검수 입고
        </h2>
        <p className="text-xs text-gray-400 dark:text-zinc-500">
          바코드 스캔 후 도서 상태 사진 3장을 촬영하여 AI 검수를 기동합니다.
        </p>
      </div>

      {/* Steps Indicator */}
      <div className="grid grid-cols-2 gap-2 shrink-0 py-1 text-center text-[10px] font-extrabold text-gray-400">
        <div className={`pb-1.5 border-b-2 transition-colors ${currentStep === 1 ? "border-emerald-500 text-emerald-600 font-black" : "border-gray-200 dark:border-zinc-800"}`}>
          1. 바코드 스캔
        </div>
        <div className={`pb-1.5 border-b-2 transition-colors ${currentStep === 2 ? "border-emerald-500 text-emerald-600 font-black" : "border-gray-200 dark:border-zinc-800"}`}>
          2. 사진 촬영 및 접수
        </div>
      </div>

      {/* Main Container */}
      <div className="flex-1 flex flex-col justify-between space-y-4">
        {currentStep === 1 && (
          /* Step 1: Barcode Scan */
          <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-3xl p-5 shadow-sm space-y-4 flex-1">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 dark:text-zinc-400">
                도서 바코드 스캔 (ISBN 또는 재촬영용 LPN/QR)
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="ISBN 또는 LPN 바코드 입력"
                    value={isbn}
                    onChange={(e) => setIsbn(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && fetchBook(isbn)}
                    className="w-full pl-9 pr-3 py-2.5 text-sm bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-800 rounded-xl focus:border-emerald-400 focus:outline-none dark:text-zinc-100"
                  />
                  <Barcode className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
                </div>
                <button
                  onClick={() => setIsScannerActive(!isScannerActive)}
                  className={`px-3.5 py-2.5 rounded-xl border font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer ${
                    isScannerActive
                      ? "bg-emerald-50 border-emerald-200 text-emerald-600"
                      : "bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 text-gray-600 dark:text-zinc-400 hover:bg-gray-50"
                  }`}
                >
                  <Camera className="w-4 h-4" />
                  카메라
                </button>
              </div>
            </div>

            {/* Barcode scanner camera stream */}
            {isScannerActive && (
              <div className="mt-2">
                <BarcodeScanner onScan={handleScan} isActive={isScannerActive} />
              </div>
            )}

            {isLoadingBook && (
              <div className="flex flex-col items-center justify-center py-12 space-y-2 text-xs text-gray-500">
                <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
                <span>도서 접수 처리 중...</span>
              </div>
            )}

            {uploadError && (
              <div className="flex items-start gap-2 bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-950/20 p-3 rounded-2xl text-xs font-medium">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{uploadError}</span>
              </div>
            )}
          </div>
        )}

        {currentStep === 2 && bookInfo && inboundInfo && (
          /* Step 2: 3 Photos Capture */
          <div className="flex-1 flex flex-col justify-between space-y-4">
            <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-3xl p-5 shadow-sm space-y-4">
              <div className="bg-emerald-50/40 dark:bg-emerald-950/10 border border-emerald-100/50 dark:border-emerald-950/20 rounded-2xl p-3 flex items-center justify-between text-xs">
                <div>
                  <h4 className="font-extrabold text-gray-800 dark:text-zinc-200">{bookInfo.title}</h4>
                  <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-bold font-mono">
                    LPN: {inboundInfo.lpnBarcode}
                  </span>
                </div>
                <button
                  onClick={handleReset}
                  className="px-2 py-1 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-[10px] text-gray-500 hover:text-gray-800 cursor-pointer font-bold"
                >
                  초기화
                </button>
              </div>

              {/* Photo capture slots */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 dark:text-zinc-400 block mb-1">
                  검수용 도서 사진 촬영 (앞면, 뒷면, 속지 총 3장)
                </label>

                <div className="grid grid-cols-3 gap-2">
                  {/* Front Photo Slot */}
                  <button
                    onClick={() => setActiveCameraType("front")}
                    className={`relative aspect-square border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-2 text-center transition-all cursor-pointer overflow-hidden ${
                      photos.front 
                        ? "border-emerald-500 bg-emerald-50/20" 
                        : "border-gray-200 dark:border-zinc-800 hover:border-emerald-400"
                    }`}
                  >
                    {photos.front ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={photos.front} alt="Front" className="absolute inset-0 w-full h-full object-cover rounded-xl" />
                    ) : (
                      <>
                        <Camera className="w-5 h-5 text-gray-400 mb-1" />
                        <span className="text-[10px] font-bold text-gray-700 dark:text-zinc-300">앞면 촬영</span>
                      </>
                    )}
                    {photos.front && (
                      <div className="absolute top-1 right-1 bg-emerald-500 text-white rounded-full p-0.5">
                        <Check className="w-2.5 h-2.5" />
                      </div>
                    )}
                  </button>

                  {/* Back Photo Slot */}
                  <button
                    onClick={() => setActiveCameraType("back")}
                    className={`relative aspect-square border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-2 text-center transition-all cursor-pointer overflow-hidden ${
                      photos.back 
                        ? "border-emerald-500 bg-emerald-50/20" 
                        : "border-gray-200 dark:border-zinc-800 hover:border-emerald-400"
                    }`}
                  >
                    {photos.back ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={photos.back} alt="Back" className="absolute inset-0 w-full h-full object-cover rounded-xl" />
                    ) : (
                      <>
                        <Camera className="w-5 h-5 text-gray-400 mb-1" />
                        <span className="text-[10px] font-bold text-gray-700 dark:text-zinc-300">뒷면 촬영</span>
                      </>
                    )}
                    {photos.back && (
                      <div className="absolute top-1 right-1 bg-emerald-500 text-white rounded-full p-0.5">
                        <Check className="w-2.5 h-2.5" />
                      </div>
                    )}
                  </button>

                  {/* Inside Photo Slot */}
                  <button
                    onClick={() => setActiveCameraType("inside")}
                    className={`relative aspect-square border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-2 text-center transition-all cursor-pointer overflow-hidden ${
                      photos.inside 
                        ? "border-emerald-500 bg-emerald-50/20" 
                        : "border-gray-200 dark:border-zinc-800 hover:border-emerald-400"
                    }`}
                  >
                    {photos.inside ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={photos.inside} alt="Inside" className="absolute inset-0 w-full h-full object-cover rounded-xl" />
                    ) : (
                      <>
                        <Camera className="w-5 h-5 text-gray-400 mb-1" />
                        <span className="text-[10px] font-bold text-gray-700 dark:text-zinc-300">속지 촬영</span>
                      </>
                    )}
                    {photos.inside && (
                      <div className="absolute top-1 right-1 bg-emerald-500 text-white rounded-full p-0.5">
                        <Check className="w-2.5 h-2.5" />
                      </div>
                    )}
                  </button>
                </div>
              </div>

              {uploadError && (
                <div className="flex items-start gap-2 bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-950/20 p-3 rounded-2xl text-xs font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{uploadError}</span>
                </div>
              )}
            </div>

            {/* Submit button (sticky bottom bar) */}
            <button
              onClick={handleStartInspection}
              disabled={!isAllPhotosCaptured || isUploading}
              className={`w-full font-bold py-3.5 rounded-2xl shadow-sm text-sm shrink-0 flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                isAllPhotosCaptured
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/15"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200 dark:bg-zinc-800 dark:border-zinc-800"
              }`}
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  이미지 업로드 중...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-emerald-100" />
                  AI 에이전트 검수 시작
                </>
              )}
            </button>
          </div>
        )}

        {/* Step 3 (AI 검수 결과 대기) UI 영역은 비동기 개선으로 인해 제거됨 */}
      </div>

      {/* Active Camera Overlay Modal */}
      {activeCameraType && (
        <CameraModal
          photoType={activeCameraType}
          onCapture={handleCapturePhoto}
          onClose={() => setActiveCameraType(null)}
        />
      )}
    </div>
  );
}
