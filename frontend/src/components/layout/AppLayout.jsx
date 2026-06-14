import { Outlet } from 'react-router-dom'
import { motion } from 'framer-motion'
import Navbar from './Navbar'
import NotificationContainer from '../notifications/NotificationContainer'
import ScanlineOverlay from '../shared/ScanlineOverlay'
import ParticleField from '../shared/ParticleField'

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-sl-bg sl-grid-bg relative">
      {/* Global scanline effect */}
      <ScanlineOverlay />

      {/* Floating particles */}
      <ParticleField />

      {/* Notifications */}
      <NotificationContainer />

      {/* Navigation */}
      <Navbar />

      {/* Page content */}
      <motion.main
        className="pt-16 px-4 pb-8 max-w-7xl mx-auto relative z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Outlet />
      </motion.main>
    </div>
  )
}
