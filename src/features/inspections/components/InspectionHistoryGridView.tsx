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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import AgentLogAccordion from '@/features/inspections/components/AgentLogAccordion';
import InspectionBadges from '@/features/inspections/components/InspectionBadges';
import { useInspectionHistoryQuery } from '@/features/inspections/hooks/useInspectionHistoryQuery';
import { inspectionHistoryColumns } from '@/features/inspections/components/inspectionHistoryColumns';
import { BOOK_GRADES, type BookGrade } from '@/features/inspections/types/inspection';
import { getGradeLabel } from '@/features/inspections/utils/gradeBadge';
import type { InspectionHistoryRow } from '@/features/inspections/types/inspectionHistory';
import { toInspectionHistoryExportRow } from '@/features/inspections/utils/toInspectionHistoryExportRow';
import { exportRowsToCsv, exportRowsToXlsx } from '@/lib/export/tableExport';

const GRADE_FILTER_ALL = 'ALL' as const;
const FAST_TRACK_ALL = 'ALL' as const;
const FAST_TRACK_ONLY = 'FAST_TRACK' as const;
const FAST_TRACK_NORMAL = 'NORMAL' as const;
type FastTrackFilter = typeof FAST_TRACK_ALL | typeof FAST_TRACK_ONLY | typeof FAST_TRACK_NORMAL;

const EXPORT_FILENAME = '검수_이력';

export function InspectionHistoryGridView() {
  const { data, isLoading, isError } = useInspectionHistoryQuery();

  const [keyword, setKeyword] = useState('');
  const [gradeFilter, setGradeFilter] = useState<BookGrade | typeof GRADE_FILTER_ALL>(GRADE_FILTER_ALL);
  const [fastTrackFilter, setFastTrackFilter] = useState<FastTrackFilter>(FAST_TRACK_ALL);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });
  const [selectedRow, setSelectedRow] = useState<InspectionHistoryRow | null>(null);

  const resetToFirstPage = () => setPagination((p) => ({ ...p, pageIndex: 0 }));

  const filteredRows = useMemo(() => {
    const rows = data ?? [];
    const normalizedKeyword = keyword.trim().toLowerCase();

    return rows.filter((row) => {
      const matchesKeyword = !normalizedKeyword || row.bookTitle.toLowerCase().includes(normalizedKeyword);
      const matchesGrade = gradeFilter === GRADE_FILTER_ALL || row.finalGrade === gradeFilter;
      const matchesFastTrack =
        fastTrackFilter === FAST_TRACK_ALL ||
        (fastTrackFilter === FAST_TRACK_ONLY && row.isFastTrack) ||
        (fastTrackFilter === FAST_TRACK_NORMAL && !row.isFastTrack);

      const rowDate = row.inspectedAt.slice(0, 10);
      const matchesDateFrom = !dateFrom || rowDate >= dateFrom;
      const matchesDateTo = !dateTo || rowDate <= dateTo;

      return matchesKeyword && matchesGrade && matchesFastTrack && matchesDateFrom && matchesDateTo;
    });
  }, [data, keyword, gradeFilter, fastTrackFilter, dateFrom, dateTo]);

  const table = useReactTable({
    data: filteredRows,
    columns: inspectionHistoryColumns,
    state: { sorting, pagination },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const exportRows = table
    .getPrePaginationRowModel()
    .rows.map((row) => toInspectionHistoryExportRow(row.original));
  const canExport = exportRows.length > 0;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">검수 이력</h2>
        <p className="text-sm text-gray-500 mt-1">
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
            <SelectValue />
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
          value={fastTrackFilter}
          onValueChange={(value) => {
            setFastTrackFilter(value as FastTrackFilter);
            resetToFirstPage();
          }}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={FAST_TRACK_ALL}>전체</SelectItem>
            <SelectItem value={FAST_TRACK_ONLY}>신속 검수</SelectItem>
            <SelectItem value={FAST_TRACK_NORMAL}>표준 검수</SelectItem>
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

      {!canExport && <p className="text-xs text-gray-400">내보낼 데이터가 없습니다.</p>}

      <DataGrid
        table={table}
        isLoading={isLoading}
        isError={isError}
        onRowClick={(row) => setSelectedRow(row)}
      />

      <Dialog open={selectedRow !== null} onOpenChange={(open) => !open && setSelectedRow(null)}>
        <DialogContent>
          {selectedRow && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedRow.bookTitle}</DialogTitle>
                <InspectionBadges isFastTrack={selectedRow.isFastTrack} finalGrade={selectedRow.finalGrade} />
              </DialogHeader>
              <AgentLogAccordion record={selectedRow} />
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
