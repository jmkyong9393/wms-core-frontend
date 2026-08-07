import type { ReactNode } from "react";

interface LegalSectionProps {
  title: string;
  children: ReactNode;
}

export function LegalSection({ title, children }: LegalSectionProps) {
  return (
    <section>
      <h2 className="mb-2 text-sm font-semibold text-gray-900 dark:text-zinc-50">{title}</h2>
      <div className="space-y-2 text-gray-600 dark:text-zinc-400">{children}</div>
    </section>
  );
}
