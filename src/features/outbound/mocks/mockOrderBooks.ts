import type { OrderBook } from '@/features/outbound/types/orderBook';

// 스마트 패킹 PoC용 주문 도서 데이터
export const mockOrderBooks: OrderBook[] = [
  { id: 'book-siddhartha', title: '싯다르타', pageCount: 240, widthMm: 148, depthMm: 210, thicknessMm: 15.6, color: '#f97316' },
  { id: 'book-cosmos', title: '코스모스', pageCount: 720, widthMm: 152, depthMm: 224, thicknessMm: 49, color: '#3b82f6' },
  { id: 'book-selfish-gene', title: '이기적 유전자', pageCount: 632, widthMm: 152, depthMm: 218, thicknessMm: 40, color: '#22c55e' },
  { id: 'book-demian', title: '데미안', pageCount: 248, widthMm: 132, depthMm: 225, thicknessMm: 16.1, color: '#a855f7' },
];
