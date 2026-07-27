import { getGradeBadgeStyle, getGradeLabel } from '@/features/inspections/utils/gradeBadge';
import type { CertificateRenderModel } from '@/features/certificate/types/certificate';

interface CertificateViewProps {
  certificate: CertificateRenderModel;
}

export default function CertificateView({ certificate }: CertificateViewProps) {
  const {
    bookTitle,
    grade,
    ubciScore,
    inspectedAt,
    completedAt,
    isbn,
    author,
    publisher,
    coverImageUrl,
    findings,
    judgementSummary,
  } = certificate;

  // 검수 완료 전 보증서 준비 상태
  if (grade === null || ubciScore === null) {
    return (
      <main className="min-h-screen bg-gray-50 p-4">
        <div className="mx-auto max-w-sm rounded-2xl border border-gray-100 bg-white p-6 text-center shadow-sm">
          <p className="text-xs font-semibold text-gray-400">UBCI 품질 보증서</p>
          <h1 className="mt-1 text-lg font-bold text-gray-900">{bookTitle}</h1>
          <div className="mt-6 space-y-2">
            <p className="text-sm font-semibold text-gray-600">품질 검수 진행 중입니다</p>
            <p className="text-xs text-gray-400">보증서는 검수 완료 후 확인할 수 있습니다.</p>
            <p className="text-xs text-gray-400">검수 요청일시: {inspectedAt.slice(0, 10)}</p>
          </div>
        </div>
      </main>
    );
  }

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
            {author && (
              <div>
                <dt className="text-xs text-gray-400">저자</dt>
                <dd className="text-sm text-gray-700">{author}</dd>
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

          {/* 실제 API 연동 전까지 제공 가능한 판정 정보만 표시 */}
          <div className="mt-4 border-t border-gray-100 pt-4">
            {coverImageUrl || (findings && findings.length > 0) || judgementSummary ? (
              <div className="space-y-3">
                {coverImageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={coverImageUrl} alt="검수 도서 사진" className="w-full rounded-xl object-cover" />
                )}
                {findings && findings.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-400">확인된 상태</p>
                    <ul className="mt-1 space-y-2">
                      {findings.map((finding, index) => (
                        <li key={`${finding.condition}-${index}`} className="text-sm text-gray-700">
                          {finding.photoUrl && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={finding.photoUrl}
                              alt={finding.condition}
                              className="mb-1 w-full rounded-lg object-cover"
                            />
                          )}
                          <span>· {finding.condition}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {judgementSummary && <p className="text-sm text-gray-700">{judgementSummary}</p>}
              </div>
            ) : grade === 'MINT' ? (
              <p className="text-sm text-gray-600">주요 결함이 확인되지 않았습니다.</p>
            ) : (
              <p className="text-xs text-gray-400">상세 판정 근거는 준비 중입니다.</p>
            )}
          </div>
        </section>

        {/* 검수 완료 정보 */}
        <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-800">검수 · 인증 정보</h2>
          <dl className="mt-3 space-y-2">
            <div>
              <dt className="text-xs text-gray-400">품질 검수 완료일</dt>
              <dd className="text-sm text-gray-700">{completedAt.slice(0, 10)}</dd>
            </div>
          </dl>
          <p className="mt-3 border-t border-gray-100 pt-3 text-xs leading-relaxed text-gray-500">
            이 도서는 AI 기반 품질 검수(UBCI Digital Certificate)를 통해 상태가 판정되었습니다.
          </p>
        </section>

        {/* 인증 완료 안내 */}
        <p className="px-2 text-center text-xs text-gray-400">UBCI 품질 검수가 완료된 도서입니다.</p>
      </div>
    </main>
  );
}
