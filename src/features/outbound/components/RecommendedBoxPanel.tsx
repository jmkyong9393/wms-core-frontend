import { Card } from '@/components/ui/card';
import { mockSelectedPostalBox } from '@/features/outbound/mocks/mockSelectedPostalBox';

// 추천 박스 정보 표시
export default function RecommendedBoxPanel() {
  const { name, widthCm, depthCm, heightCm } = mockSelectedPostalBox;

  return (
    <Card className="p-5">
      <h3 className="text-base font-bold text-foreground mb-3">추천 박스 정보</h3>
      <div className="space-y-3">
        <div>
          <p className="text-xs text-muted-foreground">추천 박스</p>
          <p className="text-sm font-semibold text-foreground">우체국 {name}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">박스 규격 (가로 × 세로 × 높이)</p>
          <p className="text-sm text-foreground/80">{widthCm} × {depthCm} × {heightCm} cm</p>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed pt-3 border-t border-border">
          이 주문은 {name} 박스를 사용하세요.
        </p>
      </div>
    </Card>
  );
}
