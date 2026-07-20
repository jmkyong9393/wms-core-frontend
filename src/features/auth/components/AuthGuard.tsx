"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAtomValue } from "jotai";
import { isAuthenticatedAtom, mustChangePasswordAtom, sessionAtom } from "@/features/auth/store/authAtoms";
import { ROLE_HOME_ROUTE } from "@/features/auth/constants/roleRoutes";
import type { Role } from "@/features/auth/types/authTypes";

interface AuthGuardProps {
  // 접근 가능한 역할. 미지정 시 로그인 사용자 전체 허용
  allow?: Role[];
  children: React.ReactNode;
}

// 로그인 상태와 역할에 따른 페이지 접근 제어
export function AuthGuard({ allow, children }: AuthGuardProps) {
  const pathname = usePathname();
  const router = useRouter();
  const isAuthenticated = useAtomValue(isAuthenticatedAtom);
  const session = useAtomValue(sessionAtom);
  const mustChangePassword = useAtomValue(mustChangePasswordAtom);

  // 비밀번호 변경 화면을 제외한 강제 변경 여부
  const needsPasswordChange = mustChangePassword && pathname !== "/change-password";

   // 현재 페이지 표시 가능 여부
  const isAllowed =
    isAuthenticated &&
    !needsPasswordChange &&
    (!allow || (session !== null && allow.includes(session.role)));

  useEffect(() => {
    // 미로그인 사용자 처리
    if (!isAuthenticated) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }
    // 최초 비밀번호 변경 처리
    if (needsPasswordChange) {
      router.replace("/change-password");
      return;
    }
    // 접근 권한이 없는 역할 처리
    if (allow && session && !allow.includes(session.role)) {
      router.replace(ROLE_HOME_ROUTE[session.role] ?? "/login");
    }
  }, [isAuthenticated, needsPasswordChange, session, allow, pathname, router]);

  if (!isAllowed) return null;
  return <>{children}</>;
}
