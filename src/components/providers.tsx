"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Provider as JotaiProvider, useAtomValue, useStore } from "jotai";
import { useEffect, useState } from "react";
import { MockProvider } from "@/mocks/MockProvider";
import { AUTH_SESSION_EXPIRED_EVENT } from "@/lib/api-client";
import { logoutAtom } from "@/features/auth/store/authAtoms";
import { themeAtom } from "@/stores/atoms";

// 인증 만료 이벤트를 감지해 로그인 상태 초기화
export function AuthSessionExpiredWatcher() {
  const store = useStore();

  useEffect(() => {
    // 기존 로그아웃 상태 처리 재사용
    function handleAuthSessionExpired() {
      store.set(logoutAtom);
    }
    // 인증 만료 이벤트 등록

    window.addEventListener(AUTH_SESSION_EXPIRED_EVENT, handleAuthSessionExpired);
    return () => window.removeEventListener(AUTH_SESSION_EXPIRED_EVENT, handleAuthSessionExpired);
  }, [store]);

  return null;
}

// themeAtom(light/dark) 값을 <html>의 .dark 클래스에 반영
export function ThemeSync() {
  const theme = useAtomValue(themeAtom);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  return null;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  // QueryClient는 각 세션마다 독립적으로 인스턴스를 유지해야 하므로 useState 안에 선언
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1분간 캐시 유지
            retry: 1, // 실패 시 1회 재시도
            refetchOnWindowFocus: false, // 윈도우 포커스 시 자동 새로고침 방지
          },
        },
      })
  );

  return (
    <MockProvider>
      <QueryClientProvider client={queryClient}>
        <JotaiProvider>
          <AuthSessionExpiredWatcher />
          <ThemeSync />
          {children}
        </JotaiProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </MockProvider>
  );
}
