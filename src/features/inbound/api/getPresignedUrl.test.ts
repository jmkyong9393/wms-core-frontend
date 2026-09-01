import { describe, it, expect, beforeEach, vi } from "vitest";
import axios from "axios";
import { getPresignedUrl } from "./getPresignedUrl";

vi.mock("axios", () => {
  return {
    default: {
      post: vi.fn(),
    },
  };
});

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    clear: () => {
      store = {};
    },
    removeItem: (key: string) => {
      delete store[key];
    },
  };
})();
vi.stubGlobal("localStorage", localStorageMock);

describe("getPresignedUrl", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("should return mock response in mock mode", async () => {
    localStorage.setItem("wms_mock_mode", "true");
    const res = await getPresignedUrl("test.jpg", "image/jpeg");
    expect(res.uploadUrl).toContain("mock-s3");
    expect(res.publicUrl).toContain("mock-s3");
    expect(axios.post).not.toHaveBeenCalled();
  });

  it("should call axios in real mode", async () => {
    localStorage.setItem("wms_mock_mode", "false");
    const mockData = { uploadUrl: "real-upload", publicUrl: "real-public" };
    vi.mocked(axios.post).mockResolvedValueOnce({ data: mockData });

    const res = await getPresignedUrl("test.jpg", "image/jpeg");
    expect(axios.post).toHaveBeenCalledWith(
      "/api/upload/url",
      { filename: "test.jpg", contentType: "image/jpeg" },
      undefined
    );
    expect(res).toEqual(mockData);
  });

  // presign 라우트는 S3 쓰기 권한을 발급하므로 서버가 토큰을 요구한다.
  it("attaches the access token when logged in", async () => {
    localStorage.setItem("wms_mock_mode", "false");
    localStorage.setItem("wms_auth_token", "token-abc");
    vi.mocked(axios.post).mockResolvedValueOnce({
      data: { uploadUrl: "u", publicUrl: "p" },
    });

    await getPresignedUrl("test.jpg", "image/jpeg");

    expect(axios.post).toHaveBeenCalledWith(
      "/api/upload/url",
      { filename: "test.jpg", contentType: "image/jpeg" },
      { headers: { Authorization: "Bearer token-abc" } }
    );
  });
});
