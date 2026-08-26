"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

const LINKS = [
  { href: "/radar", label: "Radar" },
  { href: "/cves", label: "CVEs" },
  { href: "/analytics", label: "Analytics" },
  { href: "/watchlist", label: "Watchlist" },
]

export default function NavLinks() {
  const pathname = usePathname()

  return (
    <nav className="flex items-center gap-8">
      {LINKS.map(({ href, label }) => {
        const active = pathname === href
        return (
          <Link
            key={href}
            href={href}
            className="text-[14px] font-medium tracking-[-0.7px] transition-colors duration-200"
            style={{ color: active ? '#ffffff' : '#797d86' }}
            onMouseEnter={(e) => { if (!active) e.currentTarget.style.color = '#ffffff' }}
            onMouseLeave={(e) => { if (!active) e.currentTarget.style.color = '#797d86' }}
          >
            {label}
          </Link>
        )
      })}
    </nav>
  )
}
