"use client";

import { useEffect, useState } from "react";

// 개발 환경에서 MSW 실행
// NEXT_PUBLIC_DISABLE_MSW=true이면 실제 백엔드 사용
export function MockProvider({ children }: { children: React.ReactNode }) {
  const shouldStartMsw =
    process.env.NODE_ENV !== "production" && process.env.NEXT_PUBLIC_DISABLE_MSW !== "true";
  const [ready, setReady] = useState(() => !shouldStartMsw);

  useEffect(() => {
    if (!shouldStartMsw) return;

    let cancelled = false;
    import("@/mocks/browser").then(({ worker }) =>
      worker.start({ onUnhandledRequest: "bypass", quiet: true })
    ).then(() => {
      if (!cancelled) setReady(true);
    });

    return () => {
      cancelled = true;
    };
  }, [shouldStartMsw]);

  // MSW 준비 후 화면 표시
  if (!ready) return null;
  return <>{children}</>;
}
