import type { PackedBook } from '@/features/outbound/types/binPacking';
import { mockOrderBooks } from '@/features/outbound/mocks/mockOrderBooks';
import { MM_TO_SCENE_UNIT } from '@/features/outbound/constants/binPackingScene';

// 2호 박스에 맞게 책 방향 회전
const PILE_ROTATION: [number, number, number] = [0, Math.PI / 2, 0];

// 큰 책부터 아래에 배치
const stackingOrder = [...mockOrderBooks].sort(
  (a, b) => b.widthMm * b.depthMm - a.widthMm * a.depthMm
);

// 책 두께를 누적해 한 더미로 배치
export const mockPackedBooks: PackedBook[] = (() => {
  let cumulativeHeightMm = 0;
  return stackingOrder.map((book) => {
    const heightMm = book.thicknessMm;
    const yMm = cumulativeHeightMm + heightMm / 2;
    cumulativeHeightMm += heightMm;

    return {
      id: book.id,
      title: book.title,
      width: book.widthMm * MM_TO_SCENE_UNIT,
      height: heightMm * MM_TO_SCENE_UNIT,
      depth: book.depthMm * MM_TO_SCENE_UNIT,
      position: [0, yMm * MM_TO_SCENE_UNIT, 0],
      rotation: PILE_ROTATION,
      color: book.color,
    };
  });
})();
