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
    const page = Number(url.searchParams.get('page') ?? '1');
    const size = Number(url.searchParams.get('size') ?? '20');

    const start = (page - 1) * size;
    const items: InventoryRow[] = mockInventoryRows.slice(start, start + size);

    const response: PaginatedResponse<InventoryRow> = {
      items,
      total: mockInventoryRows.length,
      page,
      size,
      total_pages: Math.ceil(mockInventoryRows.length / size),
    };
    return HttpResponse.json(response);
  }),
];
