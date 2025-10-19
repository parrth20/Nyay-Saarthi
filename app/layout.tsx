import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import SmoothScroll from "@/components/SmoothScroll" 
import "./globals.css"


export const metadata: Metadata = {
  title: "न्याय-सारथी | Nyay-Saarthi",
  description:
    "जटिल कानूनी दस्तावेज़ों को सरल भाषा में समझें | Simplify complex legal documents into plain language",
  generator: "Next.js",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="hi">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable} `}>
        <SmoothScroll>
          <Header />
          <main className="pt-20">
            <Suspense fallback={null}>{children}</Suspense>
          </main>
          {/* <Footer /> */}
          <Analytics />
        </SmoothScroll>
      </body>
    </html>
  )
}
