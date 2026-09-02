import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

/**
 * S3 Presigned URL 발급 (Next.js Route Handler).
 *
 * 버킷 쓰기 권한을 발급하므로 백엔드 /auth/me로 토큰을 검증한 뒤에만 서명한다.
 */
const s3Client = new S3Client({
  region: process.env.OSS_REGION || "ap-northeast-2",
  endpoint: process.env.OSS_ENDPOINT || "https://s3.ap-northeast-2.amazonaws.com",
  credentials: {
    accessKeyId: process.env.OSS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.OSS_ACCESS_KEY_SECRET || "",
  },
  forcePathStyle: false,
});

// 백엔드 검증(ALLOWED_IMAGE_EXTENSIONS)과 동일 범위
const ALLOWED_CONTENT_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const EXTENSION_BY_CONTENT_TYPE: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

// JWT 서명 키를 프론트에 두지 않도록 검증은 백엔드에 맡긴다.
async function isAuthenticated(request: Request): Promise<boolean> {
  const authorization = request.headers.get("authorization");
  if (!authorization?.startsWith("Bearer ")) return false;

  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/auth/me`, {
      headers: { Authorization: authorization },
      cache: "no-store",
    });
    return res.ok;
  } catch {
    // 통신 실패 시 발급하지 않는다
    return false;
  }
}

export async function POST(request: Request) {
  try {
    if (!(await isAuthenticated(request))) {
      return NextResponse.json(
        { error: "인증이 필요합니다." },
        { status: 401 }
      );
    }

    const { filename, contentType } = await request.json();
    if (!filename || !contentType) {
      return NextResponse.json(
        { error: "filename and contentType are required" },
        { status: 400 }
      );
    }

    if (!ALLOWED_CONTENT_TYPES.has(contentType)) {
      return NextResponse.json(
        { error: "검수 이미지(jpeg/png/webp)만 업로드할 수 있습니다." },
        { status: 415 }
      );
    }

    const bucketName = process.env.OSS_BUCKET_NAME || "wms-book-photos";
    // 원본 파일명을 키에 쓰면 경로 조작·확장자 위장이 가능해 contentType에서 유도한다.
    const objectKey = `uploads/${crypto.randomUUID()}${EXTENSION_BY_CONTENT_TYPE[contentType]}`;

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: objectKey,
      ContentType: contentType,
    });

    // Presigned URL 유효기간 10분
    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 600 });

    const cloudfrontDomain = process.env.CLOUDFRONT_DOMAIN;
    if (!cloudfrontDomain) {
      // 도메인이 없으면 백엔드 URL 검증에서 422가 나므로 여기서 막는다.
      return NextResponse.json(
        { error: "CLOUDFRONT_DOMAIN 환경변수가 설정되지 않았습니다." },
        { status: 500 }
      );
    }
    const publicUrl = `${cloudfrontDomain}/${objectKey}`;

    return NextResponse.json({ uploadUrl, publicUrl });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    console.error("[Presigned URL Route Error]:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
