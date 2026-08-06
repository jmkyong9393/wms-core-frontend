'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type PaginationState,
  type SortingState,
} from '@tanstack/react-table';
import { DataGrid } from '@/components/common/data-grid/DataGrid';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useInspectionHistoryQuery } from '@/features/inspections/hooks/useInspectionHistoryQuery';
import { listInspectionHistory } from '@/features/inspections/api/inspectionHistoryService';
import { createInspectionHistoryColumns } from '@/features/inspections/components/inspectionHistoryColumns';
import { InspectionHistoryDetailDialog } from '@/features/inspections/components/InspectionHistoryDetailDialog';
import {
  BOOK_GRADES,
  INSPECTION_STATUSES,
  type BookGrade,
  type InspectionStatus,
} from '@/features/inspections/types/inspection';
import { getGradeLabel } from '@/features/inspections/utils/gradeBadge';
import { getStatusLabel } from '@/features/inspections/utils/statusBadge';
import type { InspectionHistoryListParams, InspectionHistoryRow } from '@/features/inspections/types/inspectionHistory';
import { toInspectionHistoryExportRow } from '@/features/inspections/utils/toInspectionHistoryExportRow';
import { exportRowsToCsv, exportRowsToXlsx } from '@/lib/export/tableExport';
import { fetchAllPages } from '@/lib/api/fetchAllPages';

const GRADE_FILTER_ALL = 'ALL' as const;
const STATUS_FILTER_ALL = 'ALL' as const;

const EXPORT_FILENAME = '검수_이력';
const DEFAULT_PAGE_SIZE = 20;

export function InspectionHistoryGridView() {
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState<InspectionStatus | typeof STATUS_FILTER_ALL>(STATUS_FILTER_ALL);
  const [gradeFilter, setGradeFilter] = useState<BookGrade | typeof GRADE_FILTER_ALL>(GRADE_FILTER_ALL);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: DEFAULT_PAGE_SIZE });
  const [selectedRow, setSelectedRow] = useState<InspectionHistoryRow | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const resetToFirstPage = () => setPagination((p) => ({ ...p, pageIndex: 0 }));

  const activeFilters = useMemo(
    () => ({
      keyword: keyword.trim() || undefined,
      status: statusFilter === STATUS_FILTER_ALL ? undefined : statusFilter,
      grade: gradeFilter === GRADE_FILTER_ALL ? undefined : gradeFilter,
      start_date: dateFrom || undefined,
      // 종료일 전체를 포함하도록 하루의 마지막 시각으로 변환
      end_date: dateTo ? `${dateTo}T23:59:59` : undefined,
    }),
    [keyword, statusFilter, gradeFilter, dateFrom, dateTo]
  );

  const params: InspectionHistoryListParams = {
    ...activeFilters,
    page: pagination.pageIndex + 1,
    size: pagination.pageSize,
  };

  const { data, isLoading, isError, isFetching } = useInspectionHistoryQuery(params);

  // 현재 페이지가 전체 페이지 수를 넘으면 마지막 페이지로 이동
  useEffect(() => {
    if (!data) return;
    const maxIndex = Math.max(0, data.total_pages - 1);
    if (pagination.pageIndex > maxIndex) {
      setPagination((p) => ({ ...p, pageIndex: maxIndex }));
    }
  }, [data, pagination.pageIndex]);

  const columns = useMemo(
    () => createInspectionHistoryColumns({ onOpenDetail: setSelectedRow }),
    [],
  );

  const table = useReactTable({
    data: data?.items ?? [],
    columns,
    state: { sorting, pagination },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    manualPagination: true,
    pageCount: data?.total_pages ?? 0,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const canExport = (data?.total ?? 0) > 0 && !isExporting;

  async function handleExport(kind: 'csv' | 'xlsx') {
    setExportError(null);
    setIsExporting(true);
    try {
      const allRows = await fetchAllPages((page, size) =>
        listInspectionHistory({ ...activeFilters, page, size })
      );
      const exportRows = allRows.map(toInspectionHistoryExportRow);
      if (kind === 'csv') {
        await exportRowsToCsv(EXPORT_FILENAME, exportRows);
      } else {
        await exportRowsToXlsx(EXPORT_FILENAME, exportRows);
      }
    } catch {
      setExportError('내보내기에 실패했습니다. 다시 시도해 주세요.');
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">검수 이력</h2>
        <p className="text-sm text-muted-foreground mt-1">
          AI Agent 검수 결과 이력을 조회합니다. 행을 클릭하면 단계별 로그를 확인할 수 있습니다.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Input
          value={keyword}
          onChange={(e) => {
            setKeyword(e.target.value);
            resetToFirstPage();
          }}
          placeholder="도서명 검색"
          className="max-w-xs"
        />
        <Select
          value={gradeFilter}
          onValueChange={(value) => {
            setGradeFilter(value as BookGrade | typeof GRADE_FILTER_ALL);
            resetToFirstPage();
          }}
        >
          <SelectTrigger>
            <SelectValue>
              {(value: BookGrade | typeof GRADE_FILTER_ALL) =>
                value === GRADE_FILTER_ALL ? '전체 등급' : getGradeLabel(value)
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={GRADE_FILTER_ALL}>전체 등급</SelectItem>
            {BOOK_GRADES.map((grade) => (
              <SelectItem key={grade} value={grade}>
                {getGradeLabel(grade)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={statusFilter}
          onValueChange={(value) => {
            setStatusFilter(value as InspectionStatus | typeof STATUS_FILTER_ALL);
            resetToFirstPage();
          }}
        >
          <SelectTrigger>
            <SelectValue>
              {(value: InspectionStatus | typeof STATUS_FILTER_ALL) =>
                value === STATUS_FILTER_ALL ? '전체 상태' : getStatusLabel(value)
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={STATUS_FILTER_ALL}>전체 상태</SelectItem>
            {INSPECTION_STATUSES.map((status) => (
              <SelectItem key={status} value={status}>
                {getStatusLabel(status)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          type="date"
          value={dateFrom}
          onChange={(e) => {
            setDateFrom(e.target.value);
            resetToFirstPage();
          }}
          className="max-w-[160px]"
        />
        <span className="text-sm text-muted-foreground">~</span>
        <Input
          type="date"
          value={dateTo}
          onChange={(e) => {
            setDateTo(e.target.value);
            resetToFirstPage();
          }}
          className="max-w-[160px]"
        />

        <div className="ml-auto flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={!canExport}
            onClick={() => handleExport('csv')}
          >
            {isExporting ? '내보내는 중...' : 'CSV 내보내기'}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={!canExport}
            onClick={() => handleExport('xlsx')}
          >
            {isExporting ? '내보내는 중...' : 'Excel 내보내기'}
          </Button>
        </div>
      </div>

      {!canExport && !isExporting && <p className="text-xs text-muted-foreground">내보낼 데이터가 없습니다.</p>}
      {exportError && <p className="text-xs text-red-600 dark:text-red-400">{exportError}</p>}

      <DataGrid
        table={table}
        isLoading={isLoading}
        isError={isError}
        isFetching={isFetching}
        onRowClick={(row) => setSelectedRow(row)}
      />

      <InspectionHistoryDetailDialog row={selectedRow} onClose={() => setSelectedRow(null)} />
    </div>
  );
}
