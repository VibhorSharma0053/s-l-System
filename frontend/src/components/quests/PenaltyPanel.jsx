import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import HolographicPanel from '../shared/HolographicPanel'
import GlowingButton from '../shared/GlowingButton'
import { useSystem } from '../../context/SystemContext'

export default function PenaltyPanel() {
  const { processPenalty, playerData } = useSystem()
  const [loading, setLoading] = useState(false)
  
  // Total survives needed (e.g., seconds or reps)
  const PENALTY_TOTAL = 14400 
  const progress = playerData.penalty_progress || 0
  const percent = Math.min((progress / PENALTY_TOTAL) * 100, 100)
  
  const handleSurvive = async () => {
    setLoading(true)
    // Arbitrary increment for demo purposes (e.g., 100 reps/seconds per click)
    await processPenalty(3600) 
    setLoading(false)
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="sl-red-flash relative"
    >
      <HolographicPanel title="PENALTY ZONE" icon="☠" glowColor="red">
        <div className="text-center py-6 space-y-6">
          <motion.div
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            <h2 className="text-2xl font-[Orbitron] text-sl-red sl-glow-text-red mb-2">
              SURVIVAL QUEST
            </h2>
            <p className="text-sm text-sl-text-dim tracking-wider uppercase">
              Survive the Centipede Desert for 4 Hours
            </p>
          </motion.div>

          {/* Progress Bar (Red) */}
          <div className="sl-progress mb-2 border-sl-red/30">
            <motion.div
              className="sl-progress-fill"
              style={{
                width: `${percent}%`,
                background: 'linear-gradient(90deg, rgba(255,51,51,0.6), rgba(255,51,51,0.9))',
                boxShadow: '0 0 10px rgba(255,51,51,0.5)'
              }}
              animate={{ width: `${percent}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          
          <div className="text-xs text-sl-red/80 tracking-widest tabular-nums">
            {progress} / {PENALTY_TOTAL} SECONDS
          </div>

          <div className="pt-4 border-t border-sl-red/20">
            <GlowingButton
              onClick={handleSurvive}
              disabled={loading}
              className="w-full !border-sl-red !text-sl-red hover:!bg-sl-red/20"
              style={{ textShadow: '0 0 10px rgba(255,51,51,0.8)', boxShadow: 'inset 0 0 15px rgba(255,51,51,0.2)' }}
            >
              {loading ? 'SURVIVING...' : 'EVADE CENTIPEDE (+1 Hour)'}
            </GlowingButton>
          </div>
        </div>
      </HolographicPanel>
    </motion.div>
  )
}
