import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useISSPosition } from '../hooks/useISSPosition'
import { useLanguage } from '../contexts/LanguageContext'
import { t } from '../i18n/translations'

// Custom ISS icon
const issIcon = L.divIcon({
  className: '',
  html: `
    <div style="position:relative;width:40px;height:40px;display:flex;align-items:center;justify-content:center;">
      <div style="position:absolute;width:40px;height:40px;border:1px solid rgba(0,244,254,0.4);border-radius:50%;animation:ping 1.5s cubic-bezier(0,0,0.2,1) infinite;"></div>
      <div style="position:absolute;width:60px;height:60px;border:1px solid rgba(0,244,254,0.15);border-radius:50%;animation:ping 2s cubic-bezier(0,0,0.2,1) infinite;"></div>
      <div style="width:28px;height:28px;background:#000;border:1.5px solid #00f4fe;display:flex;align-items:center;justify-content:center;box-shadow:0 0 16px rgba(0,244,254,0.5);">
        <span class="material-symbols-outlined" style="color:#00f4fe;font-size:16px;font-variation-settings:'FILL' 1;">satellite</span>
      </div>
    </div>
  `,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
  popupAnchor: [0, -25],
})

function FlyToISS({ position }) {
  const map = useMap()
  useEffect(() => {
    if (position) {
      map.flyTo([position.lat, position.lng], map.getZoom(), { duration: 1.2 })
    }
  }, [position, map])
  return null
}

export default function ISSTracker() {
  const { data: position, isLoading } = useISSPosition()
  const { lang } = useLanguage()
  const tr = t[lang].iss

  const center = position ? [position.lat, position.lng] : [0, 0]

  return (
    <div className="flex flex-col h-[calc(100vh-64px-36px)] overflow-hidden">

      {/* ── Map (70%) ── */}
      <section className="relative flex-[7] border-b border-primary-container/20 overflow-hidden">
        {/* HUD overlays on top of map */}
        <div className="absolute top-4 left-4 z-[500] flex items-center gap-3">
          <div className="flex items-center gap-2 bg-black/70 border border-secondary-container/30 px-3 py-1.5 font-label text-[10px] uppercase tracking-widest backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_6px_rgba(34,197,94,0.8)]" />
            {tr.live}
          </div>
          <div className="bg-black/70 border border-white/10 px-3 py-1.5 font-label text-[10px] uppercase tracking-widest text-on-surface-variant backdrop-blur-md">
            {tr.velocity}
          </div>
        </div>

        {/* Corner HUD brackets */}
        <div className="absolute top-4 right-4 z-[500] w-6 h-6 border-t-2 border-r-2 border-secondary-container/50 pointer-events-none" />
        <div className="absolute bottom-4 left-4 z-[500] w-6 h-6 border-b-2 border-l-2 border-secondary-container/50 pointer-events-none" />

        {isLoading ? (
          <div className="w-full h-full bg-surface-container-lowest flex items-center justify-center space-grid-bg">
            <div className="text-center space-y-3 animate-pulse">
              <span className="material-symbols-outlined text-secondary-container/40 text-6xl">satellite_alt</span>
              <p className="font-label text-secondary-container/40 text-xs tracking-widest uppercase">{tr.acquiring}</p>
            </div>
          </div>
        ) : (
          <MapContainer
            center={center}
            zoom={3}
            style={{ width: '100%', height: '100%', background: '#000' }}
            zoomControl={false}
            attributionControl={false}
          >
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://carto.com/">CARTO</a>'
            />
            {position && (
              <>
                <FlyToISS position={position} />
                <Marker position={[position.lat, position.lng]} icon={issIcon}>
                  <Popup className="iss-popup">
                    <div className="bg-surface-container border border-secondary-container/30 p-3 font-label text-[10px] uppercase tracking-widest text-secondary-container min-w-[160px]">
                      <p className="font-headline font-bold text-sm mb-2">ISS_ZARYA_CLUSTER</p>
                      <p>LAT: {position.lat.toFixed(4)}°</p>
                      <p>LNG: {position.lng.toFixed(4)}°</p>
                    </div>
                  </Popup>
                </Marker>
              </>
            )}
          </MapContainer>
        )}

        {/* Cyan grid overlay on map */}
        <div
          className="absolute inset-0 pointer-events-none z-[400] opacity-30"
          style={{
            backgroundImage: 'linear-gradient(rgba(0,244,254,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,244,254,0.05) 1px, transparent 1px)',
            backgroundSize: '80px 80px',
          }}
        />
      </section>

      {/* ── Data panels (30%) ── */}
      <section className="flex-[3] grid grid-cols-1 md:grid-cols-3 bg-surface-container-low border-t border-primary-container/20">

        {/* Latitude */}
        <div className="relative border-b md:border-b-0 md:border-r border-primary-container/20 flex flex-col justify-between p-5 overflow-hidden">
          <div
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{
              backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M10 0l10 5v10l-10 5-10-5V5z' fill='%2300F4FE' fill-opacity='0.05'/%3E%3C/svg%3E\")",
            }}
          />
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="material-symbols-outlined text-xs text-secondary-container">explore</span>
              <h3 className="font-label text-xs uppercase tracking-[0.2em] text-on-surface-variant">{tr.latitude}</h3>
            </div>
            <div className="text-4xl md:text-5xl font-label font-bold text-secondary-container tracking-tighter">
              {position ? (
                <>
                  {position.lat >= 0 ? '+' : ''}{position.lat.toFixed(4)}
                  <span className="text-2xl opacity-50 ml-1">°{position.lat >= 0 ? 'N' : 'S'}</span>
                </>
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
          <div
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{
              backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M10 0l10 5v10l-10 5-10-5V5z' fill='%2300F4FE' fill-opacity='0.05'/%3E%3C/svg%3E\")",
            }}
          />
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="material-symbols-outlined text-xs text-secondary-container">language</span>
              <h3 className="font-label text-xs uppercase tracking-[0.2em] text-on-surface-variant">{tr.longitude}</h3>
            </div>
            <div className="text-4xl md:text-5xl font-label font-bold text-secondary-container tracking-tighter">
              {position ? (
                <>
                  {position.lng >= 0 ? '+' : ''}{position.lng.toFixed(4)}
                  <span className="text-2xl opacity-50 ml-1">°{position.lng >= 0 ? 'E' : 'W'}</span>
                </>
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
          <div
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{
              backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M10 0l10 5v10l-10 5-10-5V5z' fill='%2300F4FE' fill-opacity='0.05'/%3E%3C/svg%3E\")",
            }}
          />
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="material-symbols-outlined text-xs text-secondary-container">update</span>
              <h3 className="font-label text-xs uppercase tracking-[0.2em] text-on-surface-variant">{tr.lastSync}</h3>
            </div>
            <div className="text-2xl md:text-3xl font-label font-bold text-secondary-container tracking-tighter leading-tight">
              {position
                ? new Date(position.timestamp * 1000).toUTCString().split(' ').slice(4, 5).join(' ')
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

      {/* Leaflet ping keyframes */}
      <style>{`
        @keyframes ping {
          75%, 100% { transform: scale(2); opacity: 0; }
        }
        .leaflet-popup-content-wrapper,
        .leaflet-popup-tip {
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
          padding: 0 !important;
        }
        .leaflet-popup-content { margin: 0 !important; }
      `}</style>
    </div>
  )
}
