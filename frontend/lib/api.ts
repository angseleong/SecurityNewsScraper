const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

export async function fetchArticles(params: Record<string, string | number>) {
  const qs = new URLSearchParams(Object.entries(params).map(([k, v]) => [k, String(v)])).toString()
  const res = await fetch(`${BASE}/api/articles?${qs}`, { cache: "no-store" })
  if (!res.ok) throw new Error("Failed to fetch articles")
  return res.json()
}

export async function fetchCVEs(params: Record<string, string> = {}) {
  const qs = new URLSearchParams(params).toString()
  const res = await fetch(`${BASE}/api/cves?${qs}`, { cache: "no-store" })
  if (!res.ok) throw new Error("Failed to fetch CVEs")
  return res.json()
}

export async function fetchStats() {
  const res = await fetch(`${BASE}/api/stats`, { cache: "no-store" })
  if (!res.ok) throw new Error("Failed to fetch stats")
  return res.json()
}

export async function triggerScrape() {
  const res = await fetch(`${BASE}/api/scrape`, { method: "POST" })
  if (!res.ok) throw new Error("Failed to trigger scrape")
  return res.json()
}

export async function triggerEnrichment() {
  const res = await fetch(`${BASE}/api/enrich`, { method: "POST" })
  if (!res.ok) throw new Error("Failed to trigger enrichment")
  return res.json()
}

export async function fetchWatchlist(): Promise<{ keywords: { id: number; keyword: string }[] }> {
  const res = await fetch(`${BASE}/api/watchlist`, { cache: "no-store" })
  if (!res.ok) throw new Error("Failed to fetch watchlist")
  return res.json()
}

export async function addWatchlistKeyword(keyword: string): Promise<{ status: string; keyword: { id: number; keyword: string } }> {
  const res = await fetch(`${BASE}/api/watchlist`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ keyword }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || "Failed to add keyword")
  }
  return res.json()
}

export async function deleteWatchlistKeyword(id: number): Promise<{ status: string; id: number }> {
  const res = await fetch(`${BASE}/api/watchlist/${id}`, {
    method: "DELETE",
  })
  if (!res.ok) throw new Error("Failed to delete keyword")
  return res.json()
}

