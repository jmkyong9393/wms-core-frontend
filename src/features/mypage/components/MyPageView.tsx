"use client";

import Link from "next/link";
import { useAtomValue } from "jotai";
import { ArrowLeft } from "lucide-react";
import { currentUserAtom } from "@/features/auth/store/authAtoms";
import { ROLE_HOME_ROUTE } from "@/features/auth/constants/roleRoutes";
import { ChangePasswordForm } from "@/features/auth/components/ChangePasswordForm";
import { ProfileInfoCard } from "@/features/mypage/components/ProfileInfoCard";
import { Card } from "@/components/ui/card";

export function MyPageView() {
  const currentUser = useAtomValue(currentUserAtom);
  const homeRoute = (currentUser && ROLE_HOME_ROUTE[currentUser.role]) || "/login";

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 dark:bg-zinc-950 sm:py-12">
      <div className="mx-auto w-full max-w-lg space-y-4">
        <Link
          href={homeRoute}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-muted-foreground hover:text-foreground bg-card border border-border rounded-lg hover:shadow-xs transition-all cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          홈으로 돌아가기
        </Link>

        <Card className="p-6 sm:p-8">
          <div className="mb-4 text-center">
            <span className="text-lg font-bold bg-gradient-to-r from-brand-from to-brand-to bg-clip-text text-transparent">
              NEWZED
            </span>
            <h1 className="mt-1 text-base font-semibold text-foreground">마이페이지</h1>
          </div>
          <ProfileInfoCard />
        </Card>

        <Card className="p-6 sm:p-8">
          <h2 className="mb-4 text-sm font-semibold text-foreground">비밀번호 변경</h2>
          <ChangePasswordForm />
        </Card>
      </div>
    </div>
  );
}
