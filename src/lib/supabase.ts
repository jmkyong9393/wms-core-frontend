import { createClient } from "@supabase/supabase-js";

// 환경변수에서 Supabase 설정값 추출
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "";

// 실제 설정값을 넣기 전 플레이스홀더 상태인지 확인하는 헬퍼
const isPlaceholder = (val: string) => {
  return !val || val.includes("PLACEHOLDER") || val === "";
};

const hasValidConfig = !isPlaceholder(supabaseUrl) && !isPlaceholder(supabasePublishableKey);

/**
 * Supabase 클라이언트 인스턴스
 * 
 * NEXT_PUBLIC_SUPABASE_URL 및 NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY 환경변수가 설정되지 않은 경우
 * 런타임 에러 방지를 위해 에러 로깅 후 빈 껍데기 또는 더미 클라이언트 동작을 유도할 수 있도록 처리합니다.
 * 사용자가 실제 연동 정보를 채우면 정상 작동하게 됩니다.
 */
export const supabase = createClient(
  hasValidConfig ? supabaseUrl : "https://dummy-project.supabase.co",
  hasValidConfig ? supabasePublishableKey : "dummy-publishable-key"
);

if (!hasValidConfig && typeof window !== "undefined") {
  // 개발자 도구 콘솔에 경고를 노출하여 사용자가 설정 값을 교체할 수 있도록 유도
  console.warn(
    "⚠️ Supabase 설정이 비어있거나 플레이스홀더 상태입니다. .env.local 파일에 실제 NEXT_PUBLIC_SUPABASE_URL 및 NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY를 작성해 주세요."
  );
}
