"use client"

import { Article } from "@/lib/types"
import { formatDistanceToNow } from "date-fns"
import { ExternalLink, Shield, ShieldAlert, ShieldX, Info } from "lucide-react"

const SEVERITY_CONFIG = {
  critical: { label: "Critical", color: "bg-red-900 text-red-200 border-red-700", icon: ShieldX },
  high: { label: "High", color: "bg-orange-900 text-orange-200 border-orange-700", icon: ShieldAlert },
  medium: { label: "Medium", color: "bg-yellow-900 text-yellow-200 border-yellow-700", icon: Shield },
  info: { label: "Info", color: "bg-gray-800 text-gray-300 border-gray-600", icon: Info },
}

export default function ArticleCard({ article }: { article: Article }) {
  const sev = SEVERITY_CONFIG[article.severity ?? "info"] ?? SEVERITY_CONFIG.info
  const Icon = sev.icon
  const timeAgo = article.scraped_at
    ? formatDistanceToNow(new Date(article.scraped_at), { addSuffix: true })
    : ""

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 hover:border-gray-600 transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border ${sev.color}`}>
              <Icon size={10} />
              {sev.label}
            </span>
            <span className="text-xs text-gray-500 uppercase tracking-wide">{article.source}</span>
            {article.has_cve && (
              <span className="px-2 py-0.5 rounded text-xs font-medium bg-blue-900 text-blue-200 border border-blue-700">
                CVE
              </span>
            )}
          </div>
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-100 font-medium text-sm hover:text-blue-400 transition-colors line-clamp-2"
          >
            {article.title}
          </a>
          {article.summary && (
            <p className="text-gray-500 text-xs mt-1 line-clamp-2">{article.summary}</p>
          )}
        </div>
        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-600 hover:text-gray-400 flex-shrink-0 mt-1"
        >
          <ExternalLink size={14} />
        </a>
      </div>
      <div className="mt-2 text-xs text-gray-600">{timeAgo}</div>
    </div>
  )
}
