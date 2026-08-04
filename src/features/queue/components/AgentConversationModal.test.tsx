import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AgentConversationModal from './AgentConversationModal';
import type { HitlQueueItem } from '@/features/queue/store/queueAtoms';
import { getAgentLog } from '@/features/inspections/api/agentLogService';

vi.mock('@/features/inspections/api/agentLogService', () => ({
  getAgentLog: vi.fn(),
}));

const mockedGetAgentLog = vi.mocked(getAgentLog);

function buildItem(overrides: Partial<HitlQueueItem> = {}): HitlQueueItem {
  return {
    id: 'insp_001',
    title: '코스모스',
    isbn: '9788966262281',
    status: 'AWAITING_REVIEW',
    ...overrides,
  };
}

function renderModal(item: HitlQueueItem | null) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const onClose = vi.fn();
  const view = render(
    <QueryClientProvider client={queryClient}>
      <AgentConversationModal item={item} onClose={onClose} />
    </QueryClientProvider>
  );
  return { ...view, onClose };
}

describe('AgentConversationModal', () => {
  it('Agent 단계별 실행 로그를 정상적으로 보여준다', async () => {
    mockedGetAgentLog.mockResolvedValueOnce([
      {
        stepOrder: 1,
        agentName: 'Vision',
        executionStatus: 'COMPLETED',
        resultSummary: '표지 우측 하단 모서리 마모 1건 탐지',
      },
    ]);

    renderModal(buildItem());

    expect(await screen.findByText('Vision Agent')).toBeInTheDocument();
    expect(getAgentLog).toHaveBeenCalledWith('insp_001');
  });

  it('저장된 로그가 없으면 안내 문구를 보여준다', async () => {
    mockedGetAgentLog.mockResolvedValueOnce([]);

    renderModal(buildItem({ id: 'insp_013' }));

    expect(await screen.findByText('저장된 Agent 단계 로그가 없습니다.')).toBeInTheDocument();
  });

  it('조회에 실패해도 모달의 나머지 영역은 유지되고 실패 안내만 표시된다', async () => {
    mockedGetAgentLog.mockRejectedValueOnce(new Error('Not Found'));

    renderModal(buildItem({ title: '니체의 초월자' }));

    expect(await screen.findByText('Agent 로그를 불러오는데 실패했습니다.')).toBeInTheDocument();
    expect(screen.getByText('니체의 초월자')).toBeInTheDocument();
  });
});
