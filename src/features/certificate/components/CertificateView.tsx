import { BookOpen, CheckCircle2, PackageCheck, ShieldCheck } from 'lucide-react';
import {
  getGradeBadgeStyle,
  getGradeLabel,
} from '@/features/inspections/utils/gradeBadge';
import type { CertificateRenderModel } from '@/features/certificate/types/certificate';
import { LegalFooter } from '@/components/legal-footer';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

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
    <main className="min-h-screen bg-gray-50 p-4 dark:bg-zinc-950">
      <div className="mx-auto max-w-sm space-y-4">
        <Card className="p-5 text-center">
          <div className="flex items-start gap-4 text-left">
            {coverImageUrl ? (
              <img
                src={coverImageUrl}
                alt={`${bookTitle} 표지`}
                className="h-32 w-20 shrink-0 rounded-lg border border-border object-cover"
              />
            ) : (
              <div className="flex h-32 w-20 shrink-0 items-center justify-center rounded-lg border border-border bg-muted text-xs font-semibold text-muted-foreground">
                BOOK
              </div>
            )}

            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1 text-xs font-semibold text-muted-foreground">
                <ShieldCheck className="size-3.5 text-primary" />
                NEWZED 도서 상태 보증서
              </p>

              <h1 className="mt-1 break-keep text-lg font-bold text-foreground">
                {bookTitle}
              </h1>

              <Badge
                variant="outline"
                className={`mt-2 px-3 py-1 text-sm ${getGradeBadgeStyle(grade)}`}
              >
                {getGradeLabel(grade)}
              </Badge>

              <p className="mt-2 text-sm leading-5 font-medium text-foreground">
                {GRADE_DESCRIPTION[grade]}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
            <BookOpen className="size-4 text-muted-foreground" />
            도서 정보
          </h2>

          <dl className="mt-3 space-y-2">
            <div>
              <dt className="text-xs text-muted-foreground">도서명</dt>
              <dd className="text-sm text-foreground">{bookTitle}</dd>
            </div>

            {isbn && (
              <div>
                <dt className="text-xs text-muted-foreground">ISBN</dt>
                <dd className="text-sm text-foreground">{isbn}</dd>
              </div>
            )}

            {publisher && (
              <div>
                <dt className="text-xs text-muted-foreground">출판사</dt>
                <dd className="text-sm text-foreground">{publisher}</dd>
              </div>
            )}
          </dl>
        </Card>

        <Card className="p-5">
          <h2 className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
            <PackageCheck className="size-4 text-muted-foreground" />
            상품 상태
          </h2>

          <div className="mt-3 flex flex-wrap gap-2">
            {['표지', '책등', '내지'].map((item) => (
              <Badge
                key={item}
                variant="outline"
                className="border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-900/40 dark:text-blue-300"
              >
                <CheckCircle2 className="size-3" />
                {item} 확인
              </Badge>
            ))}
          </div>

          <div className="mt-4 border-t border-border pt-4">
            <p className="text-xs text-muted-foreground">상태 요약</p>
            <p className="mt-1 text-sm leading-relaxed text-foreground">
              {reportSummary}
            </p>
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
            <ShieldCheck className="size-4 text-muted-foreground" />
            검수·보증 정보
          </h2>

          <dl className="mt-3 space-y-2">
            <div>
              <dt className="text-xs text-muted-foreground">검수 완료일</dt>
              <dd className="text-sm text-foreground">
                {formatInspectionDate(inspectedAt)}
              </dd>
            </div>
          </dl>

          <p className="mt-3 border-t border-border pt-3 text-xs leading-relaxed text-muted-foreground">
            본 도서는 NEWZED 검수 기준에 따라 상태가 확인된 중고 도서입니다.
          </p>
        </Card>

        <LegalFooter />
      </div>
    </main>
  );
}
