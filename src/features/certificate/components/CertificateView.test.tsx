import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import CertificateView from './CertificateView';
import type { CertificateRenderModel } from '@/features/certificate/types/certificate';

function buildCertificate(overrides: Partial<CertificateRenderModel> = {}): CertificateRenderModel {
  return {
    bookTitle: '싯다르타',
    isbn: null,
    publisher: null,
    coverImageUrl: null,
    grade: 'MINT',
    ubciScore: 100,
    reportSummary: '주요 결함이 확인되지 않았습니다.',
    inspectedAt: '2026-07-01T09:12:00.000Z',
    ...overrides,
  };
}

describe('CertificateView', () => {
  it('등급/UBCI 점수와 판정 요약을 표시한다', () => {
    render(<CertificateView certificate={buildCertificate()} />);

    expect(screen.getAllByText('싯다르타').length).toBeGreaterThan(0);
    expect(screen.getByText('S등급')).toBeInTheDocument();
    expect(
      screen.getByText('NEWZED 도서 상태 보증서'),
    ).toBeInTheDocument();

    expect(screen.getByText('상품 상태')).toBeInTheDocument();

    expect(screen.getByText('검수·보증 정보')).toBeInTheDocument();

    expect(screen.queryByText('UBCI 점수')).not.toBeInTheDocument();
    expect(screen.getByText('주요 결함이 확인되지 않았습니다.')).toBeInTheDocument();
    expect(
      screen.getByText(
        '본 도서는 NEWZED 검수 기준에 따라 상태가 확인된 중고 도서입니다.'
      )
    ).toBeInTheDocument();
  });

  it('ISBN/출판사가 없으면 렌더링하지 않는다', () => {
    render(<CertificateView certificate={buildCertificate()} />);

    expect(screen.queryByText('ISBN')).not.toBeInTheDocument();
    expect(screen.queryByText('출판사')).not.toBeInTheDocument();
  });

  it('ISBN/출판사가 있으면 렌더링한다', () => {
    render(
      <CertificateView
        certificate={buildCertificate({ isbn: '9791234567890', publisher: '김영사' })}
      />
    );

    expect(screen.getByText('9791234567890')).toBeInTheDocument();
    expect(screen.getByText('김영사')).toBeInTheDocument();
  });
});
