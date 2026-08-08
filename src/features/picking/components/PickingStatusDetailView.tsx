'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { isAxiosError } from 'axios';
import { ArrowLeft, Barcode, Loader2, MapPin } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { usePickingInstructionQuery } from '@/features/picking/hooks/usePickingInstructionQuery';
import { useConfirmShipmentMutation } from '@/features/picking/hooks/usePickingMutations';
import { WaybillPreview } from '@/features/picking/components/WaybillPreview';
import { flattenPickingGroups } from '@/features/picking/utils/flattenPickingGroups';
import { getGradeBadgeStyle, getGradeLabel } from '@/features/inspections/utils/gradeBadge';
import { getOrderStatusLabel } from '@/features/orders/utils/orderStatusLabel';
import { formatCurrencyKRW } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { ShipmentConfirmResponse } from '@/features/picking/types/picking';

interface PickingStatusDetailViewProps {
  orderId: string;
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-border last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-semibold text-foreground">{value}</span>
    </div>
  );
}

function BackToListLink({ href }: { href: string }) {
  return (
    <Link
      href={href}
      className="w-full h-11 flex items-center justify-center gap-1.5 rounded-xl border border-border bg-card text-sm font-bold text-foreground hover:bg-accent transition-colors"
    >
      <ArrowLeft className="w-4 h-4" />
      피킹 현황 목록으로 돌아가기
    </Link>
  );
}

// 관리자용 피킹 상세 - 스캔/확정 조작 없이 대기/진행/완료 상태별 피킹 결과를 조회
export function PickingStatusDetailView({ orderId }: PickingStatusDetailViewProps) {
  const { data, isLoading, isError, error } = usePickingInstructionQuery(orderId);
  const confirmShipmentMutation = useConfirmShipmentMutation(orderId);

  // 목록에서 어떤 탭으로 들어왔는지(?status=) 기억해뒀다가 돌아갈 때 같은 탭으로 이동시킨다
  const searchParams = useSearchParams();
  const fromStatus = searchParams.get('status');
  const backHref = fromStatus ? `/admin/picking?status=${fromStatus}` : '/admin/picking';

  const [shipmentResult, setShipmentResult] = useState<ShipmentConfirmResponse | null>(null);

  // 피킹 지시서가 아직 없는 PENDING 주문은 409로 응답한다 (outbound.py: PICKING 진입 전에는 지시서 없음)
  const isNotStartedYet = isAxiosError(error) && error.response?.status === 409;

  const items = useMemo(() => (data ? flattenPickingGroups(data.picking_groups) : []), [data]);
  const totalItemUnits = useMemo(() => items.reduce((acc, item) => acc + item.quantity, 0), [items]);
  const totalPickedUnits = useMemo(() => items.reduce((acc, item) => acc + item.picked_quantity, 0), [items]);

  // SHIPPED 건은 진입 시 항상 송장 정보를 다시 조회한다 (백엔드는 재호출을 멱등 처리)
  useEffect(() => {
    if (data?.status === 'SHIPPED' && !shipmentResult && !confirmShipmentMutation.isPending) {
      confirmShipmentMutation.mutate(undefined, { onSuccess: setShipmentResult });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.status, shipmentResult]);

  return (
    <div className="max-w-xl mx-auto space-y-4">
      {isLoading && <p className="text-sm text-muted-foreground">불러오는 중...</p>}

      {isNotStartedYet && (
        <div className="space-y-4">
          <Card className="p-5 space-y-1">
            <InfoRow label="주문번호" value={<span className="font-mono">{orderId}</span>} />
            <InfoRow label="상태" value={getOrderStatusLabel('PENDING')} />
          </Card>
          <p className="text-sm text-muted-foreground text-center py-2">
            이 주문은 아직 피킹이 시작되지 않았습니다.
          </p>
          <BackToListLink href={backHref} />
        </div>
      )}

      {isError && !isNotStartedYet && (
        <p className="text-sm text-red-600 dark:text-red-400">피킹 상세 정보를 불러오지 못했습니다.</p>
      )}

      {data && (
        <>
          <Card className="p-5 space-y-1">
            <InfoRow label="주문번호" value={<span className="font-mono">{data.order_id}</span>} />
            <InfoRow label="상태" value={getOrderStatusLabel(data.status)} />
            <InfoRow label="총 금액" value={formatCurrencyKRW(data.total_price)} />
            <InfoRow label="추천 박스" value={data.recommended_box} />
          </Card>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-foreground">
                {data.status === 'PICKING' ? '피킹 진행 항목' : '피킹 완료 항목'}
              </h3>
              <span className="text-xs text-muted-foreground">
                {items.length}개 대상 / {totalPickedUnits}권{data.status === 'PICKING' ? ` / ${totalItemUnits}권` : ''}
              </span>
            </div>
            {items.map((item) => (
              <div
                key={item.allocation_id}
                className="flex items-center justify-between p-3 rounded-xl border border-border bg-card"
              >
                <div className="min-w-0">
                  <p className="flex items-center gap-1 font-medium text-foreground truncate">
                    <Barcode className="w-3.5 h-3.5 shrink-0 text-muted-foreground" />
                    {item.isbn ?? item.lpn_barcode ?? item.allocation_id}
                  </p>
                  <p className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="w-3 h-3 shrink-0" />
                    {item.zone}-{item.rack}-{item.shelf}
                  </p>
                </div>
                <div className="flex items-center gap-2 pl-3 shrink-0">
                  {item.condition_grade && (
                    <span
                      className={cn(
                        'px-2 py-0.5 rounded-full text-[11px] font-semibold',
                        getGradeBadgeStyle(item.condition_grade)
                      )}
                    >
                      {getGradeLabel(item.condition_grade)}
                    </span>
                  )}
                  <span
                    className={cn(
                      'text-sm font-bold',
                      item.picked_quantity >= item.quantity
                        ? 'text-green-700 dark:text-green-400'
                        : 'text-orange-600 dark:text-orange-400'
                    )}
                  >
                    {item.picked_quantity}/{item.quantity}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {data.status === 'PICKING' && <BackToListLink href={backHref} />}

          {data.status === 'SHIPPED' &&
            (shipmentResult ? (
              <WaybillPreview result={shipmentResult} backHref={backHref} />
            ) : (
              <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin mb-2" />
                <p className="text-sm">송장 정보를 불러오는 중...</p>
              </div>
            ))}
        </>
      )}
    </div>
  );
}
