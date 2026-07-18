"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAtomValue } from "jotai";
import { currentUserAtom, isAuthenticatedAtom } from "@/features/auth/store/authAtoms";
import { ROLE_HOME_ROUTE } from "@/features/auth/constants/roleRoutes";
import type { Role } from "@/features/auth/types/authTypes";

interface AuthGuardProps {
  // 접근 허용 역할 목록. 생략 시 로그인 사용자 전체 접근 허용
  allow?: Role[];
  children: React.ReactNode;
}

 // 로그인 여부와 사용자 역할을 확인하는 페이지 접근 가드
 // 미로그인 사용자의 로그인 페이지 이동 처리
 // 권한 없는 사용자의 역할별 기본 화면 이동 처리
export function AuthGuard({ allow, children }: AuthGuardProps) {
  const pathname = usePathname();
  const router = useRouter();
  const isAuthenticated = useAtomValue(isAuthenticatedAtom);
  const user = useAtomValue(currentUserAtom);

  const isAllowed = isAuthenticated && (!allow || (user !== null && allow.includes(user.role)));

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }
    if (allow && user && !allow.includes(user.role)) {
      router.replace(ROLE_HOME_ROUTE[user.role] ?? "/login");
    }
  }, [isAuthenticated, user, allow, pathname, router]);

  if (!isAllowed) return null;
  return <>{children}</>;
}
