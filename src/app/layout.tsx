import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "@/components/providers";
import { A2HSBanner } from "@/components/a2hs-banner";
// import { TestErrorButton } from "@/components/test-error-button";
import { ServiceWorkerRegistry } from "@/components/service-worker-registry";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#1d4ed8",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "NEWZED",
  description: "AI-powered B2B Warehouse Management System",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "NEWZED",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.__deferredPrompt = null;
              window.addEventListener('beforeinstallprompt', (e) => {
                e.preventDefault();
                window.__deferredPrompt = e;
              });
              try {
                // 'wms_theme'는 src/stores/atoms.ts의 THEME_STORAGE_KEY와 동일해야 함
                if (JSON.parse(localStorage.getItem('wms_theme') || '"light"') === 'dark') {
                  document.documentElement.classList.add('dark');
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className="min-h-full">
        <Providers>
          {children}
          <A2HSBanner />
          {/* [FE-3.7] 에러 바운더리 테스트용 폭탄 버튼 (필요 시 주석 해제하여 사용) */}
          {/* <TestErrorButton /> */}
          <ServiceWorkerRegistry />
        </Providers>
      </body>
    </html>
  );
}
