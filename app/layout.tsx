// app/layout.tsx
import type React from "react";
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Analytics } from "@vercel/analytics/next";
import { Suspense } from "react";
import { Header } from "@/components/header";
// import { Footer } from "@/components/footer";
import "./globals.css";
import { CustomCursor } from "@/components/CustomCursor";
import { Toaster } from "@/components/ui/sonner";
import { ActivityTimeoutHandler } from "@/components/ActivityTimeoutHandler"; // Import the handler

export const metadata: Metadata = {
  title: "न्याय-सारथी | Nyay-Saarthi",
  description: "जटिल कानूनी दस्तावेज़ों को सरल भाषा में समझें | Simplify complex legal documents into plain language",
  generator: "Next.js",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="hi">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </head>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <CustomCursor />
        <Header />
        <main className="pt-20">
          <ActivityTimeoutHandler>
             <Suspense fallback={null}>{children}</Suspense>
          </ActivityTimeoutHandler>
        </main>
        {/* <Footer /> */}
        <Analytics />
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}