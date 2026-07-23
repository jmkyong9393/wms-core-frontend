'use client'; // Error components must be Client Components

import { ErrorFallback } from '@/components/error-fallback';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="ko">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <div className="flex h-screen w-screen flex-col items-center justify-center">
          <ErrorFallback 
            error={error} 
            reset={reset} 
            title="치명적인 오류 발생"
            description="시스템 전체 레이아웃을 불러오는 중 문제가 발생했습니다."
          />
        </div>
      </body>
    </html>
  );
}
