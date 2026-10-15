const TOKENS = [
  { name: 'navy-900', cls: 'bg-navy-900 text-white', hex: '#0A1C38' },
  { name: 'maroon-600', cls: 'bg-maroon-600 text-white', hex: '#9E1B32' },
  { name: 'gold-600', cls: 'bg-gold-600 text-white', hex: '#B7791F' },
  { name: 'cream-100', cls: 'bg-cream-100 text-navy-900 border border-gold-500/40', hex: '#FFF6E5' },
] as const

export default function ThemeTokens() {
  return (
    <section className="section-pad py-14">
      <p className="eyebrow">✦ Tailwind theme</p>
      <h2 className="font-display mt-2 text-3xl font-bold text-navy-900">Brand tokens from your designs</h2>
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {TOKENS.map((s) => (
          <div key={s.name} className={`rounded-2xl p-5 shadow-card ${s.cls}`}>
            <p className="font-display text-lg font-bold">{s.name}</p>
            <p className="text-sm opacity-80">{s.hex}</p>
          </div>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-3">
        <span className="btn-primary">btn-primary</span>
        <span className="btn-gold">btn-gold</span>
        <span className="card-ring px-5 py-3 text-sm font-semibold text-navy-900">card-ring</span>
      </div>
      <p className="mt-4 max-w-2xl text-sm text-ink-500">
        Fonts: <span className="font-display font-bold">Playfair Display</span> (EN display) ·{' '}
        <span style={{ fontFamily: 'var(--font-gotu)' }}>Gotu</span> (HI display) ·{' '}
        <span style={{ fontFamily: 'var(--font-teko)' }}>Teko</span> (HI eyebrows) ·{' '}
        <span className="font-semibold">Mukta</span> (body, Devanagari-safe). Toggle EN / हिन्दी in the header —
        every string renders from <code>src/i18n/locales/*.json</code> via react-i18next.
      </p>
    </section>
  )
}
