// 서버 페이지네이션 공용 타입
// 백엔드 페이지 번호는 1부터 시작

export interface PaginationParams {
  page: number;
  size: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  total_pages: number;
}
