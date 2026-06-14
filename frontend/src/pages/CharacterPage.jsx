import { motion } from 'framer-motion'
import HolographicPanel from '../components/shared/HolographicPanel'
import StatBar from '../components/shared/StatBar'
import GlowingButton from '../components/shared/GlowingButton'
import { useSystem } from '../context/SystemContext'
import { STATS, STAT_ICONS, STAT_COLORS, JOBS } from '../utils/constants'

export default function CharacterPage() {
  const { playerData, allocateStat } = useSystem()
  const { level, job, title, hp, maxHp, mp, maxMp, xp, stats, remainingPoints } = playerData
  const xpNeeded = level * 100

  const availableJobs = JOBS.filter((j) => j.minLevel <= level)

  return (
    <div className="py-4 grid grid-cols-1 lg:grid-cols-2 gap-5">
      {/* Character Sheet */}
      <HolographicPanel title="Character Sheet" icon="⦿">
        <div className="text-center mb-6">
          {/* Avatar placeholder */}
          <motion.div
            className="w-24 h-24 mx-auto rounded-full border-2 border-sl-blue/50 bg-sl-darker-blue flex items-center justify-center mb-4"
            animate={{ boxShadow: ['0 0 20px rgba(0,168,255,0.2)', '0 0 40px rgba(0,168,255,0.4)', '0 0 20px rgba(0,168,255,0.2)'] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <span className="text-4xl">⚔️</span>
          </motion.div>
          <h2 className="text-2xl font-bold text-sl-text font-[Orbitron]">{playerData.username}</h2>
          <p className="text-xs text-sl-text-dim tracking-[0.25em] uppercase mt-1">{title}</p>
          <div className="flex justify-center gap-6 mt-3">
            <span className="text-sm"><span className="text-sl-text-dim">Level:</span> <span className="text-sl-blue font-bold">{level}</span></span>
            <span className="text-sm"><span className="text-sl-text-dim">Job:</span> <span className="text-sl-cyan font-bold">{job}</span></span>
          </div>
        </div>

        <div className="space-y-3">
          <StatBar label="HP" current={hp} max={maxHp} type="hp" />
          <StatBar label="MP" current={mp} max={maxMp} type="mp" />
          <StatBar label="XP" current={xp} max={xpNeeded} type="xp" />
        </div>
      </HolographicPanel>

      {/* Stats Allocation */}
      <HolographicPanel title="Stats" icon="✦">
        {remainingPoints > 0 && (
          <motion.div
            className="mb-5 px-3 py-2 rounded border border-sl-gold/30 bg-sl-gold/5 text-center"
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <span className="text-sl-gold text-sm font-bold tracking-wider">
              ✦ {remainingPoints} STAT POINTS AVAILABLE ✦
            </span>
          </motion.div>
        )}

        <div className="space-y-4">
          {STATS.map((stat) => (
            <div key={stat} className="flex items-center gap-3">
              <span className="text-xl w-8 text-center">{STAT_ICONS[stat]}</span>
              <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-bold tracking-wider uppercase" style={{ color: STAT_COLORS[stat] }}>
                    {stat}
                  </span>
                  <span className="text-sm font-bold text-sl-text tabular-nums">
                    {stats[stat]}
                  </span>
                </div>
                <div className="sl-stat-bar h-1.5 rounded-sm">
                  <motion.div
                    className="sl-stat-bar-fill rounded-sm"
                    style={{ background: `linear-gradient(90deg, ${STAT_COLORS[stat]}88, ${STAT_COLORS[stat]})` }}
                    animate={{ width: `${Math.min((stats[stat] / 100) * 100, 100)}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>
              {remainingPoints > 0 && (
                <GlowingButton size="sm" onClick={() => allocateStat(stat)} className="text-xs px-2">
                  +1
                </GlowingButton>
              )}
            </div>
          ))}
        </div>

        {/* Jobs */}
        <div className="mt-6 pt-4 border-t border-sl-panel-border">
          <h3 className="text-xs font-bold tracking-[0.2em] text-sl-blue uppercase mb-3">Available Jobs</h3>
          <div className="space-y-2">
            {availableJobs.map((j) => (
              <div
                key={j.name}
                className={`p-2 rounded border text-xs ${
                  j.name === job
                    ? 'border-sl-blue/50 bg-sl-blue/10 text-sl-blue'
                    : 'border-sl-panel-border bg-sl-darker-blue/30 text-sl-text-dim'
                }`}
              >
                <span className="font-bold">{j.name}</span>
                <span className="ml-2 opacity-70">Lv.{j.minLevel}+ — {j.description}</span>
              </div>
            ))}
          </div>
        </div>
      </HolographicPanel>
    </div>
  )
}
