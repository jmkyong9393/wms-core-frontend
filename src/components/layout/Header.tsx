'use client';

import Link from 'next/link';
import { useAtomValue } from 'jotai';
import { pendingUploadCountAtom } from '@/features/inbound/store/uploadQueueAtoms';
import { LogoutButton } from '@/features/auth/components/LogoutButton';
import { currentUserAtom } from '@/features/auth/store/authAtoms';
import { maskName } from '@/features/auth/utils/maskName';
import { NotificationBell } from '@/features/notifications/components/NotificationBell';
import { User, CloudUpload, CloudOff } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function Header() {
  const pendingCount = useAtomValue(pendingUploadCountAtom);
  const currentUser = useAtomValue(currentUserAtom);
  const isOnline = true; // 추후 PWA navigator.onLine 연동

  const pathname = usePathname();
  let pageTitle = 'Dashboard';
  if (pathname === '/worker' || pathname.startsWith('/worker/')) pageTitle = '현장 입/출고 관리';
  if (pathname === '/admin/queue') pageTitle = 'HITL 처리 현황';
  if (pathname === '/admin/inspections') pageTitle = '검수 처리 내역';
  if (pathname === '/admin/inventory') pageTitle = '재고·출고 관리';
  if (pathname === '/admin/employees') pageTitle = '직원 계정 관리';
  if (pathname === '/admin/restock') pageTitle = '발주 추천안';

  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-4 lg:px-8">
      {/* Mobile Title Spacer (since hamburger menu is on the left) */}
      <div className="flex items-center">
        <h1 className="text-lg font-semibold text-foreground ml-12 lg:ml-0">
          {pageTitle}
        </h1>
      </div>

      {/* Right Side: Status & Profile */}
      <div className="flex items-center space-x-4">

        {/* Network & Queue Status */}
        <div className="hidden sm:flex items-center px-3 py-1.5 rounded-full bg-muted border border-border">
          {isOnline ? (
            <CloudUpload className="w-4 h-4 text-green-500 dark:text-green-400 mr-2" />
          ) : (
            <CloudOff className="w-4 h-4 text-red-500 dark:text-red-400 mr-2" />
          )}
          <span className="text-xs font-medium text-muted-foreground">
            {isOnline ? 'Online' : 'Offline'}
          </span>
          <div className="w-px h-4 bg-border mx-3"></div>
          <span className="text-xs font-medium text-muted-foreground">
            대기열: <span className={pendingCount > 0 ? "text-blue-600 dark:text-blue-400 font-bold" : ""}>{pendingCount}건</span>
          </span>
        </div>

        {/* Notifications */}
        <NotificationBell />

        {/* User Profile */}
        <div className="flex items-center pl-2 border-l border-border">
          <Link
            href="/mypage"
            className="flex items-center rounded-full hover:bg-accent transition-colors"
          >
            <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/40 rounded-full flex items-center justify-center text-indigo-700 dark:text-indigo-300">
              <User className="w-4 h-4" />
            </div>
            <span className="ml-2 mr-2 text-sm font-medium text-foreground hidden md:block">
              {currentUser ? maskName(currentUser.name) : '현장 관리자'}
            </span>
          </Link>
          <LogoutButton className="ml-3 p-2 text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-accent" />
        </div>
      </div>
    </header>
  );
}
