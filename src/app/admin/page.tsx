'use client';

import { useAtomValue } from 'jotai';
import { hitlQueueAtom } from '@/stores/atoms';
import { Package, Truck, CheckCircle, Warehouse } from 'lucide-react';
import StatCard from '@/components/features/admin/shared/StatCard';
import PendingHitlStatCard from '@/components/features/admin/dashboard/PendingHitlStatCard';
import InventoryPreview from '@/components/features/admin/dashboard/InventoryPreview';
import RecentInspectionsList from '@/components/features/admin/dashboard/RecentInspectionsList';
import SystemStatusPanel from '@/components/features/admin/dashboard/SystemStatusPanel';
import { mockInventoryItems } from '@/components/features/admin/shared/mockInventory';

export default function DashboardPage() {
  // 관리자 검토 목록 가져오기
  const hitlQueue = useAtomValue(hitlQueueAtom);
  // 승인 또는 반려된 항목 수 계산
  const processedCount = hitlQueue.filter(
    (item) => item.status === 'APPROVED' || item.status === 'REJECTED'
  ).length;
  // 전체 가상 재고 수량 계산
  const totalStock = mockInventoryItems.reduce((sum, item) => sum + item.virtualStock, 0);

  return (
    <div className="max-w-6xl mx-auto space-y-6">

      {/* Header Section */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800">물류 센터 통합 대시보드</h2>
        <p className="text-sm text-gray-500 mt-1">실시간 AI 검수 현황 및 재고 요약</p>
      </div>

       {/* 주요 업무 현황을 카드로 표시 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <StatCard
          icon={Package}
          label="오늘의 입고량"
          value="1,284"
          unit="권"
          colorClass="bg-blue-50 text-blue-600"
        />
        <StatCard
          icon={Warehouse}
          label="총 재고 권수"
          value={totalStock}
          unit="권"
          colorClass="bg-yellow-50 text-yellow-600"
        />
        <PendingHitlStatCard />
        <StatCard
          icon={CheckCircle}
          label="처리 완료 (세션)"
          value={processedCount}
          unit="건"
          colorClass="bg-indigo-50 text-indigo-600"
        />
        <StatCard
          icon={Truck}
          label="자동 발주"
          value={12}
          unit="건"
          colorClass="bg-green-50 text-green-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <RecentInspectionsList />
        <SystemStatusPanel />
      </div>

      {/* 재고 현황 미리보기 */}
      <InventoryPreview />
    </div>
  );
}
