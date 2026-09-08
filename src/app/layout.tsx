import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import appleTouchIcon from "../../public/brand/snowfire-apple-touch.png";
import tabIcon from "../../public/brand/snowfire-icon-192.png";
import { getSiteUrl } from "@/lib/env";
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
  // Without this, every relative URL below resolves against whatever host served
  // the page, so a shared link previews an image from a preview deployment — or
  // from localhost.
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: "SnowFire.ca",
    template: "%s · SnowFire.ca",
  },
  description:
    "Snow removal and firewood for homes and businesses. Book service, see proof, and keep every property’s history in one place.",
  // Square, opaque crops of the mascot — these slots letterbox a tall logo, and
  // iOS paints black behind any transparency. Fingerprinted like the in-page
  // logos, since a tab icon is cached hardest of all.
  icons: {
    icon: tabIcon.src,
    apple: appleTouchIcon.src,
  },
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "SnowFire",
    statusBarStyle: "default",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en-CA"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-background font-sans text-foreground">
        {children}
      </body>
    </html>
  );
}
