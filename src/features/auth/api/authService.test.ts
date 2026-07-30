import { describe, it, expect, beforeEach, vi } from "vitest";
import { apiClient } from "@/lib/api-client";
import { login, refreshAccessToken, logout } from "./authService";

vi.mock("@/lib/api-client", () => {
  return {
    apiClient: {
      get: vi.fn(),
      post: vi.fn(),
      patch: vi.fn(),
    },
  };
});

describe("authService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("login sends withCredentials + skipAuth so a stale token is never attached", async () => {
    vi.mocked(apiClient.post).mockResolvedValueOnce({
      data: {
        access_token: "token",
        token_type: "bearer",
        expires_in: 1800,
        must_change_password: false,
      },
    });

    await login({ employee_id: "M0001", password: "pw" });

    expect(apiClient.post).toHaveBeenCalledWith(
      "/api/v1/auth/login",
      { employee_id: "M0001", password: "pw" },
      { withCredentials: true, skipAuth: true }
    );
  });

  it("refreshAccessToken sends no body and no Authorization header via skipAuth", async () => {
    vi.mocked(apiClient.post).mockResolvedValueOnce({ data: { access_token: "new-token" } });

    const res = await refreshAccessToken();

    expect(apiClient.post).toHaveBeenCalledWith("/api/v1/auth/refresh", undefined, {
      withCredentials: true,
      skipAuth: true,
    });
    expect(res).toEqual({ access_token: "new-token" });
  });

  it("logout sends withCredentials + skipAuth", async () => {
    vi.mocked(apiClient.post).mockResolvedValueOnce({ data: undefined });

    await logout();

    expect(apiClient.post).toHaveBeenCalledWith("/api/v1/auth/logout", undefined, {
      withCredentials: true,
      skipAuth: true,
    });
  });
});
