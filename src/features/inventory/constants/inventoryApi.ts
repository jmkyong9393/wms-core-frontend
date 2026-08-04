// 재고 통합 조회 API 주소
export const INVENTORY_LIST_ENDPOINT = '/api/v1/inventory';

// 신간 묶음 재고 단건 상세 조회 API 주소
export const inventoryDetailEndpoint = (inventoryId: string) => `${INVENTORY_LIST_ENDPOINT}/${inventoryId}`;
