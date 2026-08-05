import { apiClient } from '@/lib/api-client';

export interface PrintLpnRequest {
  lpnBarcode: string;
  title: string;
  isbn: string;
  workerId: string;
}

export interface PrintLpnResponse {
  success: boolean;
  message: string;
}

export const lpnPrinterApi = {
  printLpnLabel: async (data: PrintLpnRequest): Promise<PrintLpnResponse> => {
    const response = await apiClient.post<PrintLpnResponse>('/api/v1/lpn/print', data);
    return response.data;
  },
};
