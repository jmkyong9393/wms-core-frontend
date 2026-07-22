import type { InventoryRow } from '@/features/inventory/types/inventoryRow';

// 재고 데이터를 CSV·Excel 내보내기 형식으로 변환
export function toInventoryExportRow(row: InventoryRow): Record<string, string | number> {
  return {
    도서명: row.book.title,
    ISBN: row.book.isbn,
    등급: row.grade,
    구역: row.zone,
    수량: row.quantity,
    일자: row.date,
  };
}
