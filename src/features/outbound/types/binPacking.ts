export interface PackedBook {
  id: string;
  title: string;
  // 책 가로 (X축)
  width: number;
  // 책 두께 (Y축)
  height: number;
  // 책 세로 (Z축)
  depth: number;
  // 책 중심 위치 
  position: [number, number, number];
  rotation?: [number, number, number];
  color?: string;
}
