"use client"

import { useState, useEffect, useCallback } from "react"
import { fetchCVEs } from "@/lib/api"
import { CVE } from "@/lib/types"
import { Search, ExternalLink, ShieldAlert, Bug } from "lucide-react"
import CustomSelect from "@/components/CustomSelect"

const mono: React.CSSProperties = { fontFamily: 'var(--font-fira-code), monospace' }

export default function CvesPage() {
  const [cves, setCves] = useState<CVE[]>([])
  const [search, setSearch] = useState("")
  const [sort, setSort] = useState("time_desc")
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params: Record<string, string> = {}
      if (search) params.q = search
      if (sort) params.sort = sort
      const data = await fetchCVEs(params)
      setCves(data.cves)
    } catch { setCves([]) }
    finally { setLoading(false) }
  }, [search, sort])

  useEffect(() => { load() }, [load])

  // Group CVEs by cve_id to deduplicate
  const grouped = cves.reduce<Record<string, CVE[]>>((acc, c) => {
    acc[c.cve_id] = acc[c.cve_id] || []
    acc[c.cve_id].push(c)
    return acc
  }, {})
  const uniqueCves = Object.entries(grouped)

  return (
    <div className="min-h-[calc(100vh-56px)]" style={{ backgroundColor: '#000000', color: '#ffffff' }}>
      <div className="mx-auto max-w-[1200px] px-6 py-12">

        {/* Header */}
        <div className="mb-10">
          <h1 className="font-medium mb-2" style={{ fontSize: 48, letterSpacing: '-1.2px', lineHeight: 1.13 }}>
            CVE Explorer
          </h1>
          <p style={{ fontSize: 16, color: '#797d86', lineHeight: 1.6 }}>
            Search and browse all vulnerabilities detected across scraped articles.
          </p>
        </div>

        {/* Search & Sort */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8 max-w-2xl">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: '#797d86' }} />
            <input
              type="text"
              placeholder="CVE-2024-XXXXX or software name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full uppercase"
              style={{
                ...mono,
                backgroundColor: '#000',
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
          <CustomSelect
            value={sort}
            onChange={(v) => setSort(v)}
            options={[
              { value: "time_desc", label: "NEWEST FIRST" },
              { value: "time_asc", label: "OLDEST FIRST" },
              { value: "epss_desc", label: "HIGHEST RISK (EPSS)" },
              { value: "severity_desc", label: "HIGHEST SEVERITY" }
            ]}
            className="w-full sm:w-64"
          />
        </div>

        {/* Stats bar */}
        <div className="flex items-center gap-6 mb-6 pb-4" style={{ borderBottom: '1px solid #242628' }}>
          <div className="flex items-center gap-2">
            <Bug size={14} style={{ color: '#34d59a' }} />
            <span className="text-sm" style={{ color: '#797d86' }}>
              <span style={{ color: '#ffffff', fontWeight: 500 }}>{uniqueCves.length}</span> unique CVEs found
            </span>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-14 rounded animate-pulse" style={{ backgroundColor: '#151617', border: '1px solid #303236', borderRadius: 4 }} />
            ))}
          </div>
        ) : uniqueCves.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <ShieldAlert size={32} style={{ color: '#303236' }} />
            <p className="text-sm tracking-wide" style={{ color: '#797d86', ...mono }}>NO CVEs FOUND</p>
          </div>
        ) : (
          <div style={{ border: '1px solid #303236', borderRadius: 4, overflow: 'hidden' }}>
            {/* Header row */}
            <div className="flex items-center gap-4 px-5 py-3 text-[10px] font-semibold uppercase tracking-wide"
              style={{ backgroundColor: '#0a0a0b', color: '#797d86', borderBottom: '1px solid #303236', ...mono }}>
              <div className="w-44 shrink-0">CVE ID</div>
              <div className="w-24 shrink-0">Severity</div>
              <div className="w-20 shrink-0">CVSS</div>
              <div className="flex-1">Affected Software</div>
              <div className="w-20 shrink-0 text-right">Articles</div>
              <div className="w-16 shrink-0"></div>
            </div>

            {uniqueCves.map(([cveId, entries]) => {
              const first = entries[0]
              const sevColor = first.severity_hint === 'critical' ? '#ff3621' : first.severity_hint === 'high' ? '#f97316' : first.severity_hint === 'medium' ? '#eab308' : '#34d59a'

              return (
                <div key={cveId} className="group flex items-center gap-4 px-5 py-3 transition-colors"
                  style={{ borderBottom: '1px solid #242628' }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#151617')}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <div className="w-44 shrink-0 font-semibold text-[14px]" style={{ ...mono, color: '#ffffff' }}>
                    {cveId}
                  </div>
                  <div className="w-24 shrink-0">
                    <span className="px-2 py-0.5 rounded text-[10px] uppercase tracking-wide font-bold"
                      style={{ ...mono, color: sevColor, backgroundColor: `${sevColor}15`, border: `1px solid ${sevColor}40` }}>
                      {first.severity_hint || 'INFO'}
                    </span>
                  </div>
                  <div className="w-20 shrink-0 text-[13px]" style={{ ...mono, color: first.cvss_score ? '#ffffff' : '#303236' }}>
                    {first.cvss_score ? first.cvss_score.toFixed(1) : '—'}
                  </div>
                  <div className="flex-1 text-[13px] truncate" style={{ color: '#94979e' }}>
                    {first.affected_software || '—'}
                  </div>
                  <div className="w-20 shrink-0 text-right text-[13px]" style={{ ...mono, color: '#797d86' }}>
                    {entries.length}
                  </div>
                  <div className="w-16 shrink-0 flex justify-end">
                    <a
                      href={`https://nvd.nist.gov/vuln/detail/${cveId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded"
                      style={{ backgroundColor: '#242628', border: '1px solid #303236', color: '#797d86' }}
                    >
                      <ExternalLink size={12} />
                    </a>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
