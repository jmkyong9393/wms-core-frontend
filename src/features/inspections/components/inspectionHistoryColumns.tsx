import type { ColumnDef } from '@tanstack/react-table';
import { GRADE_BADGE_STYLE } from '@/features/inspections/utils/gradeBadge';
import type { InspectionHistoryRow } from '@/features/inspections/types/inspectionHistory';

export const inspectionHistoryColumns: ColumnDef<InspectionHistoryRow>[] = [
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
      return (
        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${GRADE_BADGE_STYLE[grade]}`}>
          {grade}
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
    id: 'inspectedAt',
    header: '검수일시',
    accessorKey: 'inspectedAt',
    cell: ({ getValue }) => getValue<string>().slice(0, 10),
  },
];
