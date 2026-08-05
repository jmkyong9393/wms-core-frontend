"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAtomValue } from "jotai";
import { ArrowLeft, User } from "lucide-react";
import { AuthGuard } from "@/features/auth/components/AuthGuard";
import { LogoutButton } from "@/features/auth/components/LogoutButton";
import { currentUserAtom } from "@/features/auth/store/authAtoms";
import { maskName } from "@/features/auth/utils/maskName";

// 피킹 화면 전용 작업자 레이아웃
export default function OutboundPickingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // 로그인한 사용자 정보
  const currentUser = useAtomValue(currentUserAtom);

  // 목록 화면에서는 출고 프로세스 선택으로, 상세(스캔) 화면에서는 피킹 목록으로 되돌아간다
  const pathname = usePathname();
  const backHref = pathname === "/outbound/picking" ? "/worker/outbound" : "/outbound/picking";

  return (
    <AuthGuard allow={["WORKER", "MASTER", "ADMIN"]}>
      <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 font-sans">
        {/* 상단 작업자 헤더 */}
        <header className="sticky top-0 z-30 h-14 flex items-center justify-between px-4 bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800">
          <div className="flex items-center gap-1">
            <Link
              href={backHref}
              className="p-2 -ml-2 text-gray-400 hover:text-gray-600 dark:text-zinc-500 dark:hover:text-zinc-300 transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-base font-semibold text-gray-800 dark:text-zinc-100">
              출고 피킹
            </h1>
          </div>

          {/* 사용자 정보 및 로그아웃 */}
          <div className="flex items-center pl-2 border-l border-gray-200 dark:border-zinc-800">
            <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/40 rounded-full flex items-center justify-center text-indigo-700 dark:text-indigo-300">
              <User className="w-4 h-4" />
            </div>
            {currentUser && (
              <span className="ml-2 text-sm font-medium text-gray-700 dark:text-zinc-200 hidden md:block">
                {maskName(currentUser.name)}
              </span>
            )}
            <LogoutButton className="ml-3 p-2 text-gray-400 hover:text-gray-600 dark:text-zinc-500 dark:hover:text-zinc-300 transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800" />
          </div>
        </header>

        {/* 피킹 화면 영역 */}
        <main className="flex flex-col items-center p-4">{children}</main>
      </div>
    </AuthGuard>
  );
}
