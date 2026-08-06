import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";

// === 전역 상태 (Global State) ===

export const THEME_STORAGE_KEY = "wms_theme";

// 1. 테마 상태 (Dark/Light Mode)
export const themeAtom = atomWithStorage<"light" | "dark">(THEME_STORAGE_KEY, "light", undefined, {
  getOnInit: true,
});

// 2. 사이드바 열림/닫힘 상태
export const isSidebarOpenAtom = atom<boolean>(true);

// 사용자 세션(role, token 등)은 src/features/auth/store/authAtoms.ts에서 관리
