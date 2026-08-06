import type { ColumnDef } from '@tanstack/react-table';
import { getOrderStatusLabel } from '@/features/orders/utils/orderStatusLabel';
import { formatCurrencyKRW } from '@/lib/format';
import { formatKstDate } from '@/lib/date';
import type { OrderListItem, OutboundOrderStatus } from '@/features/orders/types/order';

const STATUS_BADGE_STYLE: Record<OutboundOrderStatus, string> = {
  PENDING: 'bg-gray-100 text-gray-700 dark:bg-zinc-800 dark:text-zinc-300',
  PICKING: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
  SHIPPED: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
};

export const pickingStatusColumns: ColumnDef<OrderListItem>[] = [
  {
    id: 'orderId',
    header: '주문번호',
    accessorKey: 'id',
    cell: ({ getValue }) => <span className="font-mono text-xs">{getValue<string>()}</span>,
  },
  {
    id: 'customerName',
    header: '고객명',
    accessorKey: 'customer_name',
  },
  {
    id: 'status',
    header: '상태',
    accessorKey: 'status',
    cell: ({ getValue }) => {
      const status = getValue<OutboundOrderStatus>();
      return (
        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_BADGE_STYLE[status]}`}>
          {getOrderStatusLabel(status)}
        </span>
      );
    },
  },
  {
    id: 'totalPrice',
    header: '총 금액',
    accessorKey: 'total_price',
    cell: ({ getValue }) => formatCurrencyKRW(getValue<number>()),
  },
  {
    id: 'logisticsCenter',
    header: '물류센터',
    accessorKey: 'logistics_center',
    cell: ({ getValue }) => getValue<string | null>() ?? '-',
  },
  {
    id: 'createdAt',
    header: '주문일',
    accessorKey: 'created_at',
    cell: ({ getValue }) => formatKstDate(getValue<string>()),
  },
];
