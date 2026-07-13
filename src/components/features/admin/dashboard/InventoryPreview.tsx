import Link from 'next/link';
import { mockInventoryItems } from '@/components/features/admin/shared/mockInventory';
import { GRADE_BADGE_STYLE } from '@/lib/gradeBadge';

const PREVIEW_LIMIT = 3;

// 대시보드용 재고 현황 미리보기 
export default function InventoryPreview() {
  const items = mockInventoryItems.slice(0, PREVIEW_LIMIT);

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      {/* 제목과 전체 재고 페이지 이동 링크 */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-bold text-gray-800">재고 현황 미리보기</h3>
        <Link href="/admin/inventory" className="text-sm font-medium text-blue-600 hover:underline">
          전체 보기 →
        </Link>
      </div>

      {/* 재고 등급, 도서명, 판매가 표시 */}
      <div className="space-y-1">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between py-2 px-2 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <div className="flex items-center gap-2 min-w-0">

              {/* 등급에 맞는 배지 색상 적용 */}
              <span
                className={`text-xs font-semibold rounded-full px-2 py-0.5 shrink-0 ${GRADE_BADGE_STYLE[item.grade]}`}
              >
                {item.grade}
              </span>
              <span className="text-sm font-medium text-gray-700 truncate">{item.bookTitle}</span>
            </div>
            <div className="text-sm font-semibold text-gray-800 shrink-0">
              {item.dynamicPrice.toLocaleString()}원
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
