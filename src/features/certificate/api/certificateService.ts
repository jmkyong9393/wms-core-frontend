import { isAxiosError } from 'axios';
import { apiClient } from '@/lib/api-client';
import type { CertificateRenderModel } from '@/features/certificate/types/certificate';
import type { BookGrade } from '@/features/inspections/types/inspection';

interface CertificateApiResponse {
  book: {
    isbn: string | null;
    title: string;
    publisher: string | null;
    cover_image_url: string | null;
  };
  condition_grade: BookGrade;
  ubci_score: number | string;
  report_summary: string;
  inspected_at: string;
}

function toCertificateRenderModel(res: CertificateApiResponse): CertificateRenderModel {
  return {
    bookTitle: res.book.title,
    isbn: res.book.isbn,
    publisher: res.book.publisher,
    coverImageUrl: res.book.cover_image_url,
    grade: res.condition_grade,
    ubciScore: Number(res.ubci_score),
    reportSummary: res.report_summary,
    inspectedAt: res.inspected_at,
  };
}

// 인증 없이 조회하는 공개 품질보증서
export async function getCertificate(token: string): Promise<CertificateRenderModel | null> {
  try {
    const res = await apiClient.get<CertificateApiResponse>(`/api/v1/certificate/${token}`, {
      skipAuth: true,
    });
    return toCertificateRenderModel(res.data);
  } catch (err) {
    // 잘못된 토큰 또는 검수 미완료
    if (isAxiosError(err) && err.response?.status === 404) return null;
    throw err;
  }
}
