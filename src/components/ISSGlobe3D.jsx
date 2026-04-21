import { useRef, useState, useEffect, Suspense, useMemo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Stars } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import * as THREE from 'three'
import { SAT_GROUPS } from '../api/celestrakApi'

const EARTH_R     = 2.0
const ISS_ORBIT_R = EARTH_R * 1.066

/* ── lat/lng → 3D cartesian ── */
function latLngToVec3(lat, lng, r) {
  const phi   = (90 - lat)  * (Math.PI / 180)
  const theta = (lng + 180) * (Math.PI / 180)
  return new THREE.Vector3(
    -r * Math.sin(phi) * Math.cos(theta),
     r * Math.cos(phi),
     r * Math.sin(phi) * Math.sin(theta),
  )
}

/* ── Reusable geometry / material refs ── */
const DOT_GEO = new THREE.SphereGeometry(0.014, 5, 5)

/* ── Earth ── */
function Earth() {
  const coreRef = useRef()
  const [tex, setTex] = useState(null)

  useEffect(() => {
    const loader = new THREE.TextureLoader()
    loader.setCrossOrigin('anonymous')
    Promise.all([
      loader.loadAsync('/textures/earth-day.jpg'),
      loader.loadAsync('/textures/earth-bump.png'),
      loader.loadAsync('/textures/earth-specular.png'),
    ])
      .then(([day, bump, spec]) => setTex({ day, bump, spec }))
      .catch(() => {})
  }, [])

  useFrame(({ clock }) => {
    if (coreRef.current) coreRef.current.rotation.y = clock.getElapsedTime() * 0.04
  })

  return (
    <group>
      <mesh ref={coreRef}>
        <sphereGeometry args={[EARTH_R, 64, 64]} />
        {tex ? (
          <meshPhongMaterial
            map={tex.day} bumpMap={tex.bump} bumpScale={0.06}
            specularMap={tex.spec} specular="#1a4488" shininess={14}
          />
        ) : (
          <meshStandardMaterial color="#0b3a6b" emissive="#001a33"
            emissiveIntensity={0.5} metalness={0.1} roughness={0.75} />
        )}
      </mesh>
      {/* Atmosphere */}
      <mesh>
        <sphereGeometry args={[EARTH_R + 0.07, 32, 32]} />
        <meshStandardMaterial color="#2255ee" emissive="#1133cc"
          emissiveIntensity={0.8} transparent opacity={0.12}
          side={THREE.BackSide} depthWrite={false} />
      </mesh>
      <mesh>
        <sphereGeometry args={[EARTH_R + 0.3, 32, 32]} />
        <meshStandardMaterial color="#0022bb" transparent opacity={0.05}
          side={THREE.BackSide} depthWrite={false} />
      </mesh>
    </group>
  )
}

/* ── ISS orbit ring ── */
function OrbitTrail() {
  return (
    <group rotation={[51.6 * (Math.PI / 180), 0, 0]}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[ISS_ORBIT_R, 0.006, 8, 128]} />
        <meshBasicMaterial color="#00f4fe" transparent opacity={0.18} />
      </mesh>
    </group>
  )
}

/* ── ISS satellite marker ── */
function ISSMarker({ position }) {
  const lightRef = useRef()
  useFrame(({ clock }) => {
    if (lightRef.current)
      lightRef.current.intensity = 0.6 + Math.sin(clock.getElapsedTime() * 2.5) * 0.3
  })
  if (!position) return null
  const pos = latLngToVec3(position.lat, position.lng, ISS_ORBIT_R)
  return (
    <group position={pos}>
      <mesh rotation={[Math.PI / 4, Math.PI / 4, 0]}>
        <boxGeometry args={[0.06, 0.06, 0.06]} />
        <meshStandardMaterial color="#00f4fe" emissive="#00f4fe"
          emissiveIntensity={2.5} metalness={0.6} roughness={0.2} />
      </mesh>
      <mesh position={[-0.12, 0, 0]}>
        <boxGeometry args={[0.16, 0.005, 0.055]} />
        <meshStandardMaterial color="#1a6aff" emissive="#0033aa" emissiveIntensity={0.6} metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position={[0.12, 0, 0]}>
        <boxGeometry args={[0.16, 0.005, 0.055]} />
        <meshStandardMaterial color="#1a6aff" emissive="#0033aa" emissiveIntensity={0.6} metalness={0.8} roughness={0.3} />
      </mesh>
      <pointLight ref={lightRef} color="#00f4fe" intensity={0.8} distance={1.2} />
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.12, 0.004, 8, 32]} />
        <meshBasicMaterial color="#00f4fe" transparent opacity={0.5} />
      </mesh>
    </group>
  )
}

/* ── Satellite cloud (one InstancedMesh per group/color) ── */
function SatelliteCloud({ satellites, onSelect }) {
  // Group by color
  const byColor = useMemo(() => {
    const map = new Map()
    for (const s of satellites) {
      if (!map.has(s.color)) map.set(s.color, [])
      map.get(s.color).push(s)
    }
    return map
  }, [satellites])

  return (
    <>
      {[...byColor.entries()].map(([color, sats]) => (
        <SatGroup key={color} color={color} sats={sats} onSelect={onSelect} />
      ))}
    </>
  )
}

const _dummy = new THREE.Object3D()
const _pos   = new THREE.Vector3()

function SatGroup({ color, sats, onSelect }) {
  const meshRef = useRef()
  const matRef  = useRef()

  // Build instanced positions
  useEffect(() => {
    if (!meshRef.current) return
    sats.forEach((s, i) => {
      const alt = EARTH_R + (s.alt / 6371) * EARTH_R // scale altitude
      const clamped = Math.min(alt, EARTH_R * 1.6)    // cap for visual clarity
      _dummy.position.copy(latLngToVec3(s.lat, s.lng, clamped))
      _dummy.updateMatrix()
      meshRef.current.setMatrixAt(i, _dummy.matrix)
    })
    meshRef.current.instanceMatrix.needsUpdate = true
  }, [sats])

  const handleClick = (e) => {
    e.stopPropagation()
    const idx = e.instanceId
    if (idx != null && sats[idx]) onSelect(sats[idx])
  }

  return (
    <instancedMesh
      ref={meshRef}
      args={[DOT_GEO, null, sats.length]}
      onClick={handleClick}
      onPointerEnter={() => { document.body.style.cursor = 'pointer' }}
      onPointerLeave={() => { document.body.style.cursor = 'default' }}
    >
      <meshStandardMaterial
        ref={matRef}
        color={color}
        emissive={color}
        emissiveIntensity={1.2}
        transparent
        opacity={0.85}
      />
    </instancedMesh>
  )
}

/* ── Main 3D Scene ── */
function Scene({ issPosition, satellites, onSelectSat }) {
  return (
    <>
      <ambientLight intensity={0.12} color="#000d22" />
      <directionalLight position={[8, 5, 6]}  intensity={2.0}  color="#f0f4ff" />
      <directionalLight position={[-6, -3, -5]} intensity={0.25} color="#0033aa" />

      <Stars radius={90} depth={60} count={5000} factor={3} saturation={0.3} fade speed={0.4} />

      <Earth />
      <OrbitTrail />
      <ISSMarker position={issPosition} />

      {satellites.length > 0 && (
        <SatelliteCloud satellites={satellites} onSelect={onSelectSat} />
      )}

      <EffectComposer>
        <Bloom intensity={1.0} luminanceThreshold={0.15} luminanceSmoothing={0.85} mipmapBlur />
      </EffectComposer>

      <OrbitControls
        enablePan={false}
        minDistance={3.5}
        maxDistance={14}
        autoRotate
        autoRotateSpeed={0.3}
        enableDamping
        dampingFactor={0.06}
      />
    </>
  )
}

/* ── Filter pill ── */
function FilterPill({ group, active, count, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-1.5 font-label text-[9px] font-bold uppercase tracking-widest border transition-all ${
        active
          ? 'border-current text-current shadow-[0_0_10px_currentColor]'
          : 'border-white/10 text-on-surface-variant/50 hover:border-white/20 hover:text-on-surface-variant'
      }`}
      style={active ? { color: group.color } : {}}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: group.color }} />
      {group.label}
      {count > 0 && (
        <span className="opacity-60">({count})</span>
      )}
    </button>
  )
}

/* ── Main export ── */
export default function ISSGlobe3D({ issPosition, satellites, activeFilters, onToggleFilter, satCounts }) {
  const [selectedSat, setSelectedSat] = useState(null)

  return (
    <div className="relative w-full" style={{ height: '100%' }}>
      <Canvas
        camera={{ position: [0, 2.5, 7], fov: 50 }}
        gl={{ antialias: true, alpha: false }}
        style={{ background: '#00010a', width: '100%', height: '100%' }}
        onPointerMissed={() => setSelectedSat(null)}
      >
        <Suspense fallback={null}>
          <Scene
            issPosition={issPosition}
            satellites={satellites}
            onSelectSat={setSelectedSat}
          />
        </Suspense>
      </Canvas>

      {/* HUD breadcrumb */}
      <div className="absolute top-4 left-4 font-label text-[9px] text-secondary/30 tracking-[0.25em] uppercase pointer-events-none select-none">
        ORBITAL_TRACKER // REAL_DATA
      </div>

      {/* Filter pills */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 flex-wrap justify-center pointer-events-auto">
        {SAT_GROUPS.map(g => (
          <FilterPill
            key={g.key}
            group={g}
            active={activeFilters.has(g.key)}
            count={satCounts[g.key] ?? 0}
            onClick={() => onToggleFilter(g.key)}
          />
        ))}
      </div>

      {/* Selected satellite info panel */}
      {selectedSat ? (
        <div className="absolute top-4 right-4 bg-black/85 backdrop-blur-xl border border-secondary-container/30 p-4 w-64">
          <div className="hud-bracket-tl" /><div className="hud-bracket-br" />
          <button
            onClick={() => setSelectedSat(null)}
            className="absolute top-2 right-2 text-on-surface-variant/50 hover:text-secondary-container transition-colors p-1"
          >
            <span className="material-symbols-outlined text-base">close</span>
          </button>
          <p className="font-label text-[8px] tracking-widest uppercase mb-1" style={{ color: selectedSat.color }}>
            {selectedSat.category.toUpperCase()}
          </p>
          <p className="font-headline font-bold text-on-surface text-xs mb-3 pr-4 leading-tight">
            {selectedSat.name}
          </p>
          <div className="space-y-1.5">
            {[
              { label: 'LAT',  val: `${selectedSat.lat >= 0 ? '+' : ''}${selectedSat.lat.toFixed(4)}°` },
              { label: 'LNG',  val: `${selectedSat.lng >= 0 ? '+' : ''}${selectedSat.lng.toFixed(4)}°` },
              { label: 'ALT',  val: `${selectedSat.alt.toFixed(1)} km` },
            ].map(({ label, val }) => (
              <div key={label} className="flex justify-between border-b border-outline-variant/15 pb-1.5">
                <span className="font-label text-[9px] text-on-surface-variant/50 tracking-widest uppercase">{label}</span>
                <span className="font-headline font-bold text-xs text-secondary-container">{val}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-md border border-white/10 px-3 py-2 pointer-events-none">
          <p className="font-label text-[9px] text-on-surface-variant/40 tracking-widest uppercase">
            Click a satellite for details
          </p>
        </div>
      )}

      {/* Controls hint */}
      <div className="absolute bottom-4 left-4 pointer-events-none select-none">
        <p className="font-label text-[8px] text-on-surface-variant/25 tracking-widest uppercase">
          Drag to rotate · Scroll to zoom
        </p>
      </div>

      {/* Total count */}
      <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md border border-secondary-container/20 px-3 py-1.5 pointer-events-none">
        <span className="font-label text-[9px] text-secondary-container/60 tracking-widest uppercase">
          Tracked: <span className="text-secondary-container font-bold">{satellites.length}</span>
        </span>
      </div>
    </div>
  )
}
