import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useNASAAsset } from '../hooks/useNASAAsset'
import { useLanguage } from '../contexts/LanguageContext'
import { t } from '../i18n/translations'
import { useTranslate } from '../hooks/useTranslate'

function formatDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

export default function MediaModal({ item, onClose }) {
  const isVideo = item?.mediaType === 'video'
  const { data: asset, isLoading } = useNASAAsset(item?.id)
  const { lang } = useLanguage()
  const tr = t[lang].mediaModal
  const { translated: titleTr } = useTranslate(item?.title, lang)
  const { translated: descTr, isLoading: translating } = useTranslate(item?.description, lang)

  // Close on Escape
  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  const imgSrc = asset?.image || item?.thumbnail
  const videoSrc = asset?.video

  return createPortal(
    <AnimatePresence>
      {item && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="fixed inset-0 z-[201] flex items-center justify-center p-4 md:p-10 pointer-events-none"
          >
            <div className="relative w-full max-w-5xl max-h-[90vh] bg-surface-container glass-panel flex flex-col overflow-hidden pointer-events-auto">

              {/* HUD corners */}
              <div className="hud-bracket-tl" /><div className="hud-bracket-tr" />
              <div className="hud-bracket-bl" /><div className="hud-bracket-br" />

              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-3 right-3 z-10 text-on-surface-variant hover:text-secondary-container transition-colors p-1 flicker-effect"
                aria-label="Close"
              >
                <span className="material-symbols-outlined text-2xl">close</span>
              </button>

              {/* Media area */}
              <div className="relative w-full bg-black flex items-center justify-center" style={{ maxHeight: '60vh' }}>
                {isLoading && (
                  <div className="flex flex-col items-center justify-center py-24 w-full animate-pulse space-y-3">
                    <span className="material-symbols-outlined text-secondary-container/30 text-6xl">
                      {isVideo ? 'smart_display' : 'image'}
                    </span>
                    <p className="font-label text-secondary-container/40 text-xs tracking-widest uppercase">
                      {isVideo ? tr.loadingVideo : tr.loadingImage}
                    </p>
                  </div>
                )}

                {!isLoading && isVideo && videoSrc && (
                  <video
                    src={videoSrc}
                    controls
                    autoPlay
                    className="w-full max-h-[60vh] object-contain"
                    style={{ background: '#000' }}
                  />
                )}

                {!isLoading && isVideo && !videoSrc && (
                  <div className="flex flex-col items-center justify-center py-20 w-full space-y-4">
                    <span className="material-symbols-outlined text-on-surface-variant/30 text-6xl">smart_display</span>
                    <p className="font-label text-on-surface-variant/50 text-xs tracking-widest uppercase">
                      {tr.videoUnavailable}
                    </p>
                    <a
                      href={`https://images.nasa.gov/details/${item.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-6 py-2 bg-surface-container border border-secondary-container font-label text-xs tracking-widest uppercase text-secondary-container hover:bg-secondary-container/20 transition-colors"
                    >
                      {tr.openNasa}
                    </a>
                  </div>
                )}

                {!isLoading && !isVideo && imgSrc && (
                  <img
                    src={imgSrc}
                    alt={item.title}
                    className="w-full max-h-[60vh] object-contain"
                  />
                )}
              </div>

              {/* Info area */}
              <div className="p-6 overflow-y-auto flex-1">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 font-label text-[10px] tracking-[0.15em] border ${
                        isVideo
                          ? 'bg-tertiary-container/20 text-tertiary-container border-tertiary-container/40'
                          : 'bg-secondary-container/20 text-secondary-container border-secondary-container/40'
                      }`}>
                        {item.mediaType?.toUpperCase()}
                      </span>
                      <span className="font-label text-[10px] text-on-surface-variant/50 tracking-widest uppercase">
                        {formatDate(item.date)}
                      </span>
                    </div>
                    <h2 className="text-xl md:text-2xl font-headline font-bold text-on-surface leading-tight">
                      {titleTr}
                    </h2>
                  </div>

                  <a
                    href={`https://images.nasa.gov/details/${item.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 px-4 py-2 bg-surface-container-high border border-outline-variant/30 font-label text-[10px] tracking-widest uppercase text-on-surface-variant hover:text-secondary-container hover:border-secondary-container transition-colors"
                  >
                    {tr.nasaLink}
                  </a>
                </div>

                {item.description && (
                  translating ? (
                    <div className="space-y-2 animate-pulse">
                      <div className="h-3 bg-surface-container-highest w-full" />
                      <div className="h-3 bg-surface-container-highest w-full" />
                      <div className="h-3 bg-surface-container-highest w-2/3" />
                    </div>
                  ) : (
                    <p className="font-body text-on-surface-variant text-sm leading-relaxed">{descTr}</p>
                  )
                )}

                {/* Asset ID */}
                <div className="mt-4 pt-4 border-t border-outline-variant/20">
                  <span className="font-label text-[10px] text-on-surface-variant/40 tracking-widest uppercase">
                    NASA_ID: {item.id}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  )
}
