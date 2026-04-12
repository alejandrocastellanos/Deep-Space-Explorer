import { Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import Navbar from './Navbar'
import Sidebar from './Sidebar'
import TelemetryFooter from './TelemetryFooter'
import { useISSPosition } from '../hooks/useISSPosition'
import { useAsteroids } from '../hooks/useAsteroids'

const pageVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
  exit:    { opacity: 0, y: -6, transition: { duration: 0.2, ease: 'easeIn' } },
}

export default function Layout({ favCtx }) {
  const { data: issPosition } = useISSPosition()
  const { data: neoData } = useAsteroids()
  const location = useLocation()

  return (
    <div className="min-h-screen bg-black text-on-surface font-body">
      <div className="fixed inset-0 scanline-overlay z-[100] opacity-[0.06] pointer-events-none" />

      <Navbar favCount={favCtx?.favorites?.length ?? 0} />

      <div className="flex">
        <main className="flex-1 pt-16 pr-20 pb-9 min-h-screen overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
        <Sidebar issPosition={issPosition} hazardousCount={neoData?.hazardousCount} />
      </div>

      <TelemetryFooter />
    </div>
  )
}
