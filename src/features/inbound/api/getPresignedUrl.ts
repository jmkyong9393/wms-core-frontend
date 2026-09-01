import axios from "axios";
import { AUTH_TOKEN_STORAGE_KEY } from "@/features/auth/store/authAtoms";

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
  // 이 라우트는 S3 쓰기 권한을 발급하므로 Access Token을 함께 보내 인증받는다.
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem(AUTH_TOKEN_STORAGE_KEY)
      : null;

  const res = await axios.post<PresignedUrlResponse>(
    "/api/upload/url",
    { filename, contentType },
    token ? { headers: { Authorization: `Bearer ${token}` } } : undefined
  );
  return res.data;
}
