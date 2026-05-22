const CATEGORY_META = {
  Space:       { icon: '🚀', color: '#f59e0b', desc: 'Spaceflight & astronomy' },
  Environment: { icon: '🌿', color: '#4ade80', desc: 'Climate & environment' },
}

export default function NewsFilters({ filters, setFilters, error, selectedCategory, setSelectedCategory }) {
  const categories = ['Space', 'Environment']
  const meta = CATEGORY_META[selectedCategory] || {}
  const isSpace = selectedCategory === 'Space'

  return (
    <section className="mt-3 rounded-xl border border-cyan-500/30 bg-[#031122]/90 p-3">
      {/* Active category badge */}
      <div className="mb-3 flex items-center gap-2">
        <span className="text-lg leading-none">{meta.icon}</span>
        <span
          className="text-xs font-semibold uppercase tracking-widest"
          style={{ color: meta.color }}
        >
          {selectedCategory} News
        </span>
        <span className="text-[10px] text-slate-500">— {meta.desc}</span>
        <span
          className="ml-auto rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
          style={{ background: `${meta.color}22`, color: meta.color, border: `1px solid ${meta.color}55` }}
        >
          Live Feed
        </span>
      </div>

      <div className="grid gap-2 md:grid-cols-4">
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-slate-100 outline-none ring-cyan-300 focus:ring-1"
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>{CATEGORY_META[cat]?.icon} {cat} News</option>
          ))}
        </select>

        <input
          value={filters.search}
          onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
          placeholder="Search title / summary / site…"
          className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-slate-100 outline-none ring-cyan-300 placeholder:text-slate-500 focus:ring-1 md:col-span-2"
        />

        <input
          value={filters.newsSite}
          onChange={(e) => setFilters((prev) => ({ ...prev, newsSite: e.target.value }))}
          placeholder="Filter by source…"
          className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-slate-100 outline-none ring-cyan-300 placeholder:text-slate-500 focus:ring-1"
        />
      </div>

      {/* Space-only filters */}
      {isSpace && (
        <div className="mt-2 flex gap-3">
          <label className="flex items-center gap-2 rounded-md border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.isFeatured}
              onChange={(e) => setFilters((prev) => ({ ...prev, isFeatured: e.target.checked }))}
            />
            ⭐ Featured only
          </label>
          <label className="flex items-center gap-2 rounded-md border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.hasLaunch}
              onChange={(e) => setFilters((prev) => ({ ...prev, hasLaunch: e.target.checked }))}
            />
            🚀 Has launch
          </label>
        </div>
      )}

      {error ? <p className="mt-2 text-xs text-rose-300">⚠️ {error}</p> : null}
    </section>
  )
}

