"use client";

import { useSetAtom } from "jotai";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { logout as logoutRequest } from "@/features/auth/api/authService";
import { logoutAtom } from "@/features/auth/store/authAtoms";

interface LogoutButtonProps {
  className?: string;
}

const DEFAULT_CLASS =
  "p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-100";

export function LogoutButton({ className }: LogoutButtonProps) {
  const logout = useSetAtom(logoutAtom);
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logoutRequest();
    } catch (err) {
      // 백엔드 로그아웃 요청이 실패해도 로컬 인증 상태 정리는 계속 진행
      console.error('[Auth] 로그아웃 요청 실패', err);
    }
    logout();
    router.replace("/login");
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      className={className ?? DEFAULT_CLASS}
      aria-label="로그아웃"
      title="로그아웃"
    >
      <LogOut className="w-4 h-4" />
    </button>
  );
}
