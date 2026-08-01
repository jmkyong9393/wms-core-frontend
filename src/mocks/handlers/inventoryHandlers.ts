import { http, HttpResponse } from 'msw';
import { API_BASE_URL } from '@/lib/api-client';
import { INVENTORY_LIST_ENDPOINT } from '@/features/inventory/constants/inventoryApi';
import { mockInventoryRows } from '@/mocks/data/inventory';
import type { InventoryRow } from '@/features/inventory/types/inventoryRow';
import type { PaginatedResponse } from '@/types/pagination';

// 재고 목록 API의 임시 응답
// 백엔드 연결 전 재고 표 기능 테스트에 사용
export const inventoryHandlers = [
  http.get(`${API_BASE_URL}${INVENTORY_LIST_ENDPOINT}`, ({ request }) => {
    const url = new URL(request.url);
    const isbn = url.searchParams.get('isbn')?.trim();
    const keyword = url.searchParams.get('keyword')?.trim().toLowerCase();
    const grade = url.searchParams.get('grade');
    const zone = url.searchParams.get('zone')?.trim();
    const startDate = url.searchParams.get('start_date');
    const endDate = url.searchParams.get('end_date');
    const page = Number(url.searchParams.get('page') ?? '1');
    const size = Number(url.searchParams.get('size') ?? '20');

    const filtered = mockInventoryRows.filter((row) => {
      const matchesIsbn = !isbn || row.book.isbn === isbn;
      const matchesKeyword =
        !keyword ||
        row.book.title.toLowerCase().includes(keyword) ||
        (row.book.isbn ?? '').toLowerCase().includes(keyword);
      const matchesGrade = !grade || row.grade === grade;
      const matchesZone = !zone || row.zone.startsWith(zone);
      const rowDate = row.date.slice(0, 10);
      const matchesStart = !startDate || rowDate >= startDate;
      const matchesEnd = !endDate || rowDate <= endDate;
      return matchesIsbn && matchesKeyword && matchesGrade && matchesZone && matchesStart && matchesEnd;
    });

    const start = (page - 1) * size;
    const items: InventoryRow[] = filtered.slice(start, start + size);

    const response: PaginatedResponse<InventoryRow> = {
      items,
      total: filtered.length,
      page,
      size,
      total_pages: Math.ceil(filtered.length / size),
    };
    return HttpResponse.json(response);
  }),
];
