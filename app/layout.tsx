import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "晋行 · 山西四人旅行助手",
  description: "4人共享的太原与大同五日自驾旅行空间。",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
