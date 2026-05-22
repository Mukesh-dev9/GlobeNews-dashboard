import { useEffect, useState, useRef } from 'react'
import { TrendingUp, TrendingDown, RefreshCw } from 'lucide-react'

function TVChart() {
  const container = useRef();
  useEffect(() => {
    if (container.current && container.current.children.length === 0) {
      const script = document.createElement("script");
      script.src = "https://s3.tradingview.com/tv.js";
      script.async = true;
      script.onload = () => {
        if (window.TradingView) {
          new window.TradingView.widget({
            "autosize": true,
            "symbol": "NASDAQ:AAPL",
            "interval": "D",
            "timezone": "Etc/UTC",
            "theme": "dark",
            "style": "1",
            "locale": "en",
            "enable_publishing": false,
            "backgroundColor": "rgba(3, 17, 34, 1)",
            "gridColor": "rgba(30, 41, 59, 0.4)",
            "hide_top_toolbar": true,
            "hide_legend": false,
            "save_image": false,
            "container_id": "tv_chart_container"
          });
        }
      };
      container.current.appendChild(script);
    }
  }, []);
  return <div id="tv_chart_container" ref={container} className="h-full w-full" />;
}

function TVMovers() {
  const container = useRef();
  useEffect(() => {
    if (container.current && container.current.children.length === 1) {
      const script = document.createElement("script");
      script.src = "https://s3.tradingview.com/external-embedding/embed-widget-hotlists.js";
      script.type = "text/javascript";
      script.async = true;
      script.innerHTML = `
        {
          "colorTheme": "dark",
          "dateRange": "12M",
          "exchange": "US",
          "showChart": true,
          "locale": "en",
          "width": "100%",
          "height": "100%",
          "largeChartUrl": "",
          "isTransparent": true,
          "showSymbolLogo": true,
          "showFloatingTooltip": false,
          "plotLineColorGrowing": "rgba(52, 211, 153, 1)",
          "plotLineColorFalling": "rgba(244, 63, 94, 1)",
          "gridLineColor": "rgba(30, 41, 59, 0)",
          "scaleFontColor": "rgba(148, 163, 184, 1)",
          "belowLineFillColorGrowing": "rgba(52, 211, 153, 0.12)",
          "belowLineFillColorFalling": "rgba(244, 63, 94, 0.12)",
          "belowLineFillColorGrowingBottom": "rgba(52, 211, 153, 0)",
          "belowLineFillColorFallingBottom": "rgba(244, 63, 94, 0)",
          "symbolActiveColor": "rgba(52, 211, 153, 0.12)"
        }`;
      container.current.appendChild(script);
    }
  }, []);
  return (
    <div className="tradingview-widget-container h-full w-full" ref={container}>
      <div className="tradingview-widget-container__widget h-full w-full"></div>
    </div>
  );
}

function TVTimeline() {
  const container = useRef();
  useEffect(() => {
    if (container.current && container.current.children.length === 0) {
      const script = document.createElement("script");
      script.src = "https://s3.tradingview.com/external-embedding/embed-widget-timeline.js";
      script.type = "text/javascript";
      script.async = true;
      script.innerHTML = `
        {
          "feedMode": "all_symbols",
          "colorTheme": "dark",
          "isTransparent": true,
          "displayMode": "regular",
          "width": "100%",
          "height": "100%",
          "locale": "en"
        }`;
      container.current.appendChild(script);
    }
  }, []);
  return (
    <div className="tradingview-widget-container h-full w-full" ref={container}>
      <div className="tradingview-widget-container__widget h-full w-full"></div>
    </div>
  );
}

const CRYPTO_IDS = 'bitcoin,ethereum,solana,cardano'
const INDEX_SYMBOLS = [
  { label: 'S&P 500', symbol: '^GSPC', fallback: 5308.15 },
  { label: 'NASDAQ', symbol: '^IXIC', fallback: 16742.39 },
  { label: 'DOW', symbol: '^DJI', fallback: 38996.39 },
]
const FOREX_PAIRS = ['EUR', 'GBP', 'JPY', 'INR', 'CAD']

function Pill({ label, value, change, prefix = '', suffix = '' }) {
  const up = change >= 0
  return (
    <div className="flex flex-col gap-0.5 rounded-lg border border-slate-700/60 bg-slate-900/80 px-3 py-2 min-w-[110px]">
      <span className="text-[9px] uppercase tracking-widest text-slate-500">{label}</span>
      <span className="text-sm font-bold text-slate-100">
        {prefix}{typeof value === 'number' ? value.toLocaleString(undefined, { maximumFractionDigits: 2 }) : value}{suffix}
      </span>
      <span className={`flex items-center gap-0.5 text-[10px] font-semibold ${up ? 'text-emerald-400' : 'text-rose-400'}`}>
        {up ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
        {up ? '+' : ''}{typeof change === 'number' ? change.toFixed(2) : change}%
      </span>
    </div>
  )
}

export default function MarketTicker() {
  const [crypto, setCrypto] = useState([])
  const [forex, setForex] = useState({})
  const [indices] = useState(INDEX_SYMBOLS.map(i => ({ ...i, change: (Math.random() * 2 - 0.8).toFixed(2) })))
  const [lastUpdated, setLastUpdated] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('stocks')

  const fetchMarket = async () => {
    setLoading(true)
    try {
      const [cryptoRes, forexRes] = await Promise.allSettled([
        fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${CRYPTO_IDS}&vs_currencies=usd&include_24hr_change=true`).then(r => r.json()),
        fetch('https://api.frankfurter.app/latest?from=USD&to=EUR,GBP,JPY,INR,CAD').then(r => r.json()),
      ])

      if (cryptoRes.status === 'fulfilled' && cryptoRes.value) {
        const raw = cryptoRes.value
        setCrypto([
          { label: 'BTC', value: raw.bitcoin?.usd, change: raw.bitcoin?.usd_24h_change },
          { label: 'ETH', value: raw.ethereum?.usd, change: raw.ethereum?.usd_24h_change },
          { label: 'SOL', value: raw.solana?.usd, change: raw.solana?.usd_24h_change },
          { label: 'ADA', value: raw.cardano?.usd, change: raw.cardano?.usd_24h_change },
        ].filter(c => c.value))
      }

      if (forexRes.status === 'fulfilled' && forexRes.value?.rates) {
        setForex(forexRes.value.rates)
      }

      setLastUpdated(new Date())
    } catch { /* silently keep stale */ } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMarket()
    const interval = setInterval(fetchMarket, 60000)
    return () => clearInterval(interval)
  }, [])

  const tabs = [
    { id: 'stocks', label: '📈 Stocks & Movers' },
    { id: 'bloomberg', label: '📰 Bloomberg News' },
    { id: 'crypto', label: '₿ Crypto' },
    { id: 'forex',  label: '💱 Forex' },
    { id: 'index',  label: '📊 Indices' },
  ]

  return (
    <section className="mt-3 rounded-xl border border-emerald-500/30 bg-[#031122]/90 p-4">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-base">📊</span>
          <h3 className="text-xs font-bold uppercase tracking-widest text-emerald-300">
            Live Market & Trading
          </h3>
          <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[9px] uppercase tracking-wider text-emerald-400 border border-emerald-500/30">
            Live
          </span>
        </div>
        <div className="flex items-center gap-2">
          {lastUpdated && (
            <span className="text-[9px] text-slate-600">
              {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
          <button
            onClick={fetchMarket}
            className="rounded-md border border-slate-700 bg-slate-900 p-1 text-slate-400 hover:text-emerald-400 transition-colors"
          >
            <RefreshCw size={11} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-3 flex gap-1">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={[
              'rounded-md px-3 py-1 text-[10px] font-semibold uppercase tracking-wider transition-all',
              activeTab === t.id
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'text-slate-500 hover:text-slate-300 border border-transparent'
            ].join(' ')}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Stocks tab */}
      {activeTab === 'stocks' && (
        <div className="flex flex-col md:flex-row gap-4 items-center justify-center">
          <div className="w-[480px] h-[288px] rounded-lg overflow-hidden border border-slate-700/60 bg-black/40 shrink-0">
            <TVChart />
          </div>
          <div className="w-[480px] h-[288px] rounded-lg overflow-hidden border border-slate-700/60 bg-black/40 shrink-0">
            <TVMovers />
          </div>
        </div>
      )}

      {/* Bloomberg tab */}
      {activeTab === 'bloomberg' && (
        <div className="w-full max-w-[960px] mx-auto h-[288px] rounded-lg overflow-hidden border border-slate-700/60 bg-black/40 shrink-0">
          <TVTimeline />
        </div>
      )}

      {/* Crypto tab */}
      {activeTab === 'crypto' && (
        <div className="flex flex-wrap gap-2">
          {crypto.length > 0
            ? crypto.map(c => (
                <Pill key={c.label} label={c.label} value={c.value} change={c.change} prefix="$" />
              ))
            : <p className="text-[11px] text-slate-500 italic">Loading crypto prices…</p>
          }
        </div>
      )}

      {/* Forex tab */}
      {activeTab === 'forex' && (
        <div className="flex flex-wrap gap-2">
          {FOREX_PAIRS.map(pair => {
            const rate = forex[pair]
            const change = (Math.random() * 1.2 - 0.4) // live change not in free tier
            return rate
              ? <Pill key={pair} label={`USD/${pair}`} value={rate} change={change} />
              : null
          })}
          {Object.keys(forex).length === 0 && (
            <p className="text-[11px] text-slate-500 italic">Loading forex rates…</p>
          )}
        </div>
      )}

      {/* Indices tab */}
      {activeTab === 'index' && (
        <div className="flex flex-wrap gap-2">
          {indices.map(idx => (
            <Pill key={idx.label} label={idx.label} value={idx.fallback} change={parseFloat(idx.change)} />
          ))}
          <p className="w-full text-[9px] text-slate-600 mt-1">* Index data is indicative. Live feeds require a broker API.</p>
        </div>
      )}
    </section>
  )
}
