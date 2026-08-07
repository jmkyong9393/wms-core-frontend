import type { ColumnDef } from '@tanstack/react-table';
import { getInventoryGradeBadgeStyle, getInventoryGradeLabel } from '@/features/inventory/utils/gradeBadge';
import { getPricingStatusBadgeStyle, getPricingStatusLabel } from '@/features/inventory/utils/pricingStatusBadge';
import { formatCurrencyKRW, formatDiscountRate } from '@/lib/format';
import { formatKstDate } from '@/lib/date';
import type { InventoryRow, InventoryStockType } from '@/features/inventory/types/inventoryRow';

const STOCK_TYPE_LABEL: Record<InventoryStockType, string> = {
  NEW_STOCK: '신간 묶음',
  USED_ITEM: '중고·반품 단품',
};

const STOCK_TYPE_BADGE_STYLE: Record<InventoryStockType, string> = {
  NEW_STOCK: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300',
  USED_ITEM: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
};

export const inventoryColumns: ColumnDef<InventoryRow>[] = [
  {
    id: 'stockType',
    header: '재고 유형',
    accessorKey: 'stock_type',
    cell: ({ getValue }) => {
      const stockType = getValue<InventoryStockType>();
      return (
        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${STOCK_TYPE_BADGE_STYLE[stockType]}`}>
          {STOCK_TYPE_LABEL[stockType]}
        </span>
      );
    },
  },
  {
    id: 'title',
    header: '도서명',
    accessorFn: (row) => row.book.title,
    cell: ({ row, getValue }) => {
      const title = getValue<string>();
      const coverImageUrl = row.original.book.cover_image_url;

      return (
        <div className="flex min-w-[260px] items-center gap-3">
          {coverImageUrl ? (
            <img
              src={coverImageUrl}
              alt={`${title} 표지`}
              className="h-24 w-18 shrink-0 rounded-md border border-border bg-muted object-cover shadow-sm"
            />
          ) : (
            <div className="flex h-24 w-18 shrink-0 items-center justify-center rounded-md border border-border bg-muted text-xs font-semibold text-muted-foreground">
              BOOK
            </div>
          )}

          <span className="line-clamp-2 font-medium leading-5">
            {title}
          </span>
        </div>
      );
    },
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
    id: 'availableQuantity',
    header: '출고가능수량',
    accessorKey: 'available_quantity',
    cell: ({ getValue }) => `${getValue<number>()}권`,
  },
  {
    id: 'salePrice',
    header: '판매가',
    accessorKey: 'sale_price',
    cell: ({ getValue }) => {
      const price = getValue<number | null>();
      return price == null ? '-' : formatCurrencyKRW(price);
    },
  },
  {
    id: 'pricingStatus',
    header: '가격 상태',
    accessorKey: 'pricing_status',
    cell: ({ getValue }) => {
      const pricingStatus = getValue<string>();
      return (
        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${getPricingStatusBadgeStyle(pricingStatus)}`}>
          {getPricingStatusLabel(pricingStatus)}
        </span>
      );
    },
  },
];
