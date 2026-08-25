"use client"

import { useState } from "react"
import { Article } from "@/lib/types"
import { formatDistanceToNow } from "date-fns"
import { ExternalLink, ChevronDown, ChevronUp, BrainCircuit, Shield, Crosshair, Search } from "lucide-react"

const SEVERITY_COLORS = {
  critical: "text-red-500 bg-red-950/30 border border-red-900/50",
  high: "text-orange-500 bg-orange-950/30 border border-orange-900/50",
  medium: "text-yellow-500 bg-yellow-950/30 border border-yellow-900/50",
  info: "text-blue-500 bg-blue-950/30 border border-blue-900/50",
}

export default function ArticleRow({ article }: { article: Article }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const sevColor = SEVERITY_COLORS[article.severity ?? "info"] ?? SEVERITY_COLORS.info
  const dateToUse = article.published_at ? new Date(article.published_at) : (article.scraped_at ? new Date(article.scraped_at) : new Date())
  const timeAgo = formatDistanceToNow(dateToUse, { addSuffix: true })

  const hasAiData = article.ai_summary || article.ai_mitigation || article.ai_attack_vector || article.ai_shodan_dork

  return (
    <div className="border-b border-gray-800/30 group">
      <div 
        onClick={() => hasAiData && setIsExpanded(!isExpanded)}
        className={`flex flex-col sm:flex-row items-start sm:items-center gap-4 px-4 py-3 hover:bg-gray-800/40 hover:border-cyan-900/50 transition-all duration-200 text-xs ${hasAiData ? "cursor-pointer" : ""} relative overflow-hidden`}
      >
        {/* Left Accent Bar on Hover */}
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity glow-border" />

        {/* Time & Source */}
        <div className="flex items-center gap-3 w-full sm:w-48 shrink-0">
          <span className="text-gray-500 tabular-nums w-24 shrink-0">{timeAgo}</span>
          <span className="text-gray-400 font-bold uppercase truncate w-24 shrink-0" title={article.source}>
            {article.source}
          </span>
        </div>

        {/* Badges */}
        <div className="flex items-center gap-2 w-full sm:w-32 shrink-0">
          <span className={`px-2 py-0.5 rounded uppercase text-[10px] tracking-widest font-black shadow-sm ${sevColor}`}>
            {article.severity ?? "INFO"}
          </span>
          {article.has_cve && (
            <span className="px-2 py-0.5 rounded uppercase text-[10px] tracking-widest font-black text-cyan-400 bg-cyan-950/40 border border-cyan-800/50 glow-text shadow-[0_0_8px_rgba(0,255,255,0.2)]">
              CVE
            </span>
          )}
        </div>

        {/* Title */}
        <div className="flex-1 min-w-0 pr-4 flex items-center gap-2">
          {hasAiData && (
            <span className="text-cyan-500">
              {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </span>
          )}
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-gray-200 font-medium hover:text-cyan-400 transition-colors truncate block flex-1"
            title={article.title}
          >
            {article.title}
          </a>
        </div>

        {/* Link Icon */}
        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="text-gray-500 hover:text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity hidden sm:block p-1 bg-gray-900 rounded border border-gray-700"
        >
          <ExternalLink size={14} />
        </a>
      </div>

      {/* AI Expandable Drawer */}
      {isExpanded && hasAiData && (
        <div className="bg-[#0a0f14] border-t border-cyan-900/30 p-4 pl-12 sm:pl-56 animate-in slide-in-from-top-2 duration-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* AI Summary */}
            {article.ai_summary && (
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-cyan-500 font-semibold text-xs tracking-wider uppercase mb-1">
                  <BrainCircuit size={12} />
                  <span>TL;DR</span>
                </div>
                <p className="text-gray-300 text-[11px] leading-relaxed">
                  {article.ai_summary}
                </p>
              </div>
            )}

            {/* AI Mitigation */}
            {article.ai_mitigation && (
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-green-500 font-semibold text-xs tracking-wider uppercase mb-1">
                  <Shield size={12} />
                  <span>Mitigation</span>
                </div>
                <p className="text-gray-300 text-[11px] leading-relaxed">
                  {article.ai_mitigation}
                </p>
              </div>
            )}

            {/* AI Attack Vector */}
            {article.ai_attack_vector && (
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-red-500 font-semibold text-xs tracking-wider uppercase mb-1">
                  <Crosshair size={12} />
                  <span>Attack Vector</span>
                </div>
                <p className="text-gray-300 text-[11px] leading-relaxed">
                  {article.ai_attack_vector}
                </p>
              </div>
            )}

            {/* AI Shodan Dork */}
            {article.ai_shodan_dork && (
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-purple-500 font-semibold text-xs tracking-wider uppercase mb-1">
                  <Search size={12} />
                  <span>Shodan Dork</span>
                </div>
                <div className="bg-purple-950/20 border border-purple-900/50 p-2 rounded text-purple-300 font-mono text-[10px]">
                  {article.ai_shodan_dork}
                </div>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  )
}
