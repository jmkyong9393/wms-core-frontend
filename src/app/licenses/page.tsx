import type { Metadata } from "next";
import { LegalPageLayout } from "@/features/legal/components/LegalPageLayout";
import { LegalSection } from "@/features/legal/components/LegalSection";
import { OPEN_SOURCE_LICENSES } from "@/features/legal/content/openSourceLicenses";

export const metadata: Metadata = {
  title: "오픈소스 라이선스 고지 | NEWZED",
};

const EFFECTIVE_DATE = "2026년 8월 7일";

export default function LicensesPage() {
  return (
    <LegalPageLayout title="오픈소스 라이선스 고지" updatedAt={EFFECTIVE_DATE} activeHref="/licenses">
      <p>
        NEWZED는 아래와 같은 오픈소스 소프트웨어를 사용하고 있습니다. 각 구성요소는 해당 라이선스 조건에 따라
        사용되며, 라이선스 원문은 각 프로젝트의 공식 배포처(npm/PyPI 등)에서 확인하실 수 있습니다.
      </p>

      <LegalSection title="오픈소스 구성요소">
        <ul className="divide-y divide-gray-100 dark:divide-zinc-800">
          {OPEN_SOURCE_LICENSES.map((entry) => (
            <li key={entry.name} className="py-3 first:pt-0 last:pb-0">
              <p className="font-mono text-[13px] font-semibold text-gray-900 dark:text-zinc-50">
                {entry.name} <span className="font-sans font-normal text-gray-400 dark:text-zinc-500">({entry.version})</span>
              </p>
              <a
                href={entry.url}
                target="_blank"
                rel="noopener noreferrer"
                className="break-all text-xs text-blue-600 hover:underline dark:text-blue-400"
              >
                {entry.url}
              </a>
              <p className="mt-0.5 text-xs text-gray-400 dark:text-zinc-500">{entry.license}</p>
            </li>
          ))}
        </ul>
      </LegalSection>
    </LegalPageLayout>
  );
}
