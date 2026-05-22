import { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import {
  SNAPI_BASE,
  NEWS_SITE_LOCATIONS,
  MARKER_COLORS,
  fallbackNews,
  hotspots
} from './constants'

import { motion, AnimatePresence } from 'framer-motion'
import WorldMapSection from './components/WorldMapSection'
import DashboardKPIs from './components/DashboardKPIs'
import NewsFilters from './components/NewsFilters'
import MarketTicker from './components/MarketTicker'
import MarketSentiment from './components/MarketSentiment'
import ArticleList from './components/ArticleList'
import ChatAssistant from './components/ChatAssistant'
import NewsModal from './components/NewsModal'
import WorldMonitorConsole from './components/WorldMonitorConsole'

function App() {
  const [news, setNews] = useState(fallbackNews)
  const [rawNews, setRawNews] = useState(fallbackNews)
  const [selectedNews, setSelectedNews] = useState(null)
  const [newsDetails, setNewsDetails] = useState({})
  const [detailLoading, setDetailLoading] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('Space')
  const [currentView, setCurrentView] = useState('dashboard')


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
        'Ask me anything. I search live web news, Wikipedia, DuckDuckGo, and your dashboard to synthesize answers.',
    },
  ])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const [chatOpen, setChatOpen] = useState(false)
  const [chatMode, setChatMode] = useState('hybrid') // 'hybrid' | 'dashboard' | 'web'
  const [chatSearchSteps, setChatSearchSteps] = useState([])
  
  const dashboardRef = useRef(null)
  const globeRef = useRef(null)
  const chatScrollRef = useRef(null)

  useEffect(() => {
    const fetchDashboardData = async () => {
      const start = performance.now()
      setLoading(true)

      try {
        setError('')
        let articleNews = []
        let sourceCount = 0

        // Define the premium world-news domains filter
        const premiumSourcesFilter = '(site:bbc.com OR site:bbc.co.uk OR site:nytimes.com OR site:time.com OR site:thehindu.com OR site:reuters.com OR site:bloomberg.com OR site:techcrunch.com OR site:wired.com OR site:theguardian.com OR site:wsj.com OR site:nationalgeographic.com)';

        const catQueryMap = {
          Space: 'space OR nasa OR spacex OR astronomy OR rocket OR launch',
          Environment: 'climate OR environment OR "renewable energy" OR green-tech OR wildlife',
        }

        const baseQ = catQueryMap[selectedCategory] || selectedCategory
        const premiumQuery = `${baseQ} AND ${premiumSourcesFilter}`
        
        let liveFetched = false

        // ---- Phase 1: Try Premium Live RSS News Search ----
        try {
          const premiumRssUrl = encodeURIComponent(
            `https://news.google.com/rss/search?q=${encodeURIComponent(premiumQuery)}&hl=en-US&gl=US&ceid=US:en`
          )
          const rssRes = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${premiumRssUrl}&count=20`)
          if (rssRes.ok) {
            const rssData = await rssRes.json()
            if (rssData.status === 'ok' && rssData.items?.length) {
              const categoryImages = {
                Space: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa',
                Environment: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05'
              }
              const defaultImg = categoryImages[selectedCategory] || 'https://images.unsplash.com/photo-1446776877081-d282a0f896e2';

              articleNews = rssData.items.map((item, index) => {
                let publisher = item.author || 'World Desk';
                if (publisher.includes('(')) {
                  const match = publisher.match(/\(([^)]+)\)/);
                  if (match) publisher = match[1];
                }
                return {
                  id: `rss-premium-${index}-${Date.now()}`,
                  title: item.title?.split(' - ')[0] || 'Untitled article',
                  summary: item.description?.replace(/<[^>]*>/g, '').slice(0, 220) || item.title,
                  image_url: item.thumbnail || item.enclosure?.link || defaultImg,
                  news_site: publisher,
                  published_at: item.pubDate || new Date().toISOString(),
                  location: 'Global Desk',
                  url: item.link,
                }
              })
              liveFetched = true
              sourceCount++
            }
          }
        } catch (premiumErr) {
          console.warn('Premium RSS feeds failing, dropping to standard live RSS search', premiumErr)
        }

        // ---- Phase 2: If Premium filters return 0 articles, fallback to Standard Live RSS Search ----
        if (!liveFetched || articleNews.length < 5) {
          try {
            const standardRssUrl = encodeURIComponent(
              `https://news.google.com/rss/search?q=${encodeURIComponent(baseQ)}&hl=en-US&gl=US&ceid=US:en`
            )
            const rssRes = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${standardRssUrl}&count=20`)
            if (rssRes.ok) {
              const rssData = await rssRes.json()
              if (rssData.status === 'ok' && rssData.items?.length) {
                const categoryImages = {
                  Space: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa',
                  Environment: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05'
                }
                const defaultImg = categoryImages[selectedCategory] || 'https://images.unsplash.com/photo-1446776877081-d282a0f896e2';

                const standardItems = rssData.items.map((item, index) => {
                  let publisher = item.author || 'World Desk';
                  if (publisher.includes('(')) {
                    const match = publisher.match(/\(([^)]+)\)/);
                    if (match) publisher = match[1];
                  }
                  return {
                    id: `rss-standard-${index}-${Date.now()}`,
                    title: item.title?.split(' - ')[0] || 'Untitled article',
                    summary: item.description?.replace(/<[^>]*>/g, '').slice(0, 220) || item.title,
                    image_url: item.thumbnail || item.enclosure?.link || defaultImg,
                    news_site: publisher,
                    published_at: item.pubDate || new Date().toISOString(),
                    location: 'Global Desk',
                    url: item.link,
                  }
                })
                articleNews = [...articleNews, ...standardItems]
                liveFetched = true
                sourceCount++
              }
            }
          } catch (stdErr) {
            console.warn('Standard live news crawler offline', stdErr)
          }
        }

        // ---- Phase 3: Query Spaceflight News API (if category is Space) ----
        if (selectedCategory === 'Space') {
          try {
            const articleParams = new URLSearchParams({
              limit: String(articleLimit),
              ordering: '-published_at',
              summary_contains_one: filters.search || 'launch,mission,space,rocket,satellite',
            })
            const response = await fetch(`${SNAPI_BASE}/articles/?${articleParams.toString()}`)
            if (response.ok) {
              const data = await response.json()
              const snapiItems = (data.results ?? []).map((item) => ({
                id: `article-${item.id}`,
                title: item.title || 'Untitled article',
                summary: item.summary || `Published by ${item.news_site || 'Spaceflight News'}`,
                image_url: item.image_url,
                news_site: item.news_site || 'Spaceflight News API',
                published_at: item.published_at || new Date().toISOString(),
                location: NEWS_SITE_LOCATIONS[item.news_site]?.city || 'Global Desk',
                url: item.url
              }))
              articleNews = [...articleNews, ...snapiItems]
              sourceCount++
            }
          } catch (snapiErr) {
            console.warn('SNAPI space server offline', snapiErr)
          }
        }

        // ---- Phase 4: Query legacy backup cache (if we still have too few headlines) ----
        if (articleNews.length < 5 && selectedCategory !== 'Space') {
          try {
            const sauravCatMap = {
              'Environment': 'science',
            }
            const sauravCat = sauravCatMap[selectedCategory] || 'general'
            const response = await fetch(
              `https://saurav.tech/NewsAPI/top-headlines/category/${sauravCat}/us.json`
            )
            if (response.ok) {
              const data = await response.json()
              const backupItems = (data.articles ?? []).map((item, index) => ({
                id: `article-newsapi-${index}-${Date.now()}`,
                title: item.title || 'Untitled article',
                summary: item.description || item.content || `Published by ${item.source?.name || 'NewsAPI'}`,
                image_url: item.urlToImage || 'https://images.unsplash.com/photo-1446776877081-d282a0f896e2',
                news_site: item.source?.name || 'Global News',
                published_at: item.publishedAt || new Date().toISOString(),
                location: NEWS_SITE_LOCATIONS[item.source?.name]?.city || 'Global Desk',
                url: item.url
              }))
              articleNews = [...articleNews, ...backupItems]
              sourceCount++
            }
          } catch (backupErr) {
            console.warn('Saurav cache server offline', backupErr)
          }
        }

        // ---- Phase 5: Query USGS Earthquakes (safe sandbox execution) ----
        let usgsResult = { features: [] }
        try {
          const usgsRes = await fetch('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_hour.geojson')
          if (usgsRes.ok) {
            usgsResult = await usgsRes.json()
          }
        } catch { /* USGS failure does not crash feed */ }
        sourceCount++

        const liveZones = usgsResult.features?.length ?? 10

        // Clean results: remove duplicate headlines and "[Removed]" items
        const seenTitles = new Set();
        const cleanedNews = articleNews
          .filter((a) => {
            if (!a.title || a.title === '[Removed]') return false;
            const normalized = a.title.toLowerCase().trim();
            if (seenTitles.has(normalized)) return false;
            seenTitles.add(normalized);
            return true;
          })
          .sort((a, b) => new Date(b.published_at) - new Date(a.published_at))
          .slice(0, articleLimit)

        const effectiveNews = cleanedNews.length ? cleanedNews : fallbackNews
        setRawNews(effectiveNews)
        setNews(effectiveNews)

        const freshnessBoost = Math.min(20, cleanedNews.length * 2)
        const headlineScore = Math.min(99, Math.max(60, 55 + freshnessBoost + Math.min(liveZones, 24)))
        const latency = `${((performance.now() - start) / 1000).toFixed(2)}s`

        setKpis({
          score: headlineScore,
          zones: liveZones,
          latency,
          sourceCount: sourceCount || 1,
        })
        setLastUpdated(new Date())
      } catch (err) {
        console.error('Fatal fetch error, triggering global fallback state:', err)
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
  }, [articleLimit, filters.search, filters.newsSite, filters.isFeatured, filters.hasLaunch, refreshTick, selectedCategory])

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

  const goToDashboard = useCallback(() => {
    dashboardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  const triggerRefresh = useCallback(() => {
    setLoading(true)
    setRefreshTick((prev) => prev + 1)
  }, [])

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

  const openNewsDetails = useCallback(async (item) => {
    setSelectedNews(item)
    if (newsDetails[item.id] || item.id.includes('fallback') || selectedCategory !== 'Space') return

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
  }, [newsDetails, selectedCategory])

  const closeModal = useCallback(() => {
    setSelectedNews(null)
  }, [])

  const askWebAssistant = useCallback(async (overrideQuery) => {
    const query = (overrideQuery || chatInput).trim()
    if (!query || chatLoading) return

    setChatMessages((prev) => [...prev, { role: 'user', content: query }].slice(-20))
    setChatInput('')
    setChatLoading(true)

    // Setup initial stepper status depending on chatMode
    let steps = [];
    if (chatMode === 'dashboard') {
      steps = [
        { id: 'local', label: 'Scanning dashboard news', status: 'searching' },
        { id: 'synthesize', label: 'Formulating news analysis', status: 'pending' },
      ];
    } else if (chatMode === 'web') {
      steps = [
        { id: 'web', label: 'Querying Google News RSS', status: 'searching' },
        { id: 'wiki', label: 'Retrieving Wikipedia references', status: 'searching' },
        { id: 'synthesize', label: 'Synthesizing live web intelligence', status: 'pending' },
      ];
    } else {
      // hybrid
      steps = [
        { id: 'local', label: 'Scanning dashboard database', status: 'searching' },
        { id: 'web', label: 'Querying Google News live coverage', status: 'pending' },
        { id: 'wiki', label: 'Retrieving Wikipedia knowledge', status: 'pending' },
        { id: 'synthesize', label: 'Formulating hybrid response', status: 'pending' },
      ];
    }
    setChatSearchSteps(steps);

    const updateStepStatus = (id, status) => {
      setChatSearchSteps((prevSteps) =>
        prevSteps.map((step) => (step.id === id ? { ...step, status } : step))
      )
    }

    try {
      const encoded = encodeURIComponent(query)
      let localMatches = []
      let webSources = []
      let wikiSource = null
      let ddgSource = null
      let answer = ''

      // ---- Step 1: Local Dashboard news search ----
      if (chatMode === 'hybrid' || chatMode === 'dashboard') {
        const commonWords = new Set(['the', 'a', 'an', 'is', 'are', 'was', 'were', 'in', 'on', 'at', 'about', 'for', 'news', 'what', 'search', 'how', 'why', 'where', 'who', 'of', 'and', 'to', 'with', 'it', 'me', 'you', 'latest', 'today', 'current', 'info', 'realtime']);
        const queryWords = query.toLowerCase().split(/\W+/).filter(w => w.length > 2 && !commonWords.has(w));
        
        localMatches = news.filter(article => {
          const text = `${article.title} ${article.summary} ${article.news_site}`.toLowerCase();
          return queryWords.some(word => text.includes(word));
        });

        updateStepStatus('local', localMatches.length > 0 ? 'success' : 'error')
        if (chatMode === 'hybrid') {
          updateStepStatus('web', 'searching')
        } else {
          updateStepStatus('synthesize', 'searching')
        }
      }

      // ---- Step 2: Web News RSS Search (Google News search RSS via rss2json) ----
      if (chatMode === 'hybrid' || chatMode === 'web') {
        try {
          const googleNewsUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(`https://news.google.com/rss/search?q=${encoded}&hl=en-US&gl=US&ceid=US:en`)}`;
          const rssRes = await fetch(googleNewsUrl).then((r) => r.json());
          if (rssRes.status === 'ok' && rssRes.items?.length) {
            webSources = rssRes.items.slice(0, 5).map((item) => ({
              title: item.title,
              url: item.link,
              source: item.author || 'Google News',
              snippet: item.description?.replace(/<[^>]*>/g, '').slice(0, 180) || item.title,
              date: item.pubDate,
              isWeb: true,
            }))
            updateStepStatus('web', 'success')
          } else {
            updateStepStatus('web', 'error')
          }
        } catch {
          updateStepStatus('web', 'error')
        }

        if (chatMode === 'hybrid') {
          updateStepStatus('wiki', 'searching')
        }
      }

      // ---- Step 3: Wikipedia & DuckDuckGo Search ----
      if (chatMode === 'hybrid' || chatMode === 'web') {
        const [ddgRes, wikiSearchRes] = await Promise.allSettled([
          fetch(`https://api.duckduckgo.com/?q=${encoded}&format=json&no_html=1&no_redirect=1`).then((r) => r.json()),
          fetch(
            `https://en.wikipedia.org/w/api.php?action=opensearch&search=${encoded}&limit=1&namespace=0&format=json&origin=*`,
          ).then((r) => r.json()),
        ])

        if (wikiSearchRes.status === 'fulfilled' && Array.isArray(wikiSearchRes.value) && wikiSearchRes.value[1]?.[0]) {
          const wikiTitle = wikiSearchRes.value[1][0]
          try {
            const wikiSummaryRes = await fetch(
              `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(wikiTitle)}`,
            ).then((r) => r.json())
            
            if (wikiSummaryRes.extract) {
              const lastUpdated = wikiSummaryRes.timestamp ? new Date(wikiSummaryRes.timestamp).toLocaleDateString() : 'Recently'
              wikiSource = {
                title: wikiSummaryRes.title || wikiTitle,
                url: wikiSummaryRes.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${encodeURIComponent(wikiTitle)}`,
                source: 'Wikipedia',
                snippet: wikiSummaryRes.extract,
                date: lastUpdated,
                isWiki: true
              }
            }
          } catch { /* skip */ }
        }

        if (ddgRes.status === 'fulfilled' && ddgRes.value?.AbstractText) {
          ddgSource = {
            title: ddgRes.value.Heading || query,
            url: ddgRes.value.AbstractURL || `https://duckduckgo.com/?q=${encoded}`,
            source: ddgRes.value.AbstractSource || 'DuckDuckGo',
            snippet: ddgRes.value.AbstractText,
            date: 'Live Facts',
            isDdg: true
          }
        }

        updateStepStatus('wiki', (wikiSource || ddgSource) ? 'success' : 'error')
        updateStepStatus('synthesize', 'searching')
      }

      // ---- Step 4: Synthesize Final Response ----
      let synthesizedAnswer = '';
      const allSources = [];

      // Collect Wikipedia & DuckDuckGo
      if (wikiSource) {
        synthesizedAnswer += `📚 **Wikipedia Encyclopedia**\n• **${wikiSource.title}**: ${wikiSource.snippet}\n\n`;
        allSources.push(wikiSource);
      }
      if (ddgSource) {
        synthesizedAnswer += `ℹ️ **DuckDuckGo Fact:** ${ddgSource.snippet}\n\n`;
        allSources.push(ddgSource);
      }

      // Add local insights
      if (localMatches.length > 0) {
        synthesizedAnswer += `📊 **Dashboard Matches (${localMatches.length})**\nI matched these items directly in your live metrics database:\n`;
        localMatches.forEach((match) => {
          synthesizedAnswer += `• **${match.title}** *(Published by ${match.news_site})*: ${match.summary}\n`;
          allSources.push({
            title: match.title,
            url: match.url,
            source: match.news_site,
            snippet: match.summary,
            date: new Date(match.published_at).toLocaleDateString(),
            isLocal: true
          });
        });
        synthesizedAnswer += `\n`;
      }

      // Add web news insights
      if (webSources.length > 0) {
        synthesizedAnswer += `🌐 **Live Web Coverage**\nLatest real-time headlines crawled from across the web:\n`;
        webSources.forEach((source) => {
          synthesizedAnswer += `• **${source.title.split(' - ')[0]}** *(via ${source.source})*: ${source.snippet}\n`;
          allSources.push(source);
        });
        synthesizedAnswer += `\n`;
      }

      // If absolutely nothing was found
      if (!synthesizedAnswer.trim()) {
        synthesizedAnswer = `I couldn't locate any direct intelligence database matches or live web news for "**${query}**". \n\nFeel free to try a broader keyword, check another search mode, or ask about another active news category!`;
      }

      updateStepStatus('synthesize', 'success')

      setChatMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: synthesizedAnswer.trim(),
          sources: allSources,
          mode: chatMode
        },
      ].slice(-20))
    } catch (err) {
      console.error(err)
      setChatMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Web assistant encountered an unexpected error while retrieving data. Please try again in a moment.',
        },
      ].slice(-20))
      // set all steps to error
      setChatSearchSteps((prev) => prev.map((s) => ({ ...s, status: 'error' })))
    } finally {
      setChatLoading(false)
      // Clear progress steps after a brief delay
      setTimeout(() => {
        setChatSearchSteps([])
      }, 3500)
    }
  }, [chatInput, chatLoading, chatMode, news])

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-4 py-5 md:px-8">
      {/* Top Floating Taskbar */}
      <nav className="mb-4 flex flex-wrap items-center justify-between rounded-2xl border border-cyan-500/25 bg-[#031122]/90 px-5 py-3 shadow-[0_0_20px_rgba(6,182,212,0.06)] backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-cyan-950 flex items-center justify-center border border-cyan-400/40">
            <span className="text-sm font-bold text-cyan-300">📰</span>
          </div>
          <div>
            <h1 className="text-xs font-black uppercase tracking-[0.2em] text-cyan-100 leading-none">GlobeNews</h1>
            <span className="text-[7.5px] font-bold text-purple-400 uppercase tracking-widest block mt-0.5">Real-Time Intelligence Grid</span>
          </div>
        </div>

        {/* Global Live Indicators */}
        <div className="hidden sm:flex items-center gap-4 text-[9px] font-bold uppercase tracking-wider text-slate-500">
          <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> Feeds: <strong className="text-slate-200">Space & Climate</strong></span>
          <span className="flex items-center gap-1.5">Latency: <strong className="text-slate-300">{kpis.latency}</strong></span>
          <span className="flex items-center gap-1.5">Source Sync: <strong className="text-slate-300">Online</strong></span>
        </div>

        <div className="flex items-center gap-2 bg-[#020a15]/60 p-1 rounded-xl border border-cyan-500/10">
          {/* Dashboard Grid View Toggle */}
          <button
            onClick={() => setCurrentView('dashboard')}
            className={`relative flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-[9.5px] font-black uppercase tracking-widest transition-all duration-300 cursor-pointer ${
              currentView === 'dashboard'
                ? 'bg-cyan-500/15 border border-cyan-400/40 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.15)] scale-[1.02]'
                : 'border border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <span className="text-[10px]">📊</span>
            Dashboard Grid
          </button>

          {/* World Monitor Console Toggle */}
          <button
            onClick={() => setCurrentView('monitor')}
            className={`relative flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-[9.5px] font-black uppercase tracking-widest transition-all duration-300 cursor-pointer ${
              currentView === 'monitor'
                ? 'bg-cyan-500/15 border border-cyan-400/40 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.15)] scale-[1.02]'
                : 'border border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <span className="relative flex h-1.5 w-1.5 shrink-0">
              {currentView === 'monitor' && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              )}
              <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${currentView === 'monitor' ? 'bg-cyan-400' : 'bg-cyan-500/40'}`}></span>
            </span>
            World Monitor Console
          </button>
        </div>
      </nav>
      <AnimatePresence mode="wait">
        {currentView === 'dashboard' ? (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
            className="flex flex-col gap-4 animate-fadeIn"
          >
            <WorldMapSection
              ref={globeRef}
              kpis={kpis}
              lastUpdated={lastUpdated}
              goToDashboard={goToDashboard}
              triggerRefresh={triggerRefresh}
            />

            <section className="mt-4 mb-6 flex flex-wrap justify-center gap-2">
              {[
                { label: 'Space',       icon: '🚀' },
                { label: 'Environment', icon: '🌿' },
              ].map(({ label, icon }) => {
                const isActive = selectedCategory === label
                return (
                  <button
                    key={label}
                    id={`cat-btn-${label.toLowerCase()}`}
                    onClick={() => {
                      setSelectedCategory(label)
                      setFilters({ search: '', newsSite: '', isFeatured: false, hasLaunch: false })
                    }}
                    className={[
                      'relative flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-[11px] font-semibold uppercase tracking-widest transition-all duration-300',
                      isActive
                        ? 'border-cyan-400 bg-cyan-500/20 text-cyan-300 shadow-[0_0_12px_rgba(34,211,238,0.35)]'
                        : 'border-slate-700 bg-slate-900/70 text-slate-400 hover:border-cyan-500/60 hover:text-cyan-300 hover:bg-cyan-500/10',
                    ].join(' ')}
                  >
                    <span className="text-sm leading-none">{icon}</span>
                    {label}
                    {isActive && (
                      <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(34,211,238,0.9)] animate-pulse" />
                    )}
                  </button>
                )
              })}
            </section>

            <div className="flex flex-col gap-4">
              <DashboardKPIs
                ref={dashboardRef}
                kpis={kpis}
                news={news}
                loading={loading}
                openNewsDetails={openNewsDetails}
              />

              <NewsFilters
                filters={filters}
                setFilters={setFilters}
                error={error}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
              />

              <MarketSentiment />

              <MarketTicker />

              <ArticleList
                news={news}
                openNewsDetails={openNewsDetails}
                setArticleLimit={setArticleLimit}
              />
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="monitor"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
            className="w-full"
          >
            <WorldMonitorConsole
              onClose={() => setCurrentView('dashboard')}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <ChatAssistant
        ref={chatScrollRef}
        chatOpen={chatOpen}
        setChatOpen={setChatOpen}
        chatMessages={chatMessages}
        chatLoading={chatLoading}
        chatInput={chatInput}
        setChatInput={setChatInput}
        askWebAssistant={askWebAssistant}
        chatMode={chatMode}
        setChatMode={setChatMode}
        chatSearchSteps={chatSearchSteps}
      />



      <NewsModal
        selectedNews={selectedNews}
        newsDetails={newsDetails}
        detailLoading={detailLoading}
        closeModal={closeModal}
      />
    </main>
  )
}

export default App
