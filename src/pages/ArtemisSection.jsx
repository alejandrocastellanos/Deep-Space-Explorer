import { useState, lazy, Suspense } from 'react'
import { useArtemis } from '../hooks/useArtemis'
import MediaCard from '../components/MediaCard'
import { useLanguage } from '../contexts/LanguageContext'
import { t } from '../i18n/translations'

const ArtemisTrajectory3D = lazy(() => import('../components/ArtemisTrajectory3D'))

const CREW = [
  { name: 'Reid Wiseman',   role: 'Commander',          agency: 'NASA', icon: 'star',           image: '/crew/wiseman.png' },
  { name: 'Victor Glover',  role: 'Pilot',              agency: 'NASA', icon: 'flight',         image: '/crew/glover.png' },
  { name: 'Christina Koch', role: 'Mission Specialist',  agency: 'NASA', icon: 'science',        image: '/crew/koch.png' },
  { name: 'Jeremy Hansen',  role: 'Mission Specialist',  agency: 'CSA',  icon: 'public',         image: '/crew/hansen.png' },
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {CREW.map((member, i) => (
            <div key={i} className="relative bg-surface-container glass-panel overflow-hidden flex flex-col group transition-all duration-300 hover:border-secondary-container/40">
              <div className="hud-bracket-tl z-20" /><div className="hud-bracket-br z-20" />
              
              {/* Image with overlay and animation */}
              <div className="aspect-[4/5] overflow-hidden relative">
                <img 
                  src={member.image} 
                  alt={member.name} 
                  className="w-full h-full object-cover opacity-100 group-hover:scale-105 transition-all duration-700" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-surface-container via-transparent to-transparent opacity-80" />
                
                {/* Role Icon Overlay */}
                <div className="absolute bottom-4 right-4 w-12 h-12 bg-black/70 backdrop-blur-md border border-primary-container/30 flex items-center justify-center text-primary z-10 transition-transform duration-300 group-hover:scale-110 group-hover:border-primary">
                  <span className="material-symbols-outlined text-2xl">{member.icon}</span>
                </div>
              </div>

              <div className="p-6 pt-2 flex flex-col gap-1 relative z-10">
                <p className="font-headline font-bold text-on-surface text-lg leading-tight uppercase tracking-tight">{member.name}</p>
                <p className="font-label text-[10px] text-secondary-container uppercase tracking-widest">
                  {tr.crewRoles[member.role] ?? member.role}
                </p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="px-2 py-0.5 bg-surface-container-highest border border-outline-variant/40 font-label text-[9px] text-on-surface-variant uppercase tracking-widest font-bold">
                    {member.agency}
                  </span>
                  <div className="w-8 h-px bg-outline-variant/30" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Mission Trajectory 3D ── */}
      <section className="border-b border-surface-container-highest bg-black">
        <div className="px-8 md:px-12 pt-10 pb-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-headline text-lg font-bold tracking-widest uppercase border-l-2 border-secondary-container pl-4">
              {lang === 'es' ? 'TRAYECTORIA DE MISIÓN' : 'MISSION TRAJECTORY'}
            </h2>
            <div className="h-px flex-grow mx-6 bg-gradient-to-r from-secondary-container/50 to-transparent" />
            <span className="font-label text-xs text-on-surface-variant uppercase tracking-widest">
              {lang === 'es' ? 'SIMULACIÓN 3D' : '3D SIMULATION'}
            </span>
          </div>
          <p className="font-label text-[10px] text-on-surface-variant/40 uppercase tracking-widest pl-6 mb-4">
            {lang === 'es'
              ? 'Trayectoria de retorno libre híbrida · Escala comprimida'
              : 'Hybrid free-return trajectory · Compressed scale'}
          </p>
        </div>
        <Suspense fallback={
          <div className="h-[560px] flex items-center justify-center space-grid-bg">
            <div className="text-center space-y-3 animate-pulse">
              <span className="material-symbols-outlined text-secondary-container/30 text-6xl">public</span>
              <p className="font-label text-secondary-container/30 text-xs tracking-widest uppercase">LOADING_TRAJECTORY...</p>
            </div>
          </div>
        }>
          <ArtemisTrajectory3D />
        </Suspense>
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

        {/* Mission infographic */}
        <div className="mt-8 relative bg-surface-container glass-panel p-4">
          <div className="hud-bracket-tl" /><div className="hud-bracket-br" />
          <img
            src={lang === 'es' ? '/images/artemis2_spanish.webp' : '/images/artemis2_english.avif'}
            alt={tr.objectivesTitle}
            className="w-full h-auto object-contain"
            loading="lazy"
          />
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
