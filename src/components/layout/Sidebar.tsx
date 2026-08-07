'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Camera,
  ShoppingCart,
  Settings,
  Menu,
  X,
  ClipboardList,
  ListChecks,
  Warehouse,
  Users,
  Truck,
  ScanLine,
  Package
} from 'lucide-react';
import { useState } from 'react';

// PM님이 요청하신 사이드바 추천 메뉴 구성
const COMMON_MENU_ITEMS = [
  { name: '통합 대시보드', href: '/admin', icon: LayoutDashboard },
  { name: '현장 입/출고 관리', href: '/worker', icon: Package },
];

const INBOUND_MENU_ITEMS = [
  { name: 'HITL 처리 현황', href: '/admin/queue', icon: ListChecks },
  { name: '검수 처리 내역', href: '/admin/inspections', icon: ClipboardList },
  { name: '발주 추천안', href: '/admin/restock', icon: ShoppingCart },
];

// 스마트 패킹은 백엔드 미구현 예정으로 진입 경로만 숨김 (라우트/컴포넌트는 유지)
const OUTBOUND_MENU_ITEMS = [
  { name: '재고 관리', href: '/admin/inventory', icon: Warehouse },
  { name: 'LPN 조회', href: '/admin/lpn', icon: ScanLine },
  { name: '피킹 현황', href: '/admin/picking', icon: Truck },
];

// 운영 메뉴와 성격이 달라 구분선 아래 별도로 배치하는 관리자용 메뉴
const ADMIN_MENU_ITEMS = [
  { name: '직원 계정 관리', href: '/admin/employees', icon: Users },
];

const BOTTOM_MENU_ITEMS = [
  { name: '설정', href: '/settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const renderMenuItem = (item: (typeof COMMON_MENU_ITEMS)[number]) => {
    const isActive = pathname === item.href;
    return (
      <Link
        key={item.name}
        href={item.href}
        onClick={() => setIsOpen(false)}
        className={`flex items-center px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
          isActive
            ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300'
            : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
        }`}
      >
        <item.icon className={`w-4 h-4 mr-2.5 ${isActive ? 'text-blue-700 dark:text-blue-300' : 'text-sidebar-foreground/50'}`} />
        {item.name}
      </Link>
    );
  };

  return (
    <>
      {/* Mobile Menu Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-card rounded-md shadow-sm border border-border"
      >
        {isOpen ? <X className="w-5 h-5 text-foreground" /> : <Menu className="w-5 h-5 text-foreground" />}
      </button>

      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/20 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-40
        w-64 bg-sidebar border-r border-sidebar-border flex flex-col transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo Area */}
        <div className="h-16 flex items-center px-6 border-b border-sidebar-border">
          <Link
            href="/admin"
            onClick={() => setIsOpen(false)}
            className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent cursor-pointer hover:opacity-80 transition-opacity"
          >
            NEWZED
          </Link>
        </div>

        {/* Main Menu */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-4">
          <div className="space-y-1">
            <div className="text-[10px] font-bold text-sidebar-foreground/50 uppercase tracking-wider mb-1.5 px-3">
              공통 현황
            </div>
            {COMMON_MENU_ITEMS.map(renderMenuItem)}
          </div>

          <div className="space-y-1">
            <div className="text-[10px] font-bold text-sidebar-foreground/50 uppercase tracking-wider mb-1.5 px-3">
              입고 업무 (Inbound)
            </div>
            {INBOUND_MENU_ITEMS.map(renderMenuItem)}
          </div>

          <div className="space-y-1">
            <div className="text-[10px] font-bold text-sidebar-foreground/50 uppercase tracking-wider mb-1.5 px-3">
              출고 업무 (Outbound)
            </div>
            {OUTBOUND_MENU_ITEMS.map(renderMenuItem)}
          </div>

          <div className="my-2 border-t border-sidebar-border" />
          <div className="space-y-1">
            {ADMIN_MENU_ITEMS.map(renderMenuItem)}
          </div>
        </nav>

        {/* Bottom Menu */}
        <div className="p-4 border-t border-sidebar-border">
          {BOTTOM_MENU_ITEMS.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="flex items-center px-3 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
            >
              <item.icon className="w-5 h-5 mr-3 text-sidebar-foreground/50" />
              {item.name}
            </Link>
          ))}
        </div>
      </aside>
    </>
  );
}
