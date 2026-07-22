import { http, HttpResponse } from 'msw';
import { API_BASE_URL } from '@/lib/api-client';
import { INVENTORY_LIST_ENDPOINT } from '@/features/inventory/constants/inventoryApi';
import { mockInventoryRows } from '@/mocks/data/inventory';

// 재고 목록 API의 임시 응답
// 백엔드 연결 전 재고 표 기능 테스트에 사용
export const inventoryHandlers = [
  http.get(`${API_BASE_URL}${INVENTORY_LIST_ENDPOINT}`, () => {
    return HttpResponse.json(mockInventoryRows);
  }),
];
