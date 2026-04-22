import { useRef, useState, useMemo, useEffect, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Stars, Html } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import * as THREE from 'three'
import * as satellite from 'satellite.js'
import { useLanguage } from '../contexts/LanguageContext'
import { t } from '../i18n/translations'

const EARTH_R = 1.5
const MIN_ORBIT = 3.0
const MAX_ORBIT = 7.5
const MAX_NEO = 25
const LD_IN_KM = 384400
const MOON_R = 0.4

/* ── Orbit radius mapping (log scale) ── */
function toOrbit(dist, minD, maxD) {
  if (minD >= maxD) return (MIN_ORBIT + MAX_ORBIT) / 2
  const t = Math.max(0, Math.min(1,
    (Math.log(dist) - Math.log(minD)) / (Math.log(maxD) - Math.log(minD))
  ))
  return MIN_ORBIT + t * (MAX_ORBIT - MIN_ORBIT)
}

/* ── Earth ── */
function Earth() {
  const coreRef   = useRef()
  const cloudsRef = useRef()
  const [tex, setTex] = useState(null)

  // Load textures imperatively — never blocks rendering
  useEffect(() => {
    const loader = new THREE.TextureLoader()
    loader.setCrossOrigin('anonymous')

    Promise.all([
      loader.loadAsync('/textures/earth-day.jpg'),
      loader.loadAsync('/textures/earth-bump.png'),
      loader.loadAsync('/textures/earth-specular.png'),
    ])
      .then(([day, bump, spec]) => setTex({ day, bump, spec }))
      .catch(() => { /* keep null → fallback sphere stays */ })
  }, [])

  useFrame(() => {
    // Current GMT time expressed as rotation
    // gstime returns the Greenwich Sidereal Time in radians
    const gmst = satellite.gstime(new Date())
    
    // We subtract PI/2 because the standard Three.js sphere texture 
    // center (Long 0) aligns with the equinox logic of gstime differently.
    // This aligns the "Noon" part of the Earth with the static Sun light.
    if (coreRef.current) {
      coreRef.current.rotation.y = gmst - Math.PI / 2
    }
    
    // Cloud layer still rotates slowly for dynamism
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y = gmst * 1.05
    }
  })

  return (
    <group>
      {/* Surface */}
      <mesh ref={coreRef}>
        <sphereGeometry args={[EARTH_R, 64, 64]} />
        {tex ? (
          <meshPhongMaterial
            map={tex.day}
            bumpMap={tex.bump}
            bumpScale={0.06}
            specularMap={tex.spec}
            specular="#1a4488"
            shininess={14}
          />
        ) : (
          /* Fallback: visible immediately, blue procedural */
          <meshStandardMaterial
            color="#0b3a6b"
            emissive="#001a33"
            emissiveIntensity={0.5}
            metalness={0.1}
            roughness={0.75}
          />
        )}
      </mesh>

      {/* Cloud layer — only once textures arrive */}

      {/* Atmosphere — inner glow */}
      <mesh>
        <sphereGeometry args={[EARTH_R + 0.07, 32, 32]} />
        <meshStandardMaterial
          color="#2255ee"
          emissive="#1133cc"
          emissiveIntensity={0.8}
          transparent
          opacity={0.12}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>

      {/* Atmosphere — outer halo */}
      <mesh>
        <sphereGeometry args={[EARTH_R + 0.24, 32, 32]} />
        <meshStandardMaterial
          color="#0022bb"
          transparent
          opacity={0.05}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>
    </group>
  )
}

/* ── Single orbit ring ── */
function OrbitRing({ radius, inclination, isHazardous }) {
  return (
    <group rotation={[inclination.x, 0, inclination.z]}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[radius, 0.007, 8, 128]} />
        <meshBasicMaterial
          color={isHazardous ? '#ff3300' : '#00f4fe'}
          transparent
          opacity={isHazardous ? 0.18 : 0.10}
        />
      </mesh>
    </group>
  )
}

/* ── Single asteroid ── */
function AsteroidObject({ data, orbitRadius, inclination, initialAngle, onSelect, isSelected }) {
  const orbitRef = useRef()
  const meshRef = useRef()
  const lightRef = useRef()
  const [hovered, setHovered] = useState(false)

  const size = Math.max(0.05, Math.min(0.14,
    Math.sqrt((data.diameterMin + data.diameterMax) / 2) * 0.18
  ))
  const speed = 0.07 / Math.pow(orbitRadius, 1.15)
  const color = data.isHazardous ? '#ff5500' : '#88ccdd'
  const emissiveColor = data.isHazardous ? '#cc1100' : '#004455'

  useFrame(({ clock }) => {
    const elapsed = clock.getElapsedTime()

    // Orbit animation
    if (orbitRef.current) {
      orbitRef.current.rotation.y = initialAngle + elapsed * speed
    }

    // Self-rotation
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.006
      meshRef.current.rotation.y += 0.009
    }

    // Scale lerp on hover/select
    if (meshRef.current) {
      const target = hovered || isSelected ? 1.7 : 1.0
      meshRef.current.scale.setScalar(
        THREE.MathUtils.lerp(meshRef.current.scale.x, target, 0.12)
      )
    }

    // Hazardous pulsing glow
    if (lightRef.current && data.isHazardous) {
      lightRef.current.intensity = 0.3 + Math.sin(elapsed * 3) * 0.15
    }
  })

  return (
    <group rotation={[inclination.x, 0, inclination.z]}>
      <group ref={orbitRef}>
        <mesh
          ref={meshRef}
          position={[orbitRadius, 0, 0]}
          onClick={e => { e.stopPropagation(); onSelect(data) }}
          onPointerEnter={() => { setHovered(true); document.body.style.cursor = 'pointer' }}
          onPointerLeave={() => { setHovered(false); document.body.style.cursor = 'default' }}
        >
          <icosahedronGeometry args={[size, 0]} />
          <meshStandardMaterial
            color={color}
            emissive={emissiveColor}
            emissiveIntensity={data.isHazardous ? 1.0 : 0.4}
            roughness={0.85}
            metalness={0.15}
          />
        </mesh>

        {/* Point light for glow — hazardous only */}
        {data.isHazardous && (
          <pointLight
            ref={lightRef}
            position={[orbitRadius, 0, 0]}
            color="#ff2200"
            intensity={0.4}
            distance={2}
          />
        )}
      </group>
    </group>
  )
}

/* ── Moon ── */
function Moon({ orbitRadius }) {
  const meshRef = useRef()
  const { lang } = useLanguage()
  const tr = t[lang].asteroids

  useFrame(() => {
    if (meshRef.current) meshRef.current.rotation.y += 0.003
  })

  return (
    <group>
      {/* Moon Orbit Ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[orbitRadius, 0.005, 8, 128]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.06} />
      </mesh>

      {/* Moon Object at 0 deg initial */}
      <group position={[orbitRadius, 0, 0]}>
        <mesh ref={meshRef}>
          <sphereGeometry args={[MOON_R, 32, 32]} />
          <meshStandardMaterial
            color="#888d92"
            roughness={0.9}
            metalness={0.1}
            emissive="#1a1a1a"
            emissiveIntensity={0.2}
          />
        </mesh>
        
        {/* Label anchor */}
        <group position={[0, MOON_R + 0.3, 0]}>
          <Html center distanceFactor={10}>
            <div className="font-label text-[8px] text-white/40 tracking-[0.2em] uppercase whitespace-nowrap bg-black/40 px-2 py-0.5 border-l-2 border-white/10 backdrop-blur-sm select-none">
              {tr.moonLabel}
            </div>
          </Html>
        </group>
      </group>
    </group>
  )
}

/* ── Scene (inside Canvas) ── */
function Scene({ asteroids, onSelect, selected }) {
  const limited = useMemo(() => asteroids.slice(0, MAX_NEO), [asteroids])

  const dists = limited.map(a => parseFloat(a.missDistance))
  const minD = Math.min(...dists)
  const maxD = Math.max(...dists)

  const orbits = useMemo(() =>
    limited.map((a, i) => {
      const hash = a.id.split('').reduce((s, c) => s + c.charCodeAt(0), 0)
      return {
        radius: toOrbit(parseFloat(a.missDistance), minD, maxD),
        inclination: {
          x: ((hash % 120) - 60) * (Math.PI / 180),
          z: ((hash * 7 % 60) - 30) * (Math.PI / 180),
        },
        initialAngle: (i / limited.length) * Math.PI * 2,
      }
    }),
  [limited, minD, maxD])

  return (
    <>
      {/* Lighting: Uniform and clear visibility as requested */}
      <ambientLight intensity={0.7} color="#ffffff" />
      <directionalLight position={[10, 5, 5]} intensity={1.5} color="#ffffff" />
      <directionalLight position={[-10, -5, -5]} intensity={0.5} color="#ffffff" />

      {/* Background */}
      <Stars radius={90} depth={60} count={5000} factor={3} saturation={0.3} fade speed={0.4} />

      {/* Earth */}
      <Earth />

      {/* Moon reference */}
      <Moon orbitRadius={toOrbit(LD_IN_KM, minD, maxD)} />

      {/* Asteroids + orbits */}
      {limited.map((a, i) => (
        <group key={a.id}>
          <AsteroidObject
            data={a}
            orbitRadius={orbits[i].radius}
            inclination={orbits[i].inclination}
            initialAngle={orbits[i].initialAngle}
            onSelect={onSelect}
            isSelected={selected?.id === a.id}
          />
        </group>
      ))}

      {/* Post-processing: bloom */}
      <EffectComposer>
        <Bloom
          intensity={1.5}
          luminanceThreshold={0.15}
          luminanceSmoothing={0.85}
          mipmapBlur
        />
      </EffectComposer>

      {/* Camera controls */}
      <OrbitControls
        enablePan={false}
        minDistance={4}
        maxDistance={14}
        autoRotate
        autoRotateSpeed={0.4}
        enableDamping
        dampingFactor={0.06}
      />
    </>
  )
}

/* ── Loading fallback ── */
function Loader() {
  return (
    <div className="w-full h-full flex items-center justify-center bg-black space-grid-bg">
      <div className="text-center space-y-3 animate-pulse">
        <span className="material-symbols-outlined text-secondary-container/40 text-6xl">public</span>
        <p className="font-label text-secondary-container/40 text-xs tracking-widest uppercase">
          INITIALIZING_3D_RENDERER...
        </p>
      </div>
    </div>
  )
}

/* ── Main export ── */
export default function AsteroidOrbit3D({ asteroids }) {
  const [selected, setSelected] = useState(null)
  const { lang } = useLanguage()
  const tr = t[lang].asteroids

  return (
    <div className="relative w-full bg-black" style={{ height: '100%' }}>
      {/* Mobile: allow vertical scroll to pass through to the page */}
      <div className="absolute inset-0 z-[5] md:hidden" style={{ touchAction: 'pan-y' }} />
      <Canvas
        camera={{ position: [0, 3.5, 11], fov: 52 }}
        gl={{ antialias: true, alpha: false }}
        style={{ background: '#00010a', width: '100%', height: '100%' }}
        onPointerMissed={() => setSelected(null)}
      >
        <Suspense fallback={null}>
          <Scene
            asteroids={asteroids}
            onSelect={setSelected}
            selected={selected}
          />
        </Suspense>
      </Canvas>

      {/* HUD breadcrumb */}
      <div className="absolute top-4 left-4 font-label text-[9px] text-secondary/30 tracking-[0.25em] uppercase pointer-events-none">
        {tr.orbitSim} // REAL_DATA
      </div>

      {/* Selected asteroid panel */}
      {selected ? (
        <div className="absolute top-4 right-4 bg-black/85 backdrop-blur-xl border border-secondary-container/30 p-5 w-72 glass-panel z-[10]">
          <div className="hud-bracket-tl" /><div className="hud-bracket-tr" />
          <div className="hud-bracket-bl" /><div className="hud-bracket-br" />
          <button
            onClick={() => setSelected(null)}
            className="absolute top-2 right-2 text-on-surface-variant/50 hover:text-secondary-container transition-colors p-1"
          >
            <span className="material-symbols-outlined text-base">close</span>
          </button>

          <p className="font-label text-[9px] text-secondary-container/50 tracking-widest uppercase mb-1">
            {tr.objectSelected}
          </p>
          <h3 className="font-headline font-bold text-on-surface text-sm mb-4 leading-tight pr-6">
            {selected.name.replace(/[()]/g, '')}
          </h3>

          <div className="space-y-2">
            {[
              { label: tr.diameter,  val: `${selected.diameterMin.toFixed(3)} – ${selected.diameterMax.toFixed(3)} km` },
              { label: tr.velocity,  val: `${Number(selected.velocity).toLocaleString('en')} km/h` },
              { label: tr.missDist,  val: `${(parseFloat(selected.missDistance) / 384400).toFixed(2)} ld` },
              {
                label: tr.threat,
                val: selected.isHazardous ? tr.hazardousLabel : tr.safeLabel,
                danger: selected.isHazardous,
              },
            ].map(({ label, val, danger }) => (
              <div key={label} className="flex justify-between items-center border-b border-outline-variant/20 pb-2">
                <span className="font-label text-[9px] text-on-surface-variant/50 tracking-widest uppercase">
                  {label}
                </span>
                <span className={`font-headline font-bold text-xs ${danger ? 'text-tertiary-container' : 'text-secondary-container'}`}>
                  {val}
                </span>
              </div>
            ))}
          </div>

          <a
            href={selected.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 flex items-center justify-center gap-1 w-full py-2 bg-surface-container border border-secondary-container/30 font-label text-[9px] tracking-widest uppercase text-secondary-container/70 hover:text-secondary-container hover:border-secondary-container transition-colors flicker-effect"
          >
            NASA ↗
          </a>
        </div>
      ) : (
        <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md border border-white/10 px-3 py-2 pointer-events-none">
          <p className="font-label text-[9px] text-on-surface-variant/40 tracking-widest uppercase">
            {tr.clickAsteroid}
          </p>
        </div>
      )}

      {/* Bottom legend */}
      <div className="absolute bottom-4 left-4 flex flex-col gap-1.5 pointer-events-none">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#ff5500] shadow-[0_0_8px_#ff5500]" />
          <span className="font-label text-[9px] text-on-surface-variant/50 tracking-widest uppercase">
            {tr.hazardous}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#00f4fe] shadow-[0_0_8px_#00f4fe]" />
          <span className="font-label text-[9px] text-on-surface-variant/50 tracking-widest uppercase">
            {tr.totalTracked}
          </span>
        </div>
        <p className="font-label text-[8px] text-on-surface-variant/25 tracking-widest uppercase mt-1">
          {tr.controls}
        </p>
      </div>

      {/* NEO count badge */}
      <div className="absolute bottom-4 right-4 flex gap-3 pointer-events-none">
        <div className="bg-black/60 backdrop-blur-md border border-secondary-container/20 px-3 py-1.5">
          <span className="font-label text-[9px] text-secondary-container/60 tracking-widest uppercase">
            {tr.totalTracked}: <span className="text-secondary-container font-bold">{Math.min(asteroids.length, MAX_NEO)}</span>
          </span>
        </div>
        <div className="bg-black/60 backdrop-blur-md border border-tertiary-container/20 px-3 py-1.5">
          <span className="font-label text-[9px] text-tertiary-container/60 tracking-widest uppercase">
            {tr.hazardous}: <span className="text-tertiary-container font-bold animate-pulse">
              {asteroids.slice(0, MAX_NEO).filter(a => a.isHazardous).length}
            </span>
          </span>
        </div>
      </div>
    </div>
  )
}
