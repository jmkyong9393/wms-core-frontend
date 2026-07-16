'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Camera,
  ShoppingCart,
  LineChart,
  Settings,
  Menu,
  X,
  ClipboardList,
  ListChecks,
  Warehouse
} from 'lucide-react';
import { useState } from 'react';

// PM님이 요청하신 사이드바 추천 메뉴 구성
const MENU_ITEMS = [
  { name: '대시보드', href: '/admin', icon: LayoutDashboard },
  { name: '현장 반품 검수', href: '/inbound', icon: Camera },
  { name: '검토 대기', href: '/admin/queue', icon: ListChecks },
  { name: '검수 처리 내역', href: '/admin/inspections', icon: ClipboardList },
  { name: '재고·출고 관리', href: '/admin/inventory', icon: Warehouse },
  { name: '자동 발주 현황', href: '/po', icon: ShoppingCart },
  { name: 'AI 품질 리포트', href: '/reports', icon: LineChart },
];

const BOTTOM_MENU_ITEMS = [
  { name: '설정', href: '/settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile Menu Toggle */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-none border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer"
      >
        {isOpen ? <X className="w-5 h-5 text-black" /> : <Menu className="w-5 h-5 text-black" />}
      </button>

      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/40 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-40
        w-64 bg-white border-r-2 border-black flex flex-col transition-transform duration-300 ease-in-out font-mono
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo Area */}
        <div className="h-16 flex items-center px-6 border-b-2 border-black">
          <span className="text-sm font-black tracking-widest text-black uppercase">
            WMS AI PLATFORM
          </span>
        </div>

        {/* Main Menu */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-2">
          <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 px-3">
            Core Menus
          </div>
          {MENU_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center px-3 py-2.5 rounded-none text-xs font-bold transition-all border-2 border-transparent ${
                  isActive 
                    ? 'bg-black text-white border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]' 
                    : 'text-black hover:bg-black hover:text-white hover:border-black'
                }`}
              >
                <item.icon className="w-4 h-4 mr-3 shrink-0" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Menu */}
        <div className="p-4 border-t-2 border-black">
          {BOTTOM_MENU_ITEMS.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="flex items-center px-3 py-2.5 rounded-none text-xs font-bold text-black border-2 border-transparent hover:bg-black hover:text-white hover:border-black transition-all"
            >
              <item.icon className="w-4 h-4 mr-3 shrink-0" />
              {item.name}
            </Link>
          ))}
        </div>
      </aside>
    </>
  );
}
