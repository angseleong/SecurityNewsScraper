import type { Metadata } from "next"
import { Inter, Fira_Code } from "next/font/google"
import Link from "next/link"
import "./globals.css"
import NavLinks from "@/components/NavLinks"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

const firaCode = Fira_Code({
  subsets: ["latin"],
  variable: "--font-fira-code",
  display: "swap",
})

export const metadata: Metadata = {
  title: "SecurityNewsScraper — Automated Threat Intelligence",
  description: "AI-driven cybersecurity news aggregation, CVE detection, and exploit intelligence.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${firaCode.variable}`}>
      <body className={`${inter.className} antialiased`} style={{ backgroundColor: '#000000', color: '#ffffff' }}>

        {/* Sticky Header */}
        <header
          className="sticky top-0 z-50 w-full backdrop-blur-xl"
          style={{
            borderBottom: '1px solid #303236',
            backgroundColor: 'rgba(0,0,0,0.85)',
          }}
        >
          <div className="mx-auto flex h-14 max-w-[1200px] items-center justify-between px-6">
            <Link href="/" className="flex items-center gap-2.5">
              <div
                className="h-2.5 w-2.5 rounded-full animate-glow-pulse"
                style={{ backgroundColor: '#34d59a', boxShadow: '0 0 8px #34d59a' }}
              />
              <span className="text-[15px] font-semibold tracking-[-0.5px]" style={{ color: '#ffffff' }}>
                SecurityNewsScraper
              </span>
            </Link>

            <NavLinks />
          </div>
        </header>

        {children}
      </body>
    </html>
  )
}
