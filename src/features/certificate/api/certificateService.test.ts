import { describe, it, expect, vi } from 'vitest';
import { getCertificate } from './certificateService';
import { listInspectionHistory } from '@/features/inspections/api/inspectionHistoryService';
import type { InspectionHistoryRow } from '@/features/inspections/types/inspectionHistory';

vi.mock('@/features/inspections/api/inspectionHistoryService', () => ({
  listInspectionHistory: vi.fn(),
}));

const mockedListInspectionHistory = vi.mocked(listInspectionHistory);

function buildRow(overrides: Partial<InspectionHistoryRow> = {}): InspectionHistoryRow {
  return {
    id: 'insp_001',
    bookId: 'book_001',
    bookTitle: '싯다르타',
    finalGrade: 'MINT',
    isFastTrack: true,
    status: 'APPROVED',
    ubciScore: 100,
    finalReport: 'Auto-refund 승인 및 UBCI 디지털 품질 보증서 발급',
    inspectedAt: '2026-07-01T09:12:00.000Z',
    updatedAt: '2026-07-01T09:14:00.000Z',
    steps: [],
    ...overrides,
  };
}

describe('getCertificate', () => {
  it('존재하지 않는 token이면 null을 반환한다', async () => {
    mockedListInspectionHistory.mockResolvedValue([buildRow()]);

    const result = await getCertificate('not_exist');

    expect(result).toBeNull();
  });

  it('존재하는 token이면 CertificateRenderModel로 매핑해 반환한다', async () => {
    mockedListInspectionHistory.mockResolvedValue([buildRow()]);

    const result = await getCertificate('insp_001');

    expect(result).toEqual({
      token: 'insp_001',
      bookTitle: '싯다르타',
      grade: 'MINT',
      ubciScore: 100,
      inspectedAt: '2026-07-01T09:12:00.000Z',
      completedAt: '2026-07-01T09:14:00.000Z',
    });
  });

  it('REJECT 등급은 판매/소비자 보증서 발급 대상이 아니므로 공개 인증서에서 제외되어 null을 반환한다', async () => {
    mockedListInspectionHistory.mockResolvedValue([
      buildRow({ id: 'insp_008', finalGrade: 'REJECT', status: 'REJECTED', ubciScore: 10 }),
    ]);

    const result = await getCertificate('insp_008');

    expect(result).toBeNull();
  });
});
