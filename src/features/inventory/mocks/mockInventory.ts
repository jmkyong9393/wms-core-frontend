import type { InventoryItem } from '@/features/inventory/types/inventory';

// 재고 관리 화면에서 사용할 임시 데이터 
// 할인가는 미리 계산된 값으로 사용
export const mockInventoryItems: InventoryItem[] = [
  {
    id: 'inv_001',
    bookTitle: '싯다르타',
    grade: 'MINT',
    ubciScore: 98,
    virtualStock: 12,
    location: 'A-1-3',
    basePrice: 32000,
    dynamicPrice: 30400,
  },
  {
    id: 'inv_002',
    bookTitle: '위버멘쉬',
    grade: 'EXCELLENT',
    ubciScore: 90,
    virtualStock: 8,
    location: 'B-1-2',
    basePrice: 36000,
    dynamicPrice: 32400,
  },
  {
    id: 'inv_003',
    bookTitle: '프로젝트 헤일메리',
    grade: 'GOOD',
    ubciScore: 78,
    virtualStock: 5,
    location: 'A-2-1',
    basePrice: 21000,
    dynamicPrice: 15750,
  },
  {
    id: 'inv_004',
    bookTitle: '돈의 심리학',
    grade: 'GOOD',
    ubciScore: 72,
    virtualStock: 3,
    location: 'B-3-4',
    basePrice: 27000,
    dynamicPrice: 20250,
  },
];