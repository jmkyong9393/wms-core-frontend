// 재고 등급
export const INVENTORY_GRADES = ['MINT', 'EXCELLENT', 'NORMAL', 'REJECT'] as const;

export type InventoryGrade = (typeof INVENTORY_GRADES)[number];

