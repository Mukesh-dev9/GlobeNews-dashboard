import { forwardRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { 
  MessageCircle, 
  X, 
  Globe, 
  Database, 
  BookOpen, 
  Sparkles, 
  Check, 
  Loader2, 
  Copy, 
  ExternalLink, 
  CornerDownLeft, 
  Search,
  ShieldCheck
} from 'lucide-react';

const ChatAssistant = forwardRef(({
  chatOpen,
  setChatOpen,
  chatMessages,
  chatLoading,
  chatInput,
  setChatInput,
  askWebAssistant,
  chatMode,
  setChatMode,
  chatSearchSteps
}, ref) => {
  const [copiedId, setCopiedId] = useState(null);

  const getDomain = (urlStr) => {
    try {
      return new URL(urlStr).hostname.replace('www.', '');
    } catch {
      return 'web-source';
    }
  };

  const handleCopy = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedId(idx);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const triggerSuggestion = (suggestionText) => {
    setChatInput(suggestionText);
    askWebAssistant(suggestionText);
  };

  const formatMessageContent = (text) => {
    if (!text) return null;
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      let processed = line;
      
      // Check if line is bullet point
      const isBullet = line.trim().startsWith('•') || line.trim().startsWith('*');
      if (isBullet) {
        processed = line.trim().substring(1).trim();
      }
      
      // Parse bold text **word**
      const parts = processed.split(/(\*\*.*?\*\*)/g);
      const elements = parts.map((part, pIdx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={pIdx} className="font-semibold text-cyan-300">{part.slice(2, -2)}</strong>;
        }
        return part;
      });

      if (isBullet) {
        return (
          <li key={idx} className="ml-4 list-disc pl-1 my-1 text-slate-300 text-xs">
            {elements}
          </li>
        );
      }

      if (line.trim() === '') {
        return <div key={idx} className="h-2" />;
      }

      return (
        <p key={idx} className="my-1 text-slate-200 text-xs leading-relaxed">
          {elements}
        </p>
      );
    });
  };

  // Quick Suggestion Prompts
  const suggestions = [
    { label: '🚀 Spaceflight', text: 'What are the latest Spaceflight missions and rockets?' },
    { label: '🌿 Climate', text: 'What is the latest news in green energy and climate?' },
    { label: '🛰️ Satellites', text: 'How are satellites helping monitor global climate changes?' },
    { label: '🌍 Deep Space', text: 'What are NASA\'s recent deep space discoveries?' }
  ];

  return (
    <div className="fixed bottom-5 right-5 z-50">
      <AnimatePresence>
        {chatOpen && (
          <motion.section
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="mb-4 flex h-[540px] w-[min(92vw,440px)] flex-col rounded-2xl border border-cyan-500/30 bg-[#020914]/95 shadow-[0_0_35px_rgba(6,182,212,0.25)] backdrop-blur-xl"
          >
            {/* Header */}
            <header className="flex items-center justify-between border-b border-slate-800/80 px-4 py-3 flex-shrink-0">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <div className="absolute -inset-1 rounded-full bg-cyan-500/20 blur-sm animate-pulse" />
                  <Sparkles size={16} className="relative text-cyan-400" />
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-100">
                    GlobeNews AI Search
                  </h3>
                  <p className="text-[10px] text-slate-400 flex items-center gap-1">
                    <ShieldCheck size={10} className="text-emerald-400" /> Powered by Live Web & DB
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setChatOpen(false)}
                className="rounded-lg border border-slate-800 bg-slate-900/50 p-1.5 text-slate-400 transition hover:bg-slate-800 hover:text-slate-100"
                aria-label="Close chat"
              >
                <X size={14} />
              </button>
            </header>

            {/* Search Mode Tab Bar */}
            <section className="flex border-b border-slate-900 bg-slate-950/40 p-2 gap-1.5 flex-shrink-0">
              {[
                { id: 'hybrid', label: 'Deep Search', icon: Globe, color: 'text-cyan-400' },
                { id: 'dashboard', label: 'Dashboard Focus', icon: Database, color: 'text-amber-400' },
                { id: 'web', label: 'Web News', icon: Search, color: 'text-purple-400' },
              ].map((mode) => {
                const isActive = chatMode === mode.id;
                const Icon = mode.icon;
                return (
                  <button
                    key={mode.id}
                    onClick={() => setChatMode(mode.id)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[10px] font-semibold tracking-wide uppercase transition-all duration-300 ${
                      isActive
                        ? 'bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.15)]'
                        : 'border border-transparent bg-transparent text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                    }`}
                  >
                    <Icon size={12} className={mode.color} />
                    {mode.label}
                  </button>
                );
              })}
            </section>

            {/* Chat Area */}
            <div
              ref={ref}
              className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-cyan-500/20 scrollbar-track-transparent"
            >
              {chatMessages.map((msg, idx) => {
                const isUser = msg.role === 'user';
                return (
                  <div
                    key={`${msg.role}-${idx}`}
                    className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} group`}
                  >
                    <div
                      className={`relative max-w-[85%] rounded-xl px-3.5 py-2.5 shadow-md transition-all duration-300 ${
                        isUser
                          ? 'bg-gradient-to-r from-cyan-600/20 to-blue-600/20 border border-cyan-500/30 text-cyan-50 rounded-tr-none'
                          : 'bg-slate-900/50 border border-slate-800/80 text-slate-200 rounded-tl-none'
                      }`}
                    >
                      {/* Copy Action Button */}
                      {!isUser && (
                        <button
                          onClick={() => handleCopy(msg.content, idx)}
                          className="absolute -top-2.5 -right-2.5 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-950 border border-slate-800 rounded p-1 hover:border-cyan-500/40 text-slate-400 hover:text-cyan-300 shadow"
                          title="Copy to clipboard"
                        >
                          {copiedId === idx ? <Check size={10} className="text-emerald-400" /> : <Copy size={10} />}
                        </button>
                      )}

                      {/* Content Formatter */}
                      <div className="space-y-1">
                        {formatMessageContent(msg.content)}
                      </div>
                    </div>

                    {/* Reference Sources Scroll Row */}
                    {!isUser && msg.sources && msg.sources.length > 0 && (
                      <div className="mt-2 w-full max-w-[95%]">
                        <p className="text-[9px] font-bold uppercase tracking-wider text-cyan-400/70 mb-1.5 flex items-center gap-1">
                          <BookOpen size={10} /> Sources & References
                        </p>
                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                          {msg.sources.map((source, sIdx) => {
                            const domain = getDomain(source.url);
                            return (
                              <a
                                key={sIdx}
                                href={source.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex w-36 shrink-0 flex-col gap-1 rounded-lg border border-slate-800 bg-slate-950/70 p-2 hover:border-cyan-500/40 hover:bg-slate-900/60 transition-all duration-300"
                              >
                                <div className="flex items-center gap-1.5">
                                  <img
                                    src={`https://www.google.com/s2/favicons?sz=32&domain=${domain}`}
                                    onError={(e) => { e.target.src = 'https://www.google.com/s2/favicons?sz=32&domain=wikipedia.org' }}
                                    alt="favicon"
                                    className="h-3 w-3 rounded"
                                  />
                                  <span className="truncate text-[8px] font-semibold uppercase tracking-wider text-slate-400">
                                    {source.source}
                                  </span>
                                </div>
                                <h4 className="line-clamp-1 text-[9px] font-bold text-slate-200">
                                  {source.title}
                                </h4>
                                <p className="line-clamp-2 text-[8px] leading-tight text-slate-400">
                                  {source.snippet}
                                </p>
                              </a>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Dynamic Search Stepper */}
              {chatLoading && chatSearchSteps && chatSearchSteps.length > 0 && (
                <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-3 space-y-2 border-dashed">
                  <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider text-cyan-400">
                    <Loader2 size={10} className="animate-spin text-cyan-400" />
                    Executing Real-Time Query
                  </div>
                  <div className="space-y-1.5">
                    {chatSearchSteps.map((step) => {
                      return (
                        <div key={step.id} className="flex items-center gap-2 text-[10px]">
                          {step.status === 'searching' && (
                            <Loader2 size={11} className="animate-spin text-cyan-400 shrink-0" />
                          )}
                          {step.status === 'success' && (
                            <Check size={11} className="text-emerald-400 shrink-0" />
                          )}
                          {step.status === 'error' && (
                            <X size={11} className="text-red-400 shrink-0" />
                          )}
                          {step.status === 'pending' && (
                            <div className="h-2 w-2 rounded-full border border-slate-700 shrink-0" />
                          )}
                          <span className={`transition-colors duration-300 ${
                            step.status === 'searching' ? 'text-cyan-300 font-medium' :
                            step.status === 'success' ? 'text-slate-300' :
                            step.status === 'error' ? 'text-slate-500 line-through' :
                            'text-slate-600'
                          }`}>
                            {step.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Quick suggestion Prompts Grid */}
              {chatMessages.length <= 1 && !chatLoading && (
                <div className="mt-6 space-y-3">
                  <p className="text-[10px] text-center text-slate-500 font-medium tracking-wide">
                    Suggested topics to explore in real-time search:
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {suggestions.map((s, sIdx) => (
                      <button
                        key={sIdx}
                        onClick={() => triggerSuggestion(s.text)}
                        className="flex flex-col items-start rounded-xl border border-slate-800/80 bg-slate-900/20 p-2.5 text-left hover:border-cyan-500/40 hover:bg-cyan-500/5 transition-all duration-300"
                      >
                        <span className="text-[10px] font-bold text-cyan-300 uppercase tracking-wider mb-0.5">
                          {s.label}
                        </span>
                        <span className="line-clamp-2 text-[9px] leading-snug text-slate-400">
                          {s.text}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Input Bar */}
            <div className="p-3 border-t border-slate-900/60 bg-slate-950/20 flex-shrink-0">
              <div className="relative flex items-center">
                <input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') askWebAssistant();
                  }}
                  disabled={chatLoading}
                  placeholder={
                    chatMode === 'dashboard' ? "Search dashboard database..." :
                    chatMode === 'web' ? "Search live web news & events..." :
                    "Deep search live web & database..."
                  }
                  className="w-full rounded-xl border border-slate-800 bg-[#040c1a] pl-3 pr-10 py-2.5 text-xs text-slate-100 outline-none ring-cyan-500/50 placeholder:text-slate-500 transition focus:border-cyan-500/50 focus:ring-1 disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => askWebAssistant()}
                  disabled={chatLoading || !chatInput.trim()}
                  className="absolute right-1.5 rounded-lg border border-cyan-400/40 bg-cyan-500/10 p-1.5 text-cyan-300 transition hover:bg-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Send query"
                >
                  {chatLoading ? (
                    <Loader2 size={13} className="animate-spin text-cyan-300" />
                  ) : (
                    <CornerDownLeft size={13} />
                  )}
                </button>
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Floating Trigger Toggle Badge Button */}
      <button
        type="button"
        onClick={() => setChatOpen((prev) => !prev)}
        className="ml-auto inline-flex h-12 w-12 items-center justify-center rounded-full border border-cyan-400/50 bg-[#030f20]/90 text-cyan-300 shadow-[0_0_20px_rgba(6,182,212,0.45)] transition hover:bg-cyan-500/20 hover:scale-105"
        aria-label="Toggle chat assistant"
      >
        <MessageCircle size={20} className="text-cyan-400" />
      </button>
    </div>
  );
});

ChatAssistant.displayName = 'ChatAssistant';

export default ChatAssistant;
