"use client";

import { useEffect, useState } from "react";

// 개발 환경에서 MSW를 실행하는 Provider
// 개발 환경에서만 Mock Service Worker 실행 
// MSW 준비 완료 후 하위 화면 렌더링 
// 운영 환경에서는 MSW 실행 없이 바로 화면 표시
export function MockProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(() => process.env.NODE_ENV === "production");

  useEffect(() => {
    if (process.env.NODE_ENV === "production") return;

    let cancelled = false;
    import("@/mocks/browser").then(({ worker }) =>
      worker.start({ onUnhandledRequest: "bypass", quiet: true })
    ).then(() => {
      if (!cancelled) setReady(true);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  if (!ready) return null;
  return <>{children}</>;
}
