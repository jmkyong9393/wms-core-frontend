import { http, HttpResponse, delay } from 'msw';
import { API_BASE_URL } from '@/lib/api-client';

export const lpnPrinterHandlers = [
  http.post(`${API_BASE_URL}/api/v1/lpn/print`, async ({ request }) => {
    // 1.5초 지연을 통해 프린터 전송 시간 시뮬레이션
    await delay(1500);

    return HttpResponse.json({
      success: true,
      message: '라벨 인쇄 명령이 성공적으로 전송되었습니다.',
    });
  }),
];
