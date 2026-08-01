import type { InventoryRow, InventoryStockType } from '@/features/inventory/types/inventoryRow';
import { getInventoryGradeLabel } from '@/features/inventory/utils/gradeBadge';

const STOCK_TYPE_LABEL: Record<InventoryStockType, string> = {
  NEW_STOCK: '신간 묶음',
  USED_ITEM: '중고·반품 단품',
};

// 재고 데이터를 CSV·Excel 내보내기 형식으로 변환
export function toInventoryExportRow(row: InventoryRow): Record<string, string | number> {
  return {
    재고유형: STOCK_TYPE_LABEL[row.stock_type],
    도서명: row.book.title,
    ISBN: row.book.isbn ?? '-',
    등급: getInventoryGradeLabel(row.grade),
    구역: row.zone,
    재고수량: row.quantity,
    출고가능수량: row.available_quantity,
    일자: row.date,
  };
}
