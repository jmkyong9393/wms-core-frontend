import Link from "next/link";
import type { ReactNode } from "react";

const LEGAL_NAV_ITEMS = [
  { href: "/privacy", label: "개인정보 처리방침" },
  { href: "/terms", label: "이용약관" },
  { href: "/licenses", label: "오픈소스 라이선스" },
] as const;

interface LegalPageLayoutProps {
  title: string;
  updatedAt: string;
  activeHref: (typeof LEGAL_NAV_ITEMS)[number]["href"];
  children: ReactNode;
}

export function LegalPageLayout({ title, updatedAt, activeHref, children }: LegalPageLayoutProps) {
  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10 dark:bg-zinc-950">
      <div className="mx-auto max-w-2xl space-y-4">
        <div className="text-center">
          <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            NEWZED
          </span>
        </div>

        <nav className="flex justify-center gap-1 rounded-full border border-gray-200 bg-white p-1 text-xs dark:border-zinc-800 dark:bg-zinc-900">
          {LEGAL_NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-full px-3 py-1.5 font-medium transition-colors ${
                item.href === activeHref
                  ? "bg-gray-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                  : "text-gray-500 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8 dark:border-zinc-800 dark:bg-zinc-900">
          <header className="mb-6 border-b border-gray-100 pb-4 dark:border-zinc-800">
            <h1 className="text-xl font-bold text-gray-900 dark:text-zinc-50">{title}</h1>
            <p className="mt-1 text-xs text-gray-400 dark:text-zinc-500">시행일: {updatedAt}</p>
          </header>

          <div className="space-y-6 text-sm leading-relaxed text-gray-700 dark:text-zinc-300">
            {children}
          </div>
        </div>
      </div>
    </main>
  );
}
