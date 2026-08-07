'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  getCoreRowModel,
  useReactTable,
  type PaginationState,
} from '@tanstack/react-table';
import { DataGrid } from '@/components/common/data-grid/DataGrid';
import { useOrderListQuery } from '@/features/orders/hooks/useOrderListQuery';
import { pickingStatusColumns } from '@/features/picking/components/pickingStatusColumns';
import { getOrderStatusLabel } from '@/features/orders/utils/orderStatusLabel';
import type { OutboundOrderStatus } from '@/features/orders/types/order';
import { cn } from '@/lib/utils';

const DEFAULT_PAGE_SIZE = 20;
const STATUS_TABS: OutboundOrderStatus[] = ['SHIPPED', 'PENDING', 'PICKING'];
const DEFAULT_STATUS: OutboundOrderStatus = 'PENDING';

function isOutboundOrderStatus(value: string | null): value is OutboundOrderStatus {
  return STATUS_TABS.includes(value as OutboundOrderStatus);
}

// 관리자용 피킹 현황 목록 - 대기/진행중/완료 탭을 전환해 조회
// 현재 탭은 URL 쿼리(?status=)에 반영해, 상세 화면에서 돌아왔을 때 원래 보던 탭을 유지한다
export function PickingStatusListView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const statusParam = searchParams.get('status');
  const activeStatus: OutboundOrderStatus = isOutboundOrderStatus(statusParam) ? statusParam : DEFAULT_STATUS;

  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: DEFAULT_PAGE_SIZE });

  const params = {
    status: activeStatus,
    page: pagination.pageIndex + 1,
    size: pagination.pageSize,
  };
  const { data, isLoading, isError, isFetching } = useOrderListQuery(params);

  // 응답의 total_pages를 벗어난 페이지에 머무르지 않도록 보정 (빈 결과 등)
  useEffect(() => {
    if (!data) return;
    const maxIndex = Math.max(0, data.total_pages - 1);
    if (pagination.pageIndex > maxIndex) {
      setPagination((p) => ({ ...p, pageIndex: maxIndex }));
    }
  }, [data, pagination.pageIndex]);

  const table = useReactTable({
    data: data?.items ?? [],
    columns: pickingStatusColumns,
    state: { pagination },
    onPaginationChange: setPagination,
    manualPagination: true,
    pageCount: data?.total_pages ?? 0,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="max-w-[1600px] mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">피킹 현황</h2>
        <p className="text-sm text-muted-foreground mt-1">
          출고 주문의 피킹 대기·진행·완료 현황을 조회합니다.
        </p>
      </div>

      <div className="flex gap-1 border-b border-border">
        {STATUS_TABS.map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => {
              router.replace(`/admin/picking?status=${status}`);
              setPagination((p) => ({ ...p, pageIndex: 0 }));
            }}
            className={cn(
              'px-4 py-2 text-sm font-semibold border-b-2 -mb-px transition-colors',
              activeStatus === status
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
          >
            {getOrderStatusLabel(status)}
          </button>
        ))}
      </div>

      <p className="text-xs text-muted-foreground">행을 클릭하면 상세 정보를 볼 수 있습니다.</p>
      <DataGrid
        table={table}
        isLoading={isLoading}
        isError={isError}
        isFetching={isFetching}
        onRowClick={(row) => router.push(`/admin/picking/${row.id}?status=${activeStatus}`)}
      />
    </div>
  );
}
