import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import HitlDecisionDialog from './HitlDecisionDialog';
import type { HitlQueueItem } from '@/features/queue/api/hitlQueueService';

// jsdom 테스트용 Select 모킹
vi.mock('@/components/ui/select', async () => {
  const React = await import('react');
  const SelectContext = React.createContext<(value: string) => void>(() => {});

  return {
    Select: ({ onValueChange, children }: { value: string; onValueChange: (v: string) => void; children: React.ReactNode }) =>
      React.createElement(SelectContext.Provider, { value: onValueChange }, children),
    SelectTrigger: ({ children }: { children: React.ReactNode }) => React.createElement('div', null, children),
    SelectValue: () => null,
    SelectContent: ({ children }: { children: React.ReactNode }) => React.createElement('div', null, children),
    SelectItem: ({ value, children }: { value: string; children: React.ReactNode }) => {
      const onValueChange = React.useContext(SelectContext);
      return React.createElement(
        'button',
        { type: 'button', role: 'option', onClick: () => onValueChange(value) },
        children
      );
    },
  };
});

const item: HitlQueueItem = {
  id: 'hitl_1',
  bookId: 'book_001',
  bookTitle: '테스트 도서',
  lpnBarcode: 'LPN-TEST-001',
  locationBarcode: 'A-1-1',
  status: 'HITL_REQUIRED',
  ubciScore: 85,
  finalGrade: 'EXCELLENT',
  reasonCodes: [],
  reviewerId: null,
  reviewerEmployeeId: null,
  reviewStartedAt: null,
  createdAt: '2026-08-06T00:00:00',
  updatedAt: '2026-08-06T00:00:00',
};

// 사유 코드 선택
function selectReason(label: string) {
  fireEvent.click(screen.getByRole('option', { name: label }));
}

describe('HitlDecisionDialog', () => {
  const onClose = vi.fn();
  const onSubmit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the approve mode with FP_* reason codes by default and no grade select', () => {
    render(<HitlDecisionDialog item={item} mode="approve" onClose={onClose} onSubmit={onSubmit} />);

    expect(screen.getByText('승인 판정')).toBeInTheDocument();
    expect(screen.getByRole('option', { name: '그림자를 훼손으로 잘못 판단' })).toBeInTheDocument();
    expect(screen.queryByLabelText('조정 등급')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: '제출' })).toBeDisabled();
  });

  it('switching to 하향 승인 reveals the grade select and swaps reason codes to DMG_*, resetting the previous selection', () => {
    render(<HitlDecisionDialog item={item} mode="approve" onClose={onClose} onSubmit={onSubmit} />);

    selectReason('그림자를 훼손으로 잘못 판단');
    expect(screen.getByRole('button', { name: '제출' })).toBeEnabled();

    fireEvent.click(screen.getByRole('button', { name: '하향 승인' }));

    expect(screen.queryByRole('option', { name: '그림자를 훼손으로 잘못 판단' })).not.toBeInTheDocument();
    expect(screen.getByRole('option', { name: '모서리 찍힘 또는 눌림' })).toBeInTheDocument();
    expect(screen.getByText('조정 등급')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '제출' })).toBeDisabled();
  });

  it('submits APPROVE_DOWNGRADE with targetGrade only after both grade and reason are selected', async () => {
    onSubmit.mockResolvedValueOnce(undefined);
    render(<HitlDecisionDialog item={item} mode="approve" onClose={onClose} onSubmit={onSubmit} />);

    fireEvent.click(screen.getByRole('button', { name: '하향 승인' }));
    expect(screen.getByRole('button', { name: '제출' })).toBeDisabled();

    selectReason('모서리 찍힘 또는 눌림');
    expect(screen.getByRole('button', { name: '제출' })).toBeDisabled(); // 등급 미선택

    fireEvent.click(screen.getByRole('option', { name: 'A등급' }));
    expect(screen.getByRole('button', { name: '제출' })).toBeEnabled();

    fireEvent.click(screen.getByRole('button', { name: '제출' }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        action: 'APPROVE_DOWNGRADE',
        reviewerReasonCode: 'DMG_EXT_CRUSH',
        targetGrade: 'EXCELLENT',
      });
      expect(onClose).toHaveBeenCalled();
    });
  });

  it('submits APPROVE_NORMAL without a targetGrade key', async () => {
    onSubmit.mockResolvedValueOnce(undefined);
    render(<HitlDecisionDialog item={item} mode="approve" onClose={onClose} onSubmit={onSubmit} />);

    selectReason('그림자를 훼손으로 잘못 판단');
    fireEvent.click(screen.getByRole('button', { name: '제출' }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        action: 'APPROVE_NORMAL',
        reviewerReasonCode: 'FP_SHADOW',
      });
    });
  });

  it('requires a comment when an "기타"(_OTHER) reason code is selected', () => {
    render(<HitlDecisionDialog item={item} mode="approve" onClose={onClose} onSubmit={onSubmit} />);

    selectReason('기타 AI 오탐');
    expect(screen.getByText('의견 (필수)')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '제출' })).toBeDisabled();

    fireEvent.change(screen.getByLabelText('의견 (필수)'), { target: { value: '표지 재질이 특이해서 판단 애매함' } });
    expect(screen.getByRole('button', { name: '제출' })).toBeEnabled();
  });

  it('does not require a comment for non-"기타" reason codes', () => {
    render(<HitlDecisionDialog item={item} mode="approve" onClose={onClose} onSubmit={onSubmit} />);

    selectReason('그림자를 훼손으로 잘못 판단');
    expect(screen.getByText('의견 (선택)')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '제출' })).toBeEnabled();
  });

  it('includes a trimmed comment only when the user typed one', async () => {
    onSubmit.mockResolvedValueOnce(undefined);
    render(<HitlDecisionDialog item={item} mode="recheck" onClose={onClose} onSubmit={onSubmit} />);

    selectReason('흐림, 흔들림, 가림 또는 역광으로 판독 불가');
    fireEvent.change(screen.getByLabelText('의견 (선택)'), {
      target: { value: '  이미지가 흐려서 재촬영 필요  ' },
    });
    fireEvent.click(screen.getByRole('button', { name: '제출' }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        action: 'RE_CHECK',
        reviewerReasonCode: 'SYS_BLURRY',
        comment: '이미지가 흐려서 재촬영 필요',
      });
    });
  });

  it('reject mode toggles between 반송/폐기 and scopes reason codes to DMG_*', () => {
    render(<HitlDecisionDialog item={item} mode="reject" onClose={onClose} onSubmit={onSubmit} />);

    expect(screen.getByText('반려 판정')).toBeInTheDocument();
    expect(screen.getByRole('option', { name: '침수 또는 외부 액체 오염' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '폐기' }));
    // 반송/폐기 둘 다 동일한 DMG_* 목록을 쓰므로 옵션 목록 자체는 유지된다
    expect(screen.getByRole('option', { name: '침수 또는 외부 액체 오염' })).toBeInTheDocument();
  });

  it('recheck mode has no sub-toggle and scopes reason codes to SYS_*', () => {
    render(<HitlDecisionDialog item={item} mode="recheck" onClose={onClose} onSubmit={onSubmit} />);

    expect(screen.getByText('재검토 요청')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '정상 승인' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '반송' })).not.toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'ISBN과 사진 속 도서가 다름' })).toBeInTheDocument();
  });

  it('keeps the dialog open and preserves the selection when submission fails, allowing a retry', async () => {
    onSubmit.mockRejectedValueOnce(new Error('네트워크 오류')).mockResolvedValueOnce(undefined);
    render(<HitlDecisionDialog item={item} mode="approve" onClose={onClose} onSubmit={onSubmit} />);

    selectReason('그림자를 훼손으로 잘못 판단');
    fireEvent.click(screen.getByRole('button', { name: '제출' }));

    await waitFor(() => {
      expect(screen.getByText('네트워크 오류')).toBeInTheDocument();
    });
    expect(onClose).not.toHaveBeenCalled();

    // 재입력 없이 바로 재시도 → 동일한 payload로 다시 제출됨(선택값이 유지되었다는 뜻)
    fireEvent.click(screen.getByRole('button', { name: '제출' }));

    await waitFor(() => {
      expect(onClose).toHaveBeenCalled();
    });
    expect(onSubmit).toHaveBeenNthCalledWith(1, {
      action: 'APPROVE_NORMAL',
      reviewerReasonCode: 'FP_SHADOW',
    });
    expect(onSubmit).toHaveBeenNthCalledWith(2, {
      action: 'APPROVE_NORMAL',
      reviewerReasonCode: 'FP_SHADOW',
    });
  });
});
