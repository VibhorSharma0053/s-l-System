import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import ScanlineOverlay from '../components/shared/ScanlineOverlay'
import ParticleField from '../components/shared/ParticleField'

export default function AuthPage() {
  const { isAuthenticated, login, register, updateUser } = useAuth()
  const [isLogin, setIsLogin] = useState(true)
  const [form, setForm] = useState({ username: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (isAuthenticated) return <Navigate to="/" replace />

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (isLogin) {
        await login(form.username, form.password)
      } else {
        await register(form.username, form.email, form.password)
      }
    } catch (err) {
      // If backend is not running, create a demo session
      if (err.code === 'ERR_NETWORK' || err.response?.status >= 500 || !err.response) {
        localStorage.setItem('sl_token', 'demo_token')
        updateUser({
          username: form.username || 'Hunter',
          level: 1,
          job: 'None',
          title: 'E-Rank Hunter',
        })
        window.location.href = '/'
        return
      }
      setError(err.response?.data?.detail || 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  return (
    <div className="min-h-screen bg-sl-bg sl-grid-bg flex items-center justify-center relative overflow-hidden">
      <ScanlineOverlay />
      <ParticleField count={50} />

      <motion.div
        className="relative z-10 w-full max-w-md mx-4"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        {/* Title */}
        <div className="text-center mb-8">
          <motion.h1
            className="sl-arise-text text-4xl mb-2 font-[Orbitron]"
            animate={{ opacity: [0.8, 1, 0.8] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            SYSTEM
          </motion.h1>
          <p className="text-sl-text-dim text-sm tracking-[0.3em] uppercase">
            Solo Leveling Self-Improvement
          </p>
        </div>

        {/* Form Panel */}
        <div className="sl-panel sl-glow-border sl-corner-decoration p-6">
          <div className="sl-scanline" />

          {/* Toggle */}
          <div className="flex mb-6 border-b border-sl-panel-border relative z-10">
            {['LOGIN', 'REGISTER'].map((tab, i) => (
              <button
                key={tab}
                onClick={() => { setIsLogin(i === 0); setError('') }}
                className={`flex-1 py-2 text-sm font-bold tracking-widest transition-all duration-300 ${
                  (i === 0 ? isLogin : !isLogin)
                    ? 'text-sl-blue border-b-2 border-sl-blue'
                    : 'text-sl-text-dim hover:text-sl-text'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.form
              key={isLogin ? 'login' : 'register'}
              initial={{ opacity: 0, x: isLogin ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: isLogin ? 20 : -20 }}
              transition={{ duration: 0.3 }}
              onSubmit={handleSubmit}
              className="space-y-4 relative z-10"
            >
              <div>
                <label className="block text-xs text-sl-text-dim tracking-widest uppercase mb-1.5">
                  Hunter Name
                </label>
                <input
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  required
                  className="w-full bg-sl-darker-blue/80 border border-sl-panel-border rounded px-3 py-2.5 text-sm text-sl-text focus:border-sl-blue focus:outline-none focus:shadow-[0_0_10px_rgba(0,168,255,0.2)] transition-all placeholder:text-sl-text-dim/40"
                  placeholder="Enter your hunter name"
                />
              </div>

              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <label className="block text-xs text-sl-text-dim tracking-widest uppercase mb-1.5">
                    Email
                  </label>
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    className="w-full bg-sl-darker-blue/80 border border-sl-panel-border rounded px-3 py-2.5 text-sm text-sl-text focus:border-sl-blue focus:outline-none focus:shadow-[0_0_10px_rgba(0,168,255,0.2)] transition-all placeholder:text-sl-text-dim/40"
                    placeholder="Enter your email"
                  />
                </motion.div>
              )}

              <div>
                <label className="block text-xs text-sl-text-dim tracking-widest uppercase mb-1.5">
                  Password
                </label>
                <input
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  className="w-full bg-sl-darker-blue/80 border border-sl-panel-border rounded px-3 py-2.5 text-sm text-sl-text focus:border-sl-blue focus:outline-none focus:shadow-[0_0_10px_rgba(0,168,255,0.2)] transition-all placeholder:text-sl-text-dim/40"
                  placeholder="Enter password"
                />
              </div>

              {error && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-sl-red text-xs text-center tracking-wider"
                >
                  ⚠ {error}
                </motion.p>
              )}

              <motion.button
                type="submit"
                disabled={loading}
                className="sl-button w-full py-3 rounded text-sm tracking-[0.2em] mt-2"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                {loading ? 'CONNECTING...' : isLogin ? 'ENTER SYSTEM' : 'AWAKEN'}
              </motion.button>
            </motion.form>
          </AnimatePresence>
        </div>

        <p className="text-center text-xs text-sl-text-dim/50 mt-6 tracking-wider">
          "I alone level up."
        </p>
      </motion.div>
    </div>
  )
}
