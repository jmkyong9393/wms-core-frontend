import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import ScanPage from './page';
import { useAuthSession } from '@/features/auth/hooks/useAuthSession';
import type { AuthSessionState } from '@/features/auth/hooks/useAuthSession';

const mockReplace = vi.fn();

vi.mock('next/navigation', () => ({
  useParams: () => ({ token: 'tok-123' }),
  useRouter: () => ({ replace: mockReplace }),
}));

vi.mock('@/features/auth/hooks/useAuthSession', () => ({
  useAuthSession: vi.fn(),
}));

// 직원용 화면 렌더링 여부만 확인
// 실제 LPN 조회는 LpnScanSection 테스트에서 검증
vi.mock('@/features/lpnScan/components/LpnScanSection', () => ({
  default: ({ token }: { token: string }) => <div data-testid="lpn-scan-section">{token}</div>,
}));

function mockSession(state: AuthSessionState) {
  vi.mocked(useAuthSession).mockReturnValue(state);
}

describe('ScanPage', () => {
  beforeEach(() => {
    mockReplace.mockClear();
  });

  it('세션 로딩 중에는 LpnScanSection을 렌더하지 않고 리다이렉트도 하지 않는다', () => {
    mockSession({ status: 'loading' });

    render(<ScanPage />);

    expect(screen.getByText('세션 확인 중...')).toBeInTheDocument();
    expect(screen.queryByTestId('lpn-scan-section')).not.toBeInTheDocument();
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('비로그인이면 공개 인증서로 이동하고 그 사이 안내 문구를 표시한다', async () => {
    mockSession({ status: 'unauthenticated' });

    render(<ScanPage />);

    expect(screen.getByText('페이지를 이동하고 있습니다...')).toBeInTheDocument();
    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('/certificate/tok-123'));
    expect(screen.queryByTestId('lpn-scan-section')).not.toBeInTheDocument();
  });

  it('최초 비밀번호 변경 대기 상태면 공개 인증서로 이동한다', async () => {
    mockSession({ status: 'pendingPasswordChange' });

    render(<ScanPage />);

    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('/certificate/tok-123'));
  });

  it('GUEST 등 허용되지 않은 역할이면 공개 인증서로 이동한다', async () => {
    mockSession({
      status: 'ready',
      currentUser: { id: 'u1', employeeId: 'e1', name: '고객', role: 'GUEST', mustChangePassword: false },
    });

    render(<ScanPage />);

    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('/certificate/tok-123'));
    expect(screen.queryByTestId('lpn-scan-section')).not.toBeInTheDocument();
  });

  it.each(['MASTER', 'ADMIN', 'WORKER'] as const)('%s 역할이면 LpnScanSection을 렌더하고 리다이렉트하지 않는다', (role) => {
    mockSession({
      status: 'ready',
      currentUser: { id: 'u1', employeeId: 'e1', name: '직원', role, mustChangePassword: false },
    });

    render(<ScanPage />);

    expect(screen.getByTestId('lpn-scan-section')).toHaveTextContent('tok-123');
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('세션 확인 오류면 재시도 버튼을 표시하고 클릭 시 retry를 호출한다', () => {
    const retry = vi.fn();
    mockSession({ status: 'error', retry });

    render(<ScanPage />);

    expect(screen.getByText('세션 정보를 확인하지 못했습니다. 잠시 후 다시 시도해 주세요.')).toBeInTheDocument();
    screen.getByRole('button', { name: '다시 시도' }).click();
    expect(retry).toHaveBeenCalled();
    expect(mockReplace).not.toHaveBeenCalled();
  });
});
