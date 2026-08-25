"use client"

import { Article } from "@/lib/types"
import { formatDistanceToNow } from "date-fns"
import { ExternalLink } from "lucide-react"

const SEVERITY_COLORS = {
  critical: "text-red-500 bg-red-950/30 border border-red-900/50",
  high: "text-orange-500 bg-orange-950/30 border border-orange-900/50",
  medium: "text-yellow-500 bg-yellow-950/30 border border-yellow-900/50",
  info: "text-blue-500 bg-blue-950/30 border border-blue-900/50",
}

export default function ArticleRow({ article }: { article: Article }) {
  const sevColor = SEVERITY_COLORS[article.severity ?? "info"] ?? SEVERITY_COLORS.info
  const timeAgo = article.scraped_at
    ? formatDistanceToNow(new Date(article.scraped_at), { addSuffix: true })
    : ""

  return (
    <div className="group flex flex-col sm:flex-row items-start sm:items-center gap-4 px-4 py-3 border-b border-gray-800/30 hover:bg-gray-800/40 hover:border-cyan-900/50 transition-all duration-200 text-xs cursor-pointer relative overflow-hidden">
      
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
      <div className="flex-1 min-w-0 pr-4">
        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-200 font-medium hover:text-cyan-400 transition-colors truncate block"
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
        className="text-gray-500 hover:text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity hidden sm:block p-1 bg-gray-900 rounded border border-gray-700"
      >
        <ExternalLink size={14} />
      </a>
    </div>
  )
}
