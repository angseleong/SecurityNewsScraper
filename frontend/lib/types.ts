export interface Article {
  id: number
  source: string
  title: string
  url: string
  published_at: string | null
  summary: string | null
  severity: "critical" | "high" | "medium" | "info" | null
  has_cve: boolean
  notified: boolean
  scraped_at: string
  ai_summary: string | null
  ai_mitigation: string | null
  ai_attack_vector: string | null
  ai_shodan_dork: string | null
}

export interface CVE {
  id: number
  cve_id: string
  article_id: number
  severity_hint: string | null
  affected_software: string | null
  cvss_score: number | null
}

export interface Stats {
  total_articles: number
  total_cves: number
  sources: Record<string, number>
  severity_breakdown: Record<string, number>
  incident_trends?: { date: string; count: number }[]
  top_software?: { name: string; count: number }[]
  last_scrape: string | null
}

export interface ArticlesResponse {
  articles: Article[]
  total: number
  page: number
  per_page: number
  pages: number
}
