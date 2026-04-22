import { useRef, useState, useMemo, useEffect, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Stars, Html } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import * as THREE from 'three'
import { useLanguage } from '../contexts/LanguageContext'

/* ── Constants ── */
const EARTH_R  = 1.0
const MOON_R   = 0.27
const MOON_X   = 9.0
const DURATION = 28   // seconds per full animation loop

/* ── Figure-8 trajectory (XZ plane, Y=0)
   Left lobe  = small Earth parking orbit (CCW viewed from above)
   Crossover  = between Earth and Moon (TLI / ICPS ejection point)
   Right lobe = large Moon loop: outbound above center (Z+),
                flyby on far side, return arc below (Z-)        ── */
const RAW_TRAJ = [
  [ 0.80, -0.10],  //  0  Launch / Splashdown  (P1 / P15)  ← surface
  [ 0.47,  1.10],  //  1  SRB separation        (P2)  r≈1.20
  [-0.41,  1.13],  //  2  Upper parking orbit   (P3)  r≈1.20
  [-1.10,  0.49],  //  3  Apogee – orbit check  (P9)  r≈1.20
  [-0.99, -0.68],  //  4  Descending                  r≈1.20
  [-0.25, -1.18],  //  5  Proximity ops         (P6)  r≈1.21
  [ 0.61, -1.04],  //  6  Post-prox / TLI prep        r≈1.21
  [ 1.80, -0.15],  //  7  Figure-8 crossover + TLI burn (P7 ICPS ejected)
  [ 3.00,  0.55],  //  8  Orion outbound – full config  (P4)
  [ 5.00,  1.10],  //  9  Mid transit            (P8)
  [ 7.00,  1.05],  // 10  Approaching Moon       (P10)
  [ 8.30,  0.55],  // 11  Near-side approach
  [ 9.50,  0.00],  // 12  FAR-SIDE flyby         (P11) 10,427 km altitude
  [ 9.15, -0.70],  // 13  Post-flyby swing
  [ 7.90, -1.55],  // 14  RTC burn area          (P12)
  [ 5.80, -2.50],  // 15  Deep return
  [ 3.60, -2.55],  // 16  Return mid
  [ 1.80, -1.85],  // 17  Return nearing Earth
  [ 1.00, -0.85],  // 18  CM / SM separation     (P13)
  [ 0.55, -0.35],  // 19  Entry interface        (P14)
  [ 0.80, -0.10],  // 20  Splashdown             (P15) ← same as 0
]

/* ── Phase markers [t, labelEs, labelEn, time, color] ── */
const PHASES = [
  [0.00, 'LANZAMIENTO',       'LAUNCH',              'T+0:00',   '#00f4fe'],
  [0.07, 'SEP. PROPULSORES',  'SRB SEPARATION',      'T+0:02',   '#00f4fe'],
  [0.25, 'OP. PROXIMIDAD',    'PROXIMITY OPS',       'T+1:00',   '#f59e0b'],
  [0.33, 'ENCENDIDO TLI',     'TLI BURN',            'T+23:30',  '#00f4fe'],
  [0.40, 'TRÁNSITO LUNAR',    'LUNAR TRANSIT',       'T+24-96h', '#00f4fe'],
  [0.57, 'FLYBY LUNAR',       'LUNAR FLYBY',         'T+96:00',  '#ff5500'],
  [0.67, 'CORRECCIÓN RTC',    'RETURN CORRECTION',   'T+120:00', '#00f4fe'],
  [0.87, 'SEP. MÓD. SERV.',  'SERVICE MOD. SEP.',   'T+234:00', '#a855f7'],
  [1.00, 'AMERIZAJE',         'SPLASHDOWN',          'T+240:00', '#00f4fe'],
]

/* ── Callout definitions ── */
const CALLOUTS = [
  {
    t: 0.07,
    en: 'SRB SEPARATION',      es: 'SEP. PROPULSORES SRB',
    sub: 'P2 · SRBs + abort sys jettison',
    color: '#00f4fe',           model: 'sls_sep',   align: 'right',
  },
  {
    t: 0.25,
    en: 'PROXIMITY OPS DEMO',  es: 'DEMO OP. PROXIMIDAD',
    sub: 'P6 · Orion sep. ICPS · ~2 h maniobras manuales',
    color: '#f59e0b',           model: 'orion_prox', align: 'left', inset: true,
  },
  {
    t: 0.40,
    en: 'ORION · OUTBOUND',    es: 'ORION · TRÁNSITO',
    sub: 'P4 · Módulo servicio europeo activo',
    color: '#00f4fe',           model: 'orion',     align: 'right',
  },
  {
    t: 0.57,
    en: 'UNPOWERED LUNAR FLYBY', es: 'SOBREVUELO LUNAR SIN MOTOR',
    sub: 'P11 · 10,427 km · Lado lejano de la Luna',
    color: '#ff5500',           model: 'orion',     align: 'right', highlight: true,
  },
  {
    t: 0.70,
    en: 'RETURN TRAJECTORY CORRECTION', es: 'CORRECCIÓN TRAYECTORIA RETORNO',
    sub: 'P12 · RTC burn · ~4 días retorno',
    color: '#00f4fe',           model: 'orion',     align: 'left',
  },
  {
    t: 0.87,
    en: 'CM / SM SEPARATION',  es: 'SEP. MÓDULO DE SERVICIO',
    sub: 'P13 · Cápsula sola · Reentrada atmósfera',
    color: '#a855f7',           model: 'orion_cm',  align: 'right',
  },
]

/* ════════════════════════════════════════════
   3-D MODEL COMPONENTS
════════════════════════════════════════════ */

/* Simplified Orion spacecraft */
function OrionModel({ scale = 0.13, showCM = false }) {
  const MAT_SM  = { color: '#999999', metalness: 0.7, roughness: 0.3 }
  const MAT_CM  = { color: '#cccccc', metalness: 0.5, roughness: 0.4 }
  const MAT_SOL = { color: '#1a3a8a', metalness: 0.4, roughness: 0.5, side: THREE.DoubleSide }
  return (
    <group scale={scale}>
      {!showCM && (
        <>
          {/* Service Module */}
          <mesh position={[0, 0, 0]}>
            <cylinderGeometry args={[0.28, 0.28, 0.75, 10]} />
            <meshStandardMaterial {...MAT_SM} />
          </mesh>
          {/* Heat shield disk */}
          <mesh position={[0, -0.42, 0]}>
            <cylinderGeometry args={[0.30, 0.30, 0.04, 10]} />
            <meshStandardMaterial color="#333" roughness={0.9} />
          </mesh>
          {/* Solar panels */}
          {[-1, 1].map(s => (
            <mesh key={s} position={[s * 0.75, 0.1, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <planeGeometry args={[0.90, 0.22]} />
              <meshStandardMaterial {...MAT_SOL} />
            </mesh>
          ))}
        </>
      )}
      {/* Crew Module (truncated cone) */}
      <mesh position={[0, showCM ? 0 : 0.65, 0]}>
        <cylinderGeometry args={[0.13, 0.28, 0.46, 10]} />
        <meshStandardMaterial {...MAT_CM} />
      </mesh>
      {/* LAS tower */}
      <mesh position={[0, showCM ? 0.45 : 1.10, 0]}>
        <cylinderGeometry args={[0.025, 0.055, 0.38, 6]} />
        <meshStandardMaterial color="#888" roughness={0.5} />
      </mesh>
    </group>
  )
}

/* Simplified SLS rocket */
function SLSModel({ separation = false }) {
  const offset = separation ? 0.85 : 0.42
  const angle  = separation ? 0.20 : 0
  return (
    <group scale={0.13}>
      {/* Core stage (orange) */}
      <mesh>
        <cylinderGeometry args={[0.18, 0.18, 2.8, 8]} />
        <meshStandardMaterial color="#e8582a" metalness={0.4} roughness={0.5} />
      </mesh>
      {/* SRBs */}
      {[-1, 1].map(s => (
        <mesh key={s}
          position={[s * offset, separation ? 0.25 : 0, 0]}
          rotation={[0, 0, s * angle]}
        >
          <cylinderGeometry args={[0.075, 0.075, 2.3, 6]} />
          <meshStandardMaterial color="#efefef" metalness={0.3} roughness={0.5} />
        </mesh>
      ))}
      {/* Orion capsule on top */}
      <mesh position={[0, 1.65, 0]}>
        <cylinderGeometry args={[0.09, 0.18, 0.40, 8]} />
        <meshStandardMaterial color="#ddd" metalness={0.5} roughness={0.3} />
      </mesh>
    </group>
  )
}

/* ════════════════════════════════════════════
   SCENE BUILDING BLOCKS
════════════════════════════════════════════ */

function Earth() {
  const [tex, setTex] = useState(null)

  useEffect(() => {
    const loader = new THREE.TextureLoader()
    loader.setCrossOrigin('anonymous')
    Promise.all([
      loader.loadAsync('/textures/earth-day.jpg'),
      loader.loadAsync('/textures/earth-bump.png'),
    ])
      .then(([day, bump]) => setTex({ day, bump }))
      .catch(() => {})
  }, [])

  return (
    <group>
      <mesh>
        <sphereGeometry args={[EARTH_R, 64, 64]} />
        {tex
          ? <meshPhongMaterial map={tex.day} bumpMap={tex.bump} bumpScale={0.04} />
          : <meshStandardMaterial color="#0b3a6b" emissive="#001a33" emissiveIntensity={0.5} />}
      </mesh>
      <mesh>
        <sphereGeometry args={[EARTH_R + 0.06, 32, 32]} />
        <meshStandardMaterial color="#2255ee" emissive="#1133cc" emissiveIntensity={0.8}
          transparent opacity={0.10} side={THREE.BackSide} depthWrite={false} />
      </mesh>
    </group>
  )
}

function Moon() {
  const meshRef = useRef()
  useFrame(() => { if (meshRef.current) meshRef.current.rotation.y += 0.001 })
  return (
    <group position={[MOON_X, 0, 0]}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[MOON_R, 32, 32]} />
        <meshStandardMaterial color="#888d92" roughness={0.9} metalness={0.05}
          emissive="#222222" emissiveIntensity={0.2} />
      </mesh>
    </group>
  )
}

function TrajectoryTube({ curve }) {
  const matRef = useRef()
  const geo = useMemo(() => new THREE.TubeGeometry(curve, 350, 0.016, 6, false), [curve])
  useFrame(({ clock }) => {
    if (matRef.current) matRef.current.opacity = 0.42 + Math.sin(clock.getElapsedTime() * 1.1) * 0.10
  })
  return (
    <mesh geometry={geo}>
      <meshBasicMaterial ref={matRef} color="#00f4fe" transparent opacity={0.48} />
    </mesh>
  )
}

/* ── Static callout markers with 3D model + HTML label ── */
function CalloutMarkers({ curve, lang }) {
  const items = useMemo(() =>
    CALLOUTS.map(c => ({ ...c, pos: curve.getPoint(Math.min(c.t, 0.999)) }))
  , [curve])

  return (
    <>
      {items.map((c, i) => {
        const isHighlight = !!c.highlight
        const labelColor  = c.color
        const offsetX     = c.align === 'right' ? 0.18 : -0.18

        return (
          <group key={i} position={c.pos}>
            {/* Dot marker */}
            <mesh>
              <sphereGeometry args={[0.055, 8, 8]} />
              <meshBasicMaterial color={labelColor} />
            </mesh>
            <pointLight color={labelColor} intensity={0.5} distance={1.0} />

            {/* 3D model offset from dot */}
            <group position={[offsetX * 2.5, 0.35, 0]}>
              {c.model === 'sls_sep'   && <SLSModel separation />}
              {c.model === 'orion'     && <OrionModel />}
              {c.model === 'orion_prox'&& <OrionModel />}
              {c.model === 'orion_cm'  && <OrionModel showCM />}
            </group>

            {/* HTML callout panel */}
            <Html
              position={[offsetX * 3.8, 0.35, 0]}
              center={false}
              distanceFactor={11}
              zIndexRange={[10, 0]}
            >
              <div style={{
                background: isHighlight ? 'rgba(30,10,0,0.92)' : 'rgba(0,1,10,0.88)',
                border: `1px solid ${labelColor}40`,
                borderLeft: `2px solid ${labelColor}`,
                padding: '5px 8px',
                width: '148px',
                backdropFilter: 'blur(8px)',
                transform: c.align === 'right' ? 'translateY(-50%)' : 'translate(-100%, -50%)',
                pointerEvents: 'none',
                userSelect: 'none',
              }}>
                <p style={{
                  color: labelColor, fontSize: '6.5px', fontFamily: 'monospace',
                  textTransform: 'uppercase', letterSpacing: '0.14em', margin: 0,
                  fontWeight: 'bold',
                }}>
                  {lang === 'es' ? c.es : c.en}
                </p>
                <p style={{
                  color: 'rgba(255,255,255,0.45)', fontSize: '5.5px',
                  fontFamily: 'monospace', margin: '3px 0 0', lineHeight: 1.5,
                }}>
                  {c.sub}
                </p>
                {c.inset && (
                  <div style={{
                    marginTop: '5px', borderTop: `1px solid ${labelColor}20`,
                    paddingTop: '4px',
                  }}>
                    {['Sep. ICPS', 'Rot. 180°', 'Aprox. manual', 'Inspección', 'Retroceso'].map((s, j) => (
                      <p key={j} style={{
                        color: '#f59e0b', fontSize: '5px', fontFamily: 'monospace',
                        margin: '1px 0', letterSpacing: '0.08em',
                      }}>
                        {j + 1}. {s}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            </Html>
          </group>
        )
      })}
    </>
  )
}

/* ── Animated spacecraft ── */
function Spacecraft({ curve, progressRef, isPlayingRef }) {
  const groupRef = useRef()
  const lightRef = useRef()
  const tick     = useRef(0)

  useFrame((_, delta) => {
    if (isPlayingRef.current) {
      progressRef.current = (progressRef.current + delta / DURATION) % 1
    }
    const pos = curve.getPoint(Math.min(progressRef.current, 0.999))
    if (groupRef.current) groupRef.current.position.copy(pos)
    if (lightRef.current) lightRef.current.intensity = 0.6 + Math.sin(tick.current * 0.14) * 0.3
    tick.current++
  })

  return (
    <group ref={groupRef}>
      <mesh>
        <icosahedronGeometry args={[0.09, 0]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={2.5} />
      </mesh>
      <pointLight ref={lightRef} color="#00f4fe" intensity={0.9} distance={1.6} />
    </group>
  )
}

/* ── Full 3D Scene ── */
function Scene({ progressRef, isPlayingRef, lang }) {
  const curve = useMemo(() => {
    const pts = RAW_TRAJ.map(([x, z]) => new THREE.Vector3(x, 0, z))
    return new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0.5)
  }, [])

  return (
    <>
      <ambientLight intensity={2.2} color="#ffffff" />
      <Stars radius={120} depth={60} count={4000} factor={3} saturation={0.2} fade speed={0.3} />
      <Earth />
      <Moon />
      <TrajectoryTube curve={curve} />
      <CalloutMarkers curve={curve} lang={lang} />
      <Spacecraft curve={curve} progressRef={progressRef} isPlayingRef={isPlayingRef} />
      <EffectComposer>
        <Bloom intensity={1.1} luminanceThreshold={0.08} luminanceSmoothing={0.8} mipmapBlur />
      </EffectComposer>
      <OrbitControls
        enablePan={false}
        minDistance={3}
        maxDistance={26}
        enableDamping
        dampingFactor={0.06}
        target={[4.0, 0, -0.8]}
      />
    </>
  )
}

/* ════════════════════════════════════════════
   MAIN EXPORT
════════════════════════════════════════════ */
export default function ArtemisTrajectory3D() {
  const { lang } = useLanguage()
  const progressRef  = useRef(0)
  const isPlayingRef = useRef(true)
  const [isPlaying, setIsPlaying]             = useState(true)
  const [displayProgress, setDisplayProgress] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setDisplayProgress(progressRef.current), 120)
    return () => clearInterval(id)
  }, [])

  const togglePlay = () => {
    isPlayingRef.current = !isPlayingRef.current
    setIsPlaying(p => !p)
  }

  const handleReplay = () => {
    progressRef.current = 0
    setDisplayProgress(0)
    isPlayingRef.current = true
    setIsPlaying(true)
  }

  const currentPhase = useMemo(() => {
    for (let i = PHASES.length - 1; i >= 0; i--) {
      if (displayProgress >= PHASES[i][0] - 0.001) return PHASES[i]
    }
    return PHASES[0]
  }, [displayProgress])

  return (
    <div className="relative w-full" style={{ height: '580px' }}>
      <Canvas
        camera={{ position: [4.0, 9, 14], fov: 52 }}
        gl={{ antialias: true, alpha: false }}
        style={{ background: '#00010a', width: '100%', height: '100%' }}
        onCreated={({ gl }) => { gl.domElement.style.touchAction = 'pan-y' }}
      >
        <Suspense fallback={null}>
          <Scene progressRef={progressRef} isPlayingRef={isPlayingRef} lang={lang} />
        </Suspense>
      </Canvas>

      {/* HUD breadcrumb */}
      <div className="absolute top-3 left-4 font-label text-[8px] text-secondary/25 tracking-[0.25em] uppercase pointer-events-none select-none">
        ARTEMIS_II // FIGURA-8 // TRAYECTORIA REAL
      </div>

      {/* Current phase panel */}
      <div className="absolute top-3 right-4 bg-black/85 backdrop-blur-xl border border-secondary-container/20 px-4 py-3 w-[220px]">
        <div className="hud-bracket-tl" /><div className="hud-bracket-br" />
        <p className="font-label text-[7px] text-secondary-container/50 tracking-widest uppercase mb-1">
          {lang === 'es' ? 'FASE ACTUAL' : 'CURRENT PHASE'}
        </p>
        <p className="font-headline font-bold tracking-wider leading-tight text-sm"
          style={{ color: currentPhase[4] }}>
          {lang === 'es' ? currentPhase[1] : currentPhase[2]}
        </p>
        <p className="font-label text-[7px] text-on-surface-variant/45 mt-1.5 leading-relaxed">
          {currentPhase[3]}
        </p>
      </div>

      {/* Phase legend */}
      <div className="absolute top-14 left-4 flex flex-col gap-1 pointer-events-none select-none">
        {PHASES.map(([t, es, en,, color], i) => (
          <div key={i} className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full flex-shrink-0"
              style={{ background: color, opacity: displayProgress >= t - 0.001 ? 1 : 0.2 }} />
            <span className="font-label text-[6.5px] tracking-widest uppercase"
              style={{ color: displayProgress >= t - 0.001 ? color : 'rgba(255,255,255,0.18)' }}>
              {lang === 'es' ? es : en}
            </span>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="absolute bottom-12 left-4 right-4">
        <div className="relative h-px bg-white/10">
          <div className="absolute inset-y-0 left-0 bg-secondary-container shadow-[0_0_6px_rgba(0,244,254,0.8)]"
            style={{ width: `${displayProgress * 100}%`, transition: 'none' }} />
          <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-secondary-container shadow-[0_0_10px_rgba(0,244,254,1)]"
            style={{ left: `${displayProgress * 100}%` }} />
          {PHASES.map(([t,,,, color], i) => (
            <div key={i}
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-px h-3"
              style={{ left: `${t * 100}%`, background: color + '60' }} />
          ))}
        </div>
        <div className="flex justify-between mt-1.5 font-label text-[6.5px] text-on-surface-variant/25 uppercase tracking-wider">
          <span>T+0:00</span>
          <span>T+96H · FLYBY LUNAR</span>
          <span>T+240H</span>
        </div>
      </div>

      {/* Playback controls */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2">
        <button onClick={togglePlay}
          className="flex items-center gap-1.5 bg-black/80 border border-secondary-container/30 px-4 py-1.5 font-label text-[9px] uppercase tracking-widest text-secondary-container backdrop-blur-md hover:border-secondary-container transition-all">
          <span className="material-symbols-outlined text-sm">{isPlaying ? 'pause' : 'play_arrow'}</span>
          {isPlaying ? (lang === 'es' ? 'PAUSAR' : 'PAUSE') : (lang === 'es' ? 'REPRODUCIR' : 'PLAY')}
        </button>
        <button onClick={handleReplay}
          className="flex items-center gap-1.5 bg-black/80 border border-white/10 px-3 py-1.5 font-label text-[9px] uppercase tracking-widest text-on-surface-variant backdrop-blur-md hover:border-white/20 transition-all">
          <span className="material-symbols-outlined text-sm">replay</span>
        </button>
        <div className="bg-black/60 border border-white/10 px-3 py-1.5 font-label text-[7px] uppercase tracking-widest text-on-surface-variant/35 pointer-events-none select-none">
          {lang === 'es' ? 'Arrastra para explorar' : 'Drag to explore'}
        </div>
      </div>
    </div>
  )
}
