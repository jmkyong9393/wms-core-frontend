"use client";

import { useMutation } from "@tanstack/react-query";
import { useStore } from "jotai";
import { changePassword, getMe } from "@/features/auth/api/authService";
import { mapMeResponseToCurrentUser } from "@/features/auth/store/authSessionMapper";
import {
  authTokenAtom,
  currentUserAtom,
  mustChangePasswordAtom,
  sessionAtom,
} from "@/features/auth/store/authAtoms";
import type { ChangePasswordRequest } from "@/features/auth/types/authApiTypes";
import type { CurrentUser } from "@/features/auth/types/authTypes";

export type ChangePasswordResult =
  | { profileLoaded: true; user: CurrentUser }
  | { profileLoaded: false }; // 비밀번호 변경은 성공, 프로필 재조회만 실패

// 비밀번호 변경 요청 처리 훅
// 비밀번호 변경 자체가 성공하면 mustChangePasswordAtom을 확정하고,
// 이후 /auth/me 재조회가 실패해도 이 값은 되돌리지 않음(이미 일어난 성공을 취소하지 않음)
export function useChangePasswordMutation() {
  const store = useStore();

  return useMutation({
    mutationFn: async (payload: ChangePasswordRequest): Promise<ChangePasswordResult> => {
      await changePassword(payload);
      store.set(mustChangePasswordAtom, false);

      const session = store.get(sessionAtom);
      if (!session) {
        store.set(authTokenAtom, null);
        store.set(currentUserAtom, null);
        throw new Error("인증 정보가 유효하지 않습니다. 다시 로그인해 주세요.");
      }

      try {
        const me = await getMe();
        const user = mapMeResponseToCurrentUser(me, session);
        store.set(currentUserAtom, user);
        return { profileLoaded: true, user };
      } catch {
        // 비밀번호 변경 자체는 성공했으므로 에러로 처리하지 않음
        return { profileLoaded: false };
      }
    },
  });
}
