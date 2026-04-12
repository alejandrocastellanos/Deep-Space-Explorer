import { useState } from 'react'
import { motion } from 'framer-motion'
import MediaModal from './MediaModal'
import { useLanguage } from '../contexts/LanguageContext'
import { t } from '../i18n/translations'
import { useTranslate } from '../hooks/useTranslate'

function formatDate(iso) {
  if (!iso) return ''
  return new Date(iso).toISOString().replace('T', ' // ').slice(0, 22) + '_UTC'
}

export const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, delay: i * 0.06, ease: 'easeOut' },
  }),
}

export default function MediaCard({ id, title, description, mediaType, thumbnail, date, onFavoriteToggle, isFavorite, index = 0 }) {
  const [imgError, setImgError] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const { lang } = useLanguage()
  const tr = t[lang].mediaCard
  const isVideo = mediaType === 'video'
  const item = { id, title, description, mediaType, thumbnail, date }
  const { translated: titleTr } = useTranslate(title, lang)
  const { translated: descTr } = useTranslate(description, lang)

  return (
    <>
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        custom={index}
        onClick={() => setModalOpen(true)}
        className={`group relative bg-surface-container glass-panel p-4 flex flex-col h-[480px] transition-all duration-500 hover:-translate-y-1 overflow-hidden cursor-pointer ${
          isVideo
            ? 'hover:shadow-[0_0_30px_rgba(134,0,64,0.2)] hover:border-tertiary-container/50'
            : 'hover:shadow-[0_0_30px_rgba(0,244,254,0.2)] hover:border-secondary-container/50'
        }`}
      >
        {/* Image area */}
        <div className="relative h-[70%] overflow-hidden mb-4">
          {thumbnail && !imgError ? (
            <img
              src={thumbnail}
              alt={title}
              loading="lazy"
              onError={() => setImgError(true)}
              className="w-full h-full object-cover group-hover:scale-105 transition-all duration-700"
            />
          ) : (
            <div className="w-full h-full bg-surface-container-low flex items-center justify-center">
              <span className="material-symbols-outlined text-on-surface-variant/30 text-5xl">
                {isVideo ? 'smart_display' : 'image'}
              </span>
            </div>
          )}

          {/* Type badge */}
          <div className="absolute top-3 right-3 z-10">
            <span className={`px-3 py-1 font-label text-[10px] tracking-[0.15em] border ${
              isVideo
                ? 'bg-tertiary-container/20 text-tertiary-container border-tertiary-container/40'
                : 'bg-secondary-container/20 text-secondary-container border-secondary-container/40'
            }`}>
              {mediaType.toUpperCase()}
            </span>
          </div>

          {/* Video play button */}
          {isVideo && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 group-hover:scale-110 group-hover:bg-white/20 transition-all duration-300">
                <span className="material-symbols-outlined text-white text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                  play_arrow
                </span>
              </div>
            </div>
          )}

          {/* Image: click to expand hint */}
          {!isVideo && (
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="w-12 h-12 bg-black/50 backdrop-blur-md flex items-center justify-center border border-secondary-container/40">
                <span className="material-symbols-outlined text-secondary-container text-xl">zoom_in</span>
              </div>
            </div>
          )}

          {/* Hover description overlay */}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            <p className="text-on-surface-variant text-xs leading-relaxed line-clamp-3">
              {descTr || 'Click to view full details.'}
            </p>
          </div>
        </div>

        {/* Card body */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex justify-between items-start mb-2 gap-2">
            <h3 className={`text-base font-headline font-bold text-on-surface line-clamp-2 transition-colors ${
              isVideo ? 'group-hover:text-tertiary' : 'group-hover:text-secondary-container'
            }`}>
              {titleTr}
            </h3>
            {/* Favorite — stop propagation so click doesn't open modal */}
            <button
              onClick={e => { e.stopPropagation(); onFavoriteToggle?.(item) }}
              className={`shrink-0 material-symbols-outlined transition-colors text-xl ${
                isFavorite ? 'text-tertiary' : 'text-on-surface-variant/40 hover:text-tertiary'
              }`}
              style={isFavorite ? { fontVariationSettings: "'FILL' 1" } : {}}
              aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              favorite
            </button>
          </div>

          <p className="font-label text-[10px] text-on-surface-variant/60 tracking-[0.1em] uppercase truncate">
            {formatDate(date)}
          </p>

          <div className="mt-auto pt-3 border-t border-outline-variant/20 flex justify-between items-center">
            <span className={`text-[10px] font-label uppercase tracking-widest ${isVideo ? 'text-tertiary-container/70' : 'text-secondary-container/50'}`}>
              {isVideo ? tr.clickToPlay : tr.clickToExpand}
            </span>
            <span className="material-symbols-outlined text-on-surface-variant/30 text-base">open_in_full</span>
          </div>
        </div>
      </motion.div>

      {/* Modal */}
      {modalOpen && (
        <MediaModal item={item} onClose={() => setModalOpen(false)} />
      )}
    </>
  )
}
