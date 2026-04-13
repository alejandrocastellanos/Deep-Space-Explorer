import { useState } from 'react'
import { useAsteroids } from '../hooks/useAsteroids'
import { riskBorderColor, riskBadgeClass, riskLabel, riskIcon, riskIconClass } from '../utils/asteroidRisk'
import { useLanguage } from '../contexts/LanguageContext'
import { t } from '../i18n/translations'
import { lazy, Suspense as ReactSuspense } from 'react'
const AsteroidOrbit3D = lazy(() => import('../components/AsteroidOrbit3D'))

function fmt(numStr, decimals = 0) {
  return Number(numStr).toLocaleString('en-US', { maximumFractionDigits: decimals })
}

export default function AsteroidRadar() {
  const { data, isLoading, isError } = useAsteroids()
  const [filter, setFilter] = useState('all')
  const [view, setView] = useState('3d')
  const { lang } = useLanguage()
  const tr = t[lang].asteroids

  const list = data?.asteroids ?? []
  const visible = filter === 'hazardous' ? list.filter(a => a.isHazardous) : list

  return (
    <div className="flex flex-col min-h-[calc(100vh-64px-36px)]">

      {/* ── Header ── */}
      <header className="px-6 md:px-10 pt-8 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-surface-container-highest bg-black/60 backdrop-blur-md flex-shrink-0">
        <div className="flex items-center gap-5">
          <div className="relative w-14 h-14 flex items-center justify-center border border-cyan-500/20 flex-shrink-0">
            <div className="absolute inset-0 bg-cyan-400/5 animate-pulse" />
            <span className="material-symbols-outlined text-secondary-container text-3xl">radar</span>
            <div className="hud-bracket-tl" /><div className="hud-bracket-tr" />
            <div className="hud-bracket-bl" /><div className="hud-bracket-br" />
          </div>
          <div>
            <p className="font-label text-xs text-secondary-container tracking-[0.2em] uppercase mb-1">
              {tr.breadcrumb}
            </p>
            <h1 className="font-headline text-3xl md:text-4xl font-black tracking-tighter text-on-surface uppercase leading-none">
              {tr.title}
            </h1>
            <p className="font-label text-xs tracking-widest text-on-surface-variant/60 uppercase mt-1">
              {tr.subtitle}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 flex-wrap">
          {/* Stat badges */}
          <div className="flex gap-3">
            <div className="px-4 py-2.5 bg-surface-container border-l-4 border-secondary-container">
              <div className="font-label text-[9px] text-secondary-container/70 mb-0.5 uppercase tracking-[0.2em]">{tr.totalTracked}</div>
              <div className="font-headline text-2xl font-bold text-secondary-container leading-none">
                {isLoading ? '—' : list.length}
              </div>
            </div>
            <div className="px-4 py-2.5 bg-surface-container border-l-4 border-tertiary-container shadow-[0_0_20px_rgba(134,0,64,0.2)]">
              <div className="font-label text-[9px] text-tertiary-container/70 mb-0.5 uppercase tracking-[0.2em]">{tr.hazardous}</div>
              <div className="font-headline text-2xl font-bold text-tertiary-container leading-none animate-pulse">
                {isLoading ? '—' : data?.hazardousCount}
              </div>
            </div>
          </div>

          {/* View toggle */}
          <div className="flex items-center bg-surface-container p-1 border border-outline-variant/30">
            <button
              onClick={() => setView('3d')}
              className={`flex items-center gap-1.5 px-4 py-2 font-label text-[10px] font-bold uppercase tracking-widest transition-all ${
                view === '3d'
                  ? 'bg-secondary-container text-on-secondary-container shadow-[0_0_15px_rgba(0,244,254,0.3)]'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-sm">public</span>
              {tr.view3d}
            </button>
            <button
              onClick={() => setView('table')}
              className={`flex items-center gap-1.5 px-4 py-2 font-label text-[10px] font-bold uppercase tracking-widest transition-all ${
                view === 'table'
                  ? 'bg-secondary-container text-on-secondary-container shadow-[0_0_15px_rgba(0,244,254,0.3)]'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-sm">table_rows</span>
              {tr.viewTable}
            </button>
          </div>
        </div>
      </header>

      {/* ── 3D View ── */}
      {view === '3d' && (
        <div>
          {/* Canvas */}
          <div style={{ height: 'calc(100vh - 210px)' }}>
            {isLoading ? (
              <div className="w-full h-full flex items-center justify-center bg-black space-grid-bg" style={{ minHeight: 600 }}>
                <div className="text-center space-y-3 animate-pulse">
                  <span className="material-symbols-outlined text-secondary-container/30 text-6xl">public</span>
                  <p className="font-label text-secondary-container/30 text-xs tracking-widest uppercase">
                    LOADING_NEO_DATA...
                  </p>
                </div>
              </div>
            ) : isError ? (
              <div className="flex items-center justify-center h-96">
                <div className="text-center space-y-4">
                  <span className="material-symbols-outlined text-error text-6xl">signal_disconnected</span>
                  <p className="font-label text-error/70 text-sm tracking-widest uppercase">{tr.error}</p>
                </div>
              </div>
            ) : (
              <ReactSuspense fallback={
                <div className="w-full h-full flex items-center justify-center bg-black space-grid-bg" style={{ minHeight: 600 }}>
                  <div className="text-center space-y-3 animate-pulse">
                    <span className="material-symbols-outlined text-secondary-container/30 text-6xl">public</span>
                    <p className="font-label text-secondary-container/30 text-xs tracking-widest uppercase">LOADING_3D_ENGINE...</p>
                  </div>
                </div>
              }>
                <AsteroidOrbit3D asteroids={list} />
              </ReactSuspense>
            )}
          </div>

          {/* Info panels below the 3D canvas */}
          {!isLoading && !isError && (
            <div className="space-grid-bg px-6 md:px-10 py-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="p-5 bg-surface-container/50 border border-outline-variant/20 relative">
                  <div className="hud-bracket-tl" /><div className="hud-bracket-br" />
                  <h3 className="font-label text-[10px] tracking-widest text-secondary-container mb-4 uppercase">
                    {tr.trajectoryTitle}
                  </h3>
                  <div className="h-20 flex items-end gap-1 px-2">
                    {[60, 80, 40, 90, 50, 100, 70, 55].map((h, i) => (
                      <div
                        key={i}
                        className={`flex-1 ${i === 5 ? 'bg-tertiary-container animate-pulse' : 'bg-cyan-500/20'}`}
                        style={{ height: `${h}%` }}
                      />
                    ))}
                  </div>
                  <div className="mt-3 font-label text-[8px] text-on-surface-variant/40 flex justify-between">
                    <span>T-48H</span>
                    <span>{tr.collisionRisk}</span>
                    <span>T+48H</span>
                  </div>
                </div>

                <div className="p-5 bg-surface-container/50 border border-outline-variant/20 relative">
                  <div className="hud-bracket-tl" /><div className="hud-bracket-br" />
                  <h3 className="font-label text-[10px] tracking-widest text-secondary-container mb-4 uppercase">
                    {tr.radarTitle}
                  </h3>
                  <div className="aspect-video bg-black flex items-center justify-center overflow-hidden border border-cyan-500/10 relative">
                    <div className="w-28 h-28 border border-secondary-container/30 rounded-full" />
                    <div className="absolute w-14 h-14 border border-secondary-container/50 rounded-full" />
                    {data?.asteroids?.slice(0, 5).map((a, i) => (
                      <div
                        key={a.id}
                        className={`absolute w-1.5 h-1.5 rounded-full ${a.isHazardous ? 'bg-tertiary-container shadow-[0_0_8px_#860040]' : 'bg-secondary-container shadow-[0_0_6px_#00F4FE]'}`}
                        style={{ top: `${20 + i * 14}%`, left: `${15 + i * 17}%` }}
                      />
                    ))}
                  </div>
                </div>

                <div className="p-5 bg-surface-container/50 border border-outline-variant/20 relative">
                  <div className="hud-bracket-tl" /><div className="hud-bracket-br" />
                  <h3 className="font-label text-[10px] tracking-widest text-secondary-container mb-4 uppercase">
                    {tr.briefingTitle}
                  </h3>
                  <div className="space-y-3">
                    {[
                      { label: tr.totalNeo,       val: list.length },
                      { label: tr.hazardous,      val: data?.hazardousCount },
                      { label: tr.sensorFidelity, val: '99.98%', highlight: true },
                      { label: tr.defenseStatus,  val: lang === 'es' ? 'EN_ESPERA' : 'STANDBY' },
                    ].map(({ label, val, highlight }) => (
                      <div key={label} className="flex justify-between border-b border-surface-container-highest pb-2">
                        <span className="font-label text-[10px] text-on-surface-variant">{label}</span>
                        <span className={`font-headline font-bold text-xs ${highlight ? 'text-green-500' : 'text-on-surface'}`}>{val}</span>
                      </div>
                    ))}
                  </div>
                  <button className="mt-5 w-full py-2 bg-primary-container text-on-primary-container font-label text-[10px] font-bold uppercase tracking-[0.2em] border border-cyan-400/30 hover:bg-secondary-container/20 transition-all flicker-effect">
                    {tr.generateReport}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Table View ── */}
      {view === 'table' && (
        <div className="space-grid-bg flex-1 px-6 md:px-10 pt-6 pb-12">

          {/* Controls */}
          <section className="mb-6 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex items-center bg-surface-container p-1 border border-outline-variant/30">
              <button
                onClick={() => setFilter('all')}
                className={`px-6 py-2 font-label text-xs font-bold uppercase tracking-widest transition-all ${
                  filter === 'all'
                    ? 'bg-secondary-container text-on-secondary-container'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {tr.filterAll}
              </button>
              <button
                onClick={() => setFilter('hazardous')}
                className={`px-6 py-2 font-label text-xs font-bold uppercase tracking-widest transition-all ${
                  filter === 'hazardous'
                    ? 'bg-tertiary-container text-tertiary'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {tr.filterHazardous}
              </button>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2 border border-outline-variant/30 font-label text-[10px] text-on-surface-variant uppercase">
                <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.5)]" />
                {tr.linkStatus}
              </div>
              <div className="px-4 py-2 border border-outline-variant/30 font-label text-[10px] text-on-surface-variant uppercase">
                {tr.update}
              </div>
            </div>
          </section>

          {/* Table */}
          <section className="relative overflow-hidden">
            {isLoading && (
              <div className="space-y-1">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="h-16 bg-surface-container animate-pulse" />
                ))}
              </div>
            )}

            {isError && (
              <div className="flex flex-col items-center justify-center py-24 space-y-4">
                <span className="material-symbols-outlined text-error text-6xl">signal_disconnected</span>
                <p className="font-label text-error/70 text-sm tracking-widest uppercase">{tr.error}</p>
              </div>
            )}

            {!isLoading && !isError && (
              <div className="w-full border-t border-cyan-500/20">
                <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-surface-container-low font-label text-[10px] font-bold tracking-[0.2em] text-secondary-container/80 uppercase">
                  <div className="col-span-4">{tr.colName}</div>
                  <div className="col-span-2">{tr.colDiameter}</div>
                  <div className="col-span-2 hidden md:block">{tr.colVelocity}</div>
                  <div className="col-span-2 hidden md:block">{tr.colMissDistance}</div>
                  <div className="col-span-4 md:col-span-2 text-right">{tr.colStatus}</div>
                </div>

                <div className="space-y-1">
                  {visible.map(neo => (
                    <a
                      key={neo.id}
                      href={neo.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`grid grid-cols-12 gap-4 px-6 py-5 bg-surface-container border-l-4 backdrop-blur-md items-center group hover:bg-surface-container-high transition-colors ${riskBorderColor(neo.isHazardous)}`}
                    >
                      <div className="col-span-4 flex items-center gap-3">
                        <span className={`material-symbols-outlined ${riskIconClass(neo.isHazardous)}`}>
                          {riskIcon(neo.isHazardous)}
                        </span>
                        <span className="font-headline font-bold text-on-surface tracking-wide text-sm truncate">
                          {neo.name.replace(/[()]/g, '')}
                        </span>
                      </div>
                      <div className="col-span-2 font-label text-sm text-on-surface-variant">
                        {neo.diameterMin.toFixed(3)}–{neo.diameterMax.toFixed(3)}
                      </div>
                      <div className="col-span-2 font-label text-sm text-on-surface-variant hidden md:block">
                        {fmt(neo.velocity)}
                      </div>
                      <div className="col-span-2 hidden md:flex items-center gap-3">
                        <div className="flex-1 h-1 bg-surface-container-highest overflow-hidden">
                          <div
                            className={`h-full ${neo.isHazardous ? 'bg-tertiary-container' : 'bg-secondary-container'}`}
                            style={{ width: `${Math.min(100, (parseFloat(neo.missDistance) / 75000000) * 100)}%` }}
                          />
                        </div>
                        <span className={`font-label text-xs ${neo.isHazardous ? 'text-on-tertiary-container' : 'text-secondary-container'}`}>
                          {(parseFloat(neo.missDistance) / 384400).toFixed(1)} ld
                        </span>
                      </div>
                      <div className="col-span-4 md:col-span-2 text-right">
                        <span className={`px-3 py-1 font-label text-[10px] font-bold uppercase tracking-widest ${riskBadgeClass(neo.isHazardous)}`}>
                          {riskLabel(neo.isHazardous)}
                        </span>
                      </div>
                    </a>
                  ))}

                  {visible.length === 0 && (
                    <div className="py-16 text-center font-label text-on-surface-variant/40 text-sm tracking-widest uppercase">
                      {tr.noMatch}
                    </div>
                  )}
                </div>
              </div>
            )}
          </section>

        </div>
      )}
    </div>
  )
}
