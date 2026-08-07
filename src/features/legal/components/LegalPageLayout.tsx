import Link from "next/link";
import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";

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
          <span className="text-lg font-bold bg-gradient-to-r from-brand-from to-brand-to bg-clip-text text-transparent">
            NEWZED
          </span>
        </div>

        <nav className="flex justify-center gap-1 rounded-full border border-border bg-card p-1 text-xs">
          {LEGAL_NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-full px-3 py-1.5 font-medium transition-colors ${
                item.href === activeHref
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <Card className="p-6 sm:p-8">
          <header className="mb-6 border-b border-border pb-4">
            <h1 className="text-xl font-bold text-foreground">{title}</h1>
            <p className="mt-1 text-xs text-muted-foreground">시행일: {updatedAt}</p>
          </header>

          <div className="space-y-6 text-sm leading-relaxed text-foreground">
            {children}
          </div>
        </Card>
      </div>
    </main>
  );
}
