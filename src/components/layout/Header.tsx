'use client';

import { useAtomValue, useSetAtom } from 'jotai';
import { pendingUploadCountAtom } from '@/features/inbound/store/uploadQueueAtoms';
import { userAtom, tokenAtom } from '@/stores/atoms';
import { Bell, User, CloudUpload, CloudOff, LogOut } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { authService } from '@/services/authService';

export default function Header() {
  const pendingCount = useAtomValue(pendingUploadCountAtom);
  const isOnline = true; // 추후 PWA navigator.onLine 연동

  const user = useAtomValue(userAtom);
  const setToken = useSetAtom(tokenAtom);
  const setUser = useSetAtom(userAtom);

  const handleLogout = () => {
    authService.logout();
    setToken(null);
    setUser(null);
  };

  const pathname = usePathname();
  let pageTitle = 'Dashboard';
  if (pathname === '/inbound') pageTitle = '현장 반품 검수';
  if (pathname === '/po') pageTitle = '자동 발주 현황';
  if (pathname === '/reports') pageTitle = 'AI 품질 리포트';
  if (pathname === '/admin/queue') pageTitle = '검토 대기';
  if (pathname === '/admin/inspections') pageTitle = '검수 처리 내역';
  if (pathname === '/admin/inventory') pageTitle = '재고·출고 관리';

  return (
    <header className="h-16 bg-white border-b-2 border-black flex items-center justify-between px-4 lg:px-8 font-mono">
      {/* Mobile Title Spacer (since hamburger menu is on the left) */}
      <div className="flex items-center">
        <h1 className="text-sm font-black tracking-widest text-black uppercase ml-12 lg:ml-0">
          {pageTitle}
        </h1>
      </div>

      {/* Right Side: Status & Profile */}
      <div className="flex items-center space-x-4">
        
        {/* Network & Queue Status: 둥근 모서리 없이 보더와 미니 섀도우 */}
        <div className="hidden sm:flex items-center px-3 py-1.5 rounded-none bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
          {isOnline ? (
            <CloudUpload className="w-4 h-4 text-black mr-2 shrink-0" />
          ) : (
            <CloudOff className="w-4 h-4 text-[#E60012] mr-2 shrink-0" />
          )}
          <span className="text-[10px] font-black text-black uppercase tracking-wider">
            {isOnline ? 'Online' : 'Offline'}
          </span>
          <div className="w-0.5 h-3 bg-black mx-3"></div>
          <span className="text-[10px] font-black text-black uppercase tracking-wider">
            QUEUE: <span className={pendingCount > 0 ? "text-[#E60012] font-black" : "text-black"}>{pendingCount}EA</span>
          </span>
        </div>

        {/* Notifications: 2D 오프셋 그림자와 각진 모서리 */}
        <button className="relative p-2 text-black bg-white hover:bg-black hover:text-white transition-all rounded-none border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none cursor-pointer">
          <Bell className="w-4 h-4" />
          {pendingCount > 0 && (
            <span className="absolute top-0 right-0 w-2 h-2 bg-[#E60012] border border-black rounded-none"></span>
          )}
        </button>

        {/* User Profile */}
        <div className="flex items-center pl-4 border-l-2 border-black space-x-3">
          <div className="flex items-center">
            {/* 아바타: 각진 검은색 테두리 */}
            <div className="w-8 h-8 bg-black text-white border-2 border-black rounded-none flex items-center justify-center shrink-0">
              <User className="w-4 h-4" />
            </div>
            <div className="ml-2 hidden md:flex flex-col text-left">
              <span className="text-[10px] font-bold text-black uppercase tracking-wider">
                {user?.name || 'USER'}
              </span>
              <span className="text-[9px] text-gray-400 font-black uppercase tracking-widest mt-0.5">
                {user?.role === 'MASTER' ? 'ADMIN' : user?.role === 'WORKER' ? 'WORKER' : 'GUEST'}
              </span>
            </div>
          </div>

          {/* Logout Button: 각진 테두리와 미니 섀도우 인터랙션 */}
          <button
            onClick={handleLogout}
            title="LOGOUT"
            className="p-1.5 text-black hover:bg-black hover:text-white rounded-none border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all cursor-pointer bg-white"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
