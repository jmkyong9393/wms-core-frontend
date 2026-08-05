import type { ReactNode } from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import {
  useApproveRestockProposalMutation,
  useRejectRestockProposalMutation,
} from './useRestockProposalMutations';
import { approveRestockProposal, rejectRestockProposal } from '@/features/restock/api/restockProposalService';
import { restockProposalKeys } from '@/features/restock/constants/queryKeys';
import { inventoryKeys } from '@/features/inventory/constants/queryKeys';

vi.mock('@/features/restock/api/restockProposalService', () => ({
  approveRestockProposal: vi.fn(),
  rejectRestockProposal: vi.fn(),
}));

function setupQueryClient() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return { queryClient, invalidateSpy, wrapper };
}

function axiosErrorWithStatus(status: number) {
  return new AxiosError('failed', undefined, undefined, undefined, {
    status,
    data: { detail: 'error' },
    statusText: '',
    headers: {},
    // @ts-expect-error - config is not needed for this test
    config: {},
  });
}

describe('useRestockProposalMutations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('invalidates restockProposalKeys.all after a successful approve', async () => {
    vi.mocked(approveRestockProposal).mockResolvedValueOnce({
      proposalId: 'p1',
      status: 'APPROVED',
      autoPoOrderId: 'po1',
      reviewedAt: 't',
      message: 'ok',
    });
    const { wrapper, invalidateSpy } = setupQueryClient();

    const { result } = renderHook(() => useApproveRestockProposalMutation(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync({ proposalId: 'p1', payload: {} });
    });

    expect(approveRestockProposal).toHaveBeenCalledWith('p1', {});
    await waitFor(() => {
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: restockProposalKeys.all });
    });
  });

  it('invalidates inventoryKeys.all after a successful approve (approval increases real inventory)', async () => {
    vi.mocked(approveRestockProposal).mockResolvedValueOnce({
      proposalId: 'p1',
      status: 'APPROVED',
      autoPoOrderId: 'po1',
      reviewedAt: 't',
      message: 'ok',
    });
    const { wrapper, invalidateSpy } = setupQueryClient();

    const { result } = renderHook(() => useApproveRestockProposalMutation(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync({ proposalId: 'p1', payload: {} });
    });

    await waitFor(() => {
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: inventoryKeys.all });
    });
  });

  it('invalidates restockProposalKeys.all after a successful reject', async () => {
    vi.mocked(rejectRestockProposal).mockResolvedValueOnce({
      proposalId: 'p1',
      status: 'REJECTED',
      autoPoOrderId: null,
      reviewedAt: 't',
      message: 'ok',
    });
    const { wrapper, invalidateSpy } = setupQueryClient();

    const { result } = renderHook(() => useRejectRestockProposalMutation(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync({ proposalId: 'p1', payload: { comment: '반려 사유' } });
    });

    await waitFor(() => {
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: restockProposalKeys.all });
    });
  });

  it('re-invalidates on a 409 error so the UI reflects the latest state', async () => {
    vi.mocked(approveRestockProposal).mockRejectedValueOnce(axiosErrorWithStatus(409));
    const { wrapper, invalidateSpy } = setupQueryClient();

    const { result } = renderHook(() => useApproveRestockProposalMutation(), { wrapper });

    await act(async () => {
      await expect(result.current.mutateAsync({ proposalId: 'p1', payload: {} })).rejects.toThrow();
    });

    await waitFor(() => {
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: restockProposalKeys.all });
    });
  });

  it('re-invalidates on a 404 error', async () => {
    vi.mocked(rejectRestockProposal).mockRejectedValueOnce(axiosErrorWithStatus(404));
    const { wrapper, invalidateSpy } = setupQueryClient();

    const { result } = renderHook(() => useRejectRestockProposalMutation(), { wrapper });

    await act(async () => {
      await expect(result.current.mutateAsync({ proposalId: 'p1', payload: {} })).rejects.toThrow();
    });

    await waitFor(() => {
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: restockProposalKeys.all });
    });
  });

  it('does not invalidate on a 422 error', async () => {
    vi.mocked(approveRestockProposal).mockRejectedValueOnce(axiosErrorWithStatus(422));
    const { wrapper, invalidateSpy } = setupQueryClient();

    const { result } = renderHook(() => useApproveRestockProposalMutation(), { wrapper });

    await act(async () => {
      await expect(result.current.mutateAsync({ proposalId: 'p1', payload: {} })).rejects.toThrow();
    });

    expect(invalidateSpy).not.toHaveBeenCalled();
  });
});
