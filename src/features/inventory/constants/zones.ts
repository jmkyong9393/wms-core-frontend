// 재고 검색에 사용하는 구역 코드
// 응답의 zone은 "B-3-1" 같은 상세 위치 표시값
export const INVENTORY_ZONES = ['A', 'B', 'C'] as const;

export type InventoryZone = (typeof INVENTORY_ZONES)[number];
