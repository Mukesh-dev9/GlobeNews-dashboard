import { useEffect, useMemo, useRef, useState } from 'react'
import Globe from 'react-globe.gl'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { ArrowDown, BrainCircuit, Globe2, MessageCircle, Newspaper, Radar, X } from 'lucide-react'

const NEWS_IMAGE_FALLBACK = 'https://images.unsplash.com/photo-1446776877081-d282a0f896e2'
const SNAPI_BASE = 'https://api.spaceflightnewsapi.net/v4'
const NEWS_SITE_LOCATIONS = {
  SpaceNews: { city: 'Washington DC', lat: 38.9072, lng: -77.0369 },
  NASA: { city: 'Houston', lat: 29.7604, lng: -95.3698 },
  'ESA': { city: 'Paris', lat: 48.8566, lng: 2.3522 },
  'Teslarati': { city: 'Hawthorne', lat: 33.9164, lng: -118.3526 },
  'Ars Technica': { city: 'New York', lat: 40.7128, lng: -74.006 },
  'NASASpaceflight': { city: 'Boca Chica', lat: 25.9971, lng: -97.1566 },
}
const MARKER_COLORS = ['#22d3ee', '#f472b6', '#a78bfa', '#34d399', '#f59e0b', '#60a5fa']

const fallbackNews = [
  {
    id: 'article-fallback-1',
    title: 'Global energy transition reaches new investment high',
    summary:
      'Emerging markets and large economies are accelerating solar, storage, and grid modernization in Q2.',
    image_url: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e',
    news_site: 'World Briefing',
    url: '#',
    published_at: new Date().toISOString(),
    location: 'Global Desk',
  },
  {
    id: 'article-fallback-2',
    title: 'International health agencies coordinate vaccine logistics',
    summary:
      'Shared analytics models are helping optimize supply routes and improve rural delivery outcomes.',
    image_url: 'https://images.unsplash.com/photo-1584515933487-779824d29309',
    news_site: 'Health Wire',
    url: '#',
    published_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    location: 'Global Desk',
  },
  {
    id: 'article-fallback-3',
    title: 'Maritime trade data signals stronger cross-region demand',
    summary:
      'Shipping corridors across Asia, Europe, and Africa are showing steady recovery in high-value goods.',
    image_url: 'https://images.unsplash.com/photo-1529074963764-98f45c47344b',
    news_site: 'Economic Watch',
    url: '#',
    published_at: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
    location: 'Global Desk',
  },
]

const fallbackDemographics = [
  { region: 'Asia', population: 59, countries: 48 },
  { region: 'Africa', population: 18, countries: 54 },
  { region: 'Europe', population: 9, countries: 44 },
  { region: 'Americas', population: 13, countries: 35 },
  { region: 'Oceania', population: 1, countries: 14 },
]

const sentimentTimeline = [
  { time: '00:00', positive: 55, neutral: 28, risk: 17 },
  { time: '04:00', positive: 58, neutral: 25, risk: 17 },
  { time: '08:00', positive: 61, neutral: 24, risk: 15 },
  { time: '12:00', positive: 57, neutral: 27, risk: 16 },
  { time: '16:00', positive: 60, neutral: 24, risk: 16 },
  { time: '20:00', positive: 63, neutral: 22, risk: 15 },
]

const hotspots = [
  { lat: 37.7749, lng: -122.4194, size: 0.35, city: 'San Francisco' },
  { lat: 48.8566, lng: 2.3522, size: 0.32, city: 'Paris' },
  { lat: 19.076, lng: 72.8777, size: 0.4, city: 'Mumbai' },
  { lat: -33.8688, lng: 151.2093, size: 0.28, city: 'Sydney' },
  { lat: -1.2921, lng: 36.8219, size: 0.25, city: 'Nairobi' },
]

function App() {
  const [news, setNews] = useState(fallbackNews)
  const [rawNews, setRawNews] = useState(fallbackNews)
  const [selectedNews, setSelectedNews] = useState(null)
  const [newsDetails, setNewsDetails] = useState({})
  const [detailLoading, setDetailLoading] = useState(false)
  const [populationDistribution, setPopulationDistribution] = useState(fallbackDemographics)
  const [kpis, setKpis] = useState({
    score: 92,
    zones: 143,
    latency: '0.8s',
    sourceCount: 4,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [lastUpdated, setLastUpdated] = useState(null)
  const [refreshTick, setRefreshTick] = useState(0)
  const [articleLimit, setArticleLimit] = useState(12)
  const [filters, setFilters] = useState({
    search: '',
    newsSite: '',
    isFeatured: false,
    hasLaunch: false,
  })
  const [chatMessages, setChatMessages] = useState([
    {
      role: 'assistant',
      content:
        'Ask me anything. I use free public web search (DuckDuckGo + Wikipedia) to generate answers.',
    },
  ])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const [chatOpen, setChatOpen] = useState(false)
  const dashboardRef = useRef(null)
  const globeRef = useRef(null)
  const chatScrollRef = useRef(null)

  useEffect(() => {
    const fetchDashboardData = async () => {
      const start = performance.now()

      try {
        setError('')
        const publishedAtGte = new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString()
        const articleParams = new URLSearchParams({
          limit: String(articleLimit),
          ordering: '-published_at',
          published_at_gte: publishedAtGte,
          summary_contains_one: filters.search || 'launch,mission,space,rocket,satellite',
        })
        if (filters.newsSite) articleParams.set('news_site', filters.newsSite)
        if (filters.isFeatured) articleParams.set('is_featured', 'true')
        if (filters.hasLaunch) articleParams.set('has_launch', 'true')

        const [articlesResult, usgsResult, countriesResult] = await Promise.allSettled([
          fetch(`${SNAPI_BASE}/articles/?${articleParams.toString()}`).then((res) => res.json()),
          fetch('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_hour.geojson').then((res) => res.json()),
          fetch('https://restcountries.com/v3.1/all?fields=region,population').then((res) => res.json()),
        ])

        const articleNews =
          articlesResult.status === 'fulfilled'
            ? (articlesResult.value.results ?? []).map((item) => ({
                id: `article-${item.id}`,
                title: item.title || 'Untitled article',
                summary:
                  item.summary ||
                  `Published by ${item.news_site || 'Spaceflight News'} with live updates from SNAPI.`,
                image_url: item.image_url || NEWS_IMAGE_FALLBACK,
                news_site: item.news_site || 'Spaceflight News API',
                published_at: item.published_at || new Date().toISOString(),
                location: NEWS_SITE_LOCATIONS[item.news_site]?.city || 'Global Desk',
              }))
            : []

        const mergedNews = [...articleNews]
          .sort((a, b) => new Date(b.published_at) - new Date(a.published_at))
          .slice(0, articleLimit)

        const effectiveNews = mergedNews.length ? mergedNews : fallbackNews
        setRawNews(effectiveNews)
        setNews(effectiveNews)

        const liveZones =
          usgsResult.status === 'fulfilled' ? usgsResult.value.features?.length ?? 0 : fallbackDemographics.length * 20

        const regionBuckets = {}
        if (countriesResult.status === 'fulfilled' && Array.isArray(countriesResult.value)) {
          for (const country of countriesResult.value) {
            if (!country.region || !country.population) continue
            if (!regionBuckets[country.region]) {
              regionBuckets[country.region] = { region: country.region, populationRaw: 0, countries: 0 }
            }
            regionBuckets[country.region].populationRaw += country.population
            regionBuckets[country.region].countries += 1
          }

          const totalPopulation = Object.values(regionBuckets).reduce((sum, region) => sum + region.populationRaw, 0)
          const normalized = Object.values(regionBuckets)
            .map((region) => ({
              region: region.region,
              population: Math.round((region.populationRaw / totalPopulation) * 100),
              countries: region.countries,
            }))
            .sort((a, b) => b.population - a.population)

          if (normalized.length) setPopulationDistribution(normalized)
        }

        const freshnessBoost = Math.min(20, mergedNews.length * 2)
        const headlineScore = Math.min(99, Math.max(60, 55 + freshnessBoost + Math.min(liveZones, 24)))
        const latency = `${((performance.now() - start) / 1000).toFixed(2)}s`

        setKpis({
          score: headlineScore,
          zones: liveZones,
          latency,
          sourceCount:
            (articleNews.length > 0 ? 1 : 0) +
            (usgsResult.status === 'fulfilled' ? 1 : 0) +
            (countriesResult.status === 'fulfilled' ? 1 : 0),
        })
        setLastUpdated(new Date())
      } catch {
        setError('Unable to sync live APIs. Showing fallback content.')
        setRawNews(fallbackNews)
        setNews(fallbackNews)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
    const interval = setInterval(fetchDashboardData, 60000)
    return () => clearInterval(interval)
  }, [articleLimit, filters, refreshTick])

  useEffect(() => {
    const keyword = filters.search.trim().toLowerCase()
    if (!keyword) {
      setNews(rawNews)
      return
    }
    setNews(
      rawNews.filter(
        (item) =>
          item.title.toLowerCase().includes(keyword) ||
          item.summary.toLowerCase().includes(keyword) ||
          item.news_site.toLowerCase().includes(keyword),
      ),
    )
  }, [filters.search, rawNews])

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight
    }
  }, [chatMessages, chatLoading, chatOpen])

  const aiSummary = useMemo(() => {
    const topSource = news[0]?.news_site ?? 'Global Intelligence Feed'
    return `AI analyzer detects steady positive momentum around infrastructure, healthcare, and cross-border trade. ${topSource} currently leads story velocity with the strongest engagement curve in the last cycle.`
  }, [news])

  const goToDashboard = () => {
    dashboardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const triggerRefresh = () => {
    setLoading(true)
    setRefreshTick((prev) => prev + 1)
  }

  const newsLegend = useMemo(
    () =>
      news.slice(0, 6).map((item, index) => ({
        id: item.id,
        title: item.title,
        location: item.location || 'Global Desk',
        color: MARKER_COLORS[index % MARKER_COLORS.length],
        newsSite: item.news_site,
      })),
    [news],
  )

  const liveHotspots = useMemo(() => {
    const sourcePoints = newsLegend
      .map((item) => {
        const source = news.find((newsItem) => newsItem.id === item.id)
        if (!source) return null
        const loc = NEWS_SITE_LOCATIONS[source.news_site]
        if (!loc) return null
        return {
          lat: loc.lat,
          lng: loc.lng,
          city: loc.city,
          size: 0.24,
          color: item.color,
          title: source.title,
          location: source.location,
        }
      })
      .filter(Boolean)

    const baselinePoints = hotspots.map((point) => ({
      ...point,
      color: '#334155',
      title: point.city,
      location: point.city,
    }))

    return [...baselinePoints, ...sourcePoints].slice(0, 20)
  }, [news, newsLegend])

  const openNewsDetails = async (item) => {
    setSelectedNews(item)
    if (newsDetails[item.id] || item.id.includes('fallback')) return

    const [, rawId] = item.id.split('-')
    if (!rawId) return

    const endpoint = `${SNAPI_BASE}/articles/${rawId}/`

    try {
      setDetailLoading(true)
      const response = await fetch(endpoint)
      if (!response.ok) throw new Error('Detail fetch failed')
      const data = await response.json()
      setNewsDetails((prev) => ({
        ...prev,
        [item.id]: {
          summary: data.summary || item.summary,
          newsSite: data.news_site || item.news_site,
          publishedAt: data.published_at || item.published_at,
          title: data.title || item.title,
        },
      }))
    } catch {
      setNewsDetails((prev) => ({
        ...prev,
        [item.id]: {
          summary: item.summary,
          newsSite: item.news_site,
          publishedAt: item.published_at,
          title: item.title,
        },
      }))
    } finally {
      setDetailLoading(false)
    }
  }

  const closeModal = () => {
    setSelectedNews(null)
  }

  const askWebAssistant = async () => {
    const query = chatInput.trim()
    if (!query || chatLoading) return

    setChatMessages((prev) => [...prev, { role: 'user', content: query }].slice(-20))
    setChatInput('')
    setChatLoading(true)

    try {
      const encoded = encodeURIComponent(query)
      const [ddgRes, wikiSearchRes] = await Promise.allSettled([
        fetch(`https://api.duckduckgo.com/?q=${encoded}&format=json&no_html=1&no_redirect=1`).then((r) => r.json()),
        fetch(
          `https://en.wikipedia.org/w/api.php?action=opensearch&search=${encoded}&limit=1&namespace=0&format=json&origin=*`,
        ).then((r) => r.json()),
      ])

      let answer = ''
      const sources = []

      if (ddgRes.status === 'fulfilled') {
        const ddg = ddgRes.value
        if (ddg.AbstractText) {
          answer += `${ddg.AbstractText}\n\n`
        }
        if (ddg.AbstractURL) {
          sources.push(ddg.AbstractURL)
        }
      }

      if (wikiSearchRes.status === 'fulfilled' && Array.isArray(wikiSearchRes.value) && wikiSearchRes.value[1]?.[0]) {
        const wikiTitle = wikiSearchRes.value[1][0]
        const wikiSummaryRes = await fetch(
          `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(wikiTitle)}`,
        ).then((r) => r.json())
        if (wikiSummaryRes.extract) {
          answer += `${wikiSummaryRes.extract}\n\n`
        }
        if (wikiSummaryRes.content_urls?.desktop?.page) {
          sources.push(wikiSummaryRes.content_urls.desktop.page)
        }
      }

      const finalAnswer =
        answer.trim() ||
        'I could not find a strong direct summary from the public web APIs right now. Please try a more specific query.'

      setChatMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `${finalAnswer}${sources.length ? `\nSources: ${sources.join(' | ')}` : ''}`,
        },
      ].slice(-20))
    } catch {
      setChatMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Web assistant is temporarily unavailable. Please try again in a moment.',
        },
      ].slice(-20))
    } finally {
      setChatLoading(false)
    }
  }

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-4 py-5 md:px-8">
      <section
        ref={globeRef}
        className="relative overflow-hidden rounded-3xl border border-cyan-400/25 bg-[#020817]/90 p-5 shadow-[0_0_80px_rgba(6,182,212,0.12)]"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_10%,rgba(34,211,238,0.15),transparent_38%),radial-gradient(circle_at_10%_90%,rgba(59,130,246,0.12),transparent_40%)]" />
        <div className="relative z-10 text-center">
          <p className="mb-2 inline-flex items-center gap-2 rounded-full border border-cyan-400/40 bg-cyan-500/10 px-3 py-1 text-[10px] font-semibold tracking-[0.24em] text-cyan-200">
            <Globe2 size={12} /> AI POWERED GLOBAL NEWS ANALYZER
          </p>
          <h1 className="text-2xl font-semibold tracking-wide text-cyan-100 md:text-4xl">
            GlobeNews Command Grid
          </h1>
          <p className="mt-2 text-xs tracking-[0.14em] text-cyan-300/80 md:text-sm">
            Spaceflight News API v4 + Demographic + Real-Time Metrics
          </p>
          <motion.div
            animate={{ y: [0, -6, 0], rotate: [0, 1.5, 0, -1.5, 0] }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
            className="mx-auto mt-3 h-[270px] w-full max-w-[560px] overflow-hidden rounded-2xl border border-cyan-400/25 bg-slate-950/70 md:h-[320px]"
          >
            <Globe
              globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
              bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
              backgroundColor="rgba(0,0,0,0)"
              pointsData={liveHotspots}
              pointLat="lat"
              pointLng="lng"
              pointColor="color"
              pointLabel={(d) => `${d.title} | ${d.location}`}
              pointAltitude="size"
              pointRadius={0.35}
              ringsData={liveHotspots}
              ringLat="lat"
              ringLng="lng"
              ringColor={(d) => [d.color, 'rgba(0,0,0,0)']}
              ringMaxRadius={3.5}
              ringPropagationSpeed={1.4}
              ringRepeatPeriod={900}
              width={560}
              height={320}
            />
          </motion.div>
          <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-[10px] uppercase tracking-[0.18em] text-slate-400">
            <span className="rounded-full border border-slate-700 bg-slate-900/70 px-3 py-1">Latency {kpis.latency}</span>
            <span className="rounded-full border border-slate-700 bg-slate-900/70 px-3 py-1">Zones {kpis.zones}</span>
            <span className="rounded-full border border-slate-700 bg-slate-900/70 px-3 py-1">Sources {kpis.sourceCount}</span>
            <button
              type="button"
              onClick={goToDashboard}
              className="inline-flex items-center gap-1 rounded-full border border-cyan-400/40 bg-cyan-500/10 px-3 py-1 text-cyan-200 transition hover:bg-cyan-500/20"
            >
              Dashboard <ArrowDown size={12} />
            </button>
            <button
              type="button"
              onClick={triggerRefresh}
              className="inline-flex items-center gap-1 rounded-full border border-emerald-400/40 bg-emerald-500/10 px-3 py-1 text-emerald-200 transition hover:bg-emerald-500/20"
            >
              Refresh Live
            </button>
          </div>
          <div className="mt-2 text-[10px] uppercase tracking-[0.14em] text-slate-500">
            {lastUpdated ? `Last updated ${lastUpdated.toLocaleTimeString()}` : 'Awaiting first sync'}
          </div>
          <div className="mx-auto mt-3 grid max-w-3xl gap-2 text-left md:grid-cols-2">
            {newsLegend.map((item) => (
              <div key={item.id} className="flex items-center gap-2 rounded-md border border-slate-800 bg-slate-900/70 px-2 py-1">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <p className="text-[10px] uppercase tracking-[0.12em] text-slate-300">
                  {item.location} - {item.title}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section ref={dashboardRef} className="mt-4 grid gap-3 md:grid-cols-3">
        <article className="rounded-xl border border-cyan-500/30 bg-[#031122]/90 p-3">
          <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">AI-Powered News Analyzer</p>
          <h2 className="mt-1 text-xl font-semibold text-cyan-200">{kpis.score}/100</h2>
          <div className="mt-2 h-24">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sentimentTimeline}>
                <defs>
                  <linearGradient id="miniPositive" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.85} />
                    <stop offset="95%" stopColor="#22d3ee" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="positive" stroke="#22d3ee" strokeWidth={2} fill="url(#miniPositive)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="rounded-xl border border-cyan-500/30 bg-[#031122]/90 p-3 md:col-span-1">
          <header className="mb-2 flex items-center justify-between">
            <h3 className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">
              <Newspaper size={14} /> Live News Feed
            </h3>
            <span className="text-[10px] uppercase tracking-[0.16em] text-slate-500">
              {loading ? 'Syncing' : 'Live'}
            </span>
          </header>
          <div className="space-y-1">
            {news.slice(0, 3).map((item) => (
              <button
                type="button"
                key={item.id}
                onClick={() => openNewsDetails(item)}
                className="w-full rounded-md border border-slate-700/70 bg-slate-900/80 px-2 py-1.5 text-left transition hover:border-cyan-400/50"
              >
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-cyan-200">
                  {item.title}
                </p>
                <p className="mt-1 text-[10px] uppercase tracking-[0.15em] text-slate-400">
                  {new Date(item.published_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
                <p className="mt-1 text-[10px] uppercase tracking-[0.15em] text-fuchsia-300">{item.location}</p>
              </button>
            ))}
          </div>
        </article>

        <article className="rounded-xl border border-cyan-500/30 bg-[#031122]/90 p-3">
          <h3 className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Summary Briefing</h3>
          <p className="mt-2 text-sm leading-6 text-cyan-100">{aiSummary}</p>
        </article>
      </section>

      <section className="mt-3 rounded-xl border border-cyan-500/30 bg-[#031122]/90 p-3">
        <div className="grid gap-2 md:grid-cols-4">
          <input
            value={filters.search}
            onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
            placeholder="Search title/summary/site..."
            className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-slate-100 outline-none ring-cyan-300 placeholder:text-slate-500 focus:ring-1"
          />
          <input
            value={filters.newsSite}
            onChange={(e) => setFilters((prev) => ({ ...prev, newsSite: e.target.value }))}
            placeholder="Filter news site e.g. SpaceNews"
            className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-slate-100 outline-none ring-cyan-300 placeholder:text-slate-500 focus:ring-1"
          />
          <label className="flex items-center gap-2 rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-slate-300">
            <input
              type="checkbox"
              checked={filters.isFeatured}
              onChange={(e) => setFilters((prev) => ({ ...prev, isFeatured: e.target.checked }))}
            />
            Featured only
          </label>
          <label className="flex items-center gap-2 rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-slate-300">
            <input
              type="checkbox"
              checked={filters.hasLaunch}
              onChange={(e) => setFilters((prev) => ({ ...prev, hasLaunch: e.target.checked }))}
            />
            Has launch only
          </label>
        </div>
        {error ? <p className="mt-2 text-xs text-rose-300">{error}</p> : null}
      </section>

      <section className="mt-3 grid gap-3 md:grid-cols-3">
        <article className="rounded-xl border border-cyan-500/30 bg-[#031122]/90 p-3">
          <h3 className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">
            <BrainCircuit size={14} /> Demographic Data
          </h3>
          <div className="mt-2 h-28">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={populationDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="region" stroke="#64748b" fontSize={10} />
                <YAxis stroke="#64748b" fontSize={10} />
                <Bar dataKey="population" fill="#22d3ee" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="rounded-xl border border-cyan-500/30 bg-[#031122]/90 p-3">
          <h3 className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">
            <Radar size={14} /> Demographic Visualizer
          </h3>
          <div className="mt-3 flex items-center gap-5">
            <div className="relative h-16 w-16 rounded-full border-4 border-cyan-300/90">
              <span className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-cyan-200">
                20%
              </span>
            </div>
            <div className="relative h-16 w-16 rounded-full border-4 border-fuchsia-400/90">
              <span className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-fuchsia-200">
                39%
              </span>
            </div>
          </div>
          <p className="mt-3 text-xs uppercase tracking-[0.16em] text-slate-400">GDP growth pulse by region</p>
        </article>

        <article className="rounded-xl border border-cyan-500/30 bg-[#031122]/90 p-3">
          <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">Real-Time Global Metrics</h3>
          <div className="mt-2 h-28">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sentimentTimeline}>
                <defs>
                  <linearGradient id="miniRisk" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" stroke="#64748b" fontSize={10} />
                <YAxis stroke="#64748b" fontSize={10} />
                <Area type="monotone" dataKey="risk" stroke="#a855f7" fill="url(#miniRisk)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </article>
      </section>

      <section className="mt-3 flex flex-wrap justify-center gap-2">
        {['Economy', 'Politics', 'Technology', 'Space', 'Environment'].map((tag) => (
          <span
            key={tag}
            className="rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-cyan-200"
          >
            {tag}
          </span>
        ))}
      </section>

      <section className="mt-4 rounded-xl border border-cyan-500/30 bg-[#031122]/90 p-3">
        <header className="mb-3 flex items-center justify-between">
          <h3 className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">
            <Newspaper size={14} /> Every Article Live Modules
          </h3>
          <span className="text-[10px] uppercase tracking-[0.16em] text-slate-500">{news.length} modules</span>
        </header>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {news.map((item) => (
            <article
              key={item.id}
              className="overflow-hidden rounded-lg border border-slate-700/70 bg-slate-900/80"
            >
              <div className="h-28 overflow-hidden">
                <img
                  src={item.image_url || NEWS_IMAGE_FALLBACK}
                  alt={item.title}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="p-3">
                <p className="text-[10px] uppercase tracking-[0.16em] text-cyan-300">{item.news_site}</p>
                <h4 className="mt-1 text-sm font-semibold text-slate-100">{item.title}</h4>
                <p className="mt-2 text-xs leading-5 text-slate-400">{item.summary}</p>
                <div className="mt-3 flex items-center justify-between gap-2">
                  <span className="text-[10px] uppercase tracking-[0.14em] text-slate-500">
                    {new Date(item.published_at).toLocaleString()}
                  </span>
                  <span className="text-[10px] uppercase tracking-[0.14em] text-fuchsia-300">{item.location}</span>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => openNewsDetails(item)}
                    className="rounded-md border border-cyan-400/40 bg-cyan-500/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-cyan-200 transition hover:bg-cyan-500/20"
                  >
                    Details
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
        <div className="mt-3 flex justify-center">
          <button
            type="button"
            onClick={() => setArticleLimit((prev) => Math.min(prev + 6, 36))}
            className="rounded-md border border-cyan-400/40 bg-cyan-500/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-cyan-200 transition hover:bg-cyan-500/20"
          >
            Load More Live Articles
          </button>
        </div>
      </section>

      <div className="fixed bottom-5 right-5 z-40">
        <AnimatePresence>
          {chatOpen && (
            <motion.section
              initial={{ opacity: 0, y: 18, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.96 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="mb-3 w-[min(92vw,380px)] rounded-xl border border-cyan-500/30 bg-[#031122]/95 p-3 shadow-2xl backdrop-blur"
            >
              <header className="mb-3 flex items-center justify-between">
                <h3 className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">
                  <MessageCircle size={14} /> Web Chat Assistant
                </h3>
                <button
                  type="button"
                  onClick={() => setChatOpen(false)}
                  className="rounded-md border border-slate-700 p-1 text-slate-300 transition hover:text-slate-100"
                  aria-label="Close chat"
                >
                  <X size={14} />
                </button>
              </header>
              <div
                ref={chatScrollRef}
                className="max-h-72 space-y-2 overflow-y-auto rounded-md border border-slate-700/70 bg-slate-950/70 p-2"
              >
                {chatMessages.map((msg, idx) => (
                  <div
                    key={`${msg.role}-${idx}`}
                    className={`rounded-md px-3 py-2 text-xs leading-5 ${
                      msg.role === 'user'
                        ? 'ml-6 bg-cyan-500/15 text-cyan-100'
                        : 'mr-6 bg-slate-800/80 text-slate-200'
                    }`}
                  >
                    {msg.content}
                  </div>
                ))}
                {chatLoading ? <p className="text-xs text-slate-400">Searching web...</p> : null}
              </div>
              <div className="mt-2 flex gap-2">
                <input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') askWebAssistant()
                  }}
                  placeholder="Ask with live web search..."
                  className="flex-1 rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-slate-100 outline-none ring-cyan-300 placeholder:text-slate-500 focus:ring-1"
                />
                <button
                  type="button"
                  onClick={askWebAssistant}
                  disabled={chatLoading}
                  className="rounded-md border border-cyan-400/40 bg-cyan-500/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-cyan-200 transition hover:bg-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Ask
                </button>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        <button
          type="button"
          onClick={() => setChatOpen((prev) => !prev)}
          className="ml-auto inline-flex h-12 w-12 items-center justify-center rounded-full border border-cyan-400/50 bg-cyan-500/20 text-cyan-100 shadow-[0_0_20px_rgba(34,211,238,0.45)] transition hover:bg-cyan-500/30"
          aria-label="Toggle chat assistant"
        >
          <MessageCircle size={20} />
        </button>
      </div>

      {selectedNews && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-2xl border border-slate-700 bg-slate-900 p-5 shadow-2xl md:p-6">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">
                  {newsDetails[selectedNews.id]?.newsSite || selectedNews.news_site}
                </p>
                <h4 className="mt-2 text-lg font-semibold text-slate-100">
                  {newsDetails[selectedNews.id]?.title || selectedNews.title}
                </h4>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="rounded-lg border border-slate-700 p-2 text-slate-300 transition hover:border-slate-500 hover:text-slate-100"
                aria-label="Close details modal"
              >
                <X size={16} />
              </button>
            </div>
            <img
              src={selectedNews.image_url || NEWS_IMAGE_FALLBACK}
              alt={selectedNews.title}
              className="mb-4 h-56 w-full rounded-xl object-cover"
            />
            <p className="text-sm leading-7 text-slate-300">
              {detailLoading
                ? 'Loading full article details from Spaceflight News API articles endpoint...'
                : newsDetails[selectedNews.id]?.summary || selectedNews.summary}
            </p>
            <p className="mt-2 text-xs text-slate-500">
              Note: Spaceflight News API provides article summaries. Full publisher article body is not included in this endpoint.
            </p>
            <p className="mt-4 text-xs uppercase tracking-[0.18em] text-slate-500">
              {new Date(newsDetails[selectedNews.id]?.publishedAt || selectedNews.published_at).toLocaleString()}
            </p>
          </div>
        </div>
      )}
    </main>
  )
}

export default App
