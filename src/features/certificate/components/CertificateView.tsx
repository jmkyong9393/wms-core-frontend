import { getGradeBadgeStyle, getGradeLabel } from '@/features/inspections/utils/gradeBadge';
import type { CertificateRenderModel } from '@/features/certificate/types/certificate';
import { LegalFooter } from '@/components/legal-footer';

interface CertificateViewProps {
  certificate: CertificateRenderModel;
}

export default function CertificateView({ certificate }: CertificateViewProps) {
  const { bookTitle, grade, ubciScore, inspectedAt, isbn, publisher, reportSummary } = certificate;

  return (
    <main className="min-h-screen bg-gray-50 p-4">
      <div className="mx-auto max-w-sm space-y-4">
        {/* 보증서 핵심 정보 */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 text-center shadow-sm">
          <p className="text-xs font-semibold text-gray-400">UBCI 품질 보증서</p>
          <h1 className="mt-1 text-lg font-bold text-gray-900">{bookTitle}</h1>
          <div className="mt-6 space-y-4">
            <span className={`inline-block rounded-full px-3 py-1 text-sm font-semibold ${getGradeBadgeStyle(grade)}`}>
              {getGradeLabel(grade)}
            </span>
            <div>
              <p className="text-xs text-gray-400">UBCI 점수</p>
              <p className="text-3xl font-bold text-gray-900">{ubciScore}</p>
            </div>
          </div>
        </div>

        {/* 도서 정보 */}
        <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-800">도서 정보</h2>
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

        {/* AI 품질 판정 근거 */}
        <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-800">품질 판정 근거</h2>
          <p className="mt-3 text-xs leading-relaxed text-gray-500">
            UBCI는 도서의 훼손 상태(찢김, 오염, 낙서 등)를 AI가 정량적으로 분석해 산출하는 자체 품질 지수입니다.
          </p>

          <div className="mt-4 border-t border-gray-100 pt-4">
            <p className="text-sm text-gray-700">{reportSummary}</p>
          </div>
        </section>

        {/* 검수 완료 정보 */}
        <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-800">검수 · 인증 정보</h2>
          <dl className="mt-3 space-y-2">
            <div>
              <dt className="text-xs text-gray-400">품질 검수 완료일</dt>
              <dd className="text-sm text-gray-700">{inspectedAt.slice(0, 10)}</dd>
            </div>
          </dl>
          <p className="mt-3 border-t border-gray-100 pt-3 text-xs leading-relaxed text-gray-500">
            이 도서는 AI 기반 품질 검수(UBCI Digital Certificate)를 통해 상태가 판정되었습니다.
          </p>
        </section>

        {/* 인증 완료 안내 */}
        <p className="px-2 text-center text-xs text-gray-400">UBCI 품질 검수가 완료된 도서입니다.</p>

        <LegalFooter />
      </div>
    </main>
  );
}
