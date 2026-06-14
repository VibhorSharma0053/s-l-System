import { motion } from 'framer-motion'
import HolographicPanel from '../shared/HolographicPanel'
import StatBar from '../shared/StatBar'
import GlowingButton from '../shared/GlowingButton'
import { useSystem } from '../../context/SystemContext'
import { STATS, STAT_ICONS, STAT_COLORS } from '../../utils/constants'

export default function StatusPanel() {
  const { playerData, allocateStat } = useSystem()
  const { level, job, title, hp, maxHp, mp, maxMp, xp, stats, remainingPoints } = playerData
  const xpNeeded = level * 100

  return (
    <HolographicPanel title="Status" icon="◈">
      {/* Player Info */}
      <div className="mb-5">
        <h3 className="text-2xl font-bold tracking-wider text-sl-text font-[Orbitron]">
          {playerData.username}
        </h3>
        <div className="flex gap-4 mt-1">
          <span className="text-xs text-sl-text-dim tracking-widest uppercase">
            {title}
          </span>
        </div>
        <div className="flex gap-4 mt-2">
          <div className="flex items-center gap-1.5">
            <span className="text-sl-blue font-bold text-lg font-[Orbitron]">
              Lv.{level}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-sl-text-dim">JOB:</span>
            <span className="text-xs text-sl-cyan font-bold tracking-wider">
              {job}
            </span>
          </div>
        </div>
      </div>

      {/* HP / MP / XP Bars */}
      <div className="space-y-3 mb-5">
        <StatBar label="HP" current={hp} max={maxHp} type="hp" />
        <StatBar label="MP" current={mp} max={maxMp} type="mp" />
        <StatBar label="XP" current={xp} max={xpNeeded} type="xp" />
      </div>

      {/* Remaining Points */}
      {remainingPoints > 0 && (
        <motion.div
          className="mb-4 px-3 py-2 rounded border border-sl-gold/30 bg-sl-gold/5 text-center"
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <span className="text-sl-gold text-sm font-bold tracking-wider">
            ✦ {remainingPoints} POINTS AVAILABLE ✦
          </span>
        </motion.div>
      )}

      {/* Stats */}
      <div className="space-y-2.5">
        {STATS.map((stat) => (
          <div key={stat} className="flex items-center gap-3">
            <span className="text-base w-6 text-center">{STAT_ICONS[stat]}</span>
            <span className="text-xs font-semibold tracking-wider uppercase text-sl-text-dim w-24">
              {stat}
            </span>
            <span
              className="text-sm font-bold w-8 text-right tabular-nums"
              style={{ color: STAT_COLORS[stat] }}
            >
              {stats[stat]}
            </span>
            {remainingPoints > 0 && (
              <GlowingButton
                size="sm"
                onClick={() => allocateStat(stat)}
                className="ml-auto text-[10px] px-2 py-0.5"
              >
                +
              </GlowingButton>
            )}
          </div>
        ))}
      </div>
    </HolographicPanel>
  )
}
