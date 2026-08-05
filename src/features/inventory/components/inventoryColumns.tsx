import type { ColumnDef } from '@tanstack/react-table';
import { getInventoryGradeBadgeStyle, getInventoryGradeLabel } from '@/features/inventory/utils/gradeBadge';
import { getPricingStatusBadgeStyle, getPricingStatusLabel } from '@/features/inventory/utils/pricingStatusBadge';
import { formatCurrencyKRW, formatDiscountRate } from '@/lib/format';
import type { InventoryRow, InventoryStockType } from '@/features/inventory/types/inventoryRow';

const STOCK_TYPE_LABEL: Record<InventoryStockType, string> = {
  NEW_STOCK: '신간 묶음',
  USED_ITEM: '중고·반품 단품',
};

const STOCK_TYPE_BADGE_STYLE: Record<InventoryStockType, string> = {
  NEW_STOCK: 'bg-sky-100 text-sky-700',
  USED_ITEM: 'bg-orange-100 text-orange-700',
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
  },
  {
    id: 'isbn',
    header: 'ISBN',
    accessorFn: (row) => row.book.isbn,
    cell: ({ getValue }) => getValue<string | null>() ?? '-',
  },
  {
    id: 'lpnBarcode',
    header: 'LPN',
    accessorKey: 'lpn_barcode',
    cell: ({ getValue }) => {
      const lpnBarcode = getValue<string | null>();
      return lpnBarcode ? <span className="font-mono text-xs">{lpnBarcode}</span> : '-';
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
    id: 'basePrice',
    header: '정가',
    accessorKey: 'base_price',
    cell: ({ getValue }) => formatCurrencyKRW(getValue<number>()),
  },
  {
    id: 'discountRate',
    header: '할인율',
    accessorKey: 'discount_rate',
    cell: ({ getValue }) => {
      const rate = getValue<number | null>();
      return rate == null ? '-' : formatDiscountRate(rate);
    },
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
  {
    id: 'date',
    header: '일자',
    accessorKey: 'date',
    cell: ({ getValue }) => getValue<string>().slice(0, 10),
  },
];
