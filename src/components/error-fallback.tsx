'use client';

import { useEffect } from 'react';
import { AlertCircle, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorFallbackProps {
  error: Error & { digest?: string };
  reset: () => void;
  title?: string;
  description?: string;
}

export function ErrorFallback({
  error,
  reset,
  title = '오류가 발생했습니다',
  description = '시스템을 불러오는 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.',
}: ErrorFallbackProps) {
  useEffect(() => {
    // 에러 리포팅 서비스(예: Sentry)에 에러를 기록할 수 있습니다.
    console.error('Error Boundary Caught:', error);
  }, [error]);

  return (
    <div className="flex h-full min-h-[400px] w-full flex-col items-center justify-center p-6 bg-gray-50/50">
      <div className="flex flex-col items-center text-center max-w-md p-8 bg-white rounded-2xl shadow-sm ring-1 ring-gray-900/5">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-500 mb-6 ring-8 ring-red-50/50">
          <AlertCircle className="h-8 w-8" />
        </div>
        
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          {title}
        </h2>
        
        <p className="text-sm text-gray-500 mb-8 leading-relaxed">
          {description}
        </p>

        <div className="flex flex-col gap-3 w-full sm:flex-row sm:justify-center">
          <Button 
            onClick={() => reset()}
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all flex items-center justify-center gap-2 h-11 px-8 rounded-xl"
          >
            <RefreshCcw className="h-4 w-4" />
            다시 시도
          </Button>
          
          <Button 
            variant="outline"
            onClick={() => window.location.href = '/'}
            className="border-gray-200 text-gray-600 hover:bg-gray-50 transition-all h-11 px-8 rounded-xl"
          >
            홈으로 이동
          </Button>
        </div>
        
        {/* 개발 환경에서만 에러 상세 내역 표시 */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 p-4 bg-red-50/50 rounded-lg w-full text-left overflow-hidden">
            <p className="text-xs font-mono text-red-600 break-words">
              {error.message}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
