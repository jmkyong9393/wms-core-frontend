import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import BinPackingCanvas from './BinPackingCanvas';

// 테스트에서는 실제 3D 화면 대신 가짜 Canvas 사용
vi.mock('@react-three/fiber', () => ({
  Canvas: () => <div data-testid="r3f-canvas" />,
}));

vi.mock('@react-three/drei', () => ({
  OrbitControls: () => null,
}));

describe('BinPackingCanvas', () => {
  it('크래시 없이 마운트된다', () => {
    render(<BinPackingCanvas />);
    expect(screen.getByTestId('r3f-canvas')).toBeInTheDocument();
  });
});
