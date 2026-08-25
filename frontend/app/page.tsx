"use client"

import { useEffect, useState, useCallback, useMemo } from "react"
import { fetchArticles, fetchStats, triggerScrape } from "@/lib/api"
import { Article, Stats } from "@/lib/types"
import ArticleRow from "@/components/ArticleRow"
import FilterBar from "@/components/FilterBar"
import { ShieldAlert, Shield, Activity, Database, Terminal } from "lucide-react"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, LineChart, Line, XAxis, YAxis } from "recharts"

const SEVERITY_COLORS = {
  critical: "#ef4444",
  high: "#f97316",
  medium: "#eab308",
  info: "#3b82f6"
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
    try {
      const data = await fetchStats()
      setStats(data)
    } catch {}
  }, [])

  useEffect(() => { loadStats() }, [loadStats])
  useEffect(() => { setPage(1) }, [search, severity, source, timeRange, hasCve])
  useEffect(() => { loadArticles() }, [loadArticles])

  const handleScrape = async () => {
    setScraping(true)
    try {
      await triggerScrape()
      setTimeout(() => {
        loadArticles()
        loadStats()
        setScraping(false)
      }, 5000)
    } catch {
      setScraping(false)
    }
  }

  const pieData = useMemo(() => {
    if (!stats?.severity_breakdown) return []
    return Object.entries(stats.severity_breakdown).map(([name, value]) => ({
      name: name.toUpperCase(),
      value,
      color: SEVERITY_COLORS[name as keyof typeof SEVERITY_COLORS] || SEVERITY_COLORS.info
    })).filter(d => d.value > 0)
  }, [stats])

  return (
    <div className="min-h-screen bg-black text-gray-100 font-mono flex flex-col">
      {/* Ticker / Top Bar */}
      <header className="border-b border-gray-800 bg-[#0a0a0a] px-4 py-2 flex items-center justify-between z-10 shrink-0">
        <div className="flex items-center gap-2">
          <Terminal size={18} className="text-cyan-500" />
          <h1 className="text-sm font-bold tracking-widest text-gray-200">SEC_NEWS_SCRAPER <span className="text-gray-600">v1.1</span></h1>
        </div>
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            SYSTEM ONLINE
          </div>
        </div>
      </header>

      {/* Main Content Grid */}
      <main className="flex-1 overflow-hidden flex flex-col lg:flex-row">
        
        {/* Left Sidebar (Analytics) */}
        <aside className="w-full lg:w-72 border-r border-gray-800 bg-[#050505] p-4 flex flex-col gap-6 overflow-y-auto">
          
          {/* Key Metrics */}
          <div className="space-y-3">
            <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest border-b border-gray-800 pb-1">Telemetry</h2>
            <div className="grid grid-cols-2 gap-2">
              <div className="glass-panel p-3 rounded-md flex flex-col items-center justify-center">
                <span className="text-cyan-400 text-xl font-bold">{stats?.total_articles ?? 0}</span>
                <span className="text-[10px] text-gray-500 uppercase">Articles</span>
              </div>
              <div className="glass-panel p-3 rounded-md flex flex-col items-center justify-center">
                <span className="text-red-400 text-xl font-bold">{stats?.total_cves ?? 0}</span>
                <span className="text-[10px] text-gray-500 uppercase">CVEs</span>
              </div>
            </div>
            <div className="glass-panel p-3 rounded-md flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Database size={14} className="text-gray-400" />
                <span className="text-xs text-gray-400">Sources</span>
              </div>
              <span className="text-sm font-bold">{stats ? Object.keys(stats.sources).length : 0}</span>
            </div>
            <div className="glass-panel p-3 rounded-md flex justify-between items-center">
              <div className="flex items-center gap-2">
                <ShieldAlert size={14} className="text-red-500" />
                <span className="text-xs text-red-500">Critical</span>
              </div>
              <span className="text-sm font-bold text-red-500">{stats?.severity_breakdown?.critical ?? 0}</span>
            </div>
          </div>

          {/* Severity Chart */}
          <div className="space-y-3">
            <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest border-b border-gray-800 pb-1">Severity Distribution</h2>
            <div className="h-48 glass-panel rounded-md p-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={60}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#000', borderColor: '#333', fontSize: '12px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Incident Trends Chart */}
          <div className="space-y-3">
            <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest border-b border-gray-800 pb-1">7-Day Incident Trend</h2>
            <div className="h-32 glass-panel rounded-md p-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats?.incident_trends?.slice().reverse() || []}>
                  <XAxis dataKey="date" hide />
                  <YAxis hide />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#000', borderColor: '#333', fontSize: '10px' }}
                    itemStyle={{ color: '#06b6d4' }}
                    labelStyle={{ color: '#888' }}
                  />
                  <Line type="monotone" dataKey="count" stroke="#06b6d4" strokeWidth={2} dot={{ r: 2, fill: "#06b6d4" }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Affected Software */}
          <div className="space-y-3">
            <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest border-b border-gray-800 pb-1">Top Targeted Systems</h2>
            <div className="glass-panel rounded-md p-3 flex flex-wrap gap-2">
              {stats?.top_software?.length ? (
                stats.top_software.map((sw, i) => (
                  <div key={sw.name} className="flex items-center gap-1 text-[10px] font-bold bg-cyan-950/30 border border-cyan-900/50 text-cyan-400 px-2 py-1 rounded">
                    <span className="uppercase">{sw.name}</span>
                    <span className="text-cyan-700">|</span>
                    <span className="text-cyan-200">{sw.count}</span>
                  </div>
                ))
              ) : (
                <span className="text-xs text-gray-600">INSUFFICIENT DATA</span>
              )}
            </div>
          </div>

        </aside>

        {/* Right Section (Data Grid) */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#080808]">
          {/* Controls */}
          <div className="p-4 border-b border-gray-800 glass-panel z-10 sticky top-0">
            <FilterBar
              search={search}
              severity={severity}
              source={source}
              timeRange={timeRange}
              hasCve={hasCve}
              criticalOnly={criticalOnly}
              onSearch={setSearch}
              onSeverity={setSeverity}
              onSource={setSource}
              onTimeRange={setTimeRange}
              onHasCve={setHasCve}
              onCriticalOnly={setCriticalOnly}
              onScrape={handleScrape}
              scraping={scraping}
            />
          </div>

          {/* Grid Header */}
          <div className="flex items-center gap-3 px-6 py-2 border-b border-gray-800/50 text-[10px] uppercase tracking-widest text-gray-500 bg-black sticky top-[73px] z-10">
            <div className="flex items-center gap-3 w-full sm:w-48 shrink-0">
              <span className="w-24 shrink-0">Time</span>
              <span className="w-24 shrink-0">Source</span>
            </div>
            <div className="w-full sm:w-32 shrink-0">Indicators</div>
            <div className="flex-1">Title / Intel</div>
          </div>

          {/* Data List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-1">
            {loading ? (
              <div className="space-y-1">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="h-10 glass-panel rounded animate-pulse" />
                ))}
              </div>
            ) : articles.length === 0 ? (
              <div className="text-center py-20 text-gray-600 flex flex-col items-center gap-3">
                <Activity size={32} className="text-gray-800" />
                <p>NO INTEL FOUND FOR QUERY</p>
              </div>
            ) : (
              <div className="glass-panel border border-gray-800/50 rounded-md overflow-hidden">
                {articles.map((a) => <ArticleRow key={a.id} article={a} />)}
              </div>
            )}
            
            {/* Pagination Controls */}
            {pages > 1 && (
              <div className="flex items-center justify-between p-4 mt-4 glass-panel border border-gray-800 rounded-md">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1 bg-gray-900 border border-gray-700 hover:border-gray-500 disabled:opacity-30 rounded text-xs transition-colors"
                >
                  &lt; PREV
                </button>
                <span className="text-xs text-gray-500">PAGE {page} OF {pages}</span>
                <button
                  onClick={() => setPage((p) => Math.min(pages, p + 1))}
                  disabled={page === pages}
                  className="px-3 py-1 bg-gray-900 border border-gray-700 hover:border-cyan-500 hover:text-cyan-400 disabled:opacity-30 rounded text-xs transition-colors"
                >
                  NEXT &gt;
                </button>
              </div>
            )}
          </div>
        </div>

      </main>
    </div>
  )
}
