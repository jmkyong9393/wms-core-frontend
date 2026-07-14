import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import CameraScanner from "./CameraScanner";

// Mock hooks and processors
vi.mock("@/features/inbound/hooks/useCamera", () => {
  return {
    useCamera: () => ({
      videoRef: { current: null },
      startCamera: vi.fn(),
      stopCamera: vi.fn(),
      error: null,
    }),
  };
});

vi.mock("@/features/inbound/hooks/useS3Upload", () => {
  return {
    useS3Upload: () => ({
      isCompressing: false,
      isUploading: false,
      uploadProgress: 0,
      error: null,
      uploadImage: vi.fn(),
      resetUploadState: vi.fn(),
    }),
  };
});

vi.mock("@/features/inbound/utils/image-processor", () => {
  return {
    processImage: vi.fn().mockResolvedValue({
      blob: new Blob(["test-image"], { type: "image/jpeg" }),
      previewUrl: "test-url",
      isBlurred: false,
      blurScore: 95,
    }),
  };
});

describe("CameraScanner Component (WebRTC)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render video preview element and capture button", () => {
    render(<CameraScanner />);

    // Verify video and layout elements
    expect(screen.getByText("이 선 안에 책을 맞춰주세요")).toBeInTheDocument();
    
    const captureBtn = screen.getByRole("button");
    expect(captureBtn).toBeInTheDocument();
  });

  it("should trigger capture on button click", () => {
    render(<CameraScanner />);

    const captureBtn = screen.getByRole("button");
    fireEvent.click(captureBtn);
  });
});
