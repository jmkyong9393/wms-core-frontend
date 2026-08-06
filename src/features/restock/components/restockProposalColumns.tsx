import type { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { formatKstDateTime } from '@/lib/date';
import {
  getProposalSourceBadgeStyle,
  getProposalSourceLabel,
  getRestockStatusBadgeStyle,
  getRestockStatusLabel,
  getRiskBadgeStyle,
  getRiskLabel,
} from '@/features/restock/utils/statusBadge';
import type { RestockProposalListItem } from '@/features/restock/types/restockProposal';

interface CreateRestockProposalColumnsOptions {
  onOpenDetail: (row: RestockProposalListItem) => void;
}

// 발주 추천안 목록 Grid 컬럼 생성
export function createRestockProposalColumns({
  onOpenDetail,
}: CreateRestockProposalColumnsOptions): ColumnDef<RestockProposalListItem>[] {
  return [
    {
      id: 'bookTitle',
      header: '도서명',
      cell: ({ row }) => (
        <div>
          <p className="font-medium text-foreground">{row.original.book.title}</p>
          <p className="text-xs text-muted-foreground">
            {row.original.book.isbn} · {row.original.book.publisher ?? '-'}
          </p>
        </div>
      ),
    },
    {
      id: 'status',
      header: '상태',
      accessorKey: 'status',
      cell: ({ getValue }) => {
        const status = getValue<RestockProposalListItem['status']>();
        return (
          <span
            className={`whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-semibold ${getRestockStatusBadgeStyle(status)}`}
          >
            {getRestockStatusLabel(status)}
          </span>
        );
      },
    },
    {
      id: 'recommendedOrderQuantity',
      header: '추천 발주 수량',
      accessorKey: 'recommendedOrderQuantity',
      cell: ({ getValue }) => <span>{getValue<number>()}권</span>,
    },
    {
      id: 'riskLevel',
      header: '위험도',
      accessorKey: 'riskLevel',
      cell: ({ getValue }) => {
        const riskLevel = getValue<RestockProposalListItem['riskLevel']>();
        return (
          <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${getRiskBadgeStyle(riskLevel)}`}>
            {getRiskLabel(riskLevel)}
          </span>
        );
      },
    },
    {
      id: 'proposalSource',
      header: '발생 사유',
      accessorKey: 'proposalSource',
      cell: ({ getValue }) => {
        const proposalSource = getValue<RestockProposalListItem['proposalSource']>();
        return (
          <span
            className={`whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-semibold ${getProposalSourceBadgeStyle(proposalSource)}`}
          >
            {getProposalSourceLabel(proposalSource)}
          </span>
        );
      },
    },
    {
      id: 'recentSalesQuantity',
      header: '최근 판매량',
      accessorKey: 'recentSalesQuantity',
    },
    {
      id: 'currentStock',
      header: '현재 재고',
      accessorKey: 'currentStock',
    },
    {
      id: 'pendingAutoPoQuantity',
      header: '진행 중인 발주 수량',
      accessorKey: 'pendingAutoPoQuantity',
    },
    {
      id: 'rejectedQuantity',
      header: '반려 수량',
      accessorKey: 'rejectedQuantity',
    },
    {
      id: 'createdAt',
      header: '생성일시',
      accessorKey: 'createdAt',
      cell: ({ getValue }) => <span className="whitespace-nowrap">{formatKstDateTime(getValue<string>())}</span>,
    },
    {
      id: 'reviewedAt',
      header: '검토일시',
      accessorKey: 'reviewedAt',
      cell: ({ getValue }) => {
        const reviewedAt = getValue<RestockProposalListItem['reviewedAt']>();
        return <span className="whitespace-nowrap">{reviewedAt ? formatKstDateTime(reviewedAt) : '-'}</span>;
      },
    },
    {
      id: 'detail',
      header: '상세보기',
      cell: ({ row }) => (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onOpenDetail(row.original);
          }}
        >
          상세보기
        </Button>
      ),
    },
  ];
}
