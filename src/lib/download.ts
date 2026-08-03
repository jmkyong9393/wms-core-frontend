// 파일 다운로드 공용 유틸
// 클라이언트에서 만든 Blob과 서버 응답 Blob 모두에 사용

// 만든 파일을 사용자 컴퓨터에 다운로드
export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

// Content-Disposition 헤더에서 파일명 추출, 없거나 파싱 실패 시 fallback 사용
export function parseContentDispositionFilename(
  header: string | undefined | null,
  fallback: string
): string {
  if (!header) return fallback;

  const utf8Match = header.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8Match) {
    try {
      return decodeURIComponent(utf8Match[1]);
    } catch {
      // fall through to next pattern
    }
  }

  const quotedMatch = header.match(/filename="([^"]+)"/i);
  if (quotedMatch) return quotedMatch[1];

  const plainMatch = header.match(/filename=([^;]+)/i);
  if (plainMatch) return plainMatch[1].trim();

  return fallback;
}
