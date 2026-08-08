"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function WorkerInboundLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="w-full max-w-2xl mx-auto space-y-4 flex flex-col h-full">
      <div className="shrink-0 flex items-center">
        <Link
          href="/worker"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-gray-500 hover:text-gray-700 dark:hover:text-zinc-200 bg-card border border-border rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          작업 선택으로 돌아가기
        </Link>
      </div>
      <div className="flex-1 flex flex-col">
        {children}
      </div>
    </div>
  );
}
