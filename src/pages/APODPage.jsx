import { useState } from 'react'
import { motion } from 'framer-motion'
import { useAPOD } from '../hooks/useAPOD'
import { useLanguage } from '../contexts/LanguageContext'
import { t } from '../i18n/translations'
import { useTranslate } from '../hooks/useTranslate'

function formatDate(dateStr) {
  if (!dateStr) return ''
  const [y, m, d] = dateStr.split('-')
  return `${d}.${m}.${y}`
}

function APODSkeleton() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-5xl space-y-6 animate-pulse px-8">
        <div className="h-3 w-48 bg-surface-container-highest" />
        <div className="h-[60vh] w-full bg-surface-container-highest" />
        <div className="h-8 w-2/3 bg-surface-container-highest" />
        <div className="space-y-2">
          <div className="h-3 w-full bg-surface-container-highest" />
          <div className="h-3 w-full bg-surface-container-highest" />
          <div className="h-3 w-3/4 bg-surface-container-highest" />
        </div>
      </div>
    </div>
  )
}

function APODError({ message }) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4 p-8 bg-surface-container glass-panel relative max-w-md">
        <div className="hud-bracket-tl" /><div className="hud-bracket-tr" />
        <div className="hud-bracket-bl" /><div className="hud-bracket-br" />
        <span className="material-symbols-outlined text-error text-5xl">satellite_alt</span>
        <p className="font-label text-xs text-secondary-container tracking-widest uppercase">SIGNAL_LOST // APOD_API</p>
        <p className="font-body text-on-surface-variant text-sm">{message}</p>
      </div>
    </div>
  )
}

export default function APODPage() {
  const { data, isLoading, isError, error } = useAPOD()
  const [imgLoaded, setImgLoaded] = useState(false)
  const { lang } = useLanguage()
  const tr = t[lang].apod
  const isVideo = data?.media_type === 'video'
  const { translated: title } = useTranslate(data?.title, lang)
  const { translated: explanation, isLoading: translating } = useTranslate(data?.explanation, lang)

  if (isLoading) return <APODSkeleton />
  if (isError) return <APODError message={error?.message ?? 'Failed to fetch APOD'} />

  return (
    <div className="min-h-screen pb-16">
      {/* Page header */}
      <div className="px-8 md:px-16 pt-8 pb-6 border-b border-outline-variant/20 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-label text-[10px] text-secondary/50 tracking-[0.3em] uppercase mb-1">
            {tr.header}
          </p>
          <h1
            className="font-headline font-black uppercase tracking-tight text-on-surface leading-none"
            style={{ fontSize: 'clamp(1.8rem, 4vw, 3.5rem)' }}
          >
            APOD
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-secondary-container animate-pulse shadow-[0_0_8px_rgba(0,244,254,0.8)]" />
          <span className="font-label text-xs text-secondary-container tracking-[0.2em] uppercase">
            {formatDate(data?.date)}
          </span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-8 md:px-16 pt-10 space-y-10">
        {/* Media */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative w-full bg-black glass-panel overflow-hidden"
          style={{ minHeight: '55vh' }}
        >
          <div className="hud-bracket-tl" /><div className="hud-bracket-tr" />
          <div className="hud-bracket-bl" /><div className="hud-bracket-br" />

          {/* HUD metadata overlay */}
          <div className="absolute top-4 left-4 z-10 font-label text-[9px] text-secondary/40 tracking-[0.2em] flex flex-col gap-1">
            <span>SOURCE: NASA_APOD_API</span>
            <span>DATE: {data?.date}</span>
            <span>TYPE: {data?.media_type?.toUpperCase()}</span>
          </div>

          {isVideo ? (
            <iframe
              src={data.url}
              title={data.title}
              className="w-full"
              style={{ minHeight: '55vh' }}
              allow="autoplay; encrypted-media"
              allowFullScreen
            />
          ) : (
            <>
              {!imgLoaded && (
                <div className="absolute inset-0 flex items-center justify-center animate-pulse">
                  <span className="material-symbols-outlined text-secondary-container/20 text-8xl">image</span>
                </div>
              )}
              <img
                src={data.hdurl || data.url}
                alt={data.title}
                onLoad={() => setImgLoaded(true)}
                className="w-full object-contain"
                style={{ maxHeight: '80vh', display: imgLoaded ? 'block' : 'none' }}
              />
            </>
          )}
        </motion.div>

        {/* Info */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid md:grid-cols-3 gap-8"
        >
          {/* Title + explanation */}
          <div className="md:col-span-2 space-y-5">
            <h2
              className="font-headline font-black text-on-surface glow-text uppercase tracking-tight leading-tight"
              style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.8rem)' }}
            >
              {title}
            </h2>
            {translating ? (
              <div className="space-y-2 animate-pulse">
                <div className="h-3 bg-surface-container-highest w-full" />
                <div className="h-3 bg-surface-container-highest w-full" />
                <div className="h-3 bg-surface-container-highest w-3/4" />
              </div>
            ) : (
              <p className="font-body text-on-surface-variant text-sm leading-relaxed">{explanation}</p>
            )}
          </div>

          {/* Metadata panel */}
          <div className="space-y-4">
            <div className="bg-surface-container glass-panel p-5 space-y-4 relative">
              <div className="hud-bracket-tl" /><div className="hud-bracket-tr" />
              <div className="hud-bracket-bl" /><div className="hud-bracket-br" />

              <p className="font-label text-[9px] text-secondary/40 tracking-[0.25em] uppercase">{tr.missionData}</p>

              <div className="space-y-3 divide-y divide-outline-variant/20">
                <div className="pb-3">
                  <p className="font-label text-[9px] text-on-surface-variant/50 tracking-widest uppercase mb-1">{tr.date}</p>
                  <p className="font-headline font-bold text-secondary-container text-sm">{formatDate(data.date)}</p>
                </div>
                <div className="py-3">
                  <p className="font-label text-[9px] text-on-surface-variant/50 tracking-widest uppercase mb-1">{tr.mediaType}</p>
                  <p className="font-headline font-bold text-primary text-sm">{data.media_type?.toUpperCase()}</p>
                </div>
                {data.copyright && (
                  <div className="py-3">
                    <p className="font-label text-[9px] text-on-surface-variant/50 tracking-widest uppercase mb-1">{tr.copyright}</p>
                    <p className="font-body text-on-surface-variant text-xs">{data.copyright}</p>
                  </div>
                )}
                <div className="pt-3">
                  <p className="font-label text-[9px] text-on-surface-variant/50 tracking-widest uppercase mb-1">{tr.source}</p>
                  <p className="font-label text-[10px] text-secondary/60">NASA_APOD_API</p>
                </div>
              </div>
            </div>

            {/* CTA */}
            {!isVideo && (data.hdurl || data.url) && (
              <a
                href={data.hdurl || data.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative flex items-center justify-center gap-2 px-6 py-4 bg-surface-container border border-secondary-container transition-all duration-300 hover:bg-secondary-container/20 flicker-effect w-full"
              >
                <span className="material-symbols-outlined text-secondary-container text-base">open_in_full</span>
                <span className="font-label font-bold text-secondary tracking-[0.25em] uppercase text-xs">
                  {tr.viewHD}
                </span>
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-[0_0_20px_rgba(0,244,254,0.3)]" />
              </a>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
