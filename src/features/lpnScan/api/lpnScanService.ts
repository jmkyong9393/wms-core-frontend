import { apiClient } from '@/lib/api-client';
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
  };
}

// 작업자용 LPN QR 스캔 상세 조회 (MASTER/ADMIN/WORKER 인증 필요)
export async function getLpnScanDetail(token: string): Promise<LpnScanDetail> {
  const res = await apiClient.get<LpnScanApiResponse>(LPN_SCAN_ENDPOINT(token));
  return toLpnScanDetail(res.data);
}
