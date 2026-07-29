import type { PickingSession } from '@/features/picking/types/picking';

// 피킹 화면에서 사용할 Mock 주문 ID
export const MOCK_ACTIVE_ORDER_ID = 'mock-order-fe47-001';

// 피킹 지시서 Mock 데이터
export const mockPickingSession: PickingSession = {
  orderId: MOCK_ACTIVE_ORDER_ID,
  recommendedBox: '2호',
  items: [
    {
      id: 'pick-item-1',
      bookId: 'book-001',
      bookTitle: '사피엔스',
      isbn: '9788912345678',
      lpnBarcode: 'LPN-3F2A9C10',
      conditionGrade: 'EXCELLENT',
      quantity: 1,
      zone: 'A',
      rack: '1',
      shelf: '3',
    },
    {
      id: 'pick-item-2',
      bookId: 'book-002',
      bookTitle: '총, 균, 쇠',
      isbn: '9788991234567',
      lpnBarcode: 'LPN-7B48E211',
      conditionGrade: 'NORMAL',
      quantity: 1,
      zone: 'A',
      rack: '3',
      shelf: '1',
    },
    {
      id: 'pick-item-3',
      bookId: 'book-003',
      bookTitle: '코스모스',
      isbn: '9788983711892',
      lpnBarcode: null, 
      conditionGrade: 'MINT',
      quantity: 2,
      zone: 'B',
      rack: '2',
      shelf: '1',
    },
    {
      id: 'pick-item-4',
      bookId: 'book-004',
      bookTitle: '이기적 유전자',
      isbn: '9788932917245',
      lpnBarcode: 'LPN-9D11A004',
      conditionGrade: 'EXCELLENT',
      quantity: 1,
      zone: 'C',
      rack: '1',
      shelf: '2',
    },
    {
      id: 'pick-item-5',
      bookId: 'book-005',
      bookTitle: '넛지',
      isbn: '9788994492396',
      lpnBarcode: null,
      conditionGrade: 'MINT',
      quantity: 1,
      zone: 'B',
      rack: '2',
      shelf: '4',
    },
  ],
};
