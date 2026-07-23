import type { ColumnDef } from '@tanstack/react-table';
import { getInventoryGradeBadgeStyle, getInventoryGradeLabel } from '@/features/inventory/utils/gradeBadge';
import type { InventoryRow } from '@/features/inventory/types/inventoryRow';

export const inventoryColumns: ColumnDef<InventoryRow>[] = [
  {
    id: 'title',
    header: '도서명',
    accessorFn: (row) => row.book.title,
  },
  {
    id: 'isbn',
    header: 'ISBN',
    accessorFn: (row) => row.book.isbn,
  },
  {
    id: 'grade',
    header: '등급',
    accessorKey: 'grade',
    cell: ({ getValue }) => {
      const grade = getValue<string>();
      return (
        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${getInventoryGradeBadgeStyle(grade)}`}>
          {getInventoryGradeLabel(grade)}
        </span>
      );
    },
  },
  {
    id: 'zone',
    header: '구역',
    accessorKey: 'zone',
  },
  {
    id: 'quantity',
    header: '수량',
    accessorKey: 'quantity',
    cell: ({ getValue }) => `${getValue<number>()}권`,
  },
  {
    id: 'date',
    header: '일자',
    accessorKey: 'date',
    cell: ({ getValue }) => getValue<string>().slice(0, 10),
  },
];
