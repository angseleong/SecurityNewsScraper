"use client";

import Link from "next/link";
import { BrainCircuit, ShieldAlert, Bell } from "lucide-react";
import { useEffect, useRef } from "react";

export default function LandingPage() {
  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        // Adjust for any scroll or offset if needed, but clientX/Y works well for fixed/viewport
        const rect = containerRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        containerRef.current.style.setProperty('--mouse-x', `${x}px`);
        containerRef.current.style.setProperty('--mouse-y', `${y}px`);
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <main 
      ref={containerRef}
      className="relative min-h-[calc(100vh-56px)] w-full overflow-hidden" 
      style={{ backgroundColor: '#000000' }}
    >

      {/* Dynamic Modern Background */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden select-none">
        {/* Subtle grid pattern - Revealed by mouse */}
        <div 
          className="absolute inset-0 opacity-10" 
          style={{ 
            backgroundImage: `linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)`,
            backgroundSize: '32px 32px',
            maskImage: 'radial-gradient(400px circle at var(--mouse-x, 50vw) var(--mouse-y, 50vh), black 0%, transparent 100%)',
            WebkitMaskImage: 'radial-gradient(400px circle at var(--mouse-x, 50vw) var(--mouse-y, 50vh), black 0%, transparent 100%)',
          }} 
        />
        {/* Mouse Glow Orb */}
        <div 
          className="absolute w-[800px] h-[800px] rounded-full mix-blend-screen blur-[120px]" 
          style={{ 
            background: 'rgba(52,213,154,0.12)',
            transform: 'translate(calc(var(--mouse-x, 50vw) - 400px), calc(var(--mouse-y, 50vh) - 400px))',
            willChange: 'transform',
          }} 
        />
        {/* Ambient glow 2 (Static background base) */}
        <div 
          className="absolute right-[20%] bottom-[10%] w-[600px] h-[600px] rounded-full mix-blend-screen blur-[120px]" 
          style={{ background: 'rgba(29,78,216,0.06)' }} 
        />
        {/* Vignette to blend everything smoothly */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#000000] via-transparent to-[#000000]" />
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto flex max-w-[1200px] flex-col items-center px-6 pt-32 pb-20 text-center space-y-6">

        {/* Headline */}
        <h1 className="animate-float-up-delay max-w-4xl text-5xl md:text-7xl font-bold tracking-tight text-white">
          Security News Scraper
        </h1>

        {/* Subtitle */}
        <p className="animate-float-up-delay-2 max-w-xl text-lg text-zinc-400 leading-relaxed">
          Aggregates cybersecurity news, extracts CVEs, evaluates exploit probability via EPSS, and summarizes articles.
        </p>

        {/* CTA Buttons */}
        <div className="animate-float-up-delay-2 flex items-center gap-4 pt-4">
          <Link
            href="/radar"
            className="inline-flex items-center justify-center font-medium transition-all duration-200 hover:scale-105 rounded-full px-8 py-3.5 bg-white text-black text-sm"
          >
            View Dashboard
          </Link>
          <a
            href="https://github.com/angseleong/SecurityNewsScraper"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center font-medium transition-all duration-200 hover:scale-105 rounded-full px-6 py-3.5 border border-[#303236] text-white text-sm"
          >
            GitHub
          </a>
        </div>

        {/* Feature Pills */}
        <div className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-3xl">
          <FeatureCard 
            icon={<BrainCircuit size={20} />}
            label="AI Analysis"
            desc="AI-generated summaries, attack vectors, and mitigations for articles."
          />
          <FeatureCard 
            icon={<ShieldAlert size={20} />}
            label="CVE Enrichment"
            desc="Automatic EPSS scoring and CISA KEV lookups."
          />
          <FeatureCard 
            icon={<Bell size={20} />}
            label="Real-time Alerts"
            desc="Instant Telegram notifications for new threats."
          />
        </div>

      </div>
    </main>
  );
}

function FeatureCard({ icon, label, desc }: { icon: React.ReactNode, label: string, desc: string }) {
  return (
    <div
      className="rounded text-left p-6 transition-colors duration-200 bg-[#151617] border border-[#303236]"
    >
      <div className="text-lg mb-3 text-[#34d59a]">{icon}</div>
      <h3 className="text-sm font-semibold mb-1.5 text-white tracking-tight">
        {label}
      </h3>
      <p className="text-xs text-zinc-400 leading-relaxed">
        {desc}
      </p>
    </div>
  );
}
