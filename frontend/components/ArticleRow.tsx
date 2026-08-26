"use client"

import { useState } from "react"
import { Article } from "@/lib/types"
import { formatDistanceToNow } from "date-fns"
import { ExternalLink, ChevronDown, ChevronUp, BrainCircuit, Shield, Crosshair, Search } from "lucide-react"

const SEV: Record<string, { color: string; bg: string; border: string }> = {
  critical: { color: '#ff3621', bg: 'rgba(255,54,33,0.1)', border: 'rgba(255,54,33,0.3)' },
  high:     { color: '#f97316', bg: 'rgba(249,115,22,0.1)', border: 'rgba(249,115,22,0.3)' },
  medium:   { color: '#eab308', bg: 'rgba(234,179,8,0.1)', border: 'rgba(234,179,8,0.3)' },
  info:     { color: '#34d59a', bg: 'rgba(52,213,154,0.1)', border: 'rgba(52,213,154,0.3)' },
}

export default function ArticleRow({ article }: { article: Article }) {
  const [open, setOpen] = useState(false)
  const sev = SEV[article.severity ?? 'info'] ?? SEV.info
  const dateToUse = article.published_at ? new Date(article.published_at) : (article.scraped_at ? new Date(article.scraped_at) : new Date())
  const timeAgo = formatDistanceToNow(dateToUse, { addSuffix: true })
  const hasAi = article.ai_summary || article.ai_mitigation || article.ai_attack_vector || article.ai_shodan_dork

  const mono: React.CSSProperties = { fontFamily: 'var(--font-fira-code), monospace' }

  return (
    <div style={{ borderBottom: '1px solid #242628' }}>
      {/* Row */}
      <div
        onClick={() => hasAi && setOpen(!open)}
        className={`group flex flex-col sm:flex-row items-start sm:items-center gap-4 px-5 py-3 transition-colors duration-150 relative ${hasAi ? 'cursor-pointer' : ''}`}
        style={{ backgroundColor: 'transparent' }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#151617')}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
      >
        {/* Accent bar */}
        <div className="absolute left-0 top-0 bottom-0 w-[2px] opacity-0 group-hover:opacity-100 transition-opacity" style={{ backgroundColor: '#34d59a' }} />

        {/* Time & Source */}
        <div className="flex items-center gap-3 w-full sm:w-48 shrink-0">
          <span className="text-[12px] tabular-nums w-24 shrink-0" style={{ color: '#797d86', ...mono }}>{timeAgo}</span>
          <span className="text-[12px] font-semibold uppercase truncate w-24 shrink-0" style={{ color: '#94979e', ...mono }}>{article.source}</span>
        </div>

        {/* Badges */}
        <div className="flex items-center gap-2 w-full sm:w-36 shrink-0 flex-wrap">
          <span className="px-2 py-0.5 rounded text-[10px] uppercase tracking-widest font-bold" style={{ ...mono, color: sev.color, backgroundColor: sev.bg, border: `1px solid ${sev.border}` }}>
            {article.severity ?? 'INFO'}
          </span>
          {article.watchlist_match && (
            <span className="px-2 py-0.5 rounded text-[10px] uppercase tracking-widest font-bold animate-pulse" style={{ ...mono, color: '#ff3621', backgroundColor: 'rgba(255,54,33,0.1)', border: '1px solid rgba(255,54,33,0.3)' }}>
              TARGET
            </span>
          )}
          {article.has_cve && (
            <span className="px-2 py-0.5 rounded text-[10px] uppercase tracking-widest font-bold" style={{ ...mono, color: '#34d59a', backgroundColor: 'rgba(52,213,154,0.1)', border: '1px solid rgba(52,213,154,0.3)' }}>
              CVE
            </span>
          )}
        </div>

        {/* Title */}
        <div className="flex-1 min-w-0 pr-4 flex flex-col gap-1">
          <div className="flex items-center gap-2">
            {hasAi && <span style={{ color: '#34d59a' }}>{open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}</span>}
            <a href={article.url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
              className="font-medium truncate block flex-1 transition-colors text-[15px] tracking-[-0.3px]"
              style={{ color: '#ffffff' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#34d59a')}
              onMouseLeave={e => (e.currentTarget.style.color = '#ffffff')}
            >
              {article.title}
            </a>
          </div>
          {article.related_articles && article.related_articles.length > 0 && (
            <div className="flex items-center gap-2 mt-0.5 ml-6">
              <span className="text-[11px]" style={{ color: '#797d86' }}>Also:</span>
              {article.related_articles.map(rel => (
                <a key={rel.id} href={rel.url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
                  className="text-[11px] truncate max-w-[100px] transition-colors"
                  style={{ color: '#285d49', ...mono }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#34d59a')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#285d49')}
                >
                  {rel.source}
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Link */}
        <a href={article.url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
          className="hidden sm:flex items-center justify-center p-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ backgroundColor: '#242628', border: '1px solid #303236', color: '#797d86' }}
        >
          <ExternalLink size={14} />
        </a>
      </div>

      {/* ─── AI Drawer ─── */}
      {open && hasAi && (
        <div className="p-5 pl-12 sm:pl-[260px]" style={{ backgroundColor: '#0a0a0b', borderTop: '1px solid #242628' }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {article.ai_summary && (
              <div>
                <div className="flex items-center gap-2 mb-2 text-[11px] font-semibold uppercase tracking-widest" style={{ color: '#34d59a', ...mono }}>
                  <BrainCircuit size={14} /> TL;DR
                </div>
                <p className="text-[13px] leading-relaxed" style={{ color: '#94979e' }}>{article.ai_summary}</p>
              </div>
            )}
            {article.ai_mitigation && (
              <div>
                <div className="flex items-center gap-2 mb-2 text-[11px] font-semibold uppercase tracking-widest" style={{ color: '#ffffff', ...mono }}>
                  <Shield size={14} /> Mitigation
                </div>
                <p className="text-[13px] leading-relaxed" style={{ color: '#94979e' }}>{article.ai_mitigation}</p>
              </div>
            )}
            {article.ai_attack_vector && (
              <div>
                <div className="flex items-center gap-2 mb-2 text-[11px] font-semibold uppercase tracking-widest" style={{ color: '#ff3621', ...mono }}>
                  <Crosshair size={14} /> Attack Vector
                </div>
                <p className="text-[13px] leading-relaxed" style={{ color: '#94979e' }}>{article.ai_attack_vector}</p>
              </div>
            )}
            {article.ai_shodan_dork && (
              <div>
                <div className="flex items-center gap-2 mb-2 text-[11px] font-semibold uppercase tracking-widest" style={{ color: '#a855f7', ...mono }}>
                  <Search size={14} /> Shodan Dork
                </div>
                <div className="p-2.5 rounded text-[12px]" style={{ ...mono, backgroundColor: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.2)', color: '#d8b4fe', borderRadius: 4 }}>
                  {article.ai_shodan_dork}
                </div>
              </div>
            )}

            {/* CVE Enrichment */}
            {article.cves_detail && article.cves_detail.length > 0 && (
              <div className="col-span-1 md:col-span-2 mt-3 pt-4" style={{ borderTop: '1px solid #242628' }}>
                <div className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: '#797d86', ...mono }}>CVE Intelligence</div>
                <div className="flex flex-col gap-2">
                  {article.cves_detail.map(cve => (
                    <div key={cve.cve_id} className="flex flex-wrap items-center gap-3 p-2.5 rounded text-xs" style={{ backgroundColor: '#151617', border: '1px solid #303236', borderRadius: 4 }}>
                      <span className="font-semibold" style={{ color: '#ffffff', ...mono }}>{cve.cve_id}</span>
                      {cve.cisa_kev && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider" style={{ ...mono, backgroundColor: 'rgba(255,54,33,0.15)', color: '#ff3621', border: '1px solid rgba(255,54,33,0.3)' }}>
                          CISA KEV
                        </span>
                      )}
                      {cve.epss_score !== null && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider" style={{
                          ...mono,
                          backgroundColor: cve.epss_score > 0.5 ? 'rgba(255,54,33,0.15)' : cve.epss_score > 0.1 ? 'rgba(249,115,22,0.15)' : '#242628',
                          color: cve.epss_score > 0.5 ? '#ff3621' : cve.epss_score > 0.1 ? '#f97316' : '#94979e',
                          border: `1px solid ${cve.epss_score > 0.5 ? 'rgba(255,54,33,0.3)' : cve.epss_score > 0.1 ? 'rgba(249,115,22,0.3)' : '#303236'}`,
                        }}>
                          EPSS {(cve.epss_score * 100).toFixed(1)}%
                        </span>
                      )}
                      {cve.poc_url && (
                        <a href={cve.poc_url} target="_blank" rel="noopener noreferrer"
                          className="ml-auto flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold tracking-wider transition-colors"
                          style={{ ...mono, backgroundColor: 'rgba(236,72,153,0.1)', color: '#ec4899', border: '1px solid rgba(236,72,153,0.3)' }}
                        >
                          PoC <ExternalLink size={10} />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
