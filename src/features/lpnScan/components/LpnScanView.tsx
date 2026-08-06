import { useState } from 'react';
import { Camera, RefreshCw, Loader2, AlertCircle, AlertTriangle, QrCode } from 'lucide-react';
import { getGradeBadgeStyle, getGradeLabel } from '@/features/inspections/utils/gradeBadge';
import {
  INBOUND_STATUS_LABEL_KO,
  INBOUND_TYPE_LABEL_KO,
  INSPECTION_STATUS_LABEL_KO,
  INVENTORY_STATUS_LABEL_KO,
  REJECTED_ITEM_STATUS_LABEL_KO,
} from '@/features/lpnScan/utils/lpnScanLabels';
import type { LpnScanDetail } from '@/features/lpnScan/types/lpnScan';
import { useCamera } from '@/features/inbound/hooks/useCamera';
import { useS3Upload } from '@/features/inbound/hooks/useS3Upload';
import { submitRecheck, isMockMode } from '@/services/returnService';

type PhotoType = 'front' | 'back' | 'inside';

// Camera Capture Modal Component
interface CameraModalProps {
  photoType: PhotoType;
  onCapture: (dataUrl: string) => void;
  onClose: () => void;
}

function CameraModal({ photoType, onCapture, onClose }: CameraModalProps) {
  const { videoRef, error: cameraError, stopCamera } = useCamera({ idealFacingMode: 'environment' });
  const [isCapturing, setIsCapturing] = useState(false);

  const labelMap = {
    front: '도서 앞면 (표지)',
    back: '도서 뒷면 (바코드 영역)',
    inside: '도서 속지 (도장/오염 확인)',
  };

  const handleCaptureClick = () => {
    if (!videoRef.current || isCapturing) return;
    setIsCapturing(true);
    try {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        onCapture(dataUrl);
      }
    } catch (e) {
      console.error('Capture failed:', e);
    } finally {
      setIsCapturing(false);
    }
  };

  const handleSimulateCapture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const grad = ctx.createLinearGradient(0, 0, 640, 480);
      grad.addColorStop(0, photoType === 'front' ? '#4f46e5' : photoType === 'back' ? '#059669' : '#d97706');
      grad.addColorStop(1, '#1f2937');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 640, 480);
      
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 24px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`MOCK ${photoType.toUpperCase()} CAPTURE`, 320, 240);
      
      const dataUrl = canvas.toDataURL('image/jpeg');
      onCapture(dataUrl);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex flex-col justify-between p-4 font-sans text-white">
      <header className="flex justify-between items-center py-2">
        <h4 className="text-sm font-bold">{labelMap[photoType]} 촬영</h4>
        <button 
          onClick={() => {
            stopCamera();
            onClose();
          }}
          className="text-xs font-semibold px-3 py-1.5 bg-zinc-800 rounded-lg hover:bg-zinc-700 text-white cursor-pointer"
        >
          닫기
        </button>
      </header>

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
            <div className="absolute inset-4 border-2 border-dashed border-white/30 rounded-xl pointer-events-none flex items-center justify-center">
              <span className="text-[10px] text-white/50 bg-black/40 px-2 py-1 rounded">
                가이드 라인에 맞추어 주세요
              </span>
            </div>
          </>
        )}
      </div>

      <footer className="flex justify-center items-center py-4">
        {!cameraError && (
          <button
            onClick={handleCaptureClick}
            disabled={isCapturing}
            className="w-16 h-16 rounded-full bg-white border-4 border-zinc-300 flex items-center justify-center hover:bg-zinc-150 transition-colors cursor-pointer"
          >
            <div className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center">
              <Camera className="w-6 h-6 text-white" />
            </div>
          </button>
        )}
      </footer>
    </div>
  );
}

interface LpnScanViewProps {
  detail: LpnScanDetail;
}

// 창고 직원용 LPN 상세 화면
export default function LpnScanView({ detail }: LpnScanViewProps) {
  const {
    lpnBarcode,
    book,
    inboundType,
    inboundStatus,
    inspectionStatus,
    finalGrade,
    ubciScore,
    inventoryStatus,
    rejectedItemStatus,
    location,
    requiresRetake,
    returnJobId, // 추가: 재촬영용 검수 ID
  } = detail;

  // 재촬영용 사진 마법사 상태 정의
  const [isPhotoWizardOpen, setIsPhotoWizardOpen] = useState(false);
  const [activeCameraType, setActiveCameraType] = useState<PhotoType | null>(null);
  const [photos, setPhotos] = useState<{ front: string | null; back: string | null; inside: string | null }>({
    front: null,
    back: null,
    inside: null,
  });
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const { uploadImage, error: s3UploadError } = useS3Upload();

  const handleCapturePhoto = (dataUrl: string) => {
    if (activeCameraType) {
      setPhotos((prev) => ({ ...prev, [activeCameraType]: dataUrl }));
      setActiveCameraType(null);
    }
  };

  // Convert base64 dataUrl to blob helper
  const dataUrlToBlob = (dataUrl: string): Blob => {
    const arr = dataUrl.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  };

  // 재촬영 등록 및 제출 핸들러
  const handleRecheckSubmit = async () => {
    if (!returnJobId || !photos.front || !photos.back || !photos.inside) return;
    setIsUploading(true);
    setUploadError(null);

    try {
      let frontUrl = 'https://placehold.co/front.jpg';
      let backUrl = 'https://placehold.co/back.jpg';
      let insideUrl = 'https://placehold.co/inside.jpg';

      if (!isMockMode()) {
        const uploadResults = await Promise.all([
          (async () => {
            const blob = dataUrlToBlob(photos.front!);
            const file = new File([blob], `recheck_front_${Date.now()}.jpg`, { type: 'image/jpeg' });
            const res = await uploadImage(file);
            if (!res) throw new Error(s3UploadError || '앞면 이미지 업로드 실패');
            return res.url;
          })(),
          (async () => {
            const blob = dataUrlToBlob(photos.back!);
            const file = new File([blob], `recheck_back_${Date.now()}.jpg`, { type: 'image/jpeg' });
            const res = await uploadImage(file);
            if (!res) throw new Error(s3UploadError || '뒷면 이미지 업로드 실패');
            return res.url;
          })(),
          (async () => {
            const blob = dataUrlToBlob(photos.inside!);
            const file = new File([blob], `recheck_inside_${Date.now()}.jpg`, { type: 'image/jpeg' });
            const res = await uploadImage(file);
            if (!res) throw new Error(s3UploadError || '속지 이미지 업로드 실패');
            return res.url;
          })(),
        ]);

        frontUrl = uploadResults[0];
        backUrl = uploadResults[1];
        insideUrl = uploadResults[2];
      } else {
        // Mock 딜레이
        await new Promise((resolve) => setTimeout(resolve, 1500));
      }

      const res = await submitRecheck(returnJobId, [frontUrl, backUrl, insideUrl]);
      
      // SSE 스트림 티켓 토큰을 추출해 기존 검수 진행률 화면으로 라우팅
      try {
        let ticketToken = '';
        if (res.streamTicketUrl.startsWith('http')) {
          const ticketUrl = new URL(res.streamTicketUrl);
          ticketToken = ticketUrl.searchParams.get('ticket') || '';
        } else {
          // 상대 경로일 경우 쿼리 파라미터 파싱
          const match = res.streamTicketUrl.match(/[?&]ticket=([^&]+)/);
          ticketToken = match ? match[1] : '';
        }
        
        if (ticketToken) {
          window.location.href = `/worker/inbound/returns?ticket=${ticketToken}`;
          return;
        }
      } catch (err) {
        console.error('Ticket parsing failed:', err);
      }
      
      // 파싱 실패 혹은 Mock 모드 시 기본 라우팅 폴백
      window.location.href = '/worker/inbound/returns';
    } catch (e: any) {
      console.error(e);
      setUploadError(e.message || '재촬영 전송 중 오류가 발생했습니다.');
    } finally {
      setIsUploading(false);
    }
  };

  const isAllPhotosTaken = !!photos.front && !!photos.back && !!photos.inside;

  // 사진 촬영 마법사가 활성화되었을 때의 렌더링 분기
  if (isPhotoWizardOpen) {
    return (
      <main className="min-h-screen bg-gray-50 dark:bg-zinc-950 p-4 font-sans text-gray-800 dark:text-zinc-100">
        <div className="mx-auto max-w-sm space-y-4">
          <div className="rounded-2xl border border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm">
            <h1 className="text-base font-bold text-gray-900 dark:text-zinc-100">재촬영 진행 ({book.title})</h1>
            <p className="mt-1 text-xs text-gray-400 dark:text-zinc-500">기존 스캔 LPN: {lpnBarcode}</p>

            {uploadError && (
              <div className="mt-4 p-3 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 text-xs rounded-xl flex items-start gap-2 border border-red-100 dark:border-red-950/50">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{uploadError}</span>
              </div>
            )}

            <div className="mt-6 space-y-4">
              {/* 촬영 카드 목록 */}
              <div className="grid grid-cols-3 gap-3">
                {(['front', 'back', 'inside'] as const).map((type) => {
                  const label = type === 'front' ? '앞면(표지)' : type === 'back' ? '뒷면(바코드)' : '속지(도장)';
                  const hasPhoto = !!photos[type];
                  return (
                    <div key={type} className="flex flex-col items-center">
                      <button
                        onClick={() => setActiveCameraType(type)}
                        disabled={isUploading}
                        className={`w-24 h-24 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center relative overflow-hidden transition-all cursor-pointer ${
                          hasPhoto 
                            ? 'border-indigo-500 bg-indigo-50/10' 
                            : 'border-gray-200 dark:border-zinc-800 hover:border-gray-300 dark:hover:border-zinc-700'
                        }`}
                      >
                        {hasPhoto ? (
                          <>
                            <img src={photos[type]!} alt={label} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                              <Camera className="w-5 h-5 text-white" />
                            </div>
                          </>
                        ) : (
                          <div className="flex flex-col items-center space-y-1 text-gray-400 dark:text-zinc-500">
                            <Camera className="w-5 h-5" />
                            <span className="text-[9px]">{label}</span>
                          </div>
                        )}
                      </button>
                      <span className="text-[10px] mt-1.5 text-gray-500 dark:text-zinc-400">{label}</span>
                    </div>
                  );
                })}
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  onClick={() => setIsPhotoWizardOpen(false)}
                  disabled={isUploading}
                  className="flex-1 py-3 text-xs bg-gray-100 hover:bg-gray-150 dark:bg-zinc-800 dark:hover:bg-zinc-750 font-bold rounded-xl text-gray-600 dark:text-zinc-350 cursor-pointer"
                >
                  취소
                </button>
                <button
                  onClick={handleRecheckSubmit}
                  disabled={!isAllPhotosTaken || isUploading}
                  className={`flex-1 py-3 text-xs font-bold rounded-xl text-white flex items-center justify-center gap-1.5 cursor-pointer ${
                    isAllPhotosTaken && !isUploading
                      ? 'bg-indigo-600 hover:bg-indigo-700 shadow-md'
                      : 'bg-gray-300 dark:bg-zinc-800 text-gray-400 dark:text-zinc-600 cursor-not-allowed'
                  }`}
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>전송 및 분석중...</span>
                    </>
                  ) : (
                    <>
                      <span>재검수 요청 제출</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {activeCameraType && (
          <CameraModal
            photoType={activeCameraType}
            onCapture={handleCapturePhoto}
            onClose={() => setActiveCameraType(null)}
          />
        )}
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-zinc-950 p-4 font-sans text-gray-800 dark:text-zinc-100">
      <div className="mx-auto max-w-sm space-y-4">
        <div className="rounded-2xl border border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 text-center shadow-sm">
          <p className="text-xs font-semibold text-gray-400 dark:text-zinc-500">LPN 스캔 상세</p>
          <h1 className="mt-1 text-lg font-bold text-gray-900 dark:text-zinc-100">{book.title}</h1>
          <p className="mt-1 text-xs text-gray-400 dark:text-zinc-500">{lpnBarcode}</p>

          {/* 재촬영 상태 카드 및 버튼 트리거 */}
          {requiresRetake ? (
            <div className="mt-5 p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-950/50 rounded-2xl space-y-3">
              <div className="flex items-center gap-1.5 justify-center">
                <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span className="text-xs font-bold text-amber-700 dark:text-amber-400">품질 재확인(재촬영) 필요</span>
              </div>
              <p className="text-[10px] leading-relaxed text-amber-650/80 dark:text-amber-400/80">
                도서의 상태가 불분명하거나 판독 오류로 인해 다시 촬영해야 합니다. 아래 버튼을 눌러 촬영을 새로 진행해 주세요.
              </p>
              <button
                onClick={() => setIsPhotoWizardOpen(true)}
                className="w-full py-2.5 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white rounded-xl shadow-sm transition-colors cursor-pointer"
              >
                재촬영 시작
              </button>
            </div>
          ) : (
            inspectionStatus === 'RECHECK_REQUIRED' && (
              <p className="mt-3 inline-block rounded-full bg-amber-100 dark:bg-amber-950/30 px-3 py-1 text-xs font-semibold text-amber-700 dark:text-amber-400">
                재촬영 필요
              </p>
            )
          )}

          {finalGrade && ubciScore !== null && !requiresRetake && (
            <div className="mt-6 space-y-4">
              <span
                className={`inline-block rounded-full px-3 py-1 text-sm font-semibold ${getGradeBadgeStyle(finalGrade)}`}
              >
                {getGradeLabel(finalGrade)}
              </span>
              <div>
                <p className="text-xs text-gray-400 dark:text-zinc-500">UBCI 점수</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-zinc-100">{ubciScore}</p>
              </div>
            </div>
          )}
        </div>

        <section className="rounded-2xl border border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-800 dark:text-zinc-200">도서 정보</h2>
          <dl className="mt-3 space-y-2">
            <div>
              <dt className="text-xs text-gray-400 dark:text-zinc-500">ISBN</dt>
              <dd className="text-sm text-gray-700 dark:text-zinc-300">{book.isbn}</dd>
            </div>
            {book.publisher && (
              <div>
                <dt className="text-xs text-gray-400 dark:text-zinc-500">출판사</dt>
                <dd className="text-sm text-gray-700 dark:text-zinc-300">{book.publisher}</dd>
              </div>
            )}
          </dl>
        </section>

        <section className="rounded-2xl border border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-800 dark:text-zinc-200">입고 · 검수 상태</h2>
          <dl className="mt-3 space-y-2">
            <div>
              <dt className="text-xs text-gray-400 dark:text-zinc-500">입고 유형</dt>
              <dd className="text-sm text-gray-700 dark:text-zinc-300">{INBOUND_TYPE_LABEL_KO[inboundType]}</dd>
            </div>
            <div>
              <dt className="text-xs text-gray-400 dark:text-zinc-500">입고 상태</dt>
              <dd className="text-sm text-gray-700 dark:text-zinc-300">{INBOUND_STATUS_LABEL_KO[inboundStatus]}</dd>
            </div>
            {inspectionStatus && (
              <div>
                <dt className="text-xs text-gray-400 dark:text-zinc-500">검수 상태</dt>
                <dd className="text-sm text-gray-700 dark:text-zinc-300">
                  {INSPECTION_STATUS_LABEL_KO[inspectionStatus]}
                </dd>
              </div>
            )}
            {inventoryStatus && (
              <div>
                <dt className="text-xs text-gray-400 dark:text-zinc-500">재고 상태</dt>
                <dd className="text-sm text-gray-700 dark:text-zinc-300">
                  {INVENTORY_STATUS_LABEL_KO[inventoryStatus]}
                </dd>
              </div>
            )}
            {rejectedItemStatus && (
              <div>
                <dt className="text-xs text-gray-400 dark:text-zinc-500">반려 상태</dt>
                <dd className="text-sm text-gray-700 dark:text-zinc-300">
                  {REJECTED_ITEM_STATUS_LABEL_KO[rejectedItemStatus]}
                </dd>
              </div>
            )}
          </dl>
        </section>

        {location && (
          <section className="rounded-2xl border border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-800 dark:text-zinc-200">보관 로케이션</h2>
            <dl className="mt-3 space-y-2">
              <div>
                <dt className="text-xs text-gray-400 dark:text-zinc-500">위치 바코드</dt>
                <dd className="text-sm text-gray-700 dark:text-zinc-300">{location.barcode}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-400 dark:text-zinc-500">구역 · 랙 · 선반</dt>
                <dd className="text-sm text-gray-700 dark:text-zinc-300">
                  {location.zone} · {location.rack} · {location.shelf}
                </dd>
              </div>
            </dl>
          </section>
        )}
      </div>
    </main>
  );
}
