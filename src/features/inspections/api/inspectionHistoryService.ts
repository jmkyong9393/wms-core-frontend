import { apiClient } from '@/lib/api-client';
import { ADMIN_INSPECTIONS_ENDPOINT } from '@/features/inspections/constants/inspectionApi';
import type {
  InspectionHistoryListParams,
  InspectionHistoryRow,
} from '@/features/inspections/types/inspectionHistory';
import type { InspectionDetailResponse } from '@/features/inspections/types/inspection';
import type { PaginatedResponse } from '@/types/pagination';

// 관리자 검수 이력 조회 (검색/필터/페이지네이션)
export async function listInspectionHistory(
  params: InspectionHistoryListParams
): Promise<PaginatedResponse<InspectionHistoryRow>> {
  const res = await apiClient.get<PaginatedResponse<InspectionHistoryRow>>(
    ADMIN_INSPECTIONS_ENDPOINT,
    { params }
  );
  return res.data;
}

// 관리자 검수 상세 정보 단건 조회
export async function getInspectionDetail(
  jobId: string
): Promise<InspectionDetailResponse> {
  const res = await apiClient.get<InspectionDetailResponse>(
    `${ADMIN_INSPECTIONS_ENDPOINT}/${jobId}`
  );
  return res.data;
}
