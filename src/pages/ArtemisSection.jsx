import { useState } from 'react'
import { useArtemis } from '../hooks/useArtemis'
import MediaCard from '../components/MediaCard'
import { useLanguage } from '../contexts/LanguageContext'
import { t } from '../i18n/translations'

const CREW = [
  { name: 'Reid Wiseman',   role: 'Commander',          agency: 'NASA', icon: 'star' },
  { name: 'Victor Glover',  role: 'Pilot',              agency: 'NASA', icon: 'flight' },
  { name: 'Christina Koch', role: 'Mission Specialist',  agency: 'NASA', icon: 'science' },
  { name: 'Jeremy Hansen',  role: 'Mission Specialist',  agency: 'CSA',  icon: 'public' },
]

const TIMELINE_BASE = [
  { date: 'T+00:00',  icon: 'rocket_launch', active: true },
  { date: 'T+01:30',  icon: 'orbit',         active: true },
  { date: 'T+23:30',  icon: 'expand',        active: false },
  { date: 'T+36:00',  icon: 'north_east',    active: false },
  { date: 'T+96:00',  icon: 'brightness_2',  active: false },
  { date: 'T+144:00', icon: 'u_turn_left',   active: false },
  { date: 'T+240:00', icon: 'waves',         active: false },
]

const OBJ_ICONS = ['air', 'satellite', 'space_dashboard', 'shield']

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

export default function ArtemisSection({ favCtx }) {
  const { data: results, isLoading } = useArtemis()
  const [mediaType, setMediaType] = useState('image,video')
  const { lang } = useLanguage()
  const tr = t[lang].artemis

  const FILTERS = [
    { label: tr.filterAll,    value: 'image,video' },
    { label: tr.filterImages, value: 'image' },
    { label: tr.filterVideos, value: 'video' },
  ]

  const filtered = results?.filter(r =>
    mediaType === 'image,video' ? true : r.mediaType === mediaType
  )

  return (
    <div className="min-h-[calc(100vh-64px-36px)]">

      {/* ── Hero Banner ── */}
      <section className="relative w-full h-[440px] md:h-[540px] overflow-hidden bg-surface-container-lowest">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-container/30 via-black to-black" />
        <div className="absolute inset-0 space-grid-bg opacity-40" />
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{ background: 'linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.25) 50%)', backgroundSize: '100% 4px' }}
        />

        {/* HUD metrics */}
        <div className="absolute top-6 right-6 flex flex-col gap-3 text-right z-10">
          <div className="bg-black/60 backdrop-blur-xl p-3 border-r-2 border-secondary-container">
            <p className="font-label text-[9px] text-on-surface-variant uppercase tracking-widest">{tr.maxDistance}</p>
            <p className="font-headline text-lg font-bold text-secondary-container tracking-wider">450,000 KM</p>
          </div>
          <div className="bg-black/60 backdrop-blur-xl p-3 border-r-2 border-primary-container">
            <p className="font-label text-[9px] text-on-surface-variant uppercase tracking-widest">{tr.missionDuration}</p>
            <p className="font-headline text-lg font-bold text-primary tracking-wider">~10 {lang === 'es' ? 'DÍAS' : 'DAYS'}</p>
          </div>
          <div className="bg-black/60 backdrop-blur-xl p-3 border-r-2 border-outline">
            <p className="font-label text-[9px] text-on-surface-variant uppercase tracking-widest">{lang === 'es' ? 'TRIPULANTES' : 'CREW'}</p>
            <p className="font-headline text-lg font-bold text-on-surface tracking-wider">4 CREW</p>
          </div>
        </div>

        {/* Hero text */}
        <div className="relative h-full flex flex-col justify-end px-8 md:px-12 pb-12 z-10">
          <div className="inline-block border-l-4 border-secondary-container pl-6 py-3 bg-black/40 backdrop-blur-md max-w-3xl relative">
            <div className="hud-bracket-tl" /><div className="hud-bracket-br" />
            <p className="font-label text-secondary-container uppercase tracking-[0.3em] text-xs mb-2">
              {tr.badge}
            </p>
            <h1
              className="font-headline text-5xl md:text-7xl font-black uppercase tracking-tighter text-on-surface leading-none mb-3"
              style={{ textShadow: '0 0 20px rgba(177,197,255,0.4)' }}
            >
              ARTEMIS II <span className="text-outline-variant opacity-40">MISSION</span>
            </h1>
            <p className="font-body text-on-surface-variant/70 text-sm leading-relaxed max-w-2xl mb-4">
              {tr.description}
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-primary-container/20 border border-primary-container text-primary font-label text-[10px] tracking-widest uppercase">
                SLS_BLOCK_1
              </span>
              <span className="px-3 py-1 bg-surface-container-highest/40 border border-secondary-container/30 text-secondary-container font-label text-[10px] tracking-widest uppercase">
                ORION_CAPSULE
              </span>
              <span className="px-3 py-1 bg-surface-container-highest/40 border border-on-surface-variant/20 text-on-surface-variant font-label text-[10px] tracking-widest uppercase">
                KSC_FLORIDA
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Crew ── */}
      <section className="py-12 px-8 md:px-12 bg-surface-container-lowest border-b border-surface-container-highest">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-headline text-lg font-bold tracking-widest uppercase border-l-2 border-secondary-container pl-4">
            {tr.crewManifest}
          </h2>
          <div className="h-px flex-grow mx-6 bg-gradient-to-r from-secondary-container/50 to-transparent" />
          <span className="font-label text-xs text-on-surface-variant uppercase tracking-widest">{tr.crewCount}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {CREW.map((member, i) => (
            <div key={i} className="relative bg-surface-container glass-panel p-5 flex flex-col gap-3">
              <div className="hud-bracket-tl" /><div className="hud-bracket-br" />
              <div className="w-12 h-12 bg-primary-container/30 border border-primary-container/40 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-2xl">{member.icon}</span>
              </div>
              <div>
                <p className="font-headline font-bold text-on-surface text-base leading-tight">{member.name}</p>
                <p className="font-label text-[10px] text-secondary-container uppercase tracking-widest mt-1">
                  {tr.crewRoles[member.role] ?? member.role}
                </p>
              </div>
              <span className="mt-auto px-2 py-0.5 w-fit bg-surface-container-highest border border-outline-variant/40 font-label text-[9px] text-on-surface-variant uppercase tracking-widest">
                {member.agency}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Mission Timeline ── */}
      <section className="py-12 px-8 md:px-12 bg-black border-b border-surface-container-highest">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-headline text-lg font-bold tracking-widest uppercase border-l-2 border-secondary-container pl-4">
            {tr.timelineTitle}
          </h2>
          <div className="h-px flex-grow mx-6 bg-gradient-to-r from-secondary-container/50 to-transparent" />
          <span className="font-label text-xs text-on-surface-variant">{tr.duration}</span>
        </div>

        <div className="overflow-x-auto pb-4">
          <div className="min-w-[860px] relative py-12">
            <div className="absolute top-1/2 left-0 w-full h-px bg-secondary-container/20 shadow-[0_0_10px_rgba(0,244,254,0.2)]" />
            <div className="flex justify-between relative z-10">
              {TIMELINE_BASE.map((step, i) => {
                const tl = tr.timeline[i]
                return (
                  <div
                    key={i}
                    className={`flex flex-col items-center transition-opacity ${step.active ? 'opacity-100' : 'opacity-50 hover:opacity-90'}`}
                  >
                    {i % 2 === 0 ? (
                      <div className="mb-3 bg-surface-container-high p-3 border border-secondary-container/30 relative w-[110px] text-center">
                        {step.active && <><div className="hud-bracket-tl" /><div className="hud-bracket-br" /></>}
                        <p className="font-label text-[9px] text-secondary-container mb-1">{step.date}</p>
                        <h3 className="font-headline font-bold text-[11px] tracking-widest uppercase leading-tight">{tl.label}</h3>
                        <p className="font-label text-[8px] text-on-surface-variant/60 mt-1 leading-tight">{tl.detail}</p>
                      </div>
                    ) : (
                      <div className="mb-3 w-[110px] h-[88px]" />
                    )}

                    <div
                      className={`w-11 h-11 flex items-center justify-center ${
                        step.active
                          ? 'bg-secondary-container shadow-[0_0_20px_rgba(0,244,254,0.5)]'
                          : 'bg-surface-container-highest border border-secondary-container/30'
                      }`}
                      style={{ clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)' }}
                    >
                      <span className={`material-symbols-outlined text-base ${step.active ? 'text-black' : 'text-on-surface-variant'}`}>
                        {step.icon}
                      </span>
                    </div>

                    {i % 2 !== 0 && (
                      <div className="mt-3 bg-surface-container-high p-3 border border-white/10 w-[110px] text-center">
                        <p className="font-label text-[9px] text-on-surface-variant mb-1">{step.date}</p>
                        <h3 className="font-headline font-bold text-[11px] tracking-widest uppercase leading-tight">{tl.label}</h3>
                        <p className="font-label text-[8px] text-on-surface-variant/60 mt-1 leading-tight">{tl.detail}</p>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ── Mission Objectives ── */}
      <section className="py-12 px-8 md:px-12 bg-surface-container-lowest border-b border-surface-container-highest">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-headline text-lg font-bold tracking-widest uppercase border-l-2 border-secondary-container pl-4">
            {tr.objectivesTitle}
          </h2>
          <div className="h-px flex-grow mx-6 bg-gradient-to-r from-secondary-container/50 to-transparent" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {tr.objectives.map((obj, i) => (
            <div key={i} className="relative bg-surface-container glass-panel p-5 flex flex-col gap-3">
              <div className="hud-bracket-tl" /><div className="hud-bracket-br" />
              <span className="material-symbols-outlined text-secondary-container text-3xl">{OBJ_ICONS[i]}</span>
              <p className="font-label text-[10px] text-secondary-container uppercase tracking-widest">{obj.title}</p>
              <p className="font-body text-on-surface-variant text-xs leading-relaxed">{obj.body}</p>
            </div>
          ))}
        </div>

        {/* Mission summary strip */}
        <div className="mt-8 p-6 bg-primary-container/10 border border-primary-container/30 relative">
          <div className="hud-bracket-tl" /><div className="hud-bracket-br" />
          <p className="font-label text-[10px] text-secondary-container uppercase tracking-[0.2em] mb-2">
            {tr.briefingLabel}
          </p>
          <p className="font-body text-on-surface-variant text-sm leading-relaxed max-w-4xl">
            {tr.briefingText}
          </p>
        </div>
      </section>

      {/* ── Media Gallery ── */}
      <section className="py-12 px-8 md:px-12 space-grid-bg">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div className="space-y-1">
            <span className="font-label text-secondary-container text-xs tracking-[0.2em] uppercase">
              {tr.galleryBreadcrumb}
            </span>
            <h2 className="text-3xl font-headline font-bold uppercase tracking-tight text-on-surface">
              {tr.galleryTitle}
            </h2>
          </div>

          <div className="flex items-center gap-px bg-surface-container-highest/20 p-1 border border-outline-variant/30 w-fit">
            {FILTERS.map(f => (
              <button
                key={f.value}
                onClick={() => setMediaType(f.value)}
                className={`px-5 py-2 font-label text-[10px] tracking-widest uppercase transition-all ${
                  mediaType === f.value
                    ? 'bg-secondary-container text-on-secondary-container shadow-[0_0_15px_rgba(0,244,254,0.3)]'
                    : 'text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
          </div>
        )}

        {filtered?.length > 0 && !isLoading && (
          <>
            <div className="mb-4 font-label text-[10px] text-secondary-container/50 tracking-[0.2em] uppercase">
              {filtered.length} ASSETS_RETRIEVED // QUERY: "ARTEMIS II"
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((item, i) => (
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
      </section>
    </div>
  )
}
