import axios from "axios";

const MOCK_MODE_KEY = "wms_mock_mode";

function isMockMode(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(MOCK_MODE_KEY) === "true";
}

export interface PresignedUrlResponse {
  uploadUrl: string;
  publicUrl: string;
}

// ─── Pre-signed URL 요청 ───

export async function getPresignedUrl(
  filename: string,
  contentType: string
): Promise<PresignedUrlResponse> {
  if (isMockMode()) {
    return {
      uploadUrl: `https://mock-s3.example.com/upload/${filename}`,
      publicUrl: `https://mock-s3.example.com/public/${filename}`,
    };
  }
  // 로컬 Next.js API Route를 호출합니다.
  const res = await axios.post<PresignedUrlResponse>("/api/upload/url", {
    filename,
    contentType,
  });
  return res.data;
}
