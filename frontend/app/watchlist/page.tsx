"use client"

import { useState, useEffect, useCallback } from "react"
import { Eye, Plus, Trash2, AlertTriangle, Loader2, Download, Rss, RefreshCw, Zap } from "lucide-react"
import { fetchWatchlist, addWatchlistKeyword, deleteWatchlistKeyword, triggerEnrichment } from "@/lib/api"

const mono: React.CSSProperties = { fontFamily: 'var(--font-fira-code), monospace' }

interface KeywordItem {
  id: number
  keyword: string
}

export default function WatchlistPage() {
  const [keywords, setKeywords] = useState<KeywordItem[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [enriching, setEnriching] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleEnrich = async () => {
    setEnriching(true)
    try {
      await triggerEnrichment()
      // Optional: show success toast or similar here
    } catch (err: any) {
      console.error(err)
    }
    // We keep showing loading briefly for UX
    setTimeout(() => setEnriching(false), 2000)
  }

  const load = useCallback(async () => {
    try {
      const data = await fetchWatchlist()
      setKeywords(data.keywords || [])
    } catch {
      setKeywords([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const handleAdd = async () => {
    const trimmed = input.trim()
    if (!trimmed) return
    setAdding(true)
    setError(null)
    try {
      const res = await addWatchlistKeyword(trimmed)
      setKeywords(prev => [...prev, res.keyword])
      setInput("")
    } catch (err: any) {
      setError(err.message || "Failed to add keyword")
    } finally {
      setAdding(false)
    }
  }

  const handleRemove = async (id: number) => {
    try {
      await deleteWatchlistKeyword(id)
      setKeywords(prev => prev.filter(k => k.id !== id))
    } catch (err: any) {
      setError(err.message || "Failed to delete keyword")
    }
  }

  return (
    <div className="min-h-[calc(100vh-56px)]" style={{ backgroundColor: '#000', color: '#fff' }}>
      <div className="mx-auto max-w-[1200px] px-6 py-12">

        {/* Header */}
        <div className="mb-10">
          <h1 className="font-medium mb-2" style={{ fontSize: 48, letterSpacing: '-1.2px', lineHeight: 1.13 }}>
            Watchlist
          </h1>
          <p style={{ fontSize: 16, color: '#797d86', lineHeight: 1.6 }}>
            Configure target assets stored in the database. Articles matching these keywords will be flagged as <span style={{ color: '#ff3621', fontWeight: 600 }}>TARGET</span> in the Radar feed and prioritized for alerts.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Add Keywords */}
          <div className="rounded p-6" style={{ backgroundColor: '#151617', border: '1px solid #303236', borderRadius: 4 }}>
            <h2 className="text-[11px] font-semibold uppercase tracking-wide mb-6 flex items-center gap-2" style={{ color: '#797d86', ...mono }}>
              <Plus size={14} style={{ color: '#34d59a' }} /> Add Keyword
            </h2>
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="e.g. Windows Server, Fortinet, nginx..."
                value={input}
                onChange={e => { setInput(e.target.value); setError(null); }}
                onKeyDown={e => e.key === 'Enter' && handleAdd()}
                disabled={adding}
                className="flex-1"
                style={{
                  backgroundColor: '#000',
                  border: '1px solid #303236',
                  borderRadius: 9999,
                  padding: '10px 20px',
                  fontSize: 14,
                  color: '#fff',
                  outline: 'none',
                }}
              />
              <button
                onClick={handleAdd}
                disabled={adding || !input.trim()}
                className="flex items-center gap-2 font-medium transition-all hover:scale-105 cursor-pointer disabled:opacity-40"
                style={{
                  backgroundColor: '#fff',
                  color: '#151617',
                  borderRadius: 9999,
                  padding: '10px 24px',
                  fontSize: 14,
                  border: 'none',
                }}
              >
                {adding ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                Add
              </button>
            </div>
            {error && (
              <p className="mt-3 text-xs" style={{ color: '#ff3621', ...mono }}>
                {error}
              </p>
            )}
            <p className="mt-4 text-xs" style={{ color: '#797d86' }}>
              Keywords are stored in backend DB and matched in real-time against titles, summaries, and AI intel. Case-insensitive.
            </p>
          </div>

          {/* Info */}
          <div className="rounded p-6" style={{ backgroundColor: '#151617', border: '1px solid #303236', borderRadius: 4 }}>
            <h2 className="text-[11px] font-semibold uppercase tracking-wide mb-6 flex items-center gap-2" style={{ color: '#797d86', ...mono }}>
              <AlertTriangle size={14} style={{ color: '#ff3621' }} /> Real-time System
            </h2>
            <div className="space-y-4 text-sm" style={{ color: '#94979e', lineHeight: 1.7 }}>
              <p>Whenever new articles are scraped or viewed, they are evaluated directly against these keywords in the database.</p>
              <p>Matching articles automatically get a <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wide" style={{ ...mono, color: '#ff3621', backgroundColor: 'rgba(255,54,33,0.1)', border: '1px solid rgba(255,54,33,0.3)' }}>TARGET</span> badge in the Radar feed.</p>
              <p>Telegram bot notifications trigger immediately when target keywords are mentioned in any incoming article.</p>
            </div>
          </div>
        </div>

        {/* Current keywords */}
        <div className="mt-8 rounded p-6" style={{ backgroundColor: '#151617', border: '1px solid #303236', borderRadius: 4 }}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-[11px] font-semibold uppercase tracking-wide flex items-center gap-2" style={{ color: '#797d86', ...mono }}>
              <Eye size={14} style={{ color: '#34d59a' }} /> Active Keywords (Database)
              <span className="ml-2 px-2 py-0.5 rounded text-[10px]" style={{ ...mono, backgroundColor: '#242628', color: '#34d59a' }}>
                {keywords.length}
              </span>
            </h2>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 size={24} className="animate-spin text-[#797d86]" />
            </div>
          ) : keywords.length === 0 ? (
            <p className="text-sm py-8 text-center" style={{ color: '#797d86', ...mono }}>
              No keywords configured. Add some above to start monitoring.
            </p>
          ) : (
            <div className="flex flex-wrap gap-3">
              {keywords.map(kw => (
                <div
                  key={kw.id}
                  className="group flex items-center gap-2 px-4 py-2 rounded-full transition-colors"
                  style={{ backgroundColor: '#000', border: '1px solid #303236' }}
                >
                  <span className="text-sm font-medium" style={{ color: '#fff' }}>{kw.keyword}</span>
                  <button
                    onClick={() => handleRemove(kw.id)}
                    title="Delete keyword"
                    className="opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer ml-1"
                    style={{ color: '#ff3621' }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tools Section */}
        <div className="mt-8 rounded p-6" style={{ backgroundColor: '#151617', border: '1px solid #303236', borderRadius: 4 }}>
          <h2 className="text-[11px] font-semibold uppercase tracking-wide mb-6 flex items-center gap-2" style={{ color: '#797d86', ...mono }}>
            <Zap size={14} style={{ color: '#34d59a' }} /> Tools & Enrichment
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Export */}
            <div>
              <h3 className="text-sm font-medium mb-3" style={{ color: '#fff' }}>Export & Reports</h3>
              <p className="text-xs mb-4" style={{ color: '#797d86', lineHeight: 1.6 }}>
                Download a CSV summary of the last 7 days of intelligence, or grab the RSS feed URL to plug into your SIEM or reader.
              </p>
              <div className="flex gap-3">
                <a 
                  href={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/report/weekly.csv`}
                  download
                  className="flex items-center gap-2 font-medium transition-all hover:scale-105"
                  style={{
                    backgroundColor: '#000',
                    color: '#fff',
                    border: '1px solid #303236',
                    borderRadius: 9999,
                    padding: '8px 16px',
                    fontSize: 13,
                  }}
                >
                  <Download size={14} /> Weekly CSV
                </a>
                <button 
                  onClick={() => {
                    const url = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/feed.xml`
                    navigator.clipboard.writeText(url)
                    setCopied(true)
                    setTimeout(() => setCopied(false), 3000)
                  }}
                  className="flex items-center gap-2 font-medium transition-all hover:scale-105"
                  style={{
                    backgroundColor: '#000',
                    color: '#fff',
                    border: '1px solid #303236',
                    borderRadius: 9999,
                    padding: '8px 16px',
                    fontSize: 13,
                  }}
                >
                  <Rss size={14} /> Copy RSS URL
                </button>
              </div>
            </div>

            {/* Enrichment */}
            <div>
              <h3 className="text-sm font-medium mb-3" style={{ color: '#fff' }}>Data Enrichment</h3>
              <p className="text-xs mb-4" style={{ color: '#797d86', lineHeight: 1.6 }}>
                Manually trigger a background job to fetch EPSS scores, CISA KEV status, and GitHub PoC links for CVEs missing them.
              </p>
              <button 
                onClick={handleEnrich}
                disabled={enriching}
                className="flex items-center gap-2 font-medium transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                style={{
                  backgroundColor: '#34d59a',
                  color: '#000',
                  border: 'none',
                  borderRadius: 9999,
                  padding: '8px 16px',
                  fontSize: 13,
                }}
              >
                {enriching ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                {enriching ? "Enriching in Background..." : "Re-enrich CVEs"}
              </button>
            </div>

          </div>
        </div>

      </div>

      {/* Toast Notification */}
      {copied && (
        <div 
          className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 px-4 py-3 rounded-full shadow-lg z-50 animate-in slide-in-from-bottom-4 fade-in duration-300"
          style={{ backgroundColor: '#151617', border: '1px solid #34d59a', color: '#fff' }}
        >
          <div className="flex items-center justify-center w-6 h-6 rounded-full" style={{ backgroundColor: 'rgba(52,213,154,0.1)' }}>
            <Zap size={14} style={{ color: '#34d59a' }} />
          </div>
          <span className="text-[13px] font-medium tracking-wide">RSS Feed URL copied to clipboard!</span>
        </div>
      )}
    </div>
  )
}

