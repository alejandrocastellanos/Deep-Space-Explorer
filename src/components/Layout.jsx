import { Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import Navbar from './Navbar'
import TelemetryFooter from './TelemetryFooter'

const pageVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
  exit:    { opacity: 0, y: -6, transition: { duration: 0.2, ease: 'easeIn' } },
}

export default function Layout({ favCtx }) {
  const location = useLocation()

  return (
    <div className="min-h-screen bg-black text-on-surface font-body">
      <div className="fixed inset-0 scanline-overlay z-[100] opacity-[0.06] pointer-events-none" />

      <Navbar favCount={favCtx?.favorites?.length ?? 0} />

      <main className="pt-16 pb-9 min-h-screen">
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

      <TelemetryFooter />
    </div>
  )
}
