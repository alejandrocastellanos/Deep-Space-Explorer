import { useState, useEffect, useRef } from 'react'
import { useNASASearch } from '../hooks/useNASASearch'
import MediaCard from '../components/MediaCard'
import { useLanguage } from '../contexts/LanguageContext'
import { t } from '../i18n/translations'

function CardSkeleton() {
  return (
    <div className="bg-surface-container glass-panel p-4 h-[480px] flex flex-col animate-pulse">
      <div className="bg-surface-container-highest h-[70%] mb-4" />
      <div className="space-y-2 flex-1">
        <div className="h-4 bg-surface-container-highest w-3/4" />
        <div className="h-3 bg-surface-container-highest w-1/2" />
      </div>
    </div>
  )
}

export default function Explorer({ favCtx }) {
  const [input, setInput] = useState('earth artemis II')
  const [query, setQuery] = useState('earth artemis II')
  const [mediaType, setMediaType] = useState('image,video')
  const debounceRef = useRef(null)
  const { data: results, isLoading, isError } = useNASASearch({ query, mediaType })
  const { lang } = useLanguage()
  const tr = t[lang].explorer

  const FILTERS = [
    { label: tr.filterAll,    value: 'image,video' },
    { label: tr.filterImages, value: 'image' },
    { label: tr.filterVideos, value: 'video' },
  ]

  // Debounce 500ms
  useEffect(() => {
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => setQuery(input.trim()), 500)
    return () => clearTimeout(debounceRef.current)
  }, [input])

  return (
    <div className="space-grid-bg min-h-[calc(100vh-64px-36px)] px-6 md:px-10 pt-10 pb-12">

      {/* Header */}
      <section className="mb-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-8">
          <div className="space-y-1">
            <span className="font-label text-secondary-container text-xs tracking-[0.2em] uppercase">
              {tr.breadcrumb}
            </span>
            <h1 className="text-4xl md:text-5xl font-headline font-bold uppercase tracking-tight text-on-surface">
              {tr.title}
            </h1>
          </div>

          {/* Search bar */}
          <div className="relative group w-full md:w-80">
            <div className="hud-bracket-tl" /><div className="hud-bracket-tr" />
            <div className="hud-bracket-bl" /><div className="hud-bracket-br" />
            <div className="flex items-center bg-surface-container-low px-4 py-3 gap-3 border border-secondary-container/20 focus-within:border-secondary-container/70 transition-all duration-300 shadow-[0_0_15px_rgba(0,244,254,0.04)] focus-within:shadow-[0_0_20px_rgba(0,244,254,0.15)]">
              <span className="material-symbols-outlined text-secondary-container/50 text-xl">search</span>
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder={tr.placeholder}
                className="bg-transparent border-none outline-none text-sm font-label uppercase tracking-widest text-on-surface placeholder:text-on-surface-variant/30 w-full"
              />
              {input && (
                <button onClick={() => setInput('')} className="material-symbols-outlined text-on-surface-variant/40 hover:text-error transition-colors text-lg">
                  close
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-px bg-surface-container-highest/20 p-1 border border-outline-variant/30 w-fit">
          {FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => setMediaType(f.value)}
              className={`px-6 py-2 font-label text-[10px] tracking-widest uppercase transition-all ${
                mediaType === f.value
                  ? 'bg-secondary-container text-on-secondary-container shadow-[0_0_15px_rgba(0,244,254,0.3)]'
                  : 'text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </section>

      {/* States */}
      {!query && (
        <div className="flex flex-col items-center justify-center py-32 text-center space-y-4">
          <span className="material-symbols-outlined text-on-surface-variant/20 text-8xl">travel_explore</span>
          <p className="font-label text-on-surface-variant/40 text-sm tracking-widest uppercase">
            {tr.emptyQuery}
          </p>
        </div>
      )}

      {query && isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      )}

      {query && isError && (
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
          <span className="material-symbols-outlined text-error text-6xl">signal_disconnected</span>
          <p className="font-label text-error/70 text-sm tracking-widest uppercase">{tr.error}</p>
        </div>
      )}

      {query && !isLoading && !isError && results?.length === 0 && (
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
          <span className="material-symbols-outlined text-on-surface-variant/20 text-8xl">search_off</span>
          <p className="font-label text-on-surface-variant/40 text-sm tracking-widest uppercase">
            {tr.noResults} "{query}"
          </p>
        </div>
      )}

      {results?.length > 0 && !isLoading && (
        <>
          <div className="mb-6 font-label text-[10px] text-secondary-container/50 tracking-[0.2em] uppercase">
            {results.length} ASSETS_RETRIEVED // QUERY: "{query}"
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map((item, i) => (
              <MediaCard
                key={item.id}
                {...item}
                index={i}
                isFavorite={favCtx?.isFavorite(item.id)}
                onFavoriteToggle={favCtx?.toggleFavorite}
              />
            ))}
          </div>
        </>
      )}

      {/* Footer metadata */}
      {results?.length > 0 && (
        <footer className="mt-14 pt-6 border-t border-cyan-900/30 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-6">
            <div className="flex flex-col">
              <span className="font-label text-[10px] text-on-surface-variant/40 tracking-[0.2em] uppercase">{tr.bufferStatus}</span>
              <div className="w-28 h-1 bg-surface-container-highest mt-1 relative overflow-hidden">
                <div className="absolute top-0 left-0 h-full w-[88%] bg-secondary-container" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-label text-[10px] text-on-surface-variant/40 tracking-[0.2em] uppercase">{tr.signal}</span>
              <span className="text-secondary-container font-label text-xs mt-1">94.3 dBm // STABLE</span>
            </div>
          </div>
          <div className="font-label text-[10px] text-on-surface-variant/30 tracking-[0.3em] uppercase">
            © 2024 ASTRAL MISSION CONTROL
          </div>
        </footer>
      )}
    </div>
  )
}
