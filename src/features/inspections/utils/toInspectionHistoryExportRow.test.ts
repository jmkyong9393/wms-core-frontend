import { describe, expect, it } from 'vitest';
import { toInspectionHistoryExportRow } from '@/features/inspections/utils/toInspectionHistoryExportRow';
import type { InspectionHistoryRow } from '@/features/inspections/types/inspectionHistory';

const baseRow: InspectionHistoryRow = {
  id: 'insp_test',
  bookId: 'book_test',
  bookTitle: '테스트 도서',
  finalGrade: 'NORMAL',
  isFastTrack: false,
  status: 'APPROVED',
  ubciScore: 88,
  finalReport: '테스트 최종 검수 결과',
  reasonCodes: ['DEFECT_CONFIRMED'],
  inspectedAt: '2026-07-01T09:12:00.000Z',
  updatedAt: '2026-07-01T09:14:00.000Z',
  steps: [],
};

describe('toInspectionHistoryExportRow', () => {
  it('사유 코드 배열을 콤마로 join한다', () => {
    const row = { ...baseRow, reasonCodes: ['DEFECT_CONFIRMED', 'PURCHASE_REJECTED'] };
    expect(toInspectionHistoryExportRow(row)['AI 판정 사유']).toBe('DEFECT_CONFIRMED, PURCHASE_REJECTED');
  });

  it('사유 코드가 없으면 -로 표시한다', () => {
    const row = { ...baseRow, reasonCodes: undefined };
    expect(toInspectionHistoryExportRow(row)['AI 판정 사유']).toBe('-');
  });

  it('finalGrade가 null이면 판정 전으로 표시한다', () => {
    const row = { ...baseRow, finalGrade: null };
    expect(toInspectionHistoryExportRow(row)['최종등급']).toBe('판정 전');
  });

  it('ubciScore가 null이면 -로 표시한다', () => {
    const row = { ...baseRow, ubciScore: null };
    expect(toInspectionHistoryExportRow(row)['UBCI 점수']).toBe('-');
  });

  it('상태 라벨을 한글로 변환한다', () => {
    expect(toInspectionHistoryExportRow(baseRow)['상태']).toBe('승인완료');
    expect(toInspectionHistoryExportRow({ ...baseRow, status: 'HITL_REQUIRED' })['상태']).toBe(
      '관리자 검토 대기',
    );
  });
});
