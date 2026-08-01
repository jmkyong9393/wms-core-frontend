import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import type { AxiosRequestConfig, AxiosResponse } from "axios";
import { apiClient, AUTH_SESSION_EXPIRED_EVENT } from "./api-client";
import { AUTH_TOKEN_STORAGE_KEY } from "@/features/auth/store/authAtoms";
import { getOrRefreshAccessToken } from "@/features/auth/api/tokenRefresh";

vi.mock("@/features/auth/api/tokenRefresh", () => ({
  getOrRefreshAccessToken: vi.fn(),
}));

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

// 커스텀 adapter는 axios의 settle()을 거치지 않으므로, 401을 흉내내려면
// (실제 http/xhr adapter처럼) 직접 AxiosError 형태의 rejection을 만들어야 한다
function unauthorizedRejection(config: AxiosRequestConfig): Promise<never> {
  return Promise.reject({
    isAxiosError: true,
    message: "Request failed with status code 401",
    config,
    response: {
      data: { detail: "Unauthorized" },
      status: 401,
      statusText: "Unauthorized",
      headers: {},
      config: config as AxiosResponse["config"],
    },
  });
}

function okResponse(config: AxiosRequestConfig): AxiosResponse {
  return {
    data: { ok: true },
    status: 200,
    statusText: "OK",
    headers: {},
    config: config as AxiosResponse["config"],
  };
}

describe("apiClient response interceptor (401 처리)", () => {
  beforeEach(() => {
    localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, "stale-token");
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("401 응답 시 refresh에 성공하면 새 토큰으로 원 요청을 1회 재시도한다", async () => {
    const capturedConfigs: AxiosRequestConfig[] = [];
    apiClient.defaults.adapter = async (config: AxiosRequestConfig) => {
      capturedConfigs.push(config);
      return config._retry ? okResponse(config) : unauthorizedRejection(config);
    };
    vi.mocked(getOrRefreshAccessToken).mockResolvedValueOnce("new-token");

    const res = await apiClient.get("/api/v1/inventory");

    expect(res.status).toBe(200);
    expect(capturedConfigs).toHaveLength(2);
    expect(capturedConfigs[1].headers?.Authorization).toBe("Bearer new-token");
    expect(localStorage.getItem(AUTH_TOKEN_STORAGE_KEY)).toBe("new-token");
  });

  it("refresh 요청 자체가 401로 실패하면 토큰을 제거하고 세션 만료 이벤트를 dispatch한다", async () => {
    apiClient.defaults.adapter = async (config: AxiosRequestConfig) => unauthorizedRejection(config);
    const refreshUnauthorizedError = { isAxiosError: true, response: { status: 401 } };
    vi.mocked(getOrRefreshAccessToken).mockRejectedValueOnce(refreshUnauthorizedError);

    const handler = vi.fn();
    window.addEventListener(AUTH_SESSION_EXPIRED_EVENT, handler);

    await expect(apiClient.get("/api/v1/inventory")).rejects.toBe(refreshUnauthorizedError);

    expect(localStorage.getItem(AUTH_TOKEN_STORAGE_KEY)).toBeNull();
    expect(handler).toHaveBeenCalledTimes(1);

    window.removeEventListener(AUTH_SESSION_EXPIRED_EVENT, handler);
  });

  it("refresh가 네트워크 오류 등 401이 아닌 사유로 실패하면 토큰을 유지하고 이벤트를 dispatch하지 않는다", async () => {
    apiClient.defaults.adapter = async (config: AxiosRequestConfig) => unauthorizedRejection(config);
    const networkError = new Error("network error");
    vi.mocked(getOrRefreshAccessToken).mockRejectedValueOnce(networkError);

    const handler = vi.fn();
    window.addEventListener(AUTH_SESSION_EXPIRED_EVENT, handler);

    await expect(apiClient.get("/api/v1/inventory")).rejects.toBe(networkError);

    expect(localStorage.getItem(AUTH_TOKEN_STORAGE_KEY)).toBe("stale-token");
    expect(handler).not.toHaveBeenCalled();

    window.removeEventListener(AUTH_SESSION_EXPIRED_EVENT, handler);
  });

  it("skipAuth 요청은 401이어도 refresh를 시도하지 않는다", async () => {
    apiClient.defaults.adapter = async (config: AxiosRequestConfig) => unauthorizedRejection(config);

    await expect(
      apiClient.post("/api/v1/auth/refresh", undefined, { withCredentials: true, skipAuth: true })
    ).rejects.toBeTruthy();

    expect(getOrRefreshAccessToken).not.toHaveBeenCalled();
  });

  it("이미 _retry된 요청은 재시도하지 않는다", async () => {
    apiClient.defaults.adapter = async (config: AxiosRequestConfig) => unauthorizedRejection(config);

    await expect(apiClient.get("/api/v1/inventory", { _retry: true })).rejects.toBeTruthy();

    expect(getOrRefreshAccessToken).not.toHaveBeenCalled();
  });
});
