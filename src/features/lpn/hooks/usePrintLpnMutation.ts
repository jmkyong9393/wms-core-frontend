import { useMutation } from '@tanstack/react-query';

import { lpnPrinterApi, PrintLpnRequest } from '../api/lpnPrinterApi';

export const usePrintLpnMutation = () => {
  return useMutation({
    mutationFn: (data: PrintLpnRequest) => lpnPrinterApi.printLpnLabel(data),
    onSuccess: (_, variables) => {
      alert(`[라벨 출력 요청됨]\nLPN 바코드: ${variables.lpnBarcode}`);
    },
    onError: (error: any) => {
      console.error('라벨 출력 실패:', error);
      alert(`[라벨 출력 실패]\n${error.response?.data?.message || '네트워크 연결 또는 프린터 상태를 확인해주세요.'}`);
    },
  });
};
