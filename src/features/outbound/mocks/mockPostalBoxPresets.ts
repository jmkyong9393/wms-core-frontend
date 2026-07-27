import type { PostalBoxPreset } from '@/features/outbound/types/postalBox';
import { CM_TO_SCENE_UNIT } from '@/features/outbound/constants/binPackingScene';

// 스마트 패킹 PoC용 우체국 박스 규격
// 원본 규격: 가로 × 세로 × 높이(cm)
function createPreset(id: string, name: string, widthCm: number, depthCm: number, heightCm: number): PostalBoxPreset {
  return {
    id,
    name,
    width: widthCm * CM_TO_SCENE_UNIT,
    height: heightCm * CM_TO_SCENE_UNIT,
    depth: depthCm * CM_TO_SCENE_UNIT,
    widthCm,
    depthCm,
    heightCm,
  };
}

export const postalBoxNo0 = createPreset('postal-box-0', '0호', 22.5, 15.5, 3);
export const postalBoxNo1 = createPreset('postal-box-1', '1호', 22, 19, 9);
export const postalBoxNo2 = createPreset('postal-box-2', '2호', 27, 18, 15);
export const postalBoxNo2_1 = createPreset('postal-box-2-1', '2-1호', 35, 25, 10);
export const postalBoxNo3 = createPreset('postal-box-3', '3호', 34, 25, 21);
export const postalBoxNo4 = createPreset('postal-box-4', '4호', 41, 31, 28);
export const postalBoxNo5 = createPreset('postal-box-5', '5호', 48, 38, 34);

export const mockPostalBoxPresets: PostalBoxPreset[] = [
  postalBoxNo0,
  postalBoxNo1,
  postalBoxNo2,
  postalBoxNo2_1,
  postalBoxNo3,
  postalBoxNo4,
  postalBoxNo5,
];
