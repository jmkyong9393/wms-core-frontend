import { mockSelectedPostalBox } from '@/features/outbound/mocks/mockSelectedPostalBox';

// 추천 박스 정보 표시
export default function RecommendedBoxPanel() {
  const { name, widthCm, depthCm, heightCm } = mockSelectedPostalBox;

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <h3 className="text-base font-bold text-gray-800 mb-3">추천 박스 정보</h3>
      <div className="space-y-3">
        <div>
          <p className="text-xs text-gray-400">추천 박스</p>
          <p className="text-sm font-semibold text-gray-800">우체국 {name}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400">박스 규격 (가로 × 세로 × 높이)</p>
          <p className="text-sm text-gray-700">{widthCm} × {depthCm} × {heightCm} cm</p>
        </div>
        <p className="text-xs text-gray-500 leading-relaxed pt-3 border-t border-gray-100">
          이 주문은 {name} 박스를 사용하세요.
        </p>
      </div>
    </div>
  );
}
