import { useState } from 'react'
import { Tv, ExternalLink } from 'lucide-react'

const CHANNELS = [
  {
    id: 'skynews',
    label: 'Sky News',
    flag: '🇬🇧',
    color: '#3b82f6',
    embedUrl: 'https://www.youtube.com/embed/live_stream?channel=UCoMdktPbSTixAyNGwb-UYkQ&autoplay=1&mute=1',
    ytLink: 'https://www.youtube.com/channel/UCoMdktPbSTixAyNGwb-UYkQ/live',
  },
  {
    id: 'aljazeera',
    label: 'Al Jazeera',
    flag: '🌍',
    color: '#f59e0b',
    embedUrl: 'https://www.youtube.com/embed/live_stream?channel=UCNye-wNBqNL5ZzHSJj3l8Bg&autoplay=1&mute=1',
    ytLink: 'https://www.youtube.com/channel/UCNye-wNBqNL5ZzHSJj3l8Bg/live',
  },
  {
    id: 'dw',
    label: 'DW News',
    flag: '🇩🇪',
    color: '#a78bfa',
    embedUrl: 'https://www.youtube.com/embed/live_stream?channel=UCknLrEdhRCp1aegoMqRaCEg&autoplay=1&mute=1',
    ytLink: 'https://www.youtube.com/channel/UCknLrEdhRCp1aegoMqRaCEg/live',
  },
  {
    id: 'france24',
    label: 'France 24',
    flag: '🇫🇷',
    color: '#22d3ee',
    embedUrl: 'https://www.youtube.com/embed/live_stream?channel=UCQfwfsi5VrQ8yKZ-UWmAEFg&autoplay=1&mute=1',
    ytLink: 'https://www.youtube.com/channel/UCQfwfsi5VrQ8yKZ-UWmAEFg/live',
  },
  {
    id: 'wion',
    label: 'WION',
    flag: '🇮🇳',
    color: '#34d399',
    embedUrl: 'https://www.youtube.com/embed/live_stream?channel=UC_gUM8rL-LrgXIGeIuRsBiw&autoplay=1&mute=1',
    ytLink: 'https://www.youtube.com/channel/UC_gUM8rL-LrgXIGeIuRsBiw/live',
  },
  {
    id: 'ntv',
    label: 'NTV Telugu',
    flag: '🇮🇳',
    color: '#ef4444',
    embedUrl: 'https://www.youtube.com/embed/live_stream?channel=UCJzEZh2A6kGfW4sD5F3D1iA&autoplay=1&mute=1',
    ytLink: 'https://www.youtube.com/channel/UCJzEZh2A6kGfW4sD5F3D1iA/live',
  },
]

export default function LiveNewsFeed() {
  const [activeChannel, setActiveChannel] = useState(CHANNELS[0])

  return (
    <section className="mt-3 rounded-xl border border-slate-600/40 bg-[#031122]/90 p-4">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Tv size={14} className="text-red-400" />
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-200">
            YouTube Live News
          </h3>
          <span className="flex items-center gap-1 rounded-full bg-red-500/15 px-2 py-0.5 text-[9px] uppercase tracking-wider text-red-400 border border-red-500/30">
            <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse inline-block" />
            Live
          </span>
        </div>
        <a
          href={activeChannel.ytLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-[10px] text-slate-500 hover:text-slate-300 transition-colors"
        >
          <ExternalLink size={10} /> Open on YouTube
        </a>
      </div>

      {/* Channel selector tabs */}
      <div className="mb-3 flex flex-wrap gap-1.5">
        {CHANNELS.map(ch => (
          <button
            key={ch.id}
            onClick={() => setActiveChannel(ch)}
            style={activeChannel.id === ch.id
              ? { borderColor: ch.color, color: ch.color, background: `${ch.color}18` }
              : {}}
            className={[
              'rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-wider transition-all duration-200',
              activeChannel.id === ch.id
                ? 'shadow-md'
                : 'border-slate-700 text-slate-500 hover:border-slate-500 hover:text-slate-300'
            ].join(' ')}
          >
            {ch.flag} {ch.label}
          </button>
        ))}
      </div>

      {/* Embed - 5x5 inches approx (480x480px) */}
      <div className="mx-auto relative overflow-hidden rounded-lg border border-slate-700/60 bg-black" style={{ width: '100%', maxWidth: '480px', height: '480px' }}>
        <iframe
          key={activeChannel.id}
          src={activeChannel.embedUrl}
          title={`${activeChannel.label} Live`}
          className="absolute inset-0 h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>

      <p className="mt-2 text-[9px] text-slate-600">
        Streaming via YouTube. If blocked, click "Open on YouTube" above. ·{' '}
        <span style={{ color: activeChannel.color }}>{activeChannel.flag} {activeChannel.label}</span>
      </p>
    </section>
  )
}
