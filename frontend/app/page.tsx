import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="relative min-h-[calc(100vh-56px)] w-full overflow-hidden" style={{ backgroundColor: '#000000' }}>

      {/* Background: Abstract vertical lines — data stream aesthetic */}
      <div className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center overflow-hidden select-none">
        {/* Central bright line */}
        <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2" style={{ backgroundColor: '#34d59a', opacity: 0.15, boxShadow: '0 0 40px 4px rgba(52,213,154,0.15)' }} />
        {/* Offset lines */}
        {[80, 160, 260, 380].map((offset, i) => (
          <div key={`l${i}`}>
            <div className="absolute top-0 h-full w-px" style={{ left: `calc(50% - ${offset}px)`, backgroundColor: '#34d59a', opacity: 0.04 + i * 0.01 }} />
            <div className="absolute top-0 h-full w-px" style={{ left: `calc(50% + ${offset}px)`, backgroundColor: '#34d59a', opacity: 0.04 + i * 0.01 }} />
          </div>
        ))}
        {/* Animated scanline */}
        <div className="absolute left-0 w-full h-px animate-scanline" style={{ background: 'linear-gradient(90deg, transparent, rgba(52,213,154,0.15), transparent)' }} />
        {/* Radial glow at center */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(52,213,154,0.06) 0%, transparent 70%)' }} />
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto flex max-w-[1200px] flex-col items-center px-6 pt-32 pb-20 text-center" style={{ gap: '32px' }}>

        {/* Status badge */}
        <div className="animate-float-up flex items-center gap-2 rounded-full px-4 py-1.5" style={{ border: '1px solid #303236', backgroundColor: '#151617' }}>
          <span className="h-2 w-2 rounded-full animate-glow-pulse" style={{ backgroundColor: '#34d59a' }} />
          <span className={`text-xs font-medium tracking-widest uppercase`} style={{ color: '#797d86', fontFamily: 'var(--font-fira-code), monospace', letterSpacing: '0.1em' }}>
            System Online · Monitoring 4 Targets
          </span>
        </div>

        {/* Headline */}
        <h1
          className="animate-float-up-delay max-w-4xl font-medium"
          style={{
            fontSize: 'clamp(40px, 6vw, 80px)',
            lineHeight: 1,
            letterSpacing: '-3.2px',
            color: '#ffffff',
          }}
        >
          Automated Threat Intel.{' '}
          <br />
          <span style={{ color: '#34d59a' }}>Zero Noise.</span>
        </h1>

        {/* Subtitle */}
        <p
          className="animate-float-up-delay-2 max-w-xl"
          style={{
            fontSize: '18px',
            lineHeight: 1.6,
            letterSpacing: '-0.36px',
            color: '#797d86',
          }}
        >
          Monitors global vulnerability disclosures, evaluates exploit probability via EPSS, and delivers AI-analyzed intel before a threat becomes a breach.
        </p>

        {/* CTA Buttons */}
        <div className="animate-float-up-delay-2 flex items-center gap-4 mt-4">
          <Link
            href="/radar"
            className="inline-flex items-center justify-center font-medium transition-all duration-200 hover:scale-105"
            style={{
              backgroundColor: '#ffffff',
              color: '#151617',
              borderRadius: '9999px',
              padding: '14px 32px',
              fontSize: '15px',
              letterSpacing: '-0.4px',
            }}
          >
            Enter Terminal →
          </Link>
          <a
            href="https://github.com/angseleong/SecurityNewsScraper"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center font-medium transition-all duration-200 hover:scale-105"
            style={{
              backgroundColor: 'transparent',
              color: '#ffffff',
              border: '1px solid #303236',
              borderRadius: '9999px',
              padding: '14px 24px',
              fontSize: '15px',
              letterSpacing: '-0.4px',
            }}
          >
            View Source
          </a>
        </div>

        {/* Feature Pills */}
        <div className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-3xl">
          {[
            { icon: '◉', label: 'AI Analysis', desc: 'Gemini-powered TLDR, attack vectors, and mitigation for every article.' },
            { icon: '◈', label: 'CVE Enrichment', desc: 'Automatic EPSS scoring, CISA KEV lookup, and GitHub PoC discovery.' },
            { icon: '◎', label: 'Real-time Alerts', desc: 'Instant Telegram & Discord notifications for critical threats.' },
          ].map((feature) => (
            <div
              key={feature.label}
              className="rounded text-left p-6 transition-colors duration-200"
              style={{
                backgroundColor: '#151617',
                border: '1px solid #303236',
                borderRadius: '4px',
              }}
            >
              <div className="text-lg mb-3" style={{ color: '#34d59a' }}>{feature.icon}</div>
              <h3 className="text-sm font-semibold mb-1.5" style={{ color: '#ffffff', letterSpacing: '-0.3px' }}>
                {feature.label}
              </h3>
              <p className="text-xs leading-relaxed" style={{ color: '#797d86' }}>
                {feature.desc}
              </p>
            </div>
          ))}
        </div>

      </div>
    </main>
  );
}
