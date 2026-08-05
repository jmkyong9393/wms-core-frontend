import { apiClient } from '@/lib/api-client';
import { isMockMode } from '@/services/returnService';
import { LPN_SCAN_ENDPOINT } from '@/features/lpnScan/constants/lpnScanApi';
import type {
  LpnInboundStatus,
  LpnInboundType,
  LpnScanDetail,
  RejectedItemStatus,
  UsedInventoryStatus,
} from '@/features/lpnScan/types/lpnScan';
import type { BookGrade } from '@/features/inspections/types/inspection';
import type { InspectionJobStatus } from '@/types/returnTypes';

interface LpnScanApiResponse {
  lpn_barcode: string;
  book: {
    id: string;
    isbn: string;
    title: string;
    publisher: string | null;
  };
  inbound_type: LpnInboundType;
  inbound_status: LpnInboundStatus;
  inspection_status: InspectionJobStatus | null;
  final_grade: BookGrade | null;
  ubci_score: number | string | null;
  inventory_status: UsedInventoryStatus | null;
  rejected_item_status: RejectedItemStatus | null;
  location: {
    id: string;
    barcode: string;
    zone: string;
    rack: string;
    shelf: string;
  } | null;
  requires_retake: boolean;
  return_job_id: string | null; // 추가
}

function toLpnScanDetail(res: LpnScanApiResponse): LpnScanDetail {
  return {
    lpnBarcode: res.lpn_barcode,
    book: res.book,
    inboundType: res.inbound_type,
    inboundStatus: res.inbound_status,
    inspectionStatus: res.inspection_status,
    finalGrade: res.final_grade,
    ubciScore: res.ubci_score === null ? null : Number(res.ubci_score),
    inventoryStatus: res.inventory_status,
    rejectedItemStatus: res.rejected_item_status,
    location: res.location,
    requiresRetake: res.requires_retake,
    returnJobId: res.return_job_id, // 추가
  };
}

// 작업자용 LPN QR 스캔 상세 조회 (MASTER/ADMIN/WORKER 인증 필요)
export async function getLpnScanDetail(token: string): Promise<LpnScanDetail> {
  if (isMockMode() || token.startsWith('mock_')) {
    // 0.5초 모의 지연 후 재촬영 필요 상태의 모의 데이터 리턴
    await new Promise((resolve) => setTimeout(resolve, 500));
    return {
      lpnBarcode: 'LPN-MOCK-E8C3C7AB4D704',
      book: {
        id: 'mock_book_id',
        isbn: '9790000000001',
        title: 'Mock AI 검수 도서 (재촬영 시뮬레이션)',
        publisher: 'Mock 출판사',
      },
      inboundType: 'USED_PURCHASE',
      inboundStatus: 'COMPLETED',
      inspectionStatus: 'RECHECK_REQUIRED',
      finalGrade: null,
      ubciScore: null,
      inventoryStatus: null,
      rejectedItemStatus: null,
      location: null,
      requiresRetake: true,
      returnJobId: 'mock_job_id_recheck',
    };
  }

  const res = await apiClient.get<LpnScanApiResponse>(LPN_SCAN_ENDPOINT(token));
  return toLpnScanDetail(res.data);
}
