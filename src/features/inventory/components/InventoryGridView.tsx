'use client';

import { useEffect, useState } from 'react';
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
import { useInventoryQuery } from '@/features/inventory/hooks/useInventoryQuery';
import { listInventory } from '@/features/inventory/api/inventoryService';
import { inventoryColumns } from '@/features/inventory/components/inventoryColumns';
import { INVENTORY_GRADES, type InventoryGrade } from '@/features/inventory/constants/grades';
import { getInventoryGradeLabel } from '@/features/inventory/utils/gradeBadge';
import { toInventoryExportRow } from '@/features/inventory/utils/toInventoryExportRow';
import { exportRowsToCsv, exportRowsToXlsx } from '@/lib/export/tableExport';
import { fetchAllPages } from '@/lib/api/fetchAllPages';

const GRADE_FILTER_ALL = 'ALL' as const;
const EXPORT_FILENAME = '재고_목록';
const DEFAULT_PAGE_SIZE = 20;
const UNSUPPORTED_FILTER_MESSAGE = '현재 조회 API에서 지원하지 않는 필터입니다';

export function InventoryGridView() {
  // 서버 API가 지원하지 않는 필터 - 값은 보존하되 어떤 데이터도 필터링하지 않음
  const [keyword, setKeyword] = useState('');
  const [gradeFilter, setGradeFilter] = useState<InventoryGrade | typeof GRADE_FILTER_ALL>(
    GRADE_FILTER_ALL
  );
  const [zone, setZone] = useState('');

  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: DEFAULT_PAGE_SIZE });
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const params = { page: pagination.pageIndex + 1, size: pagination.pageSize };
  const { data, isLoading, isError, isFetching } = useInventoryQuery(params);

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
    columns: inventoryColumns,
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
      const allRows = await fetchAllPages((page, size) => listInventory({ page, size }));
      const exportRows = allRows.map(toInventoryExportRow);
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
        <h2 className="text-2xl font-bold text-gray-800">재고 조회</h2>
        <p className="text-sm text-gray-500 mt-1">
          신간 묶음 재고와 중고/반품 단품 재고를 통합 조회합니다.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex flex-col gap-1">
          <Input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="도서명 또는 ISBN 검색"
            className="max-w-xs"
            disabled
          />
          <span className="text-xs text-gray-400">{UNSUPPORTED_FILTER_MESSAGE}</span>
        </div>
        <div className="flex flex-col gap-1">
          <Select
            value={gradeFilter}
            onValueChange={(value) => setGradeFilter(value as InventoryGrade | typeof GRADE_FILTER_ALL)}
            disabled
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={GRADE_FILTER_ALL}>전체 등급</SelectItem>
              {INVENTORY_GRADES.map((grade) => (
                <SelectItem key={grade} value={grade}>
                  {getInventoryGradeLabel(grade)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-xs text-gray-400">{UNSUPPORTED_FILTER_MESSAGE}</span>
        </div>
        <div className="flex flex-col gap-1">
          <Input
            value={zone}
            onChange={(e) => setZone(e.target.value)}
            placeholder="구역 검색"
            className="max-w-[140px]"
            disabled
          />
          <span className="text-xs text-gray-400">{UNSUPPORTED_FILTER_MESSAGE}</span>
        </div>
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

      {!canExport && !isExporting && (
        <p className="text-xs text-gray-400">내보낼 데이터가 없습니다.</p>
      )}
      {exportError && <p className="text-xs text-red-600">{exportError}</p>}

      <DataGrid table={table} isLoading={isLoading} isError={isError} isFetching={isFetching} />
    </div>
  );
}
