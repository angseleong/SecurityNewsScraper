import type { Metadata } from "next"
import { JetBrains_Mono } from "next/font/google"
import "./globals.css"

const jetbrainsMono = JetBrains_Mono({ 
  subsets: ["latin"],
  variable: "--font-jetbrains" 
})

export const metadata: Metadata = {
  title: "SecurityNewsScraper",
  description: "Cybersecurity news aggregator with CVE detection",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${jetbrainsMono.className} ${jetbrainsMono.variable} antialiased selection:bg-cyan-900 selection:text-cyan-100`}>
        {children}
      </body>
    </html>
  )
}
