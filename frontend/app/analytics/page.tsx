"use client"

import { useState, useEffect } from "react"
import { fetchStats } from "@/lib/api"
import { Stats } from "@/lib/types"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from "recharts"
import { TrendingUp, Shield, Database, Activity } from "lucide-react"

const mono: React.CSSProperties = { fontFamily: 'var(--font-fira-code), monospace' }
const card: React.CSSProperties = { backgroundColor: '#151617', border: '1px solid #303236', borderRadius: 4, padding: 24 }
const SEV_COLORS: Record<string, string> = { critical: '#ff3621', high: '#f97316', medium: '#eab308', info: '#34d59a' }

export default function AnalyticsPage() {
  const [stats, setStats] = useState<Stats | null>(null)

  useEffect(() => {
    fetchStats().then(setStats).catch(() => {})
  }, [])

  if (!stats) {
    return (
      <div className="min-h-[calc(100vh-56px)] flex items-center justify-center" style={{ backgroundColor: '#000' }}>
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-8 w-64 rounded animate-pulse" style={{ backgroundColor: '#151617' }} />
          ))}
        </div>
      </div>
    )
  }

  const sourceData = Object.entries(stats.sources).map(([name, count]) => ({ name: name.toUpperCase(), count })).sort((a, b) => b.count - a.count)
  const sevData = Object.entries(stats.severity_breakdown).map(([name, value]) => ({ name: name.toUpperCase(), value, color: SEV_COLORS[name] || '#34d59a' })).filter(d => d.value > 0)
  const trendData = stats.incident_trends?.slice().reverse() || []

  return (
    <div className="min-h-[calc(100vh-56px)]" style={{ backgroundColor: '#000', color: '#fff' }}>
      <div className="mx-auto max-w-[1200px] px-6 py-12">

        {/* Header */}
        <div className="mb-10">
          <h1 className="font-medium mb-2" style={{ fontSize: 48, letterSpacing: '-1.2px', lineHeight: 1.13 }}>Threat Trends</h1>
          <p style={{ fontSize: 16, color: '#797d86', lineHeight: 1.6 }}>Helicopter view of your threat landscape.</p>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
          {[
            { label: 'Total Articles', value: stats.total_articles, icon: <Database size={16} />, color: '#ffffff' },
            { label: 'Total CVEs', value: stats.total_cves, icon: <Shield size={16} />, color: '#ff3621' },
            { label: 'Sources', value: Object.keys(stats.sources).length, icon: <Activity size={16} />, color: '#34d59a' },
            { label: 'Critical', value: stats.severity_breakdown?.critical ?? 0, icon: <TrendingUp size={16} />, color: '#ff3621' },
          ].map(m => (
            <div key={m.label} style={card} className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <span style={{ color: m.color }}>{m.icon}</span>
                <span className="text-xs uppercase tracking-wide" style={{ color: '#797d86', ...mono }}>{m.label}</span>
              </div>
              <span className="text-3xl font-medium" style={{ color: m.color, ...mono }}>{m.value}</span>
            </div>
          ))}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Incident Trend */}
          <div style={card}>
            <h2 className="text-[11px] font-semibold uppercase tracking-wide mb-6" style={{ color: '#797d86', ...mono }}>
              7-Day Incident Trend
            </h2>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="ng" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#34d59a" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#34d59a" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" tick={{ fill: '#797d86', fontSize: 11 }} axisLine={{ stroke: '#303236' }} tickLine={false} />
                  <YAxis tick={{ fill: '#797d86', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#151617', border: '1px solid #303236', color: '#fff', fontSize: 12, borderRadius: 4 }} />
                  <Area type="monotone" dataKey="count" stroke="#34d59a" strokeWidth={2} fill="url(#ng)" dot={false} activeDot={{ r: 4, fill: '#34d59a' }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Severity Breakdown Pie */}
          <div style={card}>
            <h2 className="text-[11px] font-semibold uppercase tracking-wide mb-6" style={{ color: '#797d86', ...mono }}>
              Severity Distribution
            </h2>
            <div className="h-56 flex items-center">
              <div className="w-1/2 h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={sevData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2} dataKey="value" stroke="none">
                      {sevData.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#151617', border: '1px solid #303236', color: '#fff', fontSize: 12, borderRadius: 4 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="w-1/2 flex flex-col gap-3 pl-4">
                {sevData.map(s => (
                  <div key={s.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: s.color }} />
                      <span className="text-xs" style={{ color: '#94979e', ...mono }}>{s.name}</span>
                    </div>
                    <span className="text-sm font-medium" style={{ color: '#fff', ...mono }}>{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Articles per Source Bar */}
          <div style={card}>
            <h2 className="text-[11px] font-semibold uppercase tracking-wide mb-6" style={{ color: '#797d86', ...mono }}>
              Articles per Source
            </h2>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sourceData} layout="vertical">
                  <XAxis type="number" tick={{ fill: '#797d86', fontSize: 11 }} axisLine={{ stroke: '#303236' }} tickLine={false} />
                  <YAxis type="category" dataKey="name" tick={{ fill: '#94979e', fontSize: 11 }} axisLine={false} tickLine={false} width={130} />
                  <Tooltip contentStyle={{ backgroundColor: '#151617', border: '1px solid #303236', color: '#fff', fontSize: 12, borderRadius: 4 }} cursor={{ fill: 'rgba(52,213,154,0.05)' }} />
                  <Bar dataKey="count" fill="#34d59a" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Targeted Software */}
          <div style={card}>
            <h2 className="text-[11px] font-semibold uppercase tracking-wide mb-6" style={{ color: '#797d86', ...mono }}>
              Top Targeted Software
            </h2>
            <div className="flex flex-col gap-3">
              {stats.top_software && stats.top_software.length > 0 ? (
                stats.top_software.map((sw, i) => {
                  const maxCount = stats.top_software![0].count
                  const pct = maxCount > 0 ? (sw.count / maxCount) * 100 : 0
                  return (
                    <div key={sw.name}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm font-medium" style={{ color: '#fff' }}>{sw.name}</span>
                        <span className="text-xs" style={{ color: '#34d59a', ...mono }}>{sw.count}</span>
                      </div>
                      <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: '#242628' }}>
                        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: '#34d59a' }} />
                      </div>
                    </div>
                  )
                })
              ) : (
                <p className="text-xs py-8 text-center" style={{ color: '#797d86', ...mono }}>NO DATA YET</p>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
