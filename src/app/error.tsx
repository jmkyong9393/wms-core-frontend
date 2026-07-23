'use client'; // Error components must be Client Components

import { ErrorFallback } from '@/components/error-fallback';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex-1 w-full h-full flex flex-col items-center justify-center">
      <ErrorFallback 
        error={error} 
        reset={reset} 
        title="페이지 렌더링 오류"
        description="해당 화면을 불러오는 도중 예상치 못한 문제가 발생했습니다."
      />
    </div>
  );
}
