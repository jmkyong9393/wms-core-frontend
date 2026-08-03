import { getGradeBadgeStyle, getGradeLabel } from '@/features/inspections/utils/gradeBadge';
import {
  INBOUND_STATUS_LABEL_KO,
  INBOUND_TYPE_LABEL_KO,
  INSPECTION_STATUS_LABEL_KO,
  INVENTORY_STATUS_LABEL_KO,
  REJECTED_ITEM_STATUS_LABEL_KO,
} from '@/features/lpnScan/utils/lpnScanLabels';
import type { LpnScanDetail } from '@/features/lpnScan/types/lpnScan';

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
  } = detail;

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-zinc-950 p-4">
      <div className="mx-auto max-w-sm space-y-4">
        <div className="rounded-2xl border border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 text-center shadow-sm">
          <p className="text-xs font-semibold text-gray-400 dark:text-zinc-500">LPN 스캔 상세</p>
          <h1 className="mt-1 text-lg font-bold text-gray-900 dark:text-zinc-100">{book.title}</h1>
          <p className="mt-1 text-xs text-gray-400 dark:text-zinc-500">{lpnBarcode}</p>

          {requiresRetake && (
            <p className="mt-3 inline-block rounded-full bg-amber-100 dark:bg-amber-950/30 px-3 py-1 text-xs font-semibold text-amber-700 dark:text-amber-400">
              재촬영 필요
            </p>
          )}

          {finalGrade && ubciScore !== null && (
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
