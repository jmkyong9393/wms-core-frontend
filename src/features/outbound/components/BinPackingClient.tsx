'use client';

import dynamic from 'next/dynamic';

// 3D 화면은 브라우저에서만 불러오기
const BinPackingCanvas = dynamic(() => import('@/features/outbound/components/BinPackingCanvas'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center text-sm text-gray-400">
      3D 뷰 불러오는 중...
    </div>
  ),
});

// 3D 화면 영역 크기 및 스타일 설정
export default function BinPackingClient() {
  return (
    <div className="h-[70vh] w-full overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
      <BinPackingCanvas />
    </div>
  );
}
