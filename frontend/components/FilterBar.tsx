"use client"

import { Search, RefreshCw, ShieldAlert, Bug } from "lucide-react"

interface FilterBarProps {
  search: string
  severity: string
  source: string
  timeRange: string
  hasCve: boolean
  criticalOnly: boolean
  onSearch: (v: string) => void
  onSeverity: (v: string) => void
  onSource: (v: string) => void
  onTimeRange: (v: string) => void
  onHasCve: (v: boolean) => void
  onCriticalOnly: (v: boolean) => void
  onScrape: () => void
  scraping: boolean
}

const SEVERITIES = ["", "critical", "high", "medium", "info"]
const SOURCES = ["", "bleepingcomputer", "thehackernews", "krebsonsecurity", "securityweek"]
const TIME_RANGES = [
  { value: "", label: "ALL TIME" },
  { value: "today", label: "TODAY (24H)" },
  { value: "week", label: "THIS WEEK (7D)" },
]

export default function FilterBar({
  search, severity, source, timeRange, hasCve, criticalOnly,
  onSearch, onSeverity, onSource, onTimeRange, onHasCve, onCriticalOnly, onScrape, scraping
}: FilterBarProps) {
  return (
    <div className="flex flex-col gap-3">
      {/* Search and Main Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="SEARCH CVE, VENDOR, OR INTEL..."
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            className="w-full bg-black border border-gray-700 rounded pl-9 pr-4 py-1.5 text-xs text-cyan-400 placeholder-gray-600 focus:outline-none focus:border-cyan-500 transition-colors uppercase"
          />
        </div>

        <select
          value={timeRange}
          onChange={(e) => onTimeRange(e.target.value)}
          className="bg-black border border-gray-700 rounded px-3 py-1.5 text-xs text-gray-300 focus:outline-none focus:border-cyan-500 uppercase"
        >
          {TIME_RANGES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>

        <select
          value={severity}
          onChange={(e) => {
            onSeverity(e.target.value)
            if (e.target.value !== "critical") onCriticalOnly(false)
          }}
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
          className="flex items-center gap-2 px-4 py-1.5 bg-gray-900 border border-gray-700 hover:border-cyan-500 hover:text-cyan-400 disabled:opacity-50 text-gray-300 text-xs rounded transition-colors uppercase font-bold tracking-wider shrink-0"
        >
          <RefreshCw size={12} className={scraping ? "animate-spin" : ""} />
          {scraping ? "EXECUTING..." : "INIT_SCRAPE"}
        </button>
      </div>

      {/* Quick Toggles */}
      <div className="flex flex-wrap gap-2 items-center">
        <button
          onClick={() => {
            const next = !hasCve;
            onHasCve(next);
          }}
          className={`flex items-center gap-1.5 px-3 py-1 text-[10px] uppercase tracking-wider rounded border transition-colors ${hasCve ? 'bg-cyan-950/40 border-cyan-500 text-cyan-400 shadow-[0_0_8px_rgba(0,255,255,0.2)]' : 'bg-transparent border-gray-700 text-gray-500 hover:border-gray-500'}`}
        >
          <Bug size={12} />
          Only With CVEs
        </button>
        <button
          onClick={() => {
            const next = !criticalOnly;
            onCriticalOnly(next);
            if (next) onSeverity("critical");
            else if (severity === "critical") onSeverity("");
          }}
          className={`flex items-center gap-1.5 px-3 py-1 text-[10px] uppercase tracking-wider rounded border transition-colors ${criticalOnly ? 'bg-red-950/40 border-red-500 text-red-400 shadow-[0_0_8px_rgba(255,0,0,0.2)]' : 'bg-transparent border-gray-700 text-gray-500 hover:border-gray-500'}`}
        >
          <ShieldAlert size={12} />
          Critical Only
        </button>
      </div>
    </div>
  )
}
