import { http, HttpResponse } from 'msw';
import { API_BASE_URL } from '@/lib/api-client';
import { mockPickingSession } from '@/mocks/data/picking';

// 피킹 지시서 Mock 응답
export const pickingHandlers = [
  http.get(`${API_BASE_URL}/api/v1/orders/:orderId/picking-list`, () => {
    return HttpResponse.json(mockPickingSession);
  }),
];
