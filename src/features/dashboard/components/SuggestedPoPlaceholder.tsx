import { Truck } from 'lucide-react';

// 발주 추천 데이터는 아직 백엔드 연동 전이므로 빈 상태로 표시
export default function SuggestedPoPlaceholder() {
  return (
    <div className="bg-card rounded-xl border border-border shadow-sm p-5 flex flex-col items-center justify-center text-center min-h-[176px]">
      <Truck className="w-6 h-6 text-muted-foreground/50 mb-2" />
      <h3 className="text-sm font-bold text-foreground mb-1">발주 추천</h3>
      <p className="text-xs text-muted-foreground">발주 추천 데이터는 준비 중입니다.</p>
    </div>
  );
}
