import { describe, it, expect, beforeEach, vi } from "vitest";
import { processImage } from "./image-processor";

describe("image-processor", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should process video element frame and calculate score", async () => {
    const mockCtx = {
      drawImage: vi.fn(),
      getImageData: vi.fn().mockReturnValue({
        width: 400,
        height: 400,
        data: new Uint8ClampedArray(400 * 400 * 4),
      }),
    };

    const mockCanvas = {
      width: 0,
      height: 0,
      getContext: vi.fn().mockReturnValue(mockCtx),
      toBlob: vi.fn().mockImplementation((callback) => {
        callback(new Blob(["test-image"], { type: "image/jpeg" }));
      }),
    };

    vi.stubGlobal("document", {
      createElement: vi.fn().mockImplementation((el) => {
        if (el === "canvas") return mockCanvas;
        return {};
      }),
    });

    const mockVideo = {
      videoWidth: 1920,
      videoHeight: 1080,
    } as HTMLVideoElement;

    const res = await processImage(mockVideo);

    expect(res.blob).toBeDefined();
    expect(res.isBlurred).toBe(true); // Since all pixels are 0, Laplacian variance will be 0 (blurred)
    expect(res.blurScore).toBe(0);
  });
});
