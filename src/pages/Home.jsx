import { motion } from 'framer-motion'
import { useLanguage } from '../contexts/LanguageContext'
import { t } from '../i18n/translations'

const ARTEMIS_VIDEO = 'https://images-assets.nasa.gov/video/Orion_Artemis-I_b-roll_9_2021_LB/Orion_Artemis-I_b-roll_9_2021_LB~orig.mp4'

/* ── Section 1: Artemis II Video Hero ── */
function ArtemisHero() {
  const { lang } = useLanguage()
  const tr = t[lang].home

  return (
    <section className="relative h-screen overflow-hidden -mt-16">
      {/* Video background */}
      <video
        src={ARTEMIS_VIDEO}
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-black/60" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-transparent" />

      {/* Scanline */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          background: 'linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.2) 50%)',
          backgroundSize: '100% 4px',
        }}
      />

      {/* HUD brackets */}
      <div className="absolute inset-0 pointer-events-none p-20 md:p-28">
        <div className="relative w-full h-full">
          <div className="absolute top-0 left-0 hud-bracket-tl" style={{ width: 56, height: 56 }} />
          <div className="absolute top-0 right-0 hud-bracket-tr" style={{ width: 56, height: 56 }} />
          <div className="absolute bottom-0 left-0 hud-bracket-bl" style={{ width: 56, height: 56 }} />
          <div className="absolute bottom-0 right-0 hud-bracket-br" style={{ width: 56, height: 56 }} />
          {/* HUD metadata top-left */}
          <div className="absolute top-4 left-4 font-label text-[10px] text-secondary/40 tracking-[0.2em] flex flex-col gap-1">
            <span>MISSION: ARTEMIS_II</span>
            <span>VEHICLE: ORION_CAPSULE + SLS</span>
            <span>STATUS: PRE_LAUNCH</span>
          </div>
          {/* HUD stats top-right */}
          <div className="absolute top-4 right-4 flex flex-col gap-2 text-right">
            <div className="bg-black/50 backdrop-blur-md border-r-2 border-secondary-container px-3 py-2">
              <p className="font-label text-[9px] text-on-surface-variant uppercase tracking-widest">{tr.crew}</p>
              <p className="font-headline font-bold text-secondary-container text-sm">4</p>
            </div>
            <div className="bg-black/50 backdrop-blur-md border-r-2 border-primary px-3 py-2">
              <p className="font-label text-[9px] text-on-surface-variant uppercase tracking-widest">{tr.maxDistance}</p>
              <p className="font-headline font-bold text-primary text-sm">450,000 KM</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main content — bottom aligned */}
      <div className="absolute inset-0 flex flex-col items-start justify-end px-8 md:px-16 pb-28">
        <div className="max-w-3xl space-y-5">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex items-center gap-3"
          >
            <span className="w-2 h-2 rounded-full bg-secondary-container animate-pulse shadow-[0_0_8px_rgba(0,244,254,0.8)]" />
            <span className="font-label text-xs uppercase tracking-[0.3em] text-secondary-container">
              {tr.badge}
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="font-headline font-black uppercase tracking-tighter text-on-surface leading-none"
            style={{
              fontSize: 'clamp(3rem, 8vw, 7rem)',
              textShadow: '0 0 40px rgba(177,197,255,0.3)',
            }}
          >
            ARTEMIS II<br />
            <span className="text-primary/60">MISSION</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="font-body text-on-surface-variant/80 text-base leading-relaxed max-w-xl"
          >
            {tr.description}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.55 }}
            className="flex flex-wrap gap-3 pt-2"
          >
            <a
              href="/artemis"
              className="group relative px-8 py-3 bg-surface-container border border-secondary-container transition-all duration-300 hover:bg-secondary-container/20 flicker-effect"
            >
              <span className="font-label font-bold text-secondary tracking-[0.25em] uppercase text-sm">
                {tr.missionBriefing}
              </span>
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-[0_0_20px_rgba(0,244,254,0.3)]" />
            </a>
            <span className="px-4 py-3 bg-black/40 border border-white/10 font-label text-[10px] text-on-surface-variant uppercase tracking-widest">
              SLS BLOCK 1 · ORION · KSC FL
            </span>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 1 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="font-label text-[9px] text-secondary/40 tracking-[0.3em] uppercase">{tr.scroll}</span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
        >
          <span className="material-symbols-outlined text-secondary/30 text-xl">expand_more</span>
        </motion.div>
      </motion.div>
    </section>
  )
}

/* ── Main Export ── */
export default function Home() {
  return (
    <div className="-mt-16 -mr-20 -mb-9">
      <ArtemisHero />
    </div>
  )
}
