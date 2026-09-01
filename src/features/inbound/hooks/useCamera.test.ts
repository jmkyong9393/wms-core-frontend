import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useCamera } from "./useCamera";

describe("useCamera Hook", () => {
  let mockStreamInstance: {
    getTracks: ReturnType<
      typeof vi.fn<() => Array<{ stop: ReturnType<typeof vi.fn> }>>
    >;
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockStreamInstance = {
      getTracks: vi.fn().mockReturnValue([
        { stop: vi.fn() }
      ]),
    };

    // Stub getUserMedia and requestAnimationFrame globally
    vi.stubGlobal("navigator", {
      mediaDevices: {
        getUserMedia: vi.fn().mockResolvedValue(mockStreamInstance),
      },
    });
    vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => {
      cb(0);
      return 0;
    });
    vi.stubGlobal("cancelAnimationFrame", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("should initialize with null stream and fetch camera on mount", async () => {
    const { result } = renderHook(() => useCamera());

    await act(async () => {
      // Allow getUserMedia promise resolution
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(result.current.stream).toBe(mockStreamInstance);
    expect(result.current.error).toBeNull();
  });

  it("should stop camera stream when stopCamera is called", async () => {
    const { result } = renderHook(() => useCamera());

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    act(() => {
      result.current.stopCamera();
    });

    expect(result.current.stream).toBeNull();
    expect(mockStreamInstance.getTracks()[0].stop).toHaveBeenCalled();
  });
});
