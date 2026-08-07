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
      cell: ({ row }) => {
        const book = row.original.book;

        return (
          <div className="flex min-w-[340px] items-center gap-3">
            {book.coverImageUrl ? (
              <img
                src={book.coverImageUrl}
                alt={`${book.title} 표지`}
                className="h-32 w-24 shrink-0 rounded-md border border-border bg-muted object-cover shadow-sm"
              />
            ) : (
              <div className="flex h-32 w-24 shrink-0 items-center justify-center rounded-md border border-border bg-muted text-xs font-semibold text-muted-foreground">
                BOOK
              </div>
            )}

            <div className="min-w-0">
              <p className="line-clamp-2 font-medium leading-5 text-foreground">
                {book.title}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {book.isbn} · {book.publisher ?? '-'}
              </p>
              <p className="mt-1 text-xs font-medium text-violet-700">
                {row.original.proposalSource === 'SAFETY_STOCK'
                  ? '재고 부족 기반 추천'
                  : '반품 대체 검토'}
              </p>
            </div>
          </div>
        );
      },
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
      id: 'currentStock',
      header: '현재 재고',
      accessorKey: 'currentStock',
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
