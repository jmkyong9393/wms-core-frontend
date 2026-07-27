export interface OrderBook {
  id: string;
  title: string;
  pageCount: number;
  // 책 가로 (mm) 
  widthMm: number;
  // 책 세로 (mm) 
  depthMm: number;
  // 책 두께 (mm)
  thicknessMm: number;
  color?: string;
}
