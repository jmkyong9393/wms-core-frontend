import { mockInventoryItems } from '@/features/inventory/mocks/mockInventory';
import { GRADE_BADGE_STYLE } from '@/features/inspections/utils/gradeBadge';

export default function InventoryPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-6 font-mono">
      {/* 페이지 제목과 설명 */}
      <div className="border-b-2 border-black pb-4">
        <h2 className="text-xl font-black text-black uppercase tracking-widest">INVENTORY & DISPATCH</h2>
        <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider">
          Virtual stock by UBCI grade and dynamic pricing status.
        </p>
      </div>

      {/* 재고와 가격 정보를 표 형태로 표시 */}
      <div className="bg-white border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-none overflow-x-auto p-2">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b-2 border-black text-left text-black">
              <th className="px-4 py-3 font-black uppercase tracking-wider">도서명</th>
              <th className="px-4 py-3 font-black uppercase tracking-wider">등급</th>
              <th className="px-4 py-3 font-black uppercase tracking-wider">UBCI</th>
              <th className="px-4 py-3 font-black uppercase tracking-wider">재고</th>
              <th className="px-4 py-3 font-black uppercase tracking-wider">위치</th>
              <th className="px-4 py-3 font-black uppercase tracking-wider">정가</th>
              <th className="px-4 py-3 font-black uppercase tracking-wider">할인가</th>
              <th className="px-4 py-3 font-black uppercase tracking-wider">할인율</th>
            </tr>
          </thead>
          <tbody>
            {mockInventoryItems.map((item) => {
              // 정가와 할인가를 비교해 할인율 계산
              const discountRate = Math.round(
                (1 - item.dynamicPrice / item.basePrice) * 100
              );
              return (
                <tr key={item.id} className="border-b border-black/10 last:border-0 hover:bg-black hover:text-white transition-colors group">
                  <td className="px-4 py-3 font-bold">{item.bookTitle}</td>
                  <td className="px-4 py-3">
                    {/* 등급에 맞는 배지 색상 적용 */}
                    <span
                      className={`text-[9px] font-black rounded-none border-2 border-black px-2 py-0.5 uppercase tracking-wider ${GRADE_BADGE_STYLE[item.grade]} group-hover:bg-white group-hover:text-black`}
                    >
                      {item.grade}
                    </span>
                  </td>
                  <td className="px-4 py-3">{item.ubciScore}점</td>
                  <td className="px-4 py-3">{item.virtualStock}권</td>
                  <td className="px-4 py-3 font-bold">{item.location}</td>
                  <td className="px-4 py-3 opacity-40 line-through">
                    {item.basePrice.toLocaleString()}원
                  </td>
                  <td className="px-4 py-3 font-black">
                    {item.dynamicPrice.toLocaleString()}원
                  </td>
                  <td className="px-4 py-3 text-[#E60012] font-black">-{discountRate}%</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}