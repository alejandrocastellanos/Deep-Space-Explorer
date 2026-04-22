import { lazy, Suspense, useState, useEffect, useMemo } from 'react'
import { useISSPosition } from '../hooks/useISSPosition'
import { useSatelliteCatalog } from '../hooks/useSatelliteCatalog'
import { useLanguage } from '../contexts/LanguageContext'
import { t } from '../i18n/translations'
import { SAT_GROUPS } from '../api/celestrakApi'

const ISSGlobe3D = lazy(() => import('../components/ISSGlobe3D'))

// All categories active by default
const DEFAULT_FILTERS = new Set(SAT_GROUPS.map(g => g.key))

export default function ISSTracker() {
  const { data: issPosition, isLoading: issLoading, isError: issError } = useISSPosition()
  const { getPositions, isLoading: cataLoading, totalCount } = useSatelliteCatalog()
  const { lang } = useLanguage()
  const tr = t[lang].iss

  const [activeFilters, setActiveFilters] = useState(DEFAULT_FILTERS)
  const [satellites, setSatellites] = useState([])

  // Propagate satellite positions every 5 s
  useEffect(() => {
    if (totalCount === 0) return
    const tick = () => setSatellites(getPositions(new Date(), activeFilters))
    tick() // immediate first render
    const id = setInterval(tick, 5000)
    return () => clearInterval(id)
  }, [getPositions, activeFilters, totalCount])

  const toggleFilter = (key) => {
    setActiveFilters(prev => {
      const next = new Set(prev)
      next.has(key) ? next.delete(key) : next.add(key)
      return next
    })
  }

  // Count per category for filter pill badges
  const satCounts = useMemo(() => {
    const counts = {}
    for (const g of SAT_GROUPS) counts[g.key] = 0
    for (const s of satellites) counts[s.category] = (counts[s.category] ?? 0) + 1
    return counts
  }, [satellites])

  const isLoading = issLoading
  const isError   = issError && satellites.length === 0

  return (
    <div className="flex flex-col h-[calc(100vh-64px-36px)] overflow-y-auto overflow-x-hidden scrollbar-hide">

      {/* ── 3D Globe (70% viewport height approximately) ── */}
      <section className="relative h-[65vh] md:h-[70vh] border-b border-primary-container/20 overflow-hidden flex-shrink-0">
        {/* HUD overlays */}
        <div className="absolute top-4 left-4 z-[10] flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 bg-black/70 border border-secondary-container/30 px-3 py-1.5 font-label text-[10px] uppercase tracking-widest backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_6px_rgba(34,197,94,0.8)]" />
            {tr.live}
          </div>
          <div className="bg-black/70 border border-white/10 px-3 py-1.5 font-label text-[10px] uppercase tracking-widest text-on-surface-variant backdrop-blur-md">
            {tr.velocity}
          </div>
          {cataLoading && (
            <div className="bg-black/70 border border-purple-500/30 px-3 py-1.5 font-label text-[10px] uppercase tracking-widest text-purple-400/80 backdrop-blur-md animate-pulse">
              Loading catalog...
            </div>
          )}
        </div>

        {/* Corner brackets */}
        <div className="absolute top-4 right-4 z-[10] w-6 h-6 border-t-2 border-r-2 border-secondary-container/50 pointer-events-none" />
        <div className="absolute bottom-4 left-4 z-[10] w-6 h-6 border-b-2 border-l-2 border-secondary-container/50 pointer-events-none" />

        {isLoading ? (
          <div className="w-full h-full bg-surface-container-lowest flex items-center justify-center space-grid-bg">
            <div className="text-center space-y-3 animate-pulse">
              <span className="material-symbols-outlined text-secondary-container/40 text-6xl">satellite_alt</span>
              <p className="font-label text-secondary-container/40 text-xs tracking-widest uppercase">{tr.acquiring}</p>
            </div>
          </div>
        ) : isError ? (
          <div className="w-full h-full bg-surface-container-lowest flex items-center justify-center space-grid-bg">
            <div className="text-center space-y-3">
              <span className="material-symbols-outlined text-red-500/60 text-6xl">signal_disconnected</span>
              <p className="font-label text-red-400/80 text-xs tracking-widest uppercase">Signal Lost — Unable to reach ISS telemetry</p>
            </div>
          </div>
        ) : (
          <Suspense fallback={
            <div className="w-full h-full bg-surface-container-lowest flex items-center justify-center space-grid-bg">
              <div className="text-center space-y-3 animate-pulse">
                <span className="material-symbols-outlined text-secondary-container/30 text-6xl">public</span>
                <p className="font-label text-secondary-container/30 text-xs tracking-widest uppercase">LOADING_3D_ENGINE...</p>
              </div>
            </div>
          }>
            <ISSGlobe3D
              issPosition={issPosition}
              satellites={satellites}
              activeFilters={activeFilters}
              onToggleFilter={toggleFilter}
              satCounts={satCounts}
            />
          </Suspense>
        )}
      </section>

      {/* ── Data panels ── */}
      <section className="grid grid-cols-1 md:grid-cols-3 bg-surface-container-low border-t border-primary-container/20 flex-shrink-0">

        {/* Latitude */}
        <div className="relative border-b md:border-b-0 md:border-r border-primary-container/20 flex flex-col justify-between p-5 overflow-hidden">
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M10 0l10 5v10l-10 5-10-5V5z' fill='%2300F4FE' fill-opacity='0.05'/%3E%3C/svg%3E\")" }} />
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="material-symbols-outlined text-xs text-secondary-container">explore</span>
              <h3 className="font-label text-xs uppercase tracking-[0.2em] text-on-surface-variant">{tr.latitude}</h3>
            </div>
            <div className="text-4xl md:text-5xl font-label font-bold text-secondary-container tracking-tighter">
              {issPosition ? (
                <>{issPosition.lat >= 0 ? '+' : ''}{issPosition.lat.toFixed(4)}<span className="text-2xl opacity-50 ml-1">°{issPosition.lat >= 0 ? 'N' : 'S'}</span></>
              ) : '—'}
            </div>
          </div>
          <div className="flex justify-between items-end">
            <div className="font-label text-[9px] text-on-tertiary-container uppercase">{tr.sensorReliability}</div>
            <div className="w-10 h-px border-b border-l border-secondary-container/40" />
          </div>
        </div>

        {/* Longitude */}
        <div className="relative border-b md:border-b-0 md:border-r border-primary-container/20 flex flex-col justify-between p-5 overflow-hidden">
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M10 0l10 5v10l-10 5-10-5V5z' fill='%2300F4FE' fill-opacity='0.05'/%3E%3C/svg%3E\")" }} />
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="material-symbols-outlined text-xs text-secondary-container">language</span>
              <h3 className="font-label text-xs uppercase tracking-[0.2em] text-on-surface-variant">{tr.longitude}</h3>
            </div>
            <div className="text-4xl md:text-5xl font-label font-bold text-secondary-container tracking-tighter">
              {issPosition ? (
                <>{issPosition.lng >= 0 ? '+' : ''}{issPosition.lng.toFixed(4)}<span className="text-2xl opacity-50 ml-1">°{issPosition.lng >= 0 ? 'E' : 'W'}</span></>
              ) : '—'}
            </div>
          </div>
          <div className="flex justify-between items-end">
            <div className="font-label text-[9px] text-on-surface-variant uppercase">{tr.primeMeridian}</div>
            <div className="w-10 h-px border-b border-l border-secondary-container/40" />
          </div>
        </div>

        {/* Last sync */}
        <div className="relative flex flex-col justify-between p-5 overflow-hidden">
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M10 0l10 5v10l-10 5-10-5V5z' fill='%2300F4FE' fill-opacity='0.05'/%3E%3C/svg%3E\")" }} />
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="material-symbols-outlined text-xs text-secondary-container">update</span>
              <h3 className="font-label text-xs uppercase tracking-[0.2em] text-on-surface-variant">{tr.lastSync}</h3>
            </div>
            <div className="text-2xl md:text-3xl font-label font-bold text-secondary-container tracking-tighter leading-tight">
              {issPosition
                ? new Date(issPosition.timestamp * 1000).toUTCString().split(' ').slice(4, 5).join(' ')
                : '—'}
              <span className="text-base opacity-50 ml-1">UTC</span>
            </div>
          </div>
          <div className="flex justify-between items-end">
            <div className="font-label text-[9px] text-on-surface-variant uppercase">{tr.encryption}</div>
            <div className="font-label text-[9px] text-secondary-container/60 uppercase">{tr.autoUpdate}</div>
          </div>
        </div>
      </section>

      {/* ── Category Descriptions ── */}
      <section className="bg-surface-container-low border-t border-primary-container/10 p-6 md:px-10 pb-12 flex-shrink-0">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {[
            { key: 'stations', color: '#00f4fe', title: SAT_GROUPS[0].label, desc: tr.descStations },
            { key: 'starlink', color: '#a855f7', title: SAT_GROUPS[1].label, desc: tr.descStarlink },
            { key: 'gps',      color: '#22c55e', title: SAT_GROUPS[2].label, desc: tr.descGps },
            { key: 'weather',  color: '#eab308', title: SAT_GROUPS[3].label, desc: tr.descWeather },
          ].map((item) => (
            <div key={item.key} className="flex flex-col gap-2.5">
              <div className="flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full shadow-[0_0_8px_currentColor]" style={{ background: item.color, color: item.color }} />
                <h4 className="font-label text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface">
                  {item.title}
                </h4>
              </div>
              <p className="font-label text-[11px] text-on-surface-variant/60 leading-relaxed max-w-[280px]">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
