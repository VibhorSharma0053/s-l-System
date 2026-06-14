import { motion } from 'framer-motion'

export default function StatBar({
  label,
  current,
  max,
  type = 'default', // default, hp, mp, xp
  showValues = true,
  size = 'md', // sm, md
}) {
  const percent = Math.min((current / max) * 100, 100)

  const typeClasses = {
    default: 'sl-stat-bar',
    hp: 'sl-stat-bar sl-stat-bar-hp',
    mp: 'sl-stat-bar sl-stat-bar-mp',
    xp: 'sl-stat-bar sl-stat-bar-xp',
  }

  const heights = {
    sm: 'h-1.5',
    md: 'h-2',
  }

  return (
    <div className="w-full">
      {(label || showValues) && (
        <div className="flex justify-between items-center mb-1">
          {label && (
            <span className="text-xs font-semibold tracking-wider uppercase text-sl-text-dim">
              {label}
            </span>
          )}
          {showValues && (
            <span className="text-xs font-bold text-sl-text tabular-nums">
              {current} / {max}
            </span>
          )}
        </div>
      )}
      <div className={`${typeClasses[type]} ${heights[size]} rounded-sm`}>
        <motion.div
          className="sl-stat-bar-fill rounded-sm"
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
    </div>
  )
}
