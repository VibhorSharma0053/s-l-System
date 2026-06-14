import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import { useSystem } from '../../context/SystemContext'

const navItems = [
  { path: '/', label: 'Dashboard', icon: '◈' },
  { path: '/character', label: 'Character', icon: '⦿' },
  { path: '/quests', label: 'Quests', icon: '⚔' },
  { path: '/inventory', label: 'Inventory', icon: '◰' },
  { path: '/skills', label: 'Skills', icon: '✦' },
  { path: '/shop', label: 'Shop', icon: '◇' },
  { path: '/job', label: 'Job', icon: '⚚' },
]

export default function Navbar() {
  const { logout } = useAuth()
  const { playerData } = useSystem()

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-16">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-sl-darker-blue/95 to-sl-darker-blue/80 backdrop-blur-md border-b border-sl-panel-border" />

      {/* Glow line at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-sl-blue/50 to-transparent" />

      <div className="relative max-w-7xl mx-auto h-full flex items-center justify-between px-4">
        {/* Logo */}
        <motion.div
          className="flex items-center gap-2"
          whileHover={{ scale: 1.02 }}
        >
          <span className="text-xl font-bold tracking-widest text-sl-blue sl-glow-text font-[Orbitron]">
            SYSTEM
          </span>
          <span className="text-xs text-sl-text-dim font-medium tracking-wider">
            Lv.{playerData.level}
          </span>
        </motion.div>

        {/* Nav Links */}
        <div className="flex items-center gap-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `relative px-3 py-2 text-sm font-semibold tracking-wider uppercase transition-all duration-300 ${
                  isActive
                    ? 'text-sl-blue'
                    : 'text-sl-text-dim hover:text-sl-text'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span className="mr-1.5 text-xs">{item.icon}</span>
                  <span className="hidden md:inline">{item.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="navIndicator"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-sl-blue"
                      style={{
                        boxShadow: '0 0 10px rgba(0,168,255,0.5), 0 0 20px rgba(0,168,255,0.3)',
                      }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </div>

        {/* Logout */}
        <motion.button
          onClick={logout}
          className="sl-button px-3 py-1.5 text-xs rounded tracking-wider"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          LOGOUT
        </motion.button>
      </div>
    </nav>
  )
}
