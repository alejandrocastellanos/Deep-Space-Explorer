import { useState, useEffect } from 'react'
import { useLanguage } from '../contexts/LanguageContext'
import { t } from '../i18n/translations'

function useUptime() {
  const [seconds, setSeconds] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setSeconds(s => s + 1), 1000)
    return () => clearInterval(id)
  }, [])
  const h = String(Math.floor(seconds / 3600)).padStart(2, '0')
  const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0')
  const s = String(seconds % 60).padStart(2, '0')
  return `${h}:${m}:${s}`
}

export default function TelemetryFooter() {
  const uptime = useUptime()
  const { lang } = useLanguage()
  const tr = t[lang].telemetry

  return (
    <footer className="fixed bottom-0 left-0 w-full h-9 bg-black/80 backdrop-blur-md border-t border-white/5 px-8 flex items-center justify-between z-50">
      <div className="flex gap-8">
        <div className="flex items-center gap-2 font-label text-[10px] text-secondary/40">
          <span className="text-secondary-container">{tr.status}</span> NOMINAL
        </div>
        <div className="flex items-center gap-2 font-label text-[10px] text-secondary/40">
          <span className="text-secondary-container">{tr.link}</span> SECURE_VPN_7
        </div>
        <div className="hidden md:flex items-center gap-2 font-label text-[10px] text-secondary/40">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.8)]" />
          SIGNAL: 98.4%
        </div>
      </div>
      <div className="font-label text-[10px] text-secondary/30 uppercase tracking-[0.2em]">
        {tr.uptime} {uptime}
      </div>
    </footer>
  )
}
