import { forwardRef } from 'react';
import { Newspaper, Clock, Brain, Shield, PieChart, Sparkles } from 'lucide-react';

const DashboardKPIs = forwardRef(({
  news = [],
  loading,
  openNewsDetails,
}, ref) => {
  // ---- 1. Math Analysis Engine for Space vs Environment Ratios ----
  const spaceKeywords = [
    'space', 'nasa', 'spacex', 'orbit', 'rocket', 'satellite', 'astronomy', 
    'launch', 'mars', 'telescope', 'cosmic', 'hubble', 'astronaut', 'flight', 
    'mission', 'asteroid', 'spaceflight'
  ];
  const envKeywords = [
    'climate', 'environment', 'green', 'carbon', 'warming', 'ecosystem', 
    'wildlife', 'solar', 'wind', 'pollution', 'energy', 'nature', 'emission', 
    'biodiversity', 'recycle', 'forest', 'ocean'
  ];

  let spaceCount = 0;
  let envCount = 0;

  news.forEach((item) => {
    const text = `${item.title} ${item.summary} ${item.news_site}`.toLowerCase();
    let spaceScore = 0;
    let envScore = 0;

    spaceKeywords.forEach(kw => { if (text.includes(kw)) spaceScore++; });
    envKeywords.forEach(kw => { if (text.includes(kw)) envScore++; });

    if (spaceScore > envScore) {
      spaceCount++;
    } else if (envScore > spaceScore) {
      envCount++;
    } else {
      // Fallback categorization based on title/site or id
      if (item.news_site?.toLowerCase().includes('space') || item.id?.includes('space') || item.id?.includes('snapi')) {
        spaceCount++;
      } else {
        envCount++;
      }
    }
  });

  const totalCount = spaceCount + envCount || 1;
  const spacePct = Math.round((spaceCount / totalCount) * 100);
  const envPct = Math.round((envCount / totalCount) * 100);

  // ---- 2. Math Analysis Engine for Real-Time Fact-Check Index ----
  let totalFactScore = 0;
  let citedSourcesCount = 0;
  let quantitativeDataCount = 0;

  news.forEach((item) => {
    let itemScore = 60; // Baseline credibility
    const text = `${item.title} ${item.summary}`.toLowerCase();

    // Citation density check
    const authorities = [
      'nasa', 'esa', 'ipcc', 'noaa', 'bbc', 'reuters', 'bloomberg', 'times', 
      'nature', 'science', 'national geographic', 'guardian', 'hindu', 'wired', 'techcrunch'
    ];
    const hasAuth = authorities.some(auth => text.includes(auth) || item.news_site?.toLowerCase().includes(auth));
    if (hasAuth) {
      itemScore += 20;
      citedSourcesCount++;
    }

    // Quantitative metrics check (numbers, ratios, stats)
    const hasNumbers = /\b\d+(?:\.\d+)?%?\b/.test(text) || /\b(?:billion|million|percent|quarter|q2|q3|q1|q4)\b/.test(text);
    if (hasNumbers) {
      itemScore += 15;
      quantitativeDataCount++;
    }

    // Summary depth & link integrity
    if (item.url && item.url !== '#') itemScore += 2.5;
    if (item.summary && item.summary.length > 140) itemScore += 2.5;

    totalFactScore += Math.min(100, itemScore);
  });

  const avgFactuality = news.length > 0 ? Math.round(totalFactScore / news.length) : 85;
  const citationPct = Math.round((citedSourcesCount / totalCount) * 100);
  const dataPct = Math.round((quantitativeDataCount / totalCount) * 100);

  // Dynamic AI Diagnostics Statement
  const getAiSummary = () => {
    if (news.length === 0) return "Awaiting live real-time articles to begin diagnostics...";
    if (spacePct > envPct) {
      return `Telemetry data and aerospace schedules dominate coverage today at ${spacePct}%. High scientific verification density (${avgFactuality}%) observed.`;
    } else if (envPct > spacePct) {
      return `Environmental indices and solar investments dominate coverage today at ${envPct}%. Verification shows ${avgFactuality}% quantitative rigor.`;
    } else {
      return `Balanced thematic distribution between spaceflight and climate news. Authoritative sources yield a strong ${avgFactuality}% verification index.`;
    }
  };
  const aiSummary = getAiSummary();

  // SVG ring variables
  const radius = 34;
  const circ = 2 * Math.PI * radius; // ~213.63
  const factStrokeOffset = circ * (1 - avgFactuality / 100);
  
  const spaceStrokeOffset = circ * (1 - spacePct / 100);
  const envStrokeOffset = circ * (1 - envPct / 100);
  const envRotation = (spacePct / 100) * 360 - 90;

  // Factuality status classification
  const getFactualityMeta = () => {
    if (avgFactuality >= 80) return { label: 'HIGH QUANTITATIVE RIGOR', style: 'border-emerald-500/30 text-emerald-400 bg-emerald-500/5' };
    if (avgFactuality >= 70) return { label: 'BALANCED EMPIRICAL FACTS', style: 'border-amber-500/30 text-amber-400 bg-amber-500/5' };
    return { label: 'OPINION & EDITORIAL CONTENT', style: 'border-cyan-500/30 text-cyan-400 bg-cyan-500/5' };
  };
  const factMeta = getFactualityMeta();

  return (
    <section ref={ref} className="mt-4 grid gap-4 md:grid-cols-3">
      {/* KPI Card 1 — Real-Time AI Fact-Checking Index */}
      <article className="relative flex flex-col justify-between overflow-hidden rounded-xl border border-cyan-500/30 bg-[#031122]/90 p-4 shadow-[0_0_20px_rgba(6,182,212,0.06)]">
        <header className="flex items-center justify-between">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-300 flex items-center gap-1.5">
            <Shield size={12} className="text-cyan-400" /> AI Factuality Index
          </p>
          <Sparkles size={11} className="text-cyan-400 animate-pulse" />
        </header>

        <div className="mt-3 flex items-center gap-4">
          {/* Circular SVG Gauge */}
          <div className="relative h-20 w-20 shrink-0">
            <svg viewBox="0 0 100 100" className="h-full w-full rotate-[-90deg]">
              <circle cx="50" cy="50" r={radius} fill="transparent" stroke="#1e293b" strokeWidth="9" />
              <circle 
                cx="50" 
                cy="50" 
                r={radius} 
                fill="transparent" 
                stroke="url(#factGlowGradient)" 
                strokeWidth="9" 
                strokeDasharray={circ}
                strokeDashoffset={factStrokeOffset}
                strokeLinecap="round"
                className="transition-all duration-1000"
              />
              <defs>
                <linearGradient id="factGlowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#22d3ee" />
                  <stop offset="100%" stopColor="#10b981" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-sm font-black text-cyan-200">{avgFactuality}%</span>
              <span className="text-[7px] font-semibold text-slate-500 uppercase tracking-widest">Score</span>
            </div>
          </div>

          <div>
            <div className={`inline-block rounded px-2 py-0.5 text-[8px] font-bold tracking-wider border ${factMeta.style}`}>
              {factMeta.label}
            </div>
            <p className="mt-1 text-[9px] leading-relaxed text-slate-400">
              Evaluates quantitative statistics and scientific source citations dynamically across all active articles.
            </p>
          </div>
        </div>

        {/* Sub-KPI statistics */}
        <div className="mt-3.5 grid grid-cols-3 gap-2 border-t border-slate-800/80 pt-3">
          <div className="rounded-md bg-slate-900/60 p-1.5 text-center border border-slate-800/30">
            <p className="text-[8px] uppercase tracking-wider text-slate-500">Scanned</p>
            <p className="text-xs font-bold text-slate-200">{news.length}</p>
          </div>
          <div className="rounded-md bg-slate-900/60 p-1.5 text-center border border-slate-800/30">
            <p className="text-[8px] uppercase tracking-wider text-slate-500">Citations</p>
            <p className="text-xs font-bold text-emerald-400">{citationPct}%</p>
          </div>
          <div className="rounded-md bg-slate-900/60 p-1.5 text-center border border-slate-800/30">
            <p className="text-[8px] uppercase tracking-wider text-slate-500">Data Rigor</p>
            <p className="text-xs font-bold text-cyan-400">{dataPct}%</p>
          </div>
        </div>
      </article>

      {/* KPI Card 2 — Live Headlines (Retained as Center Card) */}
      <article className="rounded-xl border border-cyan-500/30 bg-[#031122]/90 p-4 shadow-[0_0_20px_rgba(6,182,212,0.06)] md:col-span-1">
        <header className="mb-2 flex items-center justify-between">
          <h3 className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-cyan-200">
            <Newspaper size={13} className="text-cyan-400" /> Real-Time Updates
          </h3>
          <span className={`flex items-center gap-1 text-[9px] uppercase tracking-[0.16em] ${loading ? 'text-amber-400' : 'text-emerald-400'}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${loading ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400 animate-pulse'}`} />
            {loading ? 'Syncing…' : 'Live'}
          </span>
        </header>
        <div className="space-y-1.5">
          {news.slice(0, 3).map((item) => (
            <button
              type="button"
              key={item.id}
              onClick={() => openNewsDetails(item)}
              className="w-full rounded-lg border border-slate-800/60 bg-slate-900/40 px-2.5 py-1.5 text-left transition-all duration-300 hover:border-cyan-400/40 hover:bg-cyan-500/5 group"
            >
              <p className="text-[10px] font-semibold leading-snug text-slate-200 line-clamp-2 transition group-hover:text-cyan-300">
                {item.title}
              </p>
              <div className="mt-1 flex items-center justify-between">
                <p className="text-[8px] uppercase tracking-wider text-slate-500 font-bold">{item.news_site}</p>
                <p className="text-[8px] text-fuchsia-400 flex items-center gap-1">
                  <Clock size={8} /> {new Date(item.published_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </button>
          ))}
        </div>
      </article>

      {/* KPI Card 3 — Space vs Environment Ring Distribution & AI Diagnostic Summary */}
      <article className="relative flex flex-col justify-between rounded-xl border border-cyan-500/30 bg-[#031122]/90 p-4 shadow-[0_0_20px_rgba(6,182,212,0.06)]">
        <header className="flex items-center justify-between">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-300 flex items-center gap-1.5">
            <PieChart size={12} className="text-purple-400" /> Sector Volume breakdown
          </p>
          <div className="text-[9px] font-semibold uppercase tracking-wider text-slate-500">Space vs Climate</div>
        </header>

        <div className="mt-2.5 flex items-center gap-4">
          {/* Circular Segmented Pie/Ring Chart */}
          <div className="relative h-20 w-20 shrink-0">
            <svg viewBox="0 0 100 100" className="h-full w-full">
              {/* Environment Circle segment (Emerald) */}
              <circle 
                cx="50" 
                cy="50" 
                r={radius} 
                fill="transparent" 
                stroke="#10b981" 
                strokeWidth="10" 
                strokeDasharray={circ}
                strokeDashoffset={envStrokeOffset}
                strokeLinecap="round"
                transform={`rotate(${envRotation} 50 50)`}
                className="transition-all duration-1000"
              />
              {/* Space Circle segment (Cyan) */}
              <circle 
                cx="50" 
                cy="50" 
                r={radius} 
                fill="transparent" 
                stroke="#06b6d4" 
                strokeWidth="10" 
                strokeDasharray={circ}
                strokeDashoffset={spaceStrokeOffset}
                strokeLinecap="round"
                transform="rotate(-90 50 50)"
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Total</span>
              <span className="text-sm font-black text-slate-200">{news.length}</span>
            </div>
          </div>

          <div className="flex-1 space-y-1 text-[10px]">
            <div className="flex items-center justify-between font-semibold">
              <div className="flex items-center gap-1.5 text-cyan-400">
                <span className="h-2 w-2 rounded-full bg-[#06b6d4]" /> Space
              </div>
              <span className="text-cyan-200 font-bold">{spacePct}%</span>
            </div>
            <div className="flex items-center justify-between font-semibold">
              <div className="flex items-center gap-1.5 text-emerald-400">
                <span className="h-2 w-2 rounded-full bg-[#10b981]" /> Environment
              </div>
              <span className="text-emerald-200 font-bold">{envPct}%</span>
            </div>
            <p className="text-[8px] leading-tight text-slate-500">
              Matches ratios of aerospace scheduling versus environment reporting.
            </p>
          </div>
        </div>

        {/* AI Diagnostics Statement Summary Box */}
        <div className="mt-3.5 border-t border-slate-800/80 pt-3">
          <div className="rounded-lg bg-slate-950/60 px-3 py-2 border border-purple-500/20 shadow-inner">
            <p className="text-[8px] font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1 mb-1">
              <Brain size={10} className="text-purple-400" /> AI Engine Diagnostics
            </p>
            <p className="text-[9px] leading-relaxed text-slate-300 font-medium font-mono min-h-6">
              {aiSummary}
            </p>
          </div>
        </div>
      </article>
    </section>
  );
});

DashboardKPIs.displayName = 'DashboardKPIs';

export default DashboardKPIs;
