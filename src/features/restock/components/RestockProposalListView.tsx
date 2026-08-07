'use client';

import { useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type PaginationState,
  type SortingState,
} from '@tanstack/react-table';
import { DataGrid } from '@/components/common/data-grid/DataGrid';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useRestockProposalsQuery } from '@/features/restock/hooks/useRestockProposalsQuery';
import { createRestockProposalColumns } from '@/features/restock/components/restockProposalColumns';
import { RestockProposalDetailDialog } from '@/features/restock/components/RestockProposalDetailDialog';
import { getRestockStatusLabel } from '@/features/restock/utils/statusBadge';
import type { RestockProposalStatus } from '@/features/restock/types/restockProposal';

const STATUS_FILTER_ALL = 'ALL' as const;
const STATUS_FILTERS: readonly RestockProposalStatus[] = ['PENDING', 'APPROVED', 'REJECTED', 'NOT_REQUIRED'];

const PROPOSAL_ID_PARAM = 'proposalId';

// 관리자용 발주 추천안 목록 화면
export function RestockProposalListView() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // URL에서 현재 선택된 추천안 확인
  const selectedProposalId = searchParams.get(PROPOSAL_ID_PARAM);

  const [statusFilter, setStatusFilter] = useState<RestockProposalStatus | typeof STATUS_FILTER_ALL>(
    STATUS_FILTER_ALL
  );
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });

  const queryStatus = statusFilter === STATUS_FILTER_ALL ? undefined : statusFilter;
  const { data, isLoading, isError } = useRestockProposalsQuery(queryStatus);

  const openProposal = (id: string) => {
    const params = new URLSearchParams(searchParams);
    params.set(PROPOSAL_ID_PARAM, id);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const closeProposal = () => {
    const params = new URLSearchParams(searchParams);
    params.delete(PROPOSAL_ID_PARAM);
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  const columns = createRestockProposalColumns({ onOpenDetail: (row) => openProposal(row.id) });

  const table = useReactTable({
    data: data ?? [],
    columns,
    state: { sorting, pagination },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="max-w-[1600px] mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">발주 추천안</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Restock Agent가 생성한 대체 발주 추천안을 조회하고 승인 또는 반려합니다.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Select
          value={statusFilter}
          onValueChange={(value) => {
            setStatusFilter((value as RestockProposalStatus | typeof STATUS_FILTER_ALL) ?? STATUS_FILTER_ALL);
            setPagination((p) => ({ ...p, pageIndex: 0 }));
          }}
        >
          <SelectTrigger>
            <SelectValue>
              {(value: RestockProposalStatus | typeof STATUS_FILTER_ALL) =>
                value === STATUS_FILTER_ALL ? '전체 상태' : getRestockStatusLabel(value)
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={STATUS_FILTER_ALL}>전체 상태</SelectItem>
            {STATUS_FILTERS.map((status) => (
              <SelectItem key={status} value={status}>
                {getRestockStatusLabel(status)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <DataGrid
        table={table}
        isLoading={isLoading}
        isError={isError}
        onRowClick={(row) => openProposal(row.id)}
      />

      <RestockProposalDetailDialog proposalId={selectedProposalId} onClose={closeProposal} />
    </div>
  );
}
