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
          placeholder="Search articles..."
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-9 pr-4 py-2 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-gray-500"
        />
      </div>

      <select
        value={severity}
        onChange={(e) => onSeverity(e.target.value)}
        className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-gray-500"
      >
        {SEVERITIES.map((s) => (
          <option key={s} value={s}>{s ? s.charAt(0).toUpperCase() + s.slice(1) : "All Severities"}</option>
        ))}
      </select>

      <select
        value={source}
        onChange={(e) => onSource(e.target.value)}
        className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-gray-500"
      >
        {SOURCES.map((s) => (
          <option key={s} value={s}>{s || "All Sources"}</option>
        ))}
      </select>

      <button
        onClick={onScrape}
        disabled={scraping}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-500 text-white text-sm rounded-lg transition-colors"
      >
        <RefreshCw size={14} className={scraping ? "animate-spin" : ""} />
        {scraping ? "Scraping..." : "Scrape Now"}
      </button>
    </div>
  )
}
