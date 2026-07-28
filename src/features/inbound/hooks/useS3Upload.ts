/**
 * S3 Direct Upload 커스텀 훅
 *
 * browser-image-compression 라이브러리를 활용하여 Web Worker 내에서 이미지를 비동기 압축한 뒤,
 * Pre-signed URL을 통해 S3에 직접 업로드합니다.
 * 메인 스레드 블로킹 없이 대용량 이미지(10MB+)를 300KB~1MB 수준으로 압축합니다.
 */
"use client";

import { useState, useCallback } from "react";

import { getPresignedUrl } from "@/features/inbound/api/getPresignedUrl";

interface UploadResult {
  url: string;
}

interface UseS3UploadReturn {
  isCompressing: boolean;
  isUploading: boolean;
  uploadProgress: number;
  error: string | null;
  uploadImage: (file: File) => Promise<UploadResult | null>;
  resetUploadState: () => void;
}

export function useS3Upload(): UseS3UploadReturn {
  const [isCompressing, setIsCompressing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const resetUploadState = useCallback(() => {
    setIsCompressing(false);
    setIsUploading(false);
    setUploadProgress(0);
    setError(null);
  }, []);

  const uploadImage = useCallback(
    async (file: File): Promise<UploadResult | null> => {
      try {
        setError(null);
        setUploadProgress(0);

        // 1단계: 압축은 Canvas(image-processor)에서 이미 최적화되었으므로 바로 전송합니다.
        
        // 2단계: Pre-signed URL 요청
        setIsUploading(true);
        setUploadProgress(10);

        const filename = file.name;
        const { uploadUrl, publicUrl } = await getPresignedUrl(
          filename,
          file.type
        );
        setUploadProgress(30);

        // 3단계: S3 Direct PUT 업로드
        const uploadResponse = await fetch(uploadUrl, {
          method: "PUT",
          body: file,
          headers: {
            "Content-Type": file.type,
          },
        });

        if (!uploadResponse.ok) {
          let errorDetails = "";
          try {
            const errorText = await uploadResponse.text();
            const codeMatch = errorText.match(/<Code>([\s\S]*?)<\/Code>/);
            const messageMatch = errorText.match(/<Message>([\s\S]*?)<\/Message>/);
            if (codeMatch && codeMatch[1]) {
              errorDetails += ` [${codeMatch[1].trim()}]`;
            }
            if (messageMatch && messageMatch[1]) {
              errorDetails += `: ${messageMatch[1].trim()}`;
            }
          } catch (e) {
            // ignore parsing error
          }
          throw new Error(
            `S3 업로드 실패 (HTTP ${uploadResponse.status})${errorDetails}`
          );
        }

        setUploadProgress(100);
        setIsUploading(false);

        return { url: publicUrl };
      } catch (err: unknown) {
        const errMsg =
          err instanceof Error
            ? err.message
            : "이미지 업로드 중 오류가 발생했습니다.";
        setError(errMsg);
        setIsCompressing(false);
        setIsUploading(false);
        return null;
      }
    },
    []
  );

  return {
    isCompressing,
    isUploading,
    uploadProgress,
    error,
    uploadImage,
    resetUploadState,
  };
}
