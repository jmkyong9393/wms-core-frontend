'use client';

import { useAtomValue } from 'jotai';
import { uploadQueueAtom, hitlQueueAtom } from '@/stores/atoms';
import { Package, Truck, CheckCircle, Camera, Warehouse } from 'lucide-react';
import StatCard from '@/components/features/admin/shared/StatCard';
import PendingHitlStatCard from '@/components/features/admin/dashboard/PendingHitlStatCard';
import InventoryPreview from '@/components/features/admin/dashboard/InventoryPreview';
import RecentInspectionsList from '@/components/features/admin/dashboard/RecentInspectionsList';
import SystemStatusPanel from '@/components/features/admin/dashboard/SystemStatusPanel';
import { mockInventoryItems } from '@/components/features/admin/shared/mockInventory';

export default function DashboardPage() {
  // 관리자 검토 목록 가져오기
  const hitlQueue = useAtomValue(hitlQueueAtom);
  // 로컬 업로드 큐 가져오기
  const uploadQueue = useAtomValue(uploadQueueAtom);

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

      {/* 실시간 업로드 큐 (진행 중인 항목이 있는 경우 표시) */}
      {uploadQueue.length > 0 && (
        <div className="bg-white rounded-xl border border-blue-100 shadow-sm p-5">
          <h3 className="text-base font-bold text-gray-800 mb-3 flex items-center">
            <Camera className="w-5 h-5 mr-2 text-blue-600" />
            실시간 검수/업로드 진행 현황
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[...uploadQueue].reverse().slice(0, 6).map((task) => (
              <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex items-center space-x-3 min-w-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={task.previewUrl} alt="book" className="w-10 h-10 object-cover rounded-md border border-gray-200 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{task.id.replace('local_', 'REQ-')}</p>
                    <p className="text-xs text-gray-500">UBCI 판독 대기 중</p>
                  </div>
                </div>
                <div>
                  {task.status === 'COMPLETED' ? (
                    <span className="px-2.5 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded-full">완료</span>
                  ) : (
                    <span className="px-2.5 py-0.5 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded-full flex items-center">
                      <span className="w-1.5 h-1.5 rounded-full border border-yellow-500 border-t-transparent animate-spin mr-1.5" />
                      분석 중
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <RecentInspectionsList />
        <SystemStatusPanel />
      </div>

      {/* 재고 현황 미리보기 */}
      <InventoryPreview />
    </div>
  );
}
