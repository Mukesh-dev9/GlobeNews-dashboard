import { Area, AreaChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { BrainCircuit, Activity } from 'lucide-react';

export default function AIAnalysisGraph({ sentimentData, summary }) {
  const currentScore = sentimentData.length > 0 ? sentimentData[sentimentData.length - 1] : { positive: 0, neutral: 0, risk: 0 };

  return (
    <section className="mt-3 grid gap-3 md:grid-cols-3">
      <article className="rounded-xl border border-cyan-500/30 bg-[#031122]/90 p-3 md:col-span-2">
        <header className="mb-2 flex items-center justify-between">
          <h3 className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">
            <Activity size={14} /> Real-Time AI Sentiment Analysis
          </h3>
          <span className="text-[10px] uppercase tracking-[0.16em] text-slate-500">Live feed processed</span>
        </header>
        <div className="mt-2 h-40">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sentimentData}>
              <defs>
                <linearGradient id="colorPos" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorNeu" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#94a3b8" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="time" stroke="#64748b" fontSize={10} />
              <YAxis stroke="#64748b" fontSize={10} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', fontSize: '12px' }}
                itemStyle={{ color: '#e2e8f0' }}
              />
              <Area type="monotone" dataKey="positive" stroke="#22d3ee" fillOpacity={1} fill="url(#colorPos)" />
              <Area type="monotone" dataKey="risk" stroke="#ef4444" fillOpacity={1} fill="url(#colorRisk)" />
              <Area type="monotone" dataKey="neutral" stroke="#94a3b8" fillOpacity={1} fill="url(#colorNeu)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </article>

      <article className="rounded-xl border border-cyan-500/30 bg-[#031122]/90 p-3">
        <h3 className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">
          <BrainCircuit size={14} /> AI Diagnostic
        </h3>
        <div className="mt-4 flex flex-col gap-3">
          <div>
            <div className="flex justify-between text-[10px] uppercase text-slate-400">
              <span>Positive Momentum</span>
              <span className="text-cyan-300">{currentScore.positive}%</span>
            </div>
            <div className="mt-1 h-1.5 w-full rounded-full bg-slate-800">
              <div className="h-full rounded-full bg-cyan-400" style={{ width: `${currentScore.positive}%` }} />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-[10px] uppercase text-slate-400">
              <span>Risk / Alert Level</span>
              <span className="text-red-400">{currentScore.risk}%</span>
            </div>
            <div className="mt-1 h-1.5 w-full rounded-full bg-slate-800">
              <div className="h-full rounded-full bg-red-500" style={{ width: `${currentScore.risk}%` }} />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-[10px] uppercase text-slate-400">
              <span>Neutral / Info</span>
              <span className="text-slate-300">{currentScore.neutral}%</span>
            </div>
            <div className="mt-1 h-1.5 w-full rounded-full bg-slate-800">
              <div className="h-full rounded-full bg-slate-400" style={{ width: `${currentScore.neutral}%` }} />
            </div>
          </div>
        </div>
        <p className="mt-4 text-xs leading-5 text-cyan-100/80">{summary}</p>
      </article>
    </section>
  );
}
