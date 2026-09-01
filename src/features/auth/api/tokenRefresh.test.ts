import { describe, it, expect, beforeEach, vi } from "vitest";
import { refreshAccessToken } from "./authService";
import { getOrRefreshAccessToken } from "./tokenRefresh";
import type { RefreshResponse } from "@/features/auth/types/authApiTypes";

vi.mock("./authService", () => ({
  refreshAccessToken: vi.fn(),
}));


function makeRefreshResponse(token: string): RefreshResponse {
  return {
    access_token: token,
    token_type: "bearer",
    expires_in: 1800,
    must_change_password: false,
  };
}

describe("getOrRefreshAccessToken", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shares a single in-flight refresh request across concurrent callers", async () => {
    let resolveRefresh!: (value: RefreshResponse) => void;
    vi.mocked(refreshAccessToken).mockReturnValueOnce(
      new Promise((resolve) => {
        resolveRefresh = resolve;
      })
    );

    const call1 = getOrRefreshAccessToken();
    const call2 = getOrRefreshAccessToken();

    expect(refreshAccessToken).toHaveBeenCalledTimes(1);

    resolveRefresh(makeRefreshResponse("new-token"));

    await expect(call1).resolves.toBe("new-token");
    await expect(call2).resolves.toBe("new-token");
    expect(refreshAccessToken).toHaveBeenCalledTimes(1);
  });

  it("propagates the same rejection to every concurrent caller", async () => {
    const error = new Error("refresh failed");
    let rejectRefresh!: (err: unknown) => void;
    vi.mocked(refreshAccessToken).mockReturnValueOnce(
      new Promise((_resolve, reject) => {
        rejectRefresh = reject;
      })
    );

    const call1 = getOrRefreshAccessToken();
    const call2 = getOrRefreshAccessToken();

    rejectRefresh(error);

    await expect(call1).rejects.toBe(error);
    await expect(call2).rejects.toBe(error);
    expect(refreshAccessToken).toHaveBeenCalledTimes(1);
  });

  it("issues a new refresh call for a later, separate invocation", async () => {
    vi.mocked(refreshAccessToken).mockResolvedValueOnce(makeRefreshResponse("first"));
    await expect(getOrRefreshAccessToken()).resolves.toBe("first");

    vi.mocked(refreshAccessToken).mockResolvedValueOnce(makeRefreshResponse("second"));
    await expect(getOrRefreshAccessToken()).resolves.toBe("second");

    expect(refreshAccessToken).toHaveBeenCalledTimes(2);
  });
});
