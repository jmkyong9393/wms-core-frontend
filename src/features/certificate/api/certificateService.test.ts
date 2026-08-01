import { describe, it, expect, vi } from 'vitest';
import { getCertificate } from './certificateService';
import type { MockInspectionRecord } from '@/features/inspections/types/inspection';

// 마지막 테스트가 실제 inspectionHistoryService(→api-client→authAtoms)를 동적 import하는데,
// Node의 기본 localStorage 스텁이 불완전해 atomWithStorage(getOnInit)가 모듈 로드 시점에 깨진다
vi.hoisted(() => {
  const memoryStore: Record<string, string> = {};
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => memoryStore[key] ?? null,
    setItem: (key: string, value: string) => {
      memoryStore[key] = String(value);
    },
    removeItem: (key: string) => {
      delete memoryStore[key];
    },
    clear: () => {
      Object.keys(memoryStore).forEach((key) => delete memoryStore[key]);
    },
  });
});

function buildRecord(overrides: Partial<MockInspectionRecord> = {}): MockInspectionRecord {
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

vi.mock('@/features/inspections/mocks/mockAgentLogs', () => ({
  mockInspectionRecords: [
    buildRecord(),
    buildRecord({ id: 'insp_008', finalGrade: 'REJECT', status: 'REJECTED', ubciScore: 10 }),
  ],
}));

describe('getCertificate', () => {
  it('존재하지 않는 token이면 null을 반환한다', async () => {
    const result = await getCertificate('not_exist');

    expect(result).toBeNull();
  });

  it('존재하는 token이면 CertificateRenderModel로 매핑해 반환한다', async () => {
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
    const result = await getCertificate('insp_008');

    expect(result).toBeNull();
  });

  it('관리자 인증 검수 이력 API(listInspectionHistory)를 호출하지 않는다 - 공개 라우트는 admin API에 의존하면 안 됨', async () => {
    const inspectionHistoryService = await import('@/features/inspections/api/inspectionHistoryService');
    const spy = vi.spyOn(inspectionHistoryService, 'listInspectionHistory');

    await getCertificate('insp_001');

    expect(spy).not.toHaveBeenCalled();
  });
});
