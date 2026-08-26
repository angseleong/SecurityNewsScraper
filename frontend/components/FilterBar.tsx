"use client"

import { Search, RefreshCw, ShieldAlert, Bug } from "lucide-react"

interface FilterBarProps {
  search: string; severity: string; source: string; timeRange: string
  hasCve: boolean; criticalOnly: boolean
  onSearch: (v: string) => void; onSeverity: (v: string) => void
  onSource: (v: string) => void; onTimeRange: (v: string) => void
  onHasCve: (v: boolean) => void; onCriticalOnly: (v: boolean) => void
  onScrape: () => void; scraping: boolean
}

const SEVERITIES = ["", "critical", "high", "medium", "info"]
const SOURCES = ["", "bleepingcomputer", "thehackernews", "krebsonsecurity", "securityweek"]
const TIME_RANGES = [
  { value: "", label: "ALL TIME" },
  { value: "today", label: "TODAY" },
  { value: "week", label: "7 DAYS" },
]

const mono: React.CSSProperties = { fontFamily: 'var(--font-fira-code), monospace' }

export default function FilterBar({
  search, severity, source, timeRange, hasCve, criticalOnly,
  onSearch, onSeverity, onSource, onTimeRange, onHasCve, onCriticalOnly, onScrape, scraping
}: FilterBarProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-3 items-center">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#797d86' }} />
          <input
            type="text"
            placeholder="SEARCH CVE, VENDOR..."
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            className="w-full uppercase"
            style={{
              ...mono,
              backgroundColor: '#000000',
              border: '1px solid #303236',
              borderRadius: 9999,
              paddingLeft: 36,
              paddingRight: 16,
              paddingTop: 8,
              paddingBottom: 8,
              fontSize: 12,
              color: '#34d59a',
              outline: 'none',
            }}
          />
        </div>

        {/* Pill Selects */}
        {[
          { value: timeRange, onChange: (v: string) => onTimeRange(v), options: TIME_RANGES.map(t => ({ value: t.value, label: t.label })) },
          { value: severity, onChange: (v: string) => { onSeverity(v); if (v !== "critical") onCriticalOnly(false) }, options: SEVERITIES.map(s => ({ value: s, label: s ? s.toUpperCase() : "ALL SEV" })) },
          { value: source, onChange: (v: string) => onSource(v), options: SOURCES.map(s => ({ value: s, label: s ? s.toUpperCase() : "ALL SOURCES" })) },
        ].map((sel, i) => (
          <select
            key={i}
            value={sel.value}
            onChange={(e) => sel.onChange(e.target.value)}
            className="cursor-pointer appearance-none"
            style={{
              ...mono,
              backgroundColor: sel.value ? '#151617' : '#000000',
              border: sel.value ? '1px solid #34d59a' : '1px solid #303236',
              borderRadius: 9999,
              padding: '8px 16px',
              paddingRight: 28,
              fontSize: 12,
              color: sel.value ? '#34d59a' : '#797d86',
              outline: 'none',
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23797d86' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 10px center',
            }}
          >
            {sel.options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        ))}

        <button
          onClick={onScrape}
          disabled={scraping}
          className="flex items-center gap-2 font-medium disabled:opacity-40 transition-all hover:scale-105 cursor-pointer"
          style={{
            ...mono,
            backgroundColor: '#ffffff',
            color: '#151617',
            borderRadius: 9999,
            padding: '8px 20px',
            fontSize: 12,
            border: 'none',
          }}
        >
          <RefreshCw size={14} className={scraping ? "animate-spin" : ""} />
          {scraping ? "RUNNING..." : "SCRAPE"}
        </button>
      </div>

      {/* Toggle pills */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onHasCve(!hasCve)}
          className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest transition-colors cursor-pointer"
          style={{
            borderRadius: 9999,
            border: hasCve ? '1px solid #34d59a' : '1px solid #303236',
            backgroundColor: hasCve ? 'rgba(52,213,154,0.1)' : 'transparent',
            color: hasCve ? '#34d59a' : '#797d86',
          }}
        >
          <Bug size={12} /> CVE Only
        </button>
        <button
          onClick={() => {
            const next = !criticalOnly
            onCriticalOnly(next)
            if (next) onSeverity("critical")
            else if (severity === "critical") onSeverity("")
          }}
          className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest transition-colors cursor-pointer"
          style={{
            borderRadius: 9999,
            border: criticalOnly ? '1px solid #ff3621' : '1px solid #303236',
            backgroundColor: criticalOnly ? 'rgba(255,54,33,0.1)' : 'transparent',
            color: criticalOnly ? '#ff3621' : '#797d86',
          }}
        >
          <ShieldAlert size={12} /> Critical
        </button>
      </div>
    </div>
  )
}
