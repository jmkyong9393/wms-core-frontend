import Link from 'next/link';
import { AlertTriangle, ArrowLeft, PackageCheck } from 'lucide-react';
import { formatKstDateTime } from '@/lib/date';
import type { ShipmentConfirmResponse } from '@/features/picking/types/picking';

interface WaybillPreviewProps {
  result: ShipmentConfirmResponse;
  backHref?: string;
}

function ContactBlock({ label, name, phone, postalCode, address }: {
  label: string;
  name: string;
  phone: string;
  postalCode: string | null;
  address: string | null;
}) {
  return (
    <div className="space-y-0.5">
      <p className="text-[11px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wide">{label}</p>
      <p className="text-sm font-semibold text-gray-800 dark:text-zinc-100">{name}</p>
      <p className="text-xs text-gray-500 dark:text-zinc-400">{phone}</p>
      {(postalCode || address) && (
        <p className="text-xs text-gray-500 dark:text-zinc-400">
          {postalCode ? `[${postalCode}] ` : ''}
          {address ?? ''}
        </p>
      )}
    </div>
  );
}

// 출고 확정 완료 후 표시하는 Mock 송장 미리보기
export function WaybillPreview({ result, backHref = '/outbound/picking' }: WaybillPreviewProps) {
  const { shipping_label: label } = result;

  return (
    <div className="w-full max-w-md mx-auto flex flex-col gap-4">
      <div className="flex flex-col items-center text-center py-4">
        <PackageCheck className="h-14 w-14 text-green-600 dark:text-green-400 mb-3" />
        <h1 className="text-xl font-bold text-gray-900 dark:text-zinc-100">출고가 확정되었습니다</h1>
        <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">주문 번호 {result.order_id}</p>
      </div>

      {label.is_demo && (
        <div className="flex items-center gap-2 text-xs text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-xl px-3 py-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
          <span>실제 배송 요청이 아닌 데모용(Mock) 송장입니다.</span>
        </div>
      )}

      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-gray-900 dark:text-zinc-100">{label.title}</h2>
          <span className="text-xs font-semibold text-gray-500 dark:text-zinc-400">{result.shipping_carrier}</span>
        </div>

        <div className="space-y-0.5">
          <p className="text-[11px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wide">송장 번호</p>
          <p className="text-sm font-mono font-bold text-gray-800 dark:text-zinc-100">{result.waybill_number}</p>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs text-gray-500 dark:text-zinc-400">
          <div>
            <p className="text-[11px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wide">집화일</p>
            <p className="mt-0.5">{label.collected_date}</p>
          </div>
          <div>
            <p className="text-[11px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wide">출고 완료 시각</p>
            <p className="mt-0.5">{formatKstDateTime(result.shipped_at)}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 pt-2 border-t border-gray-100 dark:border-zinc-800">
          <ContactBlock
            label="보내는 분"
            name={label.sender.name}
            phone={label.sender.phone}
            postalCode={label.sender.postal_code}
            address={label.sender.address}
          />
          <ContactBlock
            label="받는 분"
            name={label.recipient.name}
            phone={label.recipient.phone}
            postalCode={label.recipient.postal_code}
            address={label.recipient.address}
          />
        </div>

        <div className="pt-2 border-t border-gray-100 dark:border-zinc-800">
          <p className="text-[11px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wide mb-1.5">송장 바코드</p>
          {/* 바코드 렌더링 라이브러리 미도입 - 모노스페이스 텍스트로 표시 */}
          <div className="bg-gray-900 text-white text-center font-mono text-sm tracking-widest py-3 rounded-lg select-all">
            {result.waybill_barcode}
          </div>
        </div>
      </div>

      <Link
        href={backHref}
        className="w-full h-12 flex items-center justify-center gap-1.5 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm font-bold text-gray-700 dark:text-zinc-200 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        피킹 목록으로 돌아가기
      </Link>
    </div>
  );
}
