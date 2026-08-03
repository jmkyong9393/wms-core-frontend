import { describe, it, expect, vi } from 'vitest';
import { AxiosError } from 'axios';
import { getCertificate } from './certificateService';
import { apiClient } from '@/lib/api-client';

vi.mock('@/lib/api-client', () => ({
  apiClient: {
    get: vi.fn(),
  },
}));

describe('getCertificate', () => {
  it('공개 인증서 API를 skipAuth로 호출한다', async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce({
      data: {
        book: { isbn: '9791234567890', title: '싯다르타', publisher: '김영사' },
        condition_grade: 'MINT',
        ubci_score: '100.00',
        report_summary: '경미한 사용감 외 특이사항 없음',
        inspected_at: '2026-07-01T09:12:00.000Z',
      },
    });

    const result = await getCertificate('insp_001');

    expect(apiClient.get).toHaveBeenCalledWith('/api/v1/certificate/insp_001', { skipAuth: true });
    expect(result).toEqual({
      bookTitle: '싯다르타',
      isbn: '9791234567890',
      publisher: '김영사',
      grade: 'MINT',
      ubciScore: 100,
      reportSummary: '경미한 사용감 외 특이사항 없음',
      inspectedAt: '2026-07-01T09:12:00.000Z',
    });
  });

  it('404 응답이면 null을 반환한다 (토큰 없음 또는 검수 미완료)', async () => {
    vi.mocked(apiClient.get).mockRejectedValueOnce(
      new AxiosError('Not Found', undefined, undefined, undefined, {
        status: 404,
        data: { detail: 'Certificate not found' },
      } as never)
    );

    const result = await getCertificate('not_exist');

    expect(result).toBeNull();
  });

  it('404가 아닌 오류는 그대로 throw한다', async () => {
    const serverError = new AxiosError('Internal Server Error', undefined, undefined, undefined, {
      status: 500,
      data: { detail: 'boom' },
    } as never);
    vi.mocked(apiClient.get).mockRejectedValueOnce(serverError);

    await expect(getCertificate('insp_001')).rejects.toBe(serverError);
  });
});
