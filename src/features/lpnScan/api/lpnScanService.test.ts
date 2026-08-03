import { describe, it, expect, vi } from 'vitest';
import { getLpnScanDetail } from './lpnScanService';
import { apiClient } from '@/lib/api-client';

vi.mock('@/lib/api-client', () => ({
  apiClient: {
    get: vi.fn(),
  },
}));

describe('getLpnScanDetail', () => {
  it('작업자용 LPN 스캔 상세 API를 인증 헤더와 함께 호출하고 camelCase로 매핑한다', async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce({
      data: {
        lpn_barcode: 'LPN-E8C3C7AB4D704A96A357CD5F1D8712B9',
        book: {
          id: 'f440259e-d300-4813-bbd3-19b2d90a8a45',
          isbn: '9790000000001',
          title: 'Demo New Stock Book',
          publisher: 'Demo New Stock Publisher',
        },
        inbound_type: 'USED_PURCHASE',
        inbound_status: 'COMPLETED',
        inspection_status: 'PROCESSING',
        final_grade: 'EXCELLENT',
        ubci_score: '92.00',
        inventory_status: 'AVAILABLE',
        rejected_item_status: null,
        location: {
          id: '562b79c3-4c51-4798-b952-329eefb24bf0',
          barcode: 'B-3-1',
          zone: 'B',
          rack: '3',
          shelf: '1',
        },
        requires_retake: false,
      },
    });

    const result = await getLpnScanDetail('token-abc');

    expect(apiClient.get).toHaveBeenCalledWith('/api/v1/lpn/scan/token-abc');
    expect(result).toEqual({
      lpnBarcode: 'LPN-E8C3C7AB4D704A96A357CD5F1D8712B9',
      book: {
        id: 'f440259e-d300-4813-bbd3-19b2d90a8a45',
        isbn: '9790000000001',
        title: 'Demo New Stock Book',
        publisher: 'Demo New Stock Publisher',
      },
      inboundType: 'USED_PURCHASE',
      inboundStatus: 'COMPLETED',
      inspectionStatus: 'PROCESSING',
      finalGrade: 'EXCELLENT',
      ubciScore: 92,
      inventoryStatus: 'AVAILABLE',
      rejectedItemStatus: null,
      location: {
        id: '562b79c3-4c51-4798-b952-329eefb24bf0',
        barcode: 'B-3-1',
        zone: 'B',
        rack: '3',
        shelf: '1',
      },
      requiresRetake: false,
    });
  });

  it('검수 전이라 location이 null인 응답도 그대로 매핑한다', async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce({
      data: {
        lpn_barcode: 'LPN-1234',
        book: { id: 'book-1', isbn: '9790000000002', title: 'Book', publisher: null },
        inbound_type: 'CUSTOMER_RETURN',
        inbound_status: 'RECEIVED',
        inspection_status: null,
        final_grade: null,
        ubci_score: null,
        inventory_status: null,
        rejected_item_status: null,
        location: null,
        requires_retake: false,
      },
    });

    const result = await getLpnScanDetail('token-xyz');

    expect(result.location).toBeNull();
    expect(result.finalGrade).toBeNull();
    expect(result.ubciScore).toBeNull();
  });
});
