import Link from 'next/link';
import { mockInventoryItems } from '@/features/inventory/mocks/mockInventory';
import { GRADE_BADGE_STYLE } from '@/features/inspections/utils/gradeBadge';

const PREVIEW_LIMIT = 3;

// 대시보드용 재고 현황 미리보기 
export default function InventoryPreview() {
  const items = mockInventoryItems.slice(0, PREVIEW_LIMIT);

  return (
    <div className="bg-white border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-none p-5 font-mono">
      {/* 제목과 전체 재고 페이지 이동 링크 */}
      <div className="flex items-center justify-between mb-4 border-b-2 border-black pb-2">
        <h3 className="text-sm font-black tracking-wider text-black uppercase">재고 현황 미리보기</h3>
        <Link href="/admin/inventory" className="text-xs font-bold text-black border-b border-black hover:text-[#E60012] hover:border-[#E60012] transition-colors uppercase">
          VIEW ALL →
        </Link>
      </div>

      {/* 재고 등급, 도서명, 판매가 표시 */}
      <div className="divide-y-2 divide-black">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between py-3 px-2 hover:bg-black hover:text-white rounded-none transition-colors group"
          >
            <div className="flex items-center gap-3 min-w-0">
              {/* 등급에 맞는 배지 색상 적용 (둥근 모서리 탈피) */}
              <span
                className={`text-[10px] font-black rounded-none border-2 border-black px-2 py-0.5 shrink-0 ${GRADE_BADGE_STYLE[item.grade]} group-hover:bg-white group-hover:text-black`}
              >
                {item.grade}
              </span>
              <span className="text-xs font-semibold truncate">{item.bookTitle}</span>
            </div>
            <div className="text-xs font-bold shrink-0">
              {item.dynamicPrice.toLocaleString()}원
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
