import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

/**
 * Next.js Route Handler for S3-compatible Presigned URL generation.
 * This runs securely on the Next.js server side and reads credentials from environment variables.
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

export async function POST(request: Request) {
  try {
    const { filename, contentType } = await request.json();
    if (!filename || !contentType) {
      return NextResponse.json(
        { error: "filename and contentType are required" },
        { status: 400 }
      );
    }

    const bucketName = process.env.OSS_BUCKET_NAME || "wms-book-photos";
    const objectKey = `uploads/${Date.now()}_${filename}`;

    // Create S3 PUT command
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: objectKey,
      ContentType: contentType,
    });

    // Generate Presigned URL valid for 10 minutes (600 seconds)
    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 600 });

    // CloudFront 도메인을 통해 CDN URL 생성
    const cloudfrontDomain = process.env.CLOUDFRONT_DOMAIN || "https://d1xxxxxx.cloudfront.net";
    const publicUrl = `${cloudfrontDomain}/${objectKey}`;

    return NextResponse.json({ uploadUrl, publicUrl });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    console.error("[Presigned URL Route Error]:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
