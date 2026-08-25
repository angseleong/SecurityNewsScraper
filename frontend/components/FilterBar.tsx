"use client"

import { Search, RefreshCw } from "lucide-react"

interface FilterBarProps {
  search: string
  severity: string
  source: string
  onSearch: (v: string) => void
  onSeverity: (v: string) => void
  onSource: (v: string) => void
  onScrape: () => void
  scraping: boolean
}

const SEVERITIES = ["", "critical", "high", "medium", "info"]
const SOURCES = ["", "bleepingcomputer", "thehackernews", "krebsonsecurity", "securityweek"]

export default function FilterBar({
  search, severity, source,
  onSearch, onSeverity, onSource, onScrape, scraping
}: FilterBarProps) {
  return (
    <div className="flex flex-wrap gap-3 items-center">
      <div className="relative flex-1 min-w-48">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          type="text"
          placeholder="SEARCH QUERY..."
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          className="w-full bg-black border border-gray-700 rounded pl-9 pr-4 py-1.5 text-xs text-cyan-400 placeholder-gray-600 focus:outline-none focus:border-cyan-500 transition-colors uppercase"
        />
      </div>

      <select
        value={severity}
        onChange={(e) => onSeverity(e.target.value)}
        className="bg-black border border-gray-700 rounded px-3 py-1.5 text-xs text-gray-300 focus:outline-none focus:border-cyan-500 uppercase"
      >
        {SEVERITIES.map((s) => (
          <option key={s} value={s}>{s ? s : "ALL SEVERITIES"}</option>
        ))}
      </select>

      <select
        value={source}
        onChange={(e) => onSource(e.target.value)}
        className="bg-black border border-gray-700 rounded px-3 py-1.5 text-xs text-gray-300 focus:outline-none focus:border-cyan-500 uppercase"
      >
        {SOURCES.map((s) => (
          <option key={s} value={s}>{s || "ALL SOURCES"}</option>
        ))}
      </select>

      <button
        onClick={onScrape}
        disabled={scraping}
        className="flex items-center gap-2 px-4 py-1.5 bg-gray-900 border border-gray-700 hover:border-cyan-500 hover:text-cyan-400 disabled:opacity-50 text-gray-300 text-xs rounded transition-colors uppercase font-bold tracking-wider"
      >
        <RefreshCw size={12} className={scraping ? "animate-spin" : ""} />
        {scraping ? "EXECUTING..." : "INIT_SCRAPE"}
      </button>
    </div>
  )
}
