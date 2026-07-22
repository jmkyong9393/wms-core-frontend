import type { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
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
    },
    {
      id: 'finalGrade',
      header: '최종등급',
      accessorKey: 'finalGrade',
      cell: ({ getValue }) => {
        const grade = getValue<InspectionHistoryRow['finalGrade']>();
        if (!grade) {
          return <span className="text-xs text-gray-400">판정 전</span>;
        }
        return (
          <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${getGradeBadgeStyle(grade)}`}>
            {getGradeLabel(grade)}
          </span>
        );
      },
    },
    {
      id: 'isFastTrack',
      header: '검수 방식',
      accessorKey: 'isFastTrack',
      cell: ({ getValue }) =>
        getValue<boolean>() ? (
          <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-semibold text-purple-700">
            신속 검수
          </span>
        ) : (
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
            표준 검수
          </span>
        ),
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
      id: 'ubciScore',
      header: 'UBCI 점수',
      accessorKey: 'ubciScore',
      cell: ({ getValue }) => {
        const score = getValue<InspectionHistoryRow['ubciScore']>();
        return <span>{score === null || score === undefined ? '-' : score}</span>;
      },
    },
    {
      id: 'reasonCodes',
      header: 'AI 판정 사유',
      accessorKey: 'reasonCodes',
      cell: ({ getValue }) => {
        const codes = getValue<InspectionHistoryRow['reasonCodes']>();
        if (!codes || codes.length === 0) {
          return <span className="text-xs text-gray-400">-</span>;
        }
        const [first, ...rest] = codes;
        return (
          <span className="block max-w-[180px] truncate text-xs" title={codes.join(', ')}>
            {first}
            {rest.length > 0 && ` +${rest.length}`}
          </span>
        );
      },
    },
    {
      id: 'inspectedAt',
      header: '검수 요청일시',
      accessorKey: 'inspectedAt',
      cell: ({ getValue }) => <span className="whitespace-nowrap">{getValue<string>().slice(0, 10)}</span>,
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
