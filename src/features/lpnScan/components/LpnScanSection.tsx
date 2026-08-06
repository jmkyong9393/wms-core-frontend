'use client';

import { Button } from '@/components/ui/button';
import { useLpnScanQuery } from '@/features/lpnScan/hooks/useLpnScanQuery';
import LpnScanView from '@/features/lpnScan/components/LpnScanView';

interface LpnScanSectionProps {
  token: string;
}

// 직원용 LPN 정보 조회 및 화면 상태 처리
export default function LpnScanSection({ token }: LpnScanSectionProps) {
  const { data, isLoading, isError, refetch } = useLpnScanQuery(token);

  if (isLoading) {
    return <p className="p-8 text-center text-sm text-muted-foreground">LPN 정보를 불러오는 중...</p>;
  }

  if (isError || !data) {
    return (
      <div className="p-8 text-center space-y-3">
        <p className="text-sm text-red-600 dark:text-red-400">LPN 정보를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.</p>
        <Button type="button" onClick={() => refetch()}>
          다시 시도
        </Button>
      </div>
    );
  }

  return <LpnScanView detail={data} />;
}
