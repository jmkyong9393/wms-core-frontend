'use client';

import { flexRender, type Table as TanstackTable } from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const PAGE_SIZE_OPTIONS = [10, 20, 50];

interface DataGridProps<TData> {
  table: TanstackTable<TData>;
  isLoading?: boolean;
  isError?: boolean;
  emptyMessage?: string;
  onRowClick?: (row: TData) => void;
  // 서버 페이지네이션 재조회 중 이전/다음 버튼 중복 클릭 방지
  isFetching?: boolean;
}

// 전달받은 테이블 설정과 데이터를 화면에 표시하는 공통 표
export function DataGrid<TData>({
  table,
  isLoading = false,
  isError = false,
  emptyMessage = '표시할 데이터가 없습니다.',
  onRowClick,
  isFetching = false,
}: DataGridProps<TData>) {
  if (isLoading) {
    return <p className="text-sm text-gray-400">불러오는 중...</p>;
  }
  if (isError) {
    return <p className="text-sm text-red-600">데이터를 불러오지 못했습니다.</p>;
  }

  const rows = table.getRowModel().rows;
  const pageIndex = table.getState().pagination.pageIndex;
  const pageSize = table.getState().pagination.pageSize;
  const pageCount = table.getPageCount();
  const columnCount = table.getVisibleLeafColumns().length;

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-x-auto">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : header.column.getCanSort() ? (
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 border-0 bg-transparent p-0 font-medium text-inherit"
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getIsSorted() === 'asc' && <span aria-hidden>▲</span>}
                        {header.column.getIsSorted() === 'desc' && <span aria-hidden>▼</span>}
                      </button>
                    ) : (
                      flexRender(header.column.columnDef.header, header.getContext())
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columnCount} className="py-6 text-center text-gray-400">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow
                  key={row.id}
                  onClick={onRowClick ? () => onRowClick(row.original) : undefined}
                  className={onRowClick ? 'cursor-pointer' : undefined}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between text-sm text-gray-500">
        <div className="flex items-center gap-2">
          <span>페이지 크기</span>
          <Select
            value={String(pageSize)}
            onValueChange={(value) => {
              table.setPageSize(Number(value));
              table.setPageIndex(0);
            }}
          >
            <SelectTrigger size="sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAGE_SIZE_OPTIONS.map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size}개
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={!table.getCanPreviousPage() || isFetching}
            onClick={() => table.previousPage()}
          >
            이전
          </Button>
          <span>
            {pageIndex + 1} / {Math.max(1, pageCount)}
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={!table.getCanNextPage() || isFetching}
            onClick={() => table.nextPage()}
          >
            다음
          </Button>
        </div>
      </div>
    </div>
  );
}
