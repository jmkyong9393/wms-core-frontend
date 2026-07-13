import { mockInventoryItems } from '@/components/features/admin/shared/mockInventory';
import { GRADE_BADGE_STYLE } from '@/lib/gradeBadge';

export default function InventoryPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* 페이지 제목과 설명 */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800">재고·출고 관리</h2>
        <p className="text-sm text-gray-500 mt-1">
          UBCI 등급별 가상 재고와 동적 가격(Dynamic Pricing) 현황입니다.
        </p>
      </div>

      {/* 재고와 가격 정보를 표 형태로 표시 */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-left text-gray-500">
              <th className="px-4 py-3 font-medium">도서명</th>
              <th className="px-4 py-3 font-medium">등급</th>
              <th className="px-4 py-3 font-medium">UBCI</th>
              <th className="px-4 py-3 font-medium">재고</th>
              <th className="px-4 py-3 font-medium">위치</th>
              <th className="px-4 py-3 font-medium">정가</th>
              <th className="px-4 py-3 font-medium">할인가</th>
              <th className="px-4 py-3 font-medium">할인율</th>
            </tr>
          </thead>
          <tbody>
            {mockInventoryItems.map((item) => {
              // 정가와 할인가를 비교해 할인율 계산
              const discountRate = Math.round(
                (1 - item.dynamicPrice / item.basePrice) * 100
              );
              return (
                <tr key={item.id} className="border-b border-gray-50 last:border-0">
                  <td className="px-4 py-3 font-medium text-gray-800">{item.bookTitle}</td>
                  <td className="px-4 py-3">
                    {/* 등급에 맞는 배지 색상 적용 */}
                    <span
                      className={`text-xs font-semibold rounded-full px-2 py-0.5 ${GRADE_BADGE_STYLE[item.grade]}`}
                    >
                      {item.grade}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{item.ubciScore}점</td>
                  <td className="px-4 py-3 text-gray-600">{item.virtualStock}권</td>
                  <td className="px-4 py-3 text-gray-600">{item.location}</td>
                  <td className="px-4 py-3 text-gray-400 line-through">
                    {item.basePrice.toLocaleString()}원
                  </td>
                  <td className="px-4 py-3 font-semibold text-gray-800">
                    {item.dynamicPrice.toLocaleString()}원
                  </td>
                  <td className="px-4 py-3 text-red-600 font-medium">-{discountRate}%</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}