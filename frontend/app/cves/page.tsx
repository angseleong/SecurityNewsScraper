"use client"

import { Terminal, Construction } from "lucide-react"

export default function CveExplorer() {
  return (
    <div className="min-h-screen bg-black text-gray-100 font-mono flex flex-col">
      <header className="border-b border-gray-800 bg-[#0a0a0a] px-4 py-2 flex items-center justify-between z-10 shrink-0">
        <div className="flex items-center gap-2">
          <Terminal size={18} className="text-cyan-500" />
          <h1 className="text-sm font-bold tracking-widest text-gray-200">
            SEC_NEWS_SCRAPER <span className="text-gray-600">v1.1</span> / CVE_EXPLORER
          </h1>
        </div>
        <a href="/" className="text-xs text-gray-500 hover:text-cyan-400">&lt; BACK_TO_FEED</a>
      </header>

      <main className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-gray-500">
          <Construction size={48} className="text-yellow-500" />
          <div className="text-center space-y-2">
            <h2 className="text-xl font-bold tracking-widest text-gray-300">MODULE_NOT_READY</h2>
            <p className="text-sm">CVE Explorer is currently under construction (Phase 11).</p>
          </div>
        </div>
      </main>
    </div>
  )
}
