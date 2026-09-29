import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { NavBar } from "@/components/NavBar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "スカウトサービス",
  description: "インターン生と企業をマッチングするスカウトサービス",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ja" className={`${geistSans.variable} ${geistMono.variable}`}>
      <head>
        {/* eslint-disable-next-line @next/next/no-page-custom-font -- App Router layout, not the Pages-only pattern this rule targets; Material Symbols is an icon font next/font/google does not support. */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined&display=block"
        />
      </head>
      <body>
        <AuthProvider>
          <NavBar />
          <main className="main-container">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
