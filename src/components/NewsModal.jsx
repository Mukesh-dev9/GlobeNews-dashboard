import { X } from 'lucide-react';
import { NEWS_IMAGE_FALLBACK } from '../constants';

export default function NewsModal({ selectedNews, newsDetails, detailLoading, closeModal }) {
  if (!selectedNews) return null;

  return (
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
  );
}
