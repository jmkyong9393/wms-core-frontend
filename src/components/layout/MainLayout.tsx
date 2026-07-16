'use client';

import React, { useEffect, useState } from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
import { tokenAtom, userAtom, isAuthenticatedAtom } from '@/stores/atoms';
import { authService } from '@/services/authService';
import AuthPage from '@/components/features/auth/AuthPage';
import Sidebar from './Sidebar';
import Header from './Header';

/**
 * 메인 애플리케이션 레이아웃 컴포넌트
 * 
 * 로그인 인증 상태를 감시하여 비로그인 유저인 경우 사이드바, 헤더, 페이지 본문 대신 AuthPage를 렌더링합니다.
 * Next.js SSR 및 하이드레이션 오류 방지를 위해 마운트 완료 여부를 체크합니다.
 */
export default function MainLayout({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAtomValue(isAuthenticatedAtom);
  const setToken = useSetAtom(tokenAtom);
  const setUser = useSetAtom(userAtom);
  
  const [mounted, setMounted] = useState(false);

  // 컴포넌트 마운트 시 브라우저 로컬 스토리지에서 세션을 복원
  useEffect(() => {
    const session = authService.restoreSession();
    if (session) {
      setToken(session.token);
      setUser(session.user);
    }
    // 동기식 상태 변경(setState)이 이펙트 안에서 바로 호출되어 발생하는 
    // 폭포수식 리렌더링(cascading render) 경고를 해결하고 성능을 최적화하기 위해
    // 비동기 매크로태스크 대기열(setTimeout)로 상태 전환을 예약합니다.
    const timer = setTimeout(() => {
      setMounted(true);
    }, 0);
    return () => clearTimeout(timer);
  }, [setToken, setUser]);

  // 하이드레이션 이전 시점(서버 렌더링 포함)에는 화면 깜빡임 방지를 위해 로딩 플레이스홀더 렌더링
  if (!mounted) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-slate-400 text-xs font-medium">시스템 로드 중...</span>
        </div>
      </div>
    );
  }

  // 로그인 상태가 아닌 경우 오직 로그인/회원가입 카드만 노출
  if (!isAuthenticated) {
    return <AuthPage />;
  }

  // 로그인 상태일 때만 정상적인 어플리케이션 본문 노출
  return (
    <div className="flex h-screen bg-[#F9F9F7] overflow-hidden font-mono text-black">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
