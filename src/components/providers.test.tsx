import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import { createStore, Provider as JotaiProvider } from "jotai";

// 테스트 환경에서 사용할 임시 localStorage
// 모듈을 불러오기 전에 설정해야 초기 인증 상태를 정상적으로 읽을 수 있음
vi.hoisted(() => {
  const memoryStore: Record<string, string> = {};
  vi.stubGlobal("localStorage", {
    getItem: (key: string) => memoryStore[key] ?? null,
    setItem: (key: string, value: string) => {
      memoryStore[key] = String(value);
    },
    removeItem: (key: string) => {
      delete memoryStore[key];
    },
    clear: () => {
      Object.keys(memoryStore).forEach((key) => delete memoryStore[key]);
    },
  });
});

import { AuthSessionExpiredWatcher } from "./providers";
import { AUTH_SESSION_EXPIRED_EVENT } from "@/lib/api-client";
import { authTokenAtom, currentUserAtom } from "@/features/auth/store/authAtoms";

describe("AuthSessionExpiredWatcher", () => {
  it("AUTH_SESSION_EXPIRED_EVENT가 발생하면 로그인 상태를 초기화한다(logoutAtom 흐름 재사용)", () => {
    const store = createStore();
    store.set(authTokenAtom, "some-jwt-token");
    store.set(currentUserAtom, {
      id: "test-user-id",
      employeeId: "W0001",
      name: "홍길동",
      email: null,
      status: "ACTIVE",
      role: "WORKER",
      mustChangePassword: false,
      tenantId: "wms-local",
    });

    render(
      <JotaiProvider store={store}>
        <AuthSessionExpiredWatcher />
      </JotaiProvider>
    );

    expect(store.get(authTokenAtom)).not.toBeNull();

    window.dispatchEvent(new Event(AUTH_SESSION_EXPIRED_EVENT));

    expect(store.get(authTokenAtom)).toBeNull();
    expect(store.get(currentUserAtom)).toBeNull();
  });
});
