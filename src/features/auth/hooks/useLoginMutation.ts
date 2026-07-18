"use client";

import { useMutation } from "@tanstack/react-query";
import { useStore } from "jotai";
import { login } from "@/features/auth/api/authService";
import { authTokenAtom } from "@/features/auth/store/authAtoms";
import type { LoginRequest } from "@/features/auth/types/authApiTypes";


// 로그인 요청 처리 훅
// 로그인 성공 시 응답으로 받은 토큰을 전역 상태에 저장
export function useLoginMutation() {
  const store = useStore();

  return useMutation({
    mutationFn: (payload: LoginRequest) => login(payload),
    onSuccess: (data) => {
      store.set(authTokenAtom, data.access_token);
    },
  });
}
