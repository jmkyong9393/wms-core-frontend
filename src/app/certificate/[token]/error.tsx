'use client';

export default function CertificateError({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="text-center">
        <p className="text-sm text-red-500">보증서를 불러오는데 실패했습니다.</p>
        <button
          onClick={reset}
          className="mt-3 rounded-full border border-gray-200 px-4 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-100"
        >
          다시 시도
        </button>
      </div>
    </main>
  );
}
