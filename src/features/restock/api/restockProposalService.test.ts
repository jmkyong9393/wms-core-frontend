import { describe, it, expect, beforeEach, vi } from 'vitest';
import { apiClient } from '@/lib/api-client';
import {
  listRestockProposals,
  getRestockProposal,
  approveRestockProposal,
  rejectRestockProposal,
} from './restockProposalService';

vi.mock('@/lib/api-client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

describe('restockProposalService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('listRestockProposals calls GET on the list endpoint without a status filter', async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce({ data: [] });

    const res = await listRestockProposals();

    expect(apiClient.get).toHaveBeenCalledWith('/api/v1/admin/restock/proposals', { params: undefined });
    expect(res).toEqual([]);
  });

  it('listRestockProposals passes the status filter as a query param', async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce({ data: [] });

    await listRestockProposals('PENDING');

    expect(apiClient.get).toHaveBeenCalledWith('/api/v1/admin/restock/proposals', {
      params: { status: 'PENDING' },
    });
  });

  it('getRestockProposal calls GET on the detail endpoint', async () => {
    const detail = { id: 'p1', status: 'PENDING' };
    vi.mocked(apiClient.get).mockResolvedValueOnce({ data: detail });

    const res = await getRestockProposal('p1');

    expect(apiClient.get).toHaveBeenCalledWith('/api/v1/admin/restock/proposals/p1');
    expect(res).toEqual(detail);
  });

  it('approveRestockProposal sends the trimmed comment when one is provided', async () => {
    vi.mocked(apiClient.post).mockResolvedValueOnce({
      data: { proposalId: 'p1', status: 'APPROVED', autoPoOrderId: 'po1', reviewedAt: 't', message: 'ok' },
    });

    await approveRestockProposal('p1', { comment: '  대체 발주 진행  ' });

    expect(apiClient.post).toHaveBeenCalledWith('/api/v1/admin/restock/proposals/p1/approve', {
      comment: '대체 발주 진행',
    });
  });

  it('approveRestockProposal omits the comment field entirely when the comment is empty', async () => {
    vi.mocked(apiClient.post).mockResolvedValueOnce({
      data: { proposalId: 'p1', status: 'APPROVED', autoPoOrderId: null, reviewedAt: 't', message: 'ok' },
    });

    await approveRestockProposal('p1', { comment: '   ' });

    expect(apiClient.post).toHaveBeenCalledWith('/api/v1/admin/restock/proposals/p1/approve', {});
  });

  it('rejectRestockProposal sends the trimmed comment on the reject endpoint', async () => {
    vi.mocked(apiClient.post).mockResolvedValueOnce({
      data: { proposalId: 'p1', status: 'REJECTED', autoPoOrderId: null, reviewedAt: 't', message: 'ok' },
    });

    await rejectRestockProposal('p1', { comment: '현재 발주 불필요' });

    expect(apiClient.post).toHaveBeenCalledWith('/api/v1/admin/restock/proposals/p1/reject', {
      comment: '현재 발주 불필요',
    });
  });

  it('rejectRestockProposal omits comment when undefined', async () => {
    vi.mocked(apiClient.post).mockResolvedValueOnce({
      data: { proposalId: 'p1', status: 'REJECTED', autoPoOrderId: null, reviewedAt: 't', message: 'ok' },
    });

    await rejectRestockProposal('p1', {});

    expect(apiClient.post).toHaveBeenCalledWith('/api/v1/admin/restock/proposals/p1/reject', {});
  });
});
