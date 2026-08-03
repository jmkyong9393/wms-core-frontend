'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useAuthSession } from '@/features/auth/hooks/useAuthSession';
import LpnScanSection from '@/features/lpnScan/components/LpnScanSection';
import type { Role } from '@/features/auth/types/authTypes';

const STAFF_ROLES: readonly Role[] = ['MASTER', 'ADMIN', 'WORKER'];

const REDIRECTING_MESSAGE = (
  <p className="p-8 text-center text-sm text-gray-400">페이지를 이동하고 있습니다...</p>
);

// QR 스캔 후 사용자 역할에 맞는 화면으로 분기
// 직원은 LPN 상세를 표시하고, 그 외 사용자는 공개 인증서로 이동
export default function ScanPage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();
  const authSession = useAuthSession();

  const role = authSession.status === 'ready' ? authSession.currentUser.role : null;
  const isStaff = !!role && STAFF_ROLES.includes(role);

  const shouldRedirectToCertificate =
    authSession.status === 'unauthenticated' ||
    authSession.status === 'pendingPasswordChange' ||
    (authSession.status === 'ready' && !isStaff);

  useEffect(() => {
    if (shouldRedirectToCertificate) {
      router.replace(`/certificate/${token}`);
    }
  }, [shouldRedirectToCertificate, router, token]);

  if (authSession.status === 'loading') {
    return <p className="p-8 text-center text-sm text-gray-400">세션 확인 중...</p>;
  }

  if (authSession.status === 'error') {
    return (
      <div className="p-8 text-center space-y-3">
        <p className="text-sm text-red-600">세션 정보를 확인하지 못했습니다. 잠시 후 다시 시도해 주세요.</p>
        <Button type="button" onClick={authSession.retry}>
          다시 시도
        </Button>
      </div>
    );
  }

  // 페이지 이동이 완료될 때까지 안내 표시
  if (shouldRedirectToCertificate) {
    return REDIRECTING_MESSAGE;
  }

  return <LpnScanSection token={token} />;
}
