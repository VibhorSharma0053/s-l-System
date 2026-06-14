import { motion } from 'framer-motion'
import HolographicPanel from '../shared/HolographicPanel'
import { useQuestTimer } from '../../hooks/useQuestTimer'

export default function TimerDisplay() {
  const { timeLeft, isUrgent, isCritical } = useQuestTimer()

  return (
    <HolographicPanel
      title="Quest Timer"
      icon="⏱"
      glowColor={isCritical ? 'red' : 'blue'}
    >
      <div className={`text-center py-3 ${isCritical ? 'sl-red-flash' : ''}`}>
        <div className="text-xs text-sl-text-dim tracking-widest uppercase mb-2">
          Time Remaining
        </div>
        <motion.div
          className={`text-4xl font-bold font-[Orbitron] tabular-nums tracking-wider ${
            isCritical
              ? 'text-sl-red sl-glow-text-red'
              : isUrgent
                ? 'text-sl-gold sl-glow-text-gold'
                : 'text-sl-blue sl-glow-text'
          }`}
          animate={
            isCritical ? { scale: [1, 1.05, 1] } : {}
          }
          transition={{ duration: 1, repeat: isCritical ? Infinity : 0 }}
        >
          {String(timeLeft.hours).padStart(2, '0')}:
          {String(timeLeft.minutes).padStart(2, '0')}:
          {String(timeLeft.seconds).padStart(2, '0')}
        </motion.div>
        <div className="text-xs text-sl-text-dim mt-2 tracking-wider">
          {isCritical
            ? '⚠ CRITICAL — COMPLETE QUESTS NOW!'
            : isUrgent
              ? '⚠ Less than 1 hour remaining'
              : 'Until daily quest reset'}
        </div>
      </div>
    </HolographicPanel>
  )
}
