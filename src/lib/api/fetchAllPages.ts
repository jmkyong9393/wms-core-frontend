import type { PaginatedResponse } from '@/types/pagination';

// 서버 페이지네이션 API의 전체 페이지를 순회해 하나의 배열로 모음
// 내보내기(CSV/Excel)처럼 현재 필터 조건의 전체 결과가 필요할 때 사용
// 중간 페이지 조회가 실패하면 그대로 reject되고 이미 모은 데이터는 버려짐(호출측에서 partial 결과를 쓰지 않도록)
export async function fetchAllPages<T>(
  fetchPage: (page: number, size: number) => Promise<PaginatedResponse<T>>,
  size = 100
): Promise<T[]> {
  const first = await fetchPage(1, size);
  const items = [...first.items];
  for (let page = 2; page <= first.total_pages; page++) {
    const next = await fetchPage(page, size);
    items.push(...next.items);
  }
  return items;
}
