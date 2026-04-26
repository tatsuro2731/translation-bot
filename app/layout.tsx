import type { Metadata, Viewport } from "next";
import "./globals.css";
import { StoreProvider } from "@/lib/store";
import { SWRegister } from "@/components/SWRegister";

export const metadata: Metadata = {
  title: "あといくら家計簿",
  description: "個人事業主のための家計簿アプリ",
  applicationName: "あといくら家計簿",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "あといくら",
  },
  icons: {
    icon: [
      { url: "/icon.svg",      type: "image/svg+xml" },
      { url: "/icon-192.png",  sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png",  sizes: "512x512", type: "image/png" },
      { url: "/favicon-32.png", sizes: "32x32",  type: "image/png" },
      { url: "/favicon-16.png", sizes: "16x16",  type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#22A055" },
    { media: "(prefers-color-scheme: dark)",  color: "#1B8347" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <head>
        {/* iOS Safari 用フォールバック（古い iOS は metadata.appleWebApp を完全には反映しないため明示） */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="あといくら" />
      </head>
      <body className="min-h-[100svh] bg-bg">
        <div className="mx-auto max-w-[440px] min-h-[100svh] bg-bg shadow-[0_0_40px_rgba(0,0,0,0.04)]">
          <StoreProvider>{children}</StoreProvider>
        </div>
        <SWRegister />
      </body>
    </html>
  );
}
