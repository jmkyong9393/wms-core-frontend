import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import CertificateView from './CertificateView';
import type { CertificateRenderModel } from '@/features/certificate/types/certificate';

function buildCertificate(overrides: Partial<CertificateRenderModel> = {}): CertificateRenderModel {
  return {
    token: 'insp_001',
    bookTitle: '싯다르타',
    grade: 'MINT',
    ubciScore: 100,
    inspectedAt: '2026-07-01T09:12:00.000Z',
    completedAt: '2026-07-01T09:14:00.000Z',
    ...overrides,
  };
}

describe('CertificateView', () => {
  it('검수가 완료된 경우 등급/UBCI 점수와 상세 섹션을 표시한다', () => {
    render(<CertificateView certificate={buildCertificate()} />);

    expect(screen.getAllByText('싯다르타').length).toBeGreaterThan(0);
    expect(screen.getByText('S등급')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
    expect(screen.getByText('품질 판정 근거')).toBeInTheDocument();
    expect(screen.getByText('UBCI 품질 검수가 완료된 도서입니다.')).toBeInTheDocument();
  });

  it('ISBN 등 아직 없는 도서 정보는 렌더링하지 않는다', () => {
    render(<CertificateView certificate={buildCertificate()} />);

    expect(screen.queryByText('ISBN')).not.toBeInTheDocument();
    expect(screen.queryByText('저자')).not.toBeInTheDocument();
    expect(screen.queryByText('출판사')).not.toBeInTheDocument();
  });

  it('검수가 완료되지 않은 경우 준비 중 안내를 표시한다', () => {
    render(<CertificateView certificate={buildCertificate({ grade: null, ubciScore: null })} />);

    expect(screen.getByText('품질 검수 진행 중입니다')).toBeInTheDocument();
    expect(screen.queryByText('S등급')).not.toBeInTheDocument();
  });

  it('MINT 등급이고 판정 근거 데이터가 없으면 결함 없음 문구를 표시한다', () => {
    render(<CertificateView certificate={buildCertificate({ grade: 'MINT' })} />);

    expect(screen.getByText('주요 결함이 확인되지 않았습니다.')).toBeInTheDocument();
  });

  it('MINT가 아니고 판정 근거 데이터가 없으면 결함이 없다고 단정하지 않고 준비 중 문구만 표시한다', () => {
    render(<CertificateView certificate={buildCertificate({ grade: 'NORMAL' })} />);

    expect(screen.getByText('상세 판정 근거는 준비 중입니다.')).toBeInTheDocument();
    expect(screen.queryByText('주요 결함이 확인되지 않았습니다.')).not.toBeInTheDocument();
  });

  it('판정 근거 데이터가 있으면(테스트용 예시 mock) 확인된 상태와 판정 안내를 표시한다', () => {
    // 아래 findings/judgementSummary는 실제 검수 결과가 아니라 렌더링 구조 검증을 위한 예시 mock이다.
    render(
      <CertificateView
        certificate={buildCertificate({
          grade: 'NORMAL',
          findings: [
            { condition: '표지 모서리 마모' },
            { condition: '찢김 없음' },
          ],
          judgementSummary: '표지에 경미한 사용 흔적이 확인되어 B등급으로 판정되었습니다.',
        })}
      />
    );

    expect(screen.getByText('확인된 상태')).toBeInTheDocument();
    expect(screen.getByText('· 표지 모서리 마모')).toBeInTheDocument();
    expect(screen.getByText('· 찢김 없음')).toBeInTheDocument();
    expect(
      screen.getByText('표지에 경미한 사용 흔적이 확인되어 B등급으로 판정되었습니다.')
    ).toBeInTheDocument();
    expect(screen.queryByText('상세 판정 근거는 준비 중입니다.')).not.toBeInTheDocument();
  });
});
