import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useLanguage } from '../contexts/LanguageContext'
import { t } from '../i18n/translations'

const linkClass = ({ isActive }) =>
  'font-headline tracking-[0.1em] uppercase text-sm font-bold pb-1 transition-all duration-300 ' +
  (isActive
    ? 'text-secondary-container border-b-2 border-secondary-container'
    : 'text-on-surface-variant hover:text-secondary hover:border-b-2 hover:border-secondary')

export default function Navbar({ favCount = 0 }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { lang, toggle } = useLanguage()
  const tr = t[lang].nav

  const NAV_LINKS = [
    { to: '/',          label: tr.home,      icon: 'home' },
    { to: '/apod',      label: tr.apod,      icon: 'photo_camera' },
    { to: '/explorer',  label: tr.explorer,  icon: 'search' },
    { to: '/artemis',   label: tr.artemis,   icon: 'rocket_launch' },
    { to: '/asteroids', label: tr.asteroids, icon: 'radar' },
    { to: '/iss',       label: tr.iss,       icon: 'satellite_alt' },
  ]

  return (
    <>
      <nav className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-6 md:px-8 h-16 bg-black/40 backdrop-blur-xl border-b border-cyan-500/30 shadow-[0_1px_0_0_rgba(0,244,254,0.3)]">
        {/* Logo */}
        <div className="select-none">
          <img src="/icon.png" alt="Deep Space Explorer" className="h-10 w-10 rounded-xl" />
        </div>

        {/* Desktop links */}
        <div className="hidden md:flex gap-7 items-center">
          {NAV_LINKS.map(({ to, label }) => (
            <NavLink key={to} to={to} end={to === '/'} className={linkClass}>
              {label}
            </NavLink>
          ))}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          {/* Language toggle */}
          <button
            onClick={toggle}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 border border-secondary-container/30 text-secondary-container/70 hover:text-secondary-container hover:border-secondary-container transition-colors font-label text-[10px] tracking-widest uppercase flicker-effect"
            aria-label="Toggle language"
          >
            <span className="material-symbols-outlined text-sm">language</span>
            {lang === 'es' ? 'ES' : 'EN'}
          </button>

          {/* Favorites button */}
          <NavLink
            to="/favorites"
            className={({ isActive }) =>
              'relative hidden md:flex items-center gap-1 p-2 transition-colors flicker-effect ' +
              (isActive ? 'text-secondary-container' : 'text-on-surface-variant hover:text-secondary-container')
            }
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
            {favCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 bg-tertiary-container text-tertiary font-label text-[8px] flex items-center justify-center px-0.5 leading-none">
                {favCount}
              </span>
            )}
          </NavLink>

          <button className="hidden md:flex text-secondary-container p-2 hover:bg-white/10 transition-colors flicker-effect">
            <span className="material-symbols-outlined">account_circle</span>
          </button>

          {/* Hamburger — mobile only */}
          <button
            className="md:hidden text-secondary-container p-2 hover:bg-white/10 transition-colors"
            onClick={() => setMobileOpen(o => !o)}
            aria-label="Toggle menu"
          >
            <span className="material-symbols-outlined">{mobileOpen ? 'close' : 'menu'}</span>
          </button>
        </div>
      </nav>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="fixed top-16 left-0 w-full z-40 bg-black/95 backdrop-blur-xl border-b border-cyan-500/30 flex flex-col py-4">
          {[...NAV_LINKS, { to: '/favorites', label: tr.favorites, icon: 'favorite' }].map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                'flex items-center gap-3 px-8 py-4 font-headline tracking-[0.1em] uppercase text-sm font-bold transition-colors ' +
                (isActive
                  ? 'text-secondary-container bg-primary-container/20 border-l-2 border-secondary-container'
                  : 'text-on-surface-variant hover:text-secondary hover:bg-white/5')
              }
            >
              <span className="material-symbols-outlined text-base">{icon}</span>
              {label}
              {to === '/favorites' && favCount > 0 && (
                <span className="ml-auto bg-tertiary-container text-tertiary font-label text-[9px] px-2 py-0.5">{favCount}</span>
              )}
            </NavLink>
          ))}
          {/* Mobile language toggle */}
          <button
            onClick={toggle}
            className="flex items-center gap-3 px-8 py-4 font-headline tracking-[0.1em] uppercase text-sm font-bold text-on-surface-variant hover:text-secondary hover:bg-white/5 transition-colors"
          >
            <span className="material-symbols-outlined text-base">language</span>
            {lang === 'es' ? 'Español' : 'English'}
          </button>
        </div>
      )}
    </>
  )
}
