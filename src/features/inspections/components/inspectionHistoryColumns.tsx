import type { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { formatKstDateTime } from '@/lib/date';
import { getGradeBadgeStyle, getGradeLabel } from '@/features/inspections/utils/gradeBadge';
import { getStatusBadgeStyle, getStatusLabel } from '@/features/inspections/utils/statusBadge';
import type { InspectionHistoryRow } from '@/features/inspections/types/inspectionHistory';

interface CreateInspectionHistoryColumnsOptions {
  onOpenDetail: (row: InspectionHistoryRow) => void;
}

// 검수 이력 Grid 컬럼 생성
export function createInspectionHistoryColumns({
  onOpenDetail,
}: CreateInspectionHistoryColumnsOptions): ColumnDef<InspectionHistoryRow>[] {
  return [
    {
      id: 'bookTitle',
      header: '도서명',
      accessorKey: 'bookTitle',
      cell: ({ row, getValue }) => {
        const title = getValue<string>();
        const coverImageUrl = row.original.coverImageUrl;

        return (
          <div className="flex min-w-[320px] items-center gap-3">
            {coverImageUrl ? (
              <img
                src={coverImageUrl}
                alt={`${title} 표지`}
                className="h-32 w-24 shrink-0 rounded-md border border-border bg-muted object-cover shadow-sm"
              />
            ) : (
              <div className="flex h-32 w-24 shrink-0 items-center justify-center rounded-md border border-border bg-muted text-[10px] font-semibold text-muted-foreground">
                BOOK
              </div>
            )}

            <p className="line-clamp-2 font-medium leading-5 text-foreground">
              {title}
            </p>
          </div>
        );
      },
    },
    {
      id: 'finalGrade',
      header: '최종등급',
      accessorKey: 'finalGrade',
      cell: ({ getValue, row }) => {
        const grade = getValue<InspectionHistoryRow['finalGrade']>();
        if (!grade || row.original.status === 'PENDING') {
          return <span className="text-xs text-muted-foreground">판정 전</span>;
        }
        return (
          <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${getGradeBadgeStyle(grade)}`}>
            {getGradeLabel(grade)}
          </span>
        );
      },
    },
    {
      id: 'status',
      header: '상태',
      accessorKey: 'status',
      cell: ({ getValue }) => {
        const status = getValue<InspectionHistoryRow['status']>();
        return (
          <span
            className={`whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-semibold ${getStatusBadgeStyle(status)}`}
          >
            {getStatusLabel(status)}
          </span>
        );
      },
    },
    {
      id: 'inspectedAt',
      header: '검수 요청일시',
      accessorKey: 'inspectedAt',
      cell: ({ getValue }) => <span className="whitespace-nowrap">{formatKstDateTime(getValue<string>())}</span>,
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
