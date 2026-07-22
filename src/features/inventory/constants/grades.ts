// 재고 등급
export const INVENTORY_GRADES = ['MINT', 'EXCELLENT', 'GOOD', 'NORMAL', 'REJECT'] as const;

export type InventoryGrade = (typeof INVENTORY_GRADES)[number];

