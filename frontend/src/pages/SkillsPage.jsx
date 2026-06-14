import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import HolographicPanel from '../components/shared/HolographicPanel'
import { useNotifications } from '../context/NotificationContext'
import { NOTIFICATION_TYPES } from '../utils/constants'
import api from '../utils/api'

export default function SkillsPage() {
  const [skills, setSkills] = useState([])
  const { addNotification } = useNotifications()

  const fetchSkills = async () => {
    try {
      const { data } = await api.get('/v1/skills')
      setSkills(data)
    } catch (err) {
      console.error('Fetch skills error', err)
    }
  }

  useEffect(() => {
    fetchSkills()
  }, [])

  // Local cooldown ticker
  useEffect(() => {
    const interval = setInterval(() => {
      setSkills((prev) =>
        prev.map((s) =>
          s.current_cooldown > 0 ? { ...s, current_cooldown: s.current_cooldown - 1 } : s
        )
      )
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const handleCast = async (skill) => {
    if (!skill.unlocked || skill.type !== 'active' || skill.current_cooldown > 0) return

    try {
      const { data } = await api.post('/v1/skills/cast', { skill_id: skill.id })
      addNotification(NOTIFICATION_TYPES.SYSTEM, `CAST: ${skill.name} - ${data.effect}`)
      
      // Update local cooldown
      setSkills((prev) =>
        prev.map((s) =>
          s.id === skill.id ? { ...s, current_cooldown: data.cooldown_seconds } : s
        )
      )
    } catch (err) {
      addNotification(NOTIFICATION_TYPES.SYSTEM, err.response?.data?.detail || 'Failed to cast')
    }
  }

  const activeSkills = skills.filter((s) => s.type === 'active')
  const passiveSkills = skills.filter((s) => s.type === 'passive')

  return (
    <div className="py-4 grid grid-cols-1 lg:grid-cols-2 gap-5">
      {/* Active Skills */}
      <HolographicPanel title="Active Skills" icon="⚡">
        <div className="space-y-3">
          {activeSkills.map((skill, i) => (
            <motion.div
              key={skill.id}
              onClick={() => handleCast(skill)}
              className={`p-3 rounded border transition-all ${
                skill.unlocked
                  ? skill.current_cooldown > 0
                    ? 'border-sl-red/30 bg-sl-red/10 cursor-not-allowed'
                    : 'border-sl-panel-border bg-sl-darker-blue/50 cursor-pointer hover:border-sl-blue'
                  : 'border-sl-panel-border/30 bg-sl-darker-blue/20 opacity-50'
              }`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: skill.unlocked ? 1 : 0.5, x: 0 }}
              transition={{ delay: i * 0.1 }}
              whileTap={skill.unlocked && skill.current_cooldown === 0 ? { scale: 0.98 } : {}}
            >
              <div className="flex items-start gap-3">
                <div className="text-2xl w-10 h-10 flex items-center justify-center rounded bg-sl-blue/10 border border-sl-blue/20 shrink-0 relative overflow-hidden">
                  {skill.icon}
                  {/* Cooldown overlay mask */}
                  {skill.current_cooldown > 0 && (
                    <motion.div 
                      className="absolute bottom-0 left-0 w-full bg-sl-red/50"
                      initial={{ height: '100%' }}
                      animate={{ height: `${(skill.current_cooldown / skill.cooldown_seconds) * 100}%` }}
                      transition={{ duration: 1, ease: 'linear' }}
                    />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <h4 className="text-sm font-bold tracking-wider text-sl-text">{skill.name}</h4>
                    {!skill.unlocked && (
                      <span className="text-[10px] text-sl-text-dim">Lv.{skill.unlock_level} Required</span>
                    )}
                  </div>
                  <p className="text-xs text-sl-text-dim mt-0.5">{skill.description}</p>
                  {skill.unlocked && (
                    <span className={`text-[10px] tracking-wider mt-1 inline-block ${skill.current_cooldown > 0 ? 'text-sl-red font-bold' : 'text-sl-cyan'}`}>
                      {skill.current_cooldown > 0 ? `ON COOLDOWN: ${skill.current_cooldown}s` : `READY (${skill.cooldown_seconds}s CD)`}
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </HolographicPanel>

      {/* Passive Skills */}
      <HolographicPanel title="Passive Skills" icon="✦">
        <div className="space-y-3">
          {passiveSkills.map((skill, i) => (
            <motion.div
              key={skill.id}
              className={`p-3 rounded border transition-all ${
                skill.unlocked
                  ? 'border-sl-green/20 bg-sl-green/5'
                  : 'border-sl-panel-border/30 bg-sl-darker-blue/20 opacity-50'
              }`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: skill.unlocked ? 1 : 0.5, x: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="flex items-start gap-3">
                <div className="text-2xl w-10 h-10 flex items-center justify-center rounded bg-sl-green/10 border border-sl-green/20 shrink-0">
                  {skill.icon}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <h4 className="text-sm font-bold tracking-wider text-sl-text">{skill.name}</h4>
                    {!skill.unlocked && (
                      <span className="text-[10px] text-sl-text-dim">Lv.{skill.unlock_level} Required</span>
                    )}
                  </div>
                  <p className="text-xs text-sl-text-dim mt-0.5">{skill.description}</p>
                  {skill.unlocked && (
                    <span className="text-[10px] text-sl-green tracking-wider mt-1 inline-block font-bold">
                      {skill.effect}
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </HolographicPanel>
    </div>
  )
}
