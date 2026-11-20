import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ucapin · Latihan Speaking Bahasa Inggris Harian",
  description:
    "Website latihan bicara bahasa Inggris untuk pelajar Indonesia. Kesalahan ucapan otomatis menjadi latihan besok di Bank Kesalahan.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <link
          rel="preload"
          href="/fonts/bricolage-grotesque-latin.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
