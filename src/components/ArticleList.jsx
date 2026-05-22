import { Newspaper } from 'lucide-react';
import { NEWS_IMAGE_FALLBACK } from '../constants';

export default function ArticleList({ news, openNewsDetails, setArticleLimit }) {
  return (
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
  );
}
