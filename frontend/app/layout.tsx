import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "SecurityNewsScraper",
  description: "Cybersecurity news aggregator with CVE detection",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  )
}
