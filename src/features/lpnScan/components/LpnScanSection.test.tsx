import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import LpnScanSection from './LpnScanSection';
import { useLpnScanQuery } from '@/features/lpnScan/hooks/useLpnScanQuery';

vi.mock('@/features/lpnScan/hooks/useLpnScanQuery', () => ({
  useLpnScanQuery: vi.fn(),
}));

describe('LpnScanSection', () => {
  it('로딩 중이면 로딩 문구를 표시한다', () => {
    vi.mocked(useLpnScanQuery).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      refetch: vi.fn(),
    } as never);

    render(<LpnScanSection token="tok" />);

    expect(screen.getByText('LPN 정보를 불러오는 중...')).toBeInTheDocument();
  });

  it('에러면 재시도 버튼을 표시한다', () => {
    const refetch = vi.fn();
    vi.mocked(useLpnScanQuery).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      refetch,
    } as never);

    render(<LpnScanSection token="tok" />);

    expect(screen.getByText('LPN 정보를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.')).toBeInTheDocument();
    screen.getByRole('button', { name: '다시 시도' }).click();
    expect(refetch).toHaveBeenCalled();
  });

  it('데이터를 받아오면 LpnScanView에 전달해 렌더링한다', () => {
    vi.mocked(useLpnScanQuery).mockReturnValue({
      data: {
        lpnBarcode: 'LPN-1',
        book: { id: 'b1', isbn: '9790000000001', title: '테스트 도서', publisher: null },
        inboundType: 'USED_PURCHASE',
        inboundStatus: 'COMPLETED',
        inspectionStatus: null,
        finalGrade: null,
        ubciScore: null,
        inventoryStatus: null,
        rejectedItemStatus: null,
        location: null,
        requiresRetake: false,
      },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as never);

    render(<LpnScanSection token="tok" />);

    expect(screen.getByText('테스트 도서')).toBeInTheDocument();
  });
});
