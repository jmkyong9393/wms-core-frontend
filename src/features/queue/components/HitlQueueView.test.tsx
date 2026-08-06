import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import HitlQueueView from './HitlQueueView';

vi.mock('./HitlKanbanPreview', () => ({
  default: () => <div data-testid="hitl-kanban-board" />,
}));

vi.mock('./HitlTicketDetailDialog', () => ({
  default: () => null,
}));

vi.mock('../hooks/useHitlQueueQuery', () => ({
  useHitlQueueInfiniteQuery: () => ({
    data: {
      pages: [
        {
          items: [],
          total: 0,
          page: 1,
          size: 10,
          totalPages: 0,
          hasMore: false,
        },
      ],
    },
    hasNextPage: false,
    isLoading: false,
    isFetchingNextPage: false,
    fetchNextPage: vi.fn(),
  }),
  useHitlQueueMetricsQuery: () => ({
    data: {
      pendingCount: 2,
      todayCompletedCount: 5,
      overdueCount: 1,
    },
  }),
}));

describe('HitlQueueView', () => {
  it('현장 관리자용 HITL KPI와 4단계 작업 보드를 표시한다', () => {
    render(<HitlQueueView />);

    expect(screen.getByText('검토 대기 건')).toBeInTheDocument();
    expect(screen.getByText('오늘 검토 완료')).toBeInTheDocument();
    expect(screen.getByText('처리 지연 건')).toBeInTheDocument();

    expect(screen.getByText('2건')).toBeInTheDocument();
    expect(screen.getByText('5건')).toBeInTheDocument();
    expect(screen.getByText('1건')).toBeInTheDocument();

    expect(screen.getByTestId('hitl-kanban-board')).toBeInTheDocument();
  });
});