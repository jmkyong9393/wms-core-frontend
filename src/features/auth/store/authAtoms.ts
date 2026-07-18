import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { mapTokenToSession } from "@/features/auth/store/authSessionMapper";
import type { CurrentUser } from "@/features/auth/types/authTypes";

// localStorage에 토큰을 저장할 때 사용하는 키
export const AUTH_TOKEN_STORAGE_KEY = "wms_auth_token";


const rawTokenStorage = {
  getItem: (key: string, initialValue: string | null) => {
    if (typeof window === "undefined") return initialValue;
    const value = localStorage.getItem(key);
    return value === null ? initialValue : value;
  },
  setItem: (key: string, newValue: string | null) => {
    if (typeof window === "undefined") return;
    if (newValue === null) {
      localStorage.removeItem(key);
    } else {
      localStorage.setItem(key, newValue);
    }
  },
  removeItem: (key: string) => {
    if (typeof window === "undefined") return;
    localStorage.removeItem(key);
  },
};

// 로그인 토큰 전역 상태
// 로그인 성공 후 토큰 저장
// 새로고침 시 localStorage의 토큰 즉시 불러오기
export const authTokenAtom = atomWithStorage<string | null>(
  AUTH_TOKEN_STORAGE_KEY,
  null,
  rawTokenStorage,
  { getOnInit: true }
);


// 현재 로그인 사용자 정보
// 저장된 토큰 해석 후 사용자 정보 생성
// 유효한 토큰이 없을 경우 null 반환
export const currentUserAtom = atom<CurrentUser | null>((get) => {
  const token = get(authTokenAtom);
  if (!token) return null;
  return mapTokenToSession(token);
});

export const isAuthenticatedAtom = atom((get) => get(currentUserAtom) !== null);

export const logoutAtom = atom(null, (_get, set) => {
  set(authTokenAtom, null);
});
