import Link from "next/link";

const FULL_LINKS = [
  { href: "/privacy", label: "개인정보 처리방침" },
  { href: "/terms", label: "이용약관" },
  { href: "/licenses", label: "오픈소스 라이선스" },
] as const;

const COMPACT_LINKS = [
  { href: "/privacy", label: "개인정보 처리방침" },
  { href: "/terms", label: "이용약관" },
] as const;

interface LegalFooterProps {
  /** "full": 개인정보/이용약관/라이선스 3개, 가운데 정렬(기본값). "compact": 개인정보/이용약관 2개, 굵은 링크 + 하단 정보 줄이 있는 사이트 푸터 스타일 */
  variant?: "full" | "compact";
}

export function LegalFooter({ variant = "full" }: LegalFooterProps) {
  if (variant === "compact") {
    return (
      <footer className="mt-8 border-t border-gray-200 pt-4 text-xs dark:border-zinc-800">
        <div className="flex gap-4 font-semibold text-gray-700 dark:text-zinc-200">
          {COMPACT_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-gray-900 dark:hover:text-white">
              {link.label}
            </Link>
          ))}
        </div>
        <p className="mt-2 text-gray-400 dark:text-zinc-500">
          © 2026 NEWZED AI_05조. All rights reserved.
        </p>
      </footer>
    );
  }

  return (
    <footer className="mt-6 flex justify-center gap-3 text-xs text-gray-400 dark:text-zinc-500">
      {FULL_LINKS.map((link, index) => (
        <span key={link.href} className="flex items-center gap-3">
          <Link href={link.href} className="hover:text-gray-600 dark:hover:text-zinc-300">
            {link.label}
          </Link>
          {index < FULL_LINKS.length - 1 && <span aria-hidden>·</span>}
        </span>
      ))}
    </footer>
  );
}
