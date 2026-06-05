import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://voicerank.vercel.app"),
  title: "VoiceRank",
  description: "Launch creator campaigns, verify submissions, and reward measurable impact.",
  applicationName: "VoiceRank",
  appleWebApp: {
    title: "VoiceRank",
  },
  icons: {
    icon: [
      { url: "/favicon.png", type: "image/png", sizes: "64x64" },
      { url: "/voicerank-icon.png", type: "image/png", sizes: "1024x1024" },
    ],
    apple: [{ url: "/voicerank-icon.png", type: "image/png", sizes: "1024x1024" }],
  },
  openGraph: {
    title: "VoiceRank",
    siteName: "VoiceRank",
    description: "Launch creator campaigns, verify submissions, and reward measurable impact.",
    images: [{ url: "/voicerank-icon.png", width: 1024, height: 1024, alt: "VoiceRank icon" }],
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
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
