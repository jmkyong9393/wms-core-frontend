// 스마트 패킹 PoC용 우체국 박스 규격
export interface PostalBoxPreset {
  id: string;
  name: string;
   // 3D 화면 가로 
  width: number;
  // 3D 화면 높이 
  height: number;
  // 3D 화면 세로 
  depth: number;
  // 실제 가로 (cm) 
  widthCm: number;
  // 실제 세로 (cm) 
  depthCm: number;
  // 실제 높이 (cm) 
  heightCm: number;
}
