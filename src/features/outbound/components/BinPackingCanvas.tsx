'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { DEFAULT_CAMERA_POSITION, DEFAULT_CAMERA_FOV } from '@/features/outbound/constants/binPackingScene';
import BinPackingScene from '@/features/outbound/components/BinPackingScene';

// 3D 적재 화면과 시점 조작 설정
export default function BinPackingCanvas() {
  return (
    <Canvas camera={{ position: DEFAULT_CAMERA_POSITION, fov: DEFAULT_CAMERA_FOV }}>
      <BinPackingScene />
      <OrbitControls />
    </Canvas>
  );
}
