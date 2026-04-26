import type { Metadata, Viewport } from "next";
import "./globals.css";
import { StoreProvider } from "@/lib/store";

export const metadata: Metadata = {
  title: "あといくら家計簿",
  description: "個人事業主のための家計簿アプリ",
};

export const viewport: Viewport = {
  themeColor: "#22A055",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="min-h-screen bg-bg">
        <div className="mx-auto max-w-[420px] min-h-screen bg-bg shadow-[0_0_40px_rgba(0,0,0,0.04)]">
          <StoreProvider>{children}</StoreProvider>
        </div>
      </body>
    </html>
  );
}
