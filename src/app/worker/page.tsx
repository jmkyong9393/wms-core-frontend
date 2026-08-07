"use client";

import Link from "next/link";
import { ArrowDownToLine, ArrowUpFromLine, Home } from "lucide-react";
import { useAuthSession } from "@/features/auth/hooks/useAuthSession";

export default function WorkerPortalPage() {
  const authSession = useAuthSession();
  const role = authSession.status === "ready" ? authSession.currentUser?.role : null;
  const isManager = role === 'MASTER' || role === 'ADMIN';

  return (
    <div className="w-full max-w-md mx-auto my-auto flex flex-col justify-center space-y-6 py-8">
      <div className="text-center space-y-1">
        <h2 className="text-xl font-extrabold text-gray-800 dark:text-zinc-50">
          오늘 진행할 작업을 선택해 주세요
        </h2>
        <p className="text-xs text-gray-400 dark:text-zinc-500">
          작업 성격에 따라 해당 영역을 터치하여 진입하세요.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {/* Inbound Button Card */}
        <Link
          href="/worker/inbound"
          className="group block relative overflow-hidden rounded-xl border border-border bg-card p-6 shadow-sm transition-shadow duration-200 hover:border-primary/40 hover:shadow-md active:scale-[0.98]"
        >
          <div className="flex items-center space-x-4">
            <div className="rounded-2xl bg-primary/10 p-4 text-primary transition-transform duration-200 group-hover:scale-110">
              <ArrowDownToLine className="w-8 h-8" />
            </div>
            <div className="flex-1 space-y-1">
              <h3 className="text-lg font-bold text-gray-800 dark:text-zinc-100 flex items-center">
                입고 프로세스 (Inbound)
              </h3>
              <p className="text-xs text-gray-400 dark:text-zinc-500">
                도서 신품 즉시 입고 및 중고/반품 AI 검수 및 분류
              </p>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-8 -mt-8 transition-transform duration-200 group-hover:scale-150" />
        </Link>

        {/* Outbound Button Card */}
        <Link
          href="/worker/outbound"
          className="group block relative overflow-hidden rounded-xl border border-border bg-card p-6 shadow-sm transition-shadow duration-200 hover:border-orange-400 dark:hover:border-orange-500 active:scale-[0.98]"
        >
          <div className="flex items-center space-x-4">
            <div className="bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 p-4 rounded-2xl transition-transform duration-200 group-hover:scale-110">
              <ArrowUpFromLine className="w-8 h-8" />
            </div>
            <div className="flex-1 space-y-1">
              <h3 className="text-lg font-bold text-gray-800 dark:text-zinc-100">
                출고 프로세스 (Outbound)
              </h3>
              <p className="text-xs text-gray-400 dark:text-zinc-500">
                출고 대상 도서의 피킹 지시서 및 스마트 패킹 연동
              </p>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/5 rounded-full -mr-8 -mt-8 transition-transform duration-200 group-hover:scale-150" />
        </Link>
      </div>

      {isManager && (
        <div className="pt-4">
          <Link
            href="/admin"
            className="flex items-center justify-center space-x-2 text-sm text-gray-500 hover:text-gray-800 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors duration-200 bg-gray-50 hover:bg-gray-100 dark:bg-zinc-800/50 dark:hover:bg-zinc-800 p-4 rounded-xl border border-transparent hover:border-gray-200 dark:hover:border-zinc-700"
          >
            <Home className="w-5 h-5" />
            <span className="font-medium">관리자 대시보드로 돌아가기</span>
          </Link>
        </div>
      )}
    </div>
  );
}
