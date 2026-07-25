import { Package } from 'lucide-react';
import BinPackingClient from '@/features/outbound/components/BinPackingClient';
import RecommendedBoxPanel from '@/features/outbound/components/RecommendedBoxPanel';
import OrderBooksPanel from '@/features/outbound/components/OrderBooksPanel';

// 스마트 패킹 화면 구성
export default function PackingVisualizationView() {
  return (
    <div className="flex flex-col h-full bg-gray-50/50 min-h-screen">
      <div className="flex-none p-4 bg-white border-b border-gray-100 shadow-sm sticky top-0 z-30">
        <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Package className="h-6 w-6 text-orange-600" />
          스마트 패킹
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          주문 도서에 적합한 포장 박스와 적재 방법을 확인하세요.
        </p>
      </div>

      <div className="flex-1 p-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
          <div className="lg:col-span-1 space-y-3">
            <RecommendedBoxPanel />
            <OrderBooksPanel />
          </div>
          <div className="lg:col-span-3">
            <h3 className="text-base font-bold text-gray-800 mb-3">3D 적재 미리보기</h3>
            <BinPackingClient />
          </div>
        </div>
      </div>
    </div>
  );
}
