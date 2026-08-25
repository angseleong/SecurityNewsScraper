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
