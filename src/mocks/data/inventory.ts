import type { InventoryGrade } from '@/features/inventory/constants/grades';
import type { InventoryRow } from '@/features/inventory/types/inventoryRow';

// 재고 목록 화면 테스트용 도서 데이터
const BOOKS: Array<{ title: string; isbn: string }> = [
  { title: '사피엔스', isbn: '9788912345678' },
  { title: '총, 균, 쇠', isbn: '9788991234567' },
  { title: '코스모스', isbn: '9788983711892' },
  { title: '이기적 유전자', isbn: '9788932917245' },
  { title: '넛지', isbn: '9788994492396' },
  { title: '팩트풀니스', isbn: '9788934985977' },
];

const ZONES = ['A-1-3', 'A-1-4', 'B-2-1', 'B-2-2', 'C-1-1'];

// 판매 가능한 재고 등급
// REJECT 재고는 별도 목록에서 관리
const GRADES: readonly InventoryGrade[] = ['MINT', 'EXCELLENT', 'NORMAL'];

// 테스트용 재고 데이터 생성
function buildInventorySeed(): InventoryRow[] {
  const rows: InventoryRow[] = [];
  const SEED_SIZE = 22;

  for (let i = 0; i < SEED_SIZE; i++) {
    const book = {
      ...BOOKS[i % BOOKS.length],
      cover_image_url: null,
    };
    const zone = ZONES[i % ZONES.length];
    const day = String((i % 28) + 1).padStart(2, '0');
    const date = `2026-07-${day}T09:00:00.000Z`;

    // 3건 중 1건은 신간 묶음 재고, 나머지는 중고·반품 단품 재고
    const isNewStock = i % 3 === 0;

    const basePrice = 15000 + (i % 5) * 1000;

    if (isNewStock) {
      const quantity = 10 + i;
      const reservedQuantity = i % 6 === 0 ? 2 : 0;
      rows.push({
        id: `inv-seed-${String(i + 1).padStart(3, '0')}`,
        stock_type: 'NEW_STOCK',
        book,
        grade: 'MINT',
        zone,
        quantity,
        reserved_quantity: reservedQuantity,
        available_quantity: quantity - reservedQuantity,
        lpn_status: null,
        lpn_barcode: null,
        base_price: basePrice,
        discount_rate: 0.1,
        sale_price: basePrice * 0.9,
        pricing_status: 'DEFAULT_POLICY',
        date,
      });
    } else {
      const grade = GRADES[i % GRADES.length];
      const quantity = 1;
      const reservedQuantity = i % 4 === 0 ? 1 : 0;
      // 3건 중 1건은 Agent 가격 산정 전(PENDING) 상태로 시뮬레이션
      const isPriced = i % 3 !== 0;
      rows.push({
        id: `inv-seed-${String(i + 1).padStart(3, '0')}`,
        stock_type: 'USED_ITEM',
        book,
        grade,
        zone,
        quantity,
        reserved_quantity: reservedQuantity,
        available_quantity: quantity - reservedQuantity,
        lpn_status: reservedQuantity > 0 ? 'RESERVED' : 'AVAILABLE',
        lpn_barcode: `LPN-SEED-${String(i + 1).padStart(3, '0')}`,
        base_price: basePrice,
        discount_rate: isPriced ? 0.3 : null,
        sale_price: isPriced ? basePrice * 0.7 : null,
        pricing_status: isPriced ? 'AGENT_PRICED' : 'PENDING',
        date,
      });
    }
  }

  return rows;
}

export const mockInventoryRows: InventoryRow[] = buildInventorySeed();
