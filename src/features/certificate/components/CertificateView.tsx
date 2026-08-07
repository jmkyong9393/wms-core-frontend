import {
  getGradeBadgeStyle,
  getGradeLabel,
} from '@/features/inspections/utils/gradeBadge';
import type { CertificateRenderModel } from '@/features/certificate/types/certificate';
import { LegalFooter } from '@/components/legal-footer';

interface CertificateViewProps {
  certificate: CertificateRenderModel;
}

const GRADE_DESCRIPTION: Record<
  CertificateRenderModel['grade'],
  string
> = {
  MINT: '새 책에 가까운 상태입니다.',
  EXCELLENT: '사용감이 거의 없는 양호한 상태입니다.',
  NORMAL: '일반적인 사용감이 있는 상태입니다.',
  REJECT: '판매 가능한 상태가 아닙니다.',
};

function formatInspectionDate(value: string): string {
  return value.slice(0, 10).replaceAll('-', '.');
}

export default function CertificateView({
  certificate,
}: CertificateViewProps) {
  const {
    bookTitle,
    grade,
    inspectedAt,
    isbn,
    publisher,
    coverImageUrl,
    reportSummary,
  } = certificate;

  return (
    <main className="min-h-screen bg-gray-50 p-4">
      <div className="mx-auto max-w-sm space-y-4">
        <section className="rounded-2xl border border-gray-100 bg-white p-5 text-center shadow-sm">
          <div className="flex items-start gap-4 text-left">
            {coverImageUrl ? (
              <img
                src={coverImageUrl}
                alt={`${bookTitle} 표지`}
                className="h-32 w-20 shrink-0 rounded-lg border border-gray-100 object-cover"
              />
            ) : (
              <div className="flex h-32 w-20 shrink-0 items-center justify-center rounded-lg border border-gray-100 bg-gray-50 text-xs font-semibold text-gray-400">
                BOOK
              </div>
            )}

            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-gray-400">
                NEWZED 도서 상태 보증서
              </p>

              <h1 className="mt-1 break-keep text-lg font-bold text-gray-900">
                {bookTitle}
              </h1>

              <span
                className={`mt-2 inline-block rounded-full px-3 py-1 text-sm font-semibold ${getGradeBadgeStyle(grade)}`}
              >
                {getGradeLabel(grade)}
              </span>

              <p className="mt-2 text-sm leading-5 font-medium text-gray-700">
                {GRADE_DESCRIPTION[grade]}
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-800">
            도서 정보
          </h2>

          <dl className="mt-3 space-y-2">
            <div>
              <dt className="text-xs text-gray-400">도서명</dt>
              <dd className="text-sm text-gray-700">{bookTitle}</dd>
            </div>

            {isbn && (
              <div>
                <dt className="text-xs text-gray-400">ISBN</dt>
                <dd className="text-sm text-gray-700">{isbn}</dd>
              </div>
            )}

            {publisher && (
              <div>
                <dt className="text-xs text-gray-400">출판사</dt>
                <dd className="text-sm text-gray-700">{publisher}</dd>
              </div>
            )}
          </dl>
        </section>

        <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-800">
            상품 상태
          </h2>

          <div className="mt-3 flex flex-wrap gap-2">
            {['표지', '책등', '내지'].map((item) => (
              <span
                key={item}
                className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700"
              >
                {item} 확인
              </span>
            ))}
          </div>

          <div className="mt-4 border-t border-gray-100 pt-4">
            <p className="text-xs text-gray-400">상태 요약</p>
            <p className="mt-1 text-sm leading-relaxed text-gray-700">
              {reportSummary}
            </p>
          </div>
        </section>

        <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-800">
            검수·보증 정보
          </h2>

          <dl className="mt-3 space-y-2">
            <div>
              <dt className="text-xs text-gray-400">검수 완료일</dt>
              <dd className="text-sm text-gray-700">
                {formatInspectionDate(inspectedAt)}
              </dd>
            </div>
          </dl>

          <p className="mt-3 border-t border-gray-100 pt-3 text-xs leading-relaxed text-gray-500">
            본 도서는 NEWZED 검수 기준에 따라 상태가 확인된 중고 도서입니다.
          </p>
        </section>

        <LegalFooter />
      </div>
    </main>
  );
}