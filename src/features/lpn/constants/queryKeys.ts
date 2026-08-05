// LPN 상세 Query key factory
export const lpnKeys = {
  all: ['lpn'] as const,
  detail: (lpnBarcode: string) => [...lpnKeys.all, 'detail', lpnBarcode] as const,
};
