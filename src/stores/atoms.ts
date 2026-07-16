import { atom } from "jotai";

// === 전역 상태 (Global State) ===

// 1. 테마 상태 (Dark/Light Mode)
export const themeAtom = atom<"light" | "dark">("light");

// 2. 사이드바 열림/닫힘 상태
export const isSidebarOpenAtom = atom<boolean>(true);

// 3. 사용자 정보 및 인증 상태 (Supabase users 테이블 매핑)
export interface UserInfo {
  id?: string;
  employee_id: string;
  name: string;
  email: string | null;
  role: "MASTER" | "WORKER" | "GUEST" | "PENDING";
  status: string | null;
}

export const userAtom = atom<UserInfo | null>(null);

// 4. 인증 토큰 (localStorage 저장)
export const tokenAtom = atom<string | null>(null);

// 5. 로그인 여부 판별 (derived read-only atom)
export const isAuthenticatedAtom = atom((get) => !!get(tokenAtom));

