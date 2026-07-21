const CACHE_NAME = 'wms-static-cache-v1';

// 설치 시 즉시 대기열을 통과하여 활성화
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// 활성화 시 기존 캐시 삭제 및 클라이언트 제어권 획득
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// 네트워크 요청 인터셉트
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // API 요청은 캐시하지 않고 무조건 네트워크 통과
  if (url.pathname.startsWith('/api/')) {
    return;
  }

  // 1. HTML 페이지 (새로고침 등 브라우저 네비게이션) - Network-First 전략
  // 온라인일 땐 항상 최신 HTML을 가져오고 캐시에 저장, 오프라인일 땐 캐시된 HTML 반환
  if (event.request.mode === 'navigate' || event.request.destination === 'document') {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
          return networkResponse;
        })
        .catch(() => {
          // 네트워크 실패(오프라인) 시 캐시에서 HTML을 찾아 반환
          return caches.match(event.request);
        })
    );
    return;
  }

  // 2. Next.js 빌드 정적 파일, 이미지, 아이콘 - Cache-First 전략
  // 이미 캐시에 있으면 네트워크를 타지 않고 즉시 반환 (매우 빠름)
  if (
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.startsWith('/_next/image/') ||
    url.pathname.startsWith('/icons/') ||
    url.pathname === '/icon.png' ||
    url.pathname === '/manifest.webmanifest'
  ) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(event.request).then((networkResponse) => {
          if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
            return networkResponse;
          }
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
          return networkResponse;
        }).catch(() => {
          // 오프라인 시 무시
        });
      })
    );
    return;
  }
});
