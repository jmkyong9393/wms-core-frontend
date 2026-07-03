import { atom } from "jotai";

// === 전역 상태 (Global State) ===

// 1. 테마 상태 (Dark/Light Mode)
export const themeAtom = atom<"light" | "dark">("light");

// 2. 사이드바 열림/닫힘 상태
export const isSidebarOpenAtom = atom<boolean>(true);

// 3. 사용자 정보 (간단한 예시)
export const userAtom = atom<{ name: string; role: string } | null>(null);

// === 도메인 상태 (Domain State - WMS 전용) ===

// 1. 현재 선택된 검수 도서 ID
export const selectedBookIdAtom = atom<string | null>(null);

// 2. AI가 찾아낸 BBox 좌표 리스트 상태 (실시간 조작용)
export interface BBox {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
}
export const bookDefectBoxesAtom = atom<BBox[]>([]);
