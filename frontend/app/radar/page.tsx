"use client"

import { useEffect, useState, useCallback, useMemo } from "react"
import { fetchArticles, fetchStats, triggerScrape } from "@/lib/api"
import { Article, Stats } from "@/lib/types"
import ArticleRow from "@/components/ArticleRow"
import FilterBar from "@/components/FilterBar"
import { ShieldAlert, Database, Activity, TrendingUp } from "lucide-react"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, AreaChart, Area, XAxis, YAxis } from "recharts"

const SEV_COLORS: Record<string, string> = {
  critical: "#ff3621",
  high: "#f97316",
  medium: "#eab308",
  info: "#34d59a"
}

export default function Dashboard() {
  const [articles, setArticles] = useState<Article[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [total, setTotal] = useState(0)
  const [pages, setPages] = useState(1)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [severity, setSeverity] = useState("")
  const [source, setSource] = useState("")
  const [timeRange, setTimeRange] = useState("")
  const [hasCve, setHasCve] = useState(false)
  const [criticalOnly, setCriticalOnly] = useState(false)
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
      const data = await fetchArticles(params)
      setArticles(data.articles)
      setTotal(data.total)
      setPages(data.pages)
    } catch {
      setArticles([])
    } finally {
      setLoading(false)
    }
  }, [page, search, severity, source, timeRange, hasCve])

  const loadStats = useCallback(async () => {
    try { setStats(await fetchStats()) } catch {}
  }, [])

  useEffect(() => { loadStats() }, [loadStats])
  useEffect(() => { setPage(1) }, [search, severity, source, timeRange, hasCve])
  useEffect(() => { loadArticles() }, [loadArticles])

  const handleScrape = async () => {
    setScraping(true)
    try {
      await triggerScrape()
      setTimeout(() => { loadArticles(); loadStats(); setScraping(false) }, 5000)
    } catch { setScraping(false) }
  }

  const pieData = useMemo(() => {
    if (!stats?.severity_breakdown) return []
    return Object.entries(stats.severity_breakdown)
      .map(([name, value]) => ({ name: name.toUpperCase(), value, color: SEV_COLORS[name] || SEV_COLORS.info }))
      .filter(d => d.value > 0)
  }, [stats])

  const mono: React.CSSProperties = { fontFamily: 'var(--font-fira-code), monospace' }
  const card: React.CSSProperties = { backgroundColor: '#151617', border: '1px solid #303236', borderRadius: '4px' }

  return (
    <div className="min-h-[calc(100vh-56px)] flex flex-col" style={{ backgroundColor: '#000000', color: '#ffffff' }}>
      <main className="flex-1 overflow-hidden flex flex-col lg:flex-row">

        {/* ─── Sidebar ─── */}
        <aside className="w-full lg:w-[280px] shrink-0 overflow-y-auto p-6 flex flex-col gap-6" style={{ borderRight: '1px solid #303236' }}>

          {/* Metrics */}
          <div>
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.15em] mb-4" style={{ color: '#797d86', ...mono }}>Telemetry</h2>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col items-center justify-center p-4" style={card}>
                <span className="text-2xl font-medium" style={{ color: '#ffffff', ...mono }}>{stats?.total_articles ?? '—'}</span>
                <span className="text-[10px] uppercase tracking-widest mt-1" style={{ color: '#797d86' }}>Articles</span>
              </div>
              <div className="flex flex-col items-center justify-center p-4" style={card}>
                <span className="text-2xl font-medium" style={{ color: '#ff3621', ...mono }}>{stats?.total_cves ?? '—'}</span>
                <span className="text-[10px] uppercase tracking-widest mt-1" style={{ color: '#797d86' }}>CVEs</span>
              </div>
            </div>
            <div className="mt-2 flex justify-between items-center p-3" style={card}>
              <div className="flex items-center gap-2">
                <Database size={14} style={{ color: '#797d86' }} />
                <span className="text-xs" style={{ color: '#797d86' }}>Sources</span>
              </div>
              <span className="text-sm font-medium" style={{ ...mono }}>{stats ? Object.keys(stats.sources).length : '—'}</span>
            </div>
            <div className="mt-2 flex justify-between items-center p-3" style={card}>
              <div className="flex items-center gap-2">
                <ShieldAlert size={14} style={{ color: '#ff3621' }} />
                <span className="text-xs" style={{ color: '#ff3621' }}>Critical</span>
              </div>
              <span className="text-sm font-medium" style={{ color: '#ff3621', ...mono }}>{stats?.severity_breakdown?.critical ?? 0}</span>
            </div>
          </div>

          {/* Pie Chart */}
          <div>
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.15em] mb-4" style={{ color: '#797d86', ...mono }}>Severity Split</h2>
            <div className="h-44 p-2" style={card}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={65} paddingAngle={2} dataKey="value" stroke="none">
                    {pieData.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#151617', border: '1px solid #303236', color: '#fff', fontSize: 12, borderRadius: 4 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Trend */}
          <div>
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.15em] mb-4" style={{ color: '#797d86', ...mono }}>7-Day Trend</h2>
            <div className="h-28 p-2" style={card}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats?.incident_trends?.slice().reverse() || []}>
                  <defs>
                    <linearGradient id="neonG" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#34d59a" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#34d59a" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" hide />
                  <YAxis hide />
                  <Tooltip contentStyle={{ backgroundColor: '#151617', border: '1px solid #303236', color: '#34d59a', fontSize: 11, borderRadius: 4 }} labelStyle={{ color: '#797d86' }} />
                  <Area type="monotone" dataKey="count" stroke="#34d59a" strokeWidth={2} fill="url(#neonG)" dot={false} activeDot={{ r: 3, fill: '#34d59a' }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Software */}
          <div>
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.15em] mb-4" style={{ color: '#797d86', ...mono }}>Top Targets</h2>
            <div className="p-4 flex flex-wrap gap-2" style={card}>
              {stats?.top_software?.length ? stats.top_software.map(sw => (
                <span key={sw.name} className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded" style={{ ...mono, backgroundColor: '#242628', border: '1px solid #303236', color: '#ffffff' }}>
                  {sw.name.toUpperCase()}
                  <span style={{ color: '#34d59a' }}>{sw.count}</span>
                </span>
              )) : <span className="text-xs" style={{ color: '#797d86', ...mono }}>NO DATA</span>}
            </div>
          </div>
        </aside>

        {/* ─── Feed Area ─── */}
        <div className="flex-1 flex flex-col min-w-0">

          {/* Filter */}
          <div className="p-4 sticky top-14 z-20" style={{ borderBottom: '1px solid #303236', backgroundColor: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(12px)' }}>
            <FilterBar
              search={search} severity={severity} source={source} timeRange={timeRange}
              hasCve={hasCve} criticalOnly={criticalOnly}
              onSearch={setSearch} onSeverity={setSeverity} onSource={setSource} onTimeRange={setTimeRange}
              onHasCve={setHasCve} onCriticalOnly={setCriticalOnly} onScrape={handleScrape} scraping={scraping}
            />
          </div>

          {/* Column Header */}
          <div className="flex items-center gap-3 px-6 py-2.5 text-[10px] font-semibold uppercase tracking-[0.15em]" style={{ borderBottom: '1px solid #303236', backgroundColor: '#0a0a0b', color: '#797d86', ...mono }}>
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
                <p className="text-sm tracking-widest" style={{ color: '#797d86', ...mono }}>NO INTEL FOUND</p>
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
                <span className="text-xs tracking-widest" style={{ color: '#797d86', ...mono }}>PAGE {page} / {pages}</span>
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
