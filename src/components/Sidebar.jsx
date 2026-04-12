import { NavLink } from 'react-router-dom'
import { useLanguage } from '../contexts/LanguageContext'
import { t } from '../i18n/translations'

export default function Sidebar({ issPosition, hazardousCount }) {
  const { lang } = useLanguage()
  const tr = t[lang].sidebar

  return (
    <aside className="fixed right-0 top-16 flex flex-col items-center py-6 z-40 bg-[#131313]/80 backdrop-blur-2xl h-[calc(100vh-64px-36px)] w-20 border-l border-cyan-900/30 shadow-[-10px_0_30px_rgba(0,0,0,0.5)]">
      <div className="flex flex-col items-center gap-6 flex-1 w-full overflow-hidden">

        {/* Pilot identity */}
        <div className="flex flex-col items-center gap-1">
          <div className="w-10 h-10 bg-primary-container border border-secondary-container/30 flex items-center justify-center">
            <span className="material-symbols-outlined text-secondary-container text-lg">person</span>
          </div>
          <span className="font-label uppercase tracking-widest text-[7px] text-on-surface-variant">
            SECTOR_V
          </span>
        </div>

        {/* Divider */}
        <div className="w-8 h-px bg-cyan-900/40" />

        {/* ISS link */}
        <NavLink
          to="/iss"
          className={({ isActive }) =>
            'flex flex-col items-center gap-1 w-full py-3 transition-colors flicker-effect ' +
            (isActive
              ? 'text-secondary-container bg-primary-container/20 border-r-2 border-secondary-container'
              : 'text-on-surface-variant hover:text-secondary-container')
          }
        >
          <span className="material-symbols-outlined text-xl">satellite_alt</span>
          <span className="font-label uppercase tracking-widest text-[7px]">ISS</span>
          {issPosition ? (
            <span className="font-label text-[7px] text-secondary/50 mt-0.5">
              {Number(issPosition.lat).toFixed(1)}°
            </span>
          ) : (
            <span className="w-1 h-1 rounded-full bg-green-500 animate-pulse mt-0.5" />
          )}
        </NavLink>

        {/* Asteroids link */}
        <NavLink
          to="/asteroids"
          className={({ isActive }) =>
            'flex flex-col items-center gap-1 w-full py-3 transition-colors flicker-effect ' +
            (isActive
              ? 'text-tertiary-container bg-tertiary-container/10 border-r-2 border-tertiary-container'
              : 'text-on-surface-variant hover:text-tertiary-container')
          }
        >
          <span className={`material-symbols-outlined text-xl ${hazardousCount > 0 ? 'animate-pulse' : ''}`}>
            warning
          </span>
          <span className="font-label uppercase tracking-widest text-[7px]">NEO</span>
          {hazardousCount != null && (
            <span className={`font-label text-[7px] mt-0.5 ${hazardousCount > 0 ? 'text-tertiary-container' : 'text-green-500'}`}>
              {hazardousCount > 0 ? `${hazardousCount}⚠` : tr.clear}
            </span>
          )}
        </NavLink>
      </div>

      {/* Bottom */}
      <div className="mt-auto pt-4 border-t border-cyan-900/30 w-full flex justify-center">
        <button className="flex flex-col items-center gap-1 text-on-surface-variant hover:text-error transition-colors py-3 flicker-effect w-full">
          <span className="material-symbols-outlined text-xl">power_settings_new</span>
          <span className="font-label uppercase tracking-widest text-[7px]">EXIT</span>
        </button>
      </div>
    </aside>
  )
}
