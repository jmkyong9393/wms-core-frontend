// 표 데이터를 CSV·Excel 파일로 내보내는 공통 함수
// xlsx는 파일을 내보낼 때만 불러와 초기 로딩을 줄임
import { downloadBlob } from '@/lib/download';

export type ExportRecord = Record<string, string | number>;

const UTF8_BOM = String.fromCharCode(0xfeff);

// 데이터를 CSV 파일로 내보내기
export async function exportRowsToCsv(filename: string, records: ExportRecord[]): Promise<void> {
  if (records.length === 0) return;

  const XLSX = await import('xlsx');
  const worksheet = XLSX.utils.json_to_sheet(records);
  const csv = XLSX.utils.sheet_to_csv(worksheet);
  // Excel에서 한글이 깨지지 않도록 처리
  const blob = new Blob([UTF8_BOM + csv], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, `${filename}.csv`);
}

// 데이터를 Excel 파일로 내보내기
export async function exportRowsToXlsx(filename: string, records: ExportRecord[]): Promise<void> {
  if (records.length === 0) return;

  const XLSX = await import('xlsx');
  const worksheet = XLSX.utils.json_to_sheet(records);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
  const arrayBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' }) as ArrayBuffer;
  const blob = new Blob([arrayBuffer], { type: 'application/octet-stream' });
  downloadBlob(blob, `${filename}.xlsx`);
}
