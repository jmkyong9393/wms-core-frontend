import { atom } from "jotai";

// === 전역 상태 (Global State) ===

// 1. 테마 상태 (Dark/Light Mode)
export const themeAtom = atom<"light" | "dark">("light");

// 2. 사이드바 열림/닫힘 상태
export const isSidebarOpenAtom = atom<boolean>(true);

// 3. 사용자 정보 (간단한 예시)
export const userAtom = atom<{ name: string; role: string } | null>(null);
