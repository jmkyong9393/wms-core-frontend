'use client';

import { useMemo, useState } from 'react';
import {
  getCoreRowModel,
  getPaginationRowModel,
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
import { inventoryColumns } from '@/features/inventory/components/inventoryColumns';
import { INVENTORY_GRADES, type InventoryGrade } from '@/features/inventory/constants/grades';
import { toInventoryExportRow } from '@/features/inventory/utils/toInventoryExportRow';
import { exportRowsToCsv, exportRowsToXlsx } from '@/lib/export/tableExport';

const GRADE_FILTER_ALL = 'ALL' as const;
const EXPORT_FILENAME = '재고_목록';

export function InventoryGridView() {
  const { data, isLoading, isError } = useInventoryQuery();

  const [keyword, setKeyword] = useState('');
  const [gradeFilter, setGradeFilter] = useState<InventoryGrade | typeof GRADE_FILTER_ALL>(
    GRADE_FILTER_ALL
  );
  const [zone, setZone] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });

  const resetToFirstPage = () => setPagination((p) => ({ ...p, pageIndex: 0 }));

  const filteredRows = useMemo(() => {
    const rows = data ?? [];
    const normalizedKeyword = keyword.trim().toLowerCase();
    const normalizedZone = zone.trim().toLowerCase();

    return rows.filter((row) => {
      const matchesKeyword =
        !normalizedKeyword ||
        row.book.title.toLowerCase().includes(normalizedKeyword) ||
        row.book.isbn.toLowerCase().includes(normalizedKeyword);
      const matchesGrade = gradeFilter === GRADE_FILTER_ALL || row.grade === gradeFilter;
      const matchesZone = !normalizedZone || row.zone.toLowerCase().includes(normalizedZone);

      const rowDate = row.date.slice(0, 10);
      const matchesDateFrom = !dateFrom || rowDate >= dateFrom;
      const matchesDateTo = !dateTo || rowDate <= dateTo;

      return matchesKeyword && matchesGrade && matchesZone && matchesDateFrom && matchesDateTo;
    });
  }, [data, keyword, gradeFilter, zone, dateFrom, dateTo]);

  const table = useReactTable({
    data: filteredRows,
    columns: inventoryColumns,
    state: { sorting, pagination },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const exportRows = table.getPrePaginationRowModel().rows.map((row) => toInventoryExportRow(row.original));
  const canExport = exportRows.length > 0;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">재고 조회</h2>
        <p className="text-sm text-gray-500 mt-1">
          신간 묶음 재고와 중고/반품 단품 재고를 통합 조회합니다.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Input
          value={keyword}
          onChange={(e) => {
            setKeyword(e.target.value);
            resetToFirstPage();
          }}
          placeholder="도서명 또는 ISBN 검색"
          className="max-w-xs"
        />
        <Select
          value={gradeFilter}
          onValueChange={(value) => {
            setGradeFilter(value as InventoryGrade | typeof GRADE_FILTER_ALL);
            resetToFirstPage();
          }}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={GRADE_FILTER_ALL}>전체 등급</SelectItem>
            {INVENTORY_GRADES.map((grade) => (
              <SelectItem key={grade} value={grade}>
                {grade}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          value={zone}
          onChange={(e) => {
            setZone(e.target.value);
            resetToFirstPage();
          }}
          placeholder="구역 검색"
          className="max-w-[140px]"
        />
        <Input
          type="date"
          value={dateFrom}
          onChange={(e) => {
            setDateFrom(e.target.value);
            resetToFirstPage();
          }}
          className="max-w-[160px]"
        />
        <span className="text-sm text-gray-400">~</span>
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
            onClick={() => exportRowsToCsv(EXPORT_FILENAME, exportRows)}
          >
            CSV 내보내기
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={!canExport}
            onClick={() => exportRowsToXlsx(EXPORT_FILENAME, exportRows)}
          >
            Excel 내보내기
          </Button>
        </div>
      </div>

      {!canExport && (
        <p className="text-xs text-gray-400">내보낼 데이터가 없습니다.</p>
      )}

      <DataGrid table={table} isLoading={isLoading} isError={isError} />
    </div>
  );
}
