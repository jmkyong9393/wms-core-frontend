"use client";

import { useAtomValue } from "jotai";
import { User } from "lucide-react";
import { AuthGuard } from "@/features/auth/components/AuthGuard";
import { LogoutButton } from "@/features/auth/components/LogoutButton";
import { currentUserAtom } from "@/features/auth/store/authAtoms";
import { maskName } from "@/features/auth/utils/maskName";

export default function InboundLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const currentUser = useAtomValue(currentUserAtom);

  return (
    <AuthGuard allow={["WORKER"]}>
      <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 font-sans">
        <header className="sticky top-0 z-30 h-14 flex items-center justify-between px-4 bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800">
          <h1 className="text-base font-semibold text-gray-800 dark:text-zinc-100">
            현장 반품 검수
          </h1>
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
        <main className="flex flex-col items-center p-4">{children}</main>
      </div>
    </AuthGuard>
  );
}
