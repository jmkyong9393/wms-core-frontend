'use client';

import { useEffect } from 'react';
import { useAtom } from 'jotai';
import { hitlActionErrorAtom } from '@/features/queue/store/queueAtoms';

// HITL 승인/반려/재검토/검토시작 실패 시 오류 메시지 보여주는 알림
// 카드가 화면에서 사라져도 오류 메시지가 계속 보이도록 관리
export default function HitlActionErrorToast() {
  const [message, setMessage] = useAtom(hitlActionErrorAtom);

  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(null), 2500);
    return () => clearTimeout(timer);
  }, [message, setMessage]);

  if (!message) return null;

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      <div className="px-4 py-3 rounded-xl shadow-lg font-medium text-xs text-center backdrop-blur-md bg-red-500/90 text-white">
        {message}
      </div>
    </div>
  );
}