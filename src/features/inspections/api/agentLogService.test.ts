import { describe, it, expect, beforeEach, vi } from 'vitest';
import { apiClient } from '@/lib/api-client';
import { getAgentLog } from '@/features/inspections/api/agentLogService';

vi.mock('@/lib/api-client', () => {
  return {
    apiClient: {
      get: vi.fn(),
    },
  };
});

describe('agentLogService.getAgentLog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls GET /api/v1/admin/inspections/{jobId}/agent-logs and returns the response data', async () => {
    const steps = [
      {
        stepOrder: 1,
        agentName: 'Vision',
        executionStatus: 'COMPLETED',
        resultSummary: '결함 미발견',
      },
    ];
    vi.mocked(apiClient.get).mockResolvedValueOnce({ data: steps });

    const result = await getAgentLog('insp_001');

    expect(apiClient.get).toHaveBeenCalledWith('/api/v1/admin/inspections/insp_001/agent-logs');
    expect(result).toEqual(steps);
  });

  it('returns an empty array when the job has no saved agent logs', async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce({ data: [] });

    const result = await getAgentLog('insp_013');

    expect(result).toEqual([]);
  });

  it('propagates the error when the request fails (e.g. 404)', async () => {
    vi.mocked(apiClient.get).mockRejectedValueOnce(new Error('Not Found'));

    await expect(getAgentLog('insp_missing')).rejects.toThrow('Not Found');
  });
});
