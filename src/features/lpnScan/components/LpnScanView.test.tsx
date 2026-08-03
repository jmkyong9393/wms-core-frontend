import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import LpnScanView from './LpnScanView';
import type { LpnScanDetail } from '@/features/lpnScan/types/lpnScan';

function buildDetail(overrides: Partial<LpnScanDetail> = {}): LpnScanDetail {
  return {
    lpnBarcode: 'LPN-E8C3C7AB4D704A96A357CD5F1D8712B9',
    book: {
      id: 'book-1',
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
      id: 'loc-1',
      barcode: 'B-3-1',
      zone: 'B',
      rack: '3',
      shelf: '1',
    },
    requiresRetake: false,
    ...overrides,
  };
}

describe('LpnScanView', () => {
  it('LPN·도서·입고/검수·로케이션 정보를 표시한다', () => {
    render(<LpnScanView detail={buildDetail()} />);

    expect(screen.getByText('Demo New Stock Book')).toBeInTheDocument();
    expect(screen.getByText('LPN-E8C3C7AB4D704A96A357CD5F1D8712B9')).toBeInTheDocument();
    expect(screen.getByText('중고 매입')).toBeInTheDocument();
    expect(screen.getByText('입고 완료')).toBeInTheDocument();
    expect(screen.getByText('AI 분석중')).toBeInTheDocument();
    expect(screen.getByText('판매 가능')).toBeInTheDocument();
    expect(screen.getByText('B-3-1')).toBeInTheDocument();
    expect(screen.getByText('92')).toBeInTheDocument();
  });

  it('location이 null이면 보관 로케이션 섹션을 렌더링하지 않는다', () => {
    render(
      <LpnScanView
        detail={buildDetail({
          location: null,
          finalGrade: null,
          ubciScore: null,
          inspectionStatus: null,
          inventoryStatus: null,
          inboundStatus: 'RECEIVED',
        })}
      />
    );

    expect(screen.queryByText('보관 로케이션')).not.toBeInTheDocument();
  });

  it('재촬영이 필요하면 안내 배지를 표시한다', () => {
    render(<LpnScanView detail={buildDetail({ requiresRetake: true })} />);

    expect(screen.getByText('재촬영 필요')).toBeInTheDocument();
  });
});
