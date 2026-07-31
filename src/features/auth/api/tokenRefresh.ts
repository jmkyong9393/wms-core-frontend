import { refreshAccessToken } from "@/features/auth/api/authService";

let refreshPromise: Promise<string> | null = null;

// 동시에 여러 곳에서 401이 발생해도 Refresh 요청은 한 번만 수행되도록 공유
// atom/store는 다루지 않음 - 새 토큰을 store에 반영하는 건 호출자의 책임
export function getOrRefreshAccessToken(): Promise<string> {
  if (!refreshPromise) {
    refreshPromise = refreshAccessToken()
      .then((res) => res.access_token)
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}
