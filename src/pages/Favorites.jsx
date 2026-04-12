import { motion } from 'framer-motion'
import MediaCard from '../components/MediaCard'
import { useLanguage } from '../contexts/LanguageContext'
import { t } from '../i18n/translations'

export default function Favorites({ favCtx }) {
  const { favorites, toggleFavorite, isFavorite } = favCtx ?? {}
  const { lang } = useLanguage()
  const tr = t[lang].favorites

  return (
    <div className="space-grid-bg min-h-[calc(100vh-64px-36px)] px-6 md:px-10 pt-10 pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10 border-b border-surface-container-highest pb-8">
        <div className="space-y-1">
          <span className="font-label text-secondary-container text-xs tracking-[0.2em] uppercase">
            {tr.breadcrumb}
          </span>
          <h1 className="text-4xl md:text-5xl font-headline font-bold uppercase tracking-tight text-on-surface">
            {tr.title}
          </h1>
        </div>
        {favorites?.length > 0 && (
          <div className="px-5 py-3 bg-surface-container border-l-4 border-secondary-container">
            <div className="font-label text-[10px] text-secondary-container/70 mb-1 uppercase tracking-[0.2em]">{tr.savedAssets}</div>
            <div className="font-headline text-3xl font-bold text-secondary-container leading-none">{favorites.length}</div>
          </div>
        )}
      </div>

      {(!favorites || favorites.length === 0) ? (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col items-center justify-center py-36 text-center space-y-4"
        >
          <span
            className="material-symbols-outlined text-on-surface-variant/20 text-8xl"
            style={{ fontVariationSettings: "'FILL' 0" }}
          >
            favorite
          </span>
          <p className="font-label text-on-surface-variant/40 text-sm tracking-widest uppercase">
            {tr.empty}
          </p>
          <p className="font-body text-on-surface-variant/30 text-sm">
            {tr.emptyHint}
          </p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((item, i) => (
            <MediaCard
              key={item.id}
              {...item}
              index={i}
              isFavorite={isFavorite?.(item.id)}
              onFavoriteToggle={toggleFavorite}
            />
          ))}
        </div>
      )}
    </div>
  )
}
