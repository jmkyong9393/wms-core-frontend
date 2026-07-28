import { PickingSessionView } from '@/features/picking/components/PickingSessionView';
import { MOCK_ACTIVE_ORDER_ID } from '@/mocks/data/picking';

// Mock 주문으로 피킹 화면 실행
export default function PickingPage() {
  return <PickingSessionView orderId={MOCK_ACTIVE_ORDER_ID} />;
}
