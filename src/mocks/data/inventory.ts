import type { InventoryGrade } from '@/features/inventory/constants/grades';
import type { InventoryRow } from '@/features/inventory/types/inventoryRow';

// 재고 표 기능 테스트에 사용하는 임시 데이터
// 새로고침하면 아래 기준으로 다시 생성
const BOOKS: Array<{ title: string; isbn: string }> = [
  { title: '사피엔스', isbn: '9788912345678' },
  { title: '총, 균, 쇠', isbn: '9788991234567' },
  { title: '코스모스', isbn: '9788983711892' },
  { title: '이기적 유전자', isbn: '9788932917245' },
  { title: '넛지', isbn: '9788994492396' },
  { title: '팩트풀니스', isbn: '9788934985977' },
];

const ZONES = ['A-1-3', 'A-1-4', 'B-2-1', 'B-2-2', 'C-1-1'];

const GRADES: readonly InventoryGrade[] = ['MINT', 'EXCELLENT', 'GOOD', 'NORMAL', 'REJECT'];

// 테스트용 재고 데이터 생성
function buildInventorySeed(): InventoryRow[] {
  const rows: InventoryRow[] = [];
  const SEED_SIZE = 22;

  for (let i = 0; i < SEED_SIZE; i++) {
    const book = BOOKS[i % BOOKS.length];
    const grade = GRADES[i % GRADES.length];
    const zone = ZONES[i % ZONES.length];
    
    // 신간 묶음 재고와 중고·반품 단품 재고를 섞어서 생성
    const isNewStock = grade === 'MINT' && i % 3 === 0;
    const day = String((i % 28) + 1).padStart(2, '0');

    rows.push({
      id: `inv-seed-${String(i + 1).padStart(3, '0')}`,
      book,
      grade,
      zone,
      quantity: isNewStock ? 10 + i : 1,
      date: `2026-07-${day}T09:00:00.000Z`,
    });
  }

  return rows;
}

export const mockInventoryRows: InventoryRow[] = buildInventorySeed();
