import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import type { AxiosRequestConfig, AxiosResponse } from "axios";
import { apiClient } from "./api-client";
import { AUTH_TOKEN_STORAGE_KEY } from "@/features/auth/store/authAtoms";

// Node의 기본 localStorage 스텁이 불완전해 atomWithStorage(getOnInit)가 모듈 로드 시점에
// 깨지므로, api-client(→authAtoms) import 전에 메모리 기반 localStorage로 교체해둔다
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

function stubAdapter(): { getCapturedConfig: () => AxiosRequestConfig | undefined } {
  let captured: AxiosRequestConfig | undefined;
  apiClient.defaults.adapter = async (config: AxiosRequestConfig): Promise<AxiosResponse> => {
    captured = config;
    return {
      data: {},
      status: 200,
      statusText: "OK",
      headers: {},
      config: config as AxiosResponse["config"],
    };
  };
  return { getCapturedConfig: () => captured };
}

describe("apiClient request interceptor", () => {
  beforeEach(() => {
    localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, "stale-token");
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("attaches the Authorization header for normal requests", async () => {
    const { getCapturedConfig } = stubAdapter();

    await apiClient.get("/api/v1/notifications");

    expect(getCapturedConfig()?.headers?.Authorization).toBe("Bearer stale-token");
  });

  it("does not attach the Authorization header when skipAuth is true", async () => {
    const { getCapturedConfig } = stubAdapter();

    await apiClient.post("/api/v1/auth/refresh", undefined, {
      withCredentials: true,
      skipAuth: true,
    });

    expect(getCapturedConfig()?.headers?.Authorization).toBeUndefined();
    expect(getCapturedConfig()?.withCredentials).toBe(true);
  });
});
