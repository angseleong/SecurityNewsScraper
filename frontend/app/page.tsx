"use client"

import { useEffect, useState, useCallback } from "react"
import { fetchArticles, fetchStats, triggerScrape } from "@/lib/api"
import { Article, Stats } from "@/lib/types"
import ArticleCard from "@/components/ArticleCard"
import FilterBar from "@/components/FilterBar"
import { Shield, Newspaper, Bug, Database } from "lucide-react"

export default function Dashboard() {
  const [articles, setArticles] = useState<Article[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [total, setTotal] = useState(0)
  const [pages, setPages] = useState(1)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [severity, setSeverity] = useState("")
  const [source, setSource] = useState("")
  const [loading, setLoading] = useState(true)
  const [scraping, setScraping] = useState(false)

  const loadArticles = useCallback(async () => {
    setLoading(true)
    try {
      const params: Record<string, string | number> = { page }
      if (search) params.q = search
      if (severity) params.severity = severity
      if (source) params.source = source
      const data = await fetchArticles(params)
      setArticles(data.articles)
      setTotal(data.total)
      setPages(data.pages)
    } catch {
      setArticles([])
    } finally {
      setLoading(false)
    }
  }, [page, search, severity, source])

  const loadStats = useCallback(async () => {
    try {
      const data = await fetchStats()
      setStats(data)
    } catch {}
  }, [])

  useEffect(() => { loadStats() }, [loadStats])
  useEffect(() => { setPage(1) }, [search, severity, source])
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

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <header className="border-b border-gray-800 bg-gray-900 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <Shield size={22} className="text-blue-400" />
          <h1 className="text-lg font-semibold">SecurityNewsScraper</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Articles", value: stats.total_articles, icon: Newspaper },
              { label: "CVEs Found", value: stats.total_cves, icon: Bug },
              { label: "Critical", value: stats.severity_breakdown?.critical ?? 0, icon: Shield },
              { label: "Sources", value: Object.keys(stats.sources).length, icon: Database },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="bg-gray-900 border border-gray-800 rounded-lg p-4">
                <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                  <Icon size={12} />
                  {label}
                </div>
                <div className="text-2xl font-bold">{value.toLocaleString()}</div>
              </div>
            ))}
          </div>
        )}

        <FilterBar
          search={search}
          severity={severity}
          source={source}
          onSearch={setSearch}
          onSeverity={setSeverity}
          onSource={setSource}
          onScrape={handleScrape}
          scraping={scraping}
        />

        <div className="text-sm text-gray-500">
          {loading ? "Loading..." : `${total.toLocaleString()} articles`}
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-24 bg-gray-900 border border-gray-800 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-16 text-gray-600">No articles found.</div>
        ) : (
          <div className="space-y-3">
            {articles.map((a) => <ArticleCard key={a.id} article={a} />)}
          </div>
        )}

        {pages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 rounded bg-gray-800 hover:bg-gray-700 disabled:opacity-40 text-sm"
            >
              Prev
            </button>
            <span className="text-sm text-gray-500">Page {page} of {pages}</span>
            <button
              onClick={() => setPage((p) => Math.min(pages, p + 1))}
              disabled={page === pages}
              className="px-3 py-1 rounded bg-gray-800 hover:bg-gray-700 disabled:opacity-40 text-sm"
            >
              Next
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
