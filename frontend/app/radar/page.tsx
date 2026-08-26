"use client"

import { useEffect, useState, useCallback, useMemo } from "react"
import { fetchArticles, fetchStats, triggerScrape } from "@/lib/api"
import { Article, Stats } from "@/lib/types"
import ArticleRow from "@/components/ArticleRow"
import FilterBar from "@/components/FilterBar"
import { Activity } from "lucide-react"

const SEV_COLORS: Record<string, string> = {
  critical: "#ff3621",
  high: "#f97316",
  medium: "#eab308",
  info: "#34d59a"
}

export default function Dashboard() {
  const [articles, setArticles] = useState<Article[]>([])
  const [total, setTotal] = useState(0)
  const [pages, setPages] = useState(1)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [severity, setSeverity] = useState("")
  const [source, setSource] = useState("")
  const [timeRange, setTimeRange] = useState("")
  const [hasCve, setHasCve] = useState(false)
  const [criticalOnly, setCriticalOnly] = useState(false)
  const [sort, setSort] = useState("time_desc")
  const [loading, setLoading] = useState(true)
  const [scraping, setScraping] = useState(false)

  const loadArticles = useCallback(async () => {
    setLoading(true)
    try {
      const params: Record<string, string | number> = { page }
      if (search) params.q = search
      if (severity) params.severity = severity
      if (source) params.source = source
      if (timeRange) params.time_range = timeRange
      if (hasCve) params.has_cve = "true"
      if (sort) params.sort = sort
      const data = await fetchArticles(params)
      setArticles(data.articles)
      setTotal(data.total)
      setPages(data.pages)
    } catch {
      setArticles([])
    } finally {
      setLoading(false)
    }
  }, [page, search, severity, source, timeRange, hasCve, sort])

  useEffect(() => { setPage(1) }, [search, severity, source, timeRange, hasCve, sort])
  useEffect(() => { loadArticles() }, [loadArticles])

  const handleScrape = async () => {
    setScraping(true)
    try {
      await triggerScrape()
      setTimeout(() => { loadArticles(); setScraping(false) }, 5000)
    } catch { setScraping(false) }
  }

  const mono: React.CSSProperties = { fontFamily: 'var(--font-fira-code), monospace' }
  const card: React.CSSProperties = { backgroundColor: '#151617', border: '1px solid #303236', borderRadius: '4px' }

  return (
    <div className="min-h-[calc(100vh-56px)] flex flex-col" style={{ backgroundColor: '#000000', color: '#ffffff' }}>
      <main className="flex-1 overflow-hidden flex flex-col items-center">
        {/* ─── Feed Area ─── */}
        <div className="flex-1 flex flex-col w-full max-w-[1200px] min-w-0 border-x" style={{ borderColor: '#303236' }}>

          {/* Filter */}
          <div className="p-4 sticky top-14 z-20" style={{ borderBottom: '1px solid #303236', backgroundColor: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(12px)' }}>
            <FilterBar
              search={search} severity={severity} source={source} timeRange={timeRange}
              hasCve={hasCve} criticalOnly={criticalOnly}
              sort={sort} onSort={setSort} sortOptions={[
                { value: 'time_desc', label: 'NEWEST FIRST' },
                { value: 'time_asc', label: 'OLDEST FIRST' },
                { value: 'severity_desc', label: 'HIGHEST SEVERITY' }
              ]}
              onSearch={setSearch} onSeverity={setSeverity} onSource={setSource} onTimeRange={setTimeRange}
              onHasCve={setHasCve} onCriticalOnly={setCriticalOnly} onScrape={handleScrape} scraping={scraping}
            />
          </div>

          {/* Column Header */}
          <div className="flex items-center gap-3 px-6 py-2.5 text-[10px] font-semibold uppercase tracking-wide" style={{ borderBottom: '1px solid #303236', backgroundColor: '#0a0a0b', color: '#797d86', ...mono }}>
            <div className="flex items-center gap-3 w-full sm:w-48 shrink-0">
              <span className="w-24 shrink-0">Time</span>
              <span className="w-24 shrink-0">Source</span>
            </div>
            <div className="w-full sm:w-32 shrink-0">Indicators</div>
            <div className="flex-1">Title / Intel</div>
          </div>

          {/* Articles */}
          <div className="flex-1 overflow-y-auto p-4">
            {loading ? (
              <div className="space-y-2">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="h-12 rounded animate-pulse" style={{ backgroundColor: '#151617', border: '1px solid #303236', borderRadius: 4 }} />
                ))}
              </div>
            ) : articles.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-32 gap-4">
                <Activity size={28} style={{ color: '#303236' }} />
                <p className="text-sm tracking-wide" style={{ color: '#797d86', ...mono }}>NO INTEL FOUND</p>
              </div>
            ) : (
              <div style={{ border: '1px solid #303236', borderRadius: 4, overflow: 'hidden' }}>
                {articles.map(a => <ArticleRow key={a.id} article={a} />)}
              </div>
            )}

            {/* Pagination */}
            {pages > 1 && (
              <div className="flex items-center justify-between p-4 mt-4" style={{ ...card }}>
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="px-4 py-2 text-xs font-medium disabled:opacity-30 transition-colors"
                  style={{ ...mono, backgroundColor: '#000', border: '1px solid #303236', borderRadius: 9999, color: '#fff' }}
                >← PREV</button>
                <span className="text-xs tracking-wide" style={{ color: '#797d86', ...mono }}>PAGE {page} / {pages}</span>
                <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages}
                  className="px-4 py-2 text-xs font-medium disabled:opacity-30 transition-colors"
                  style={{ ...mono, backgroundColor: '#000', border: '1px solid #303236', borderRadius: 9999, color: '#fff' }}
                >NEXT →</button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
