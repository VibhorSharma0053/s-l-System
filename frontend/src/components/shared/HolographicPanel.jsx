import { motion } from 'framer-motion'

export default function HolographicPanel({
  children,
  title,
  icon,
  className = '',
  glowColor = 'blue',
  animate = true,
}) {
  const glowClasses = {
    blue: 'sl-glow-border',
    red: 'sl-glow-border-red',
  }

  const Wrapper = animate ? motion.div : 'div'
  const wrapperProps = animate
    ? {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.5 },
      }
    : {}

  return (
    <Wrapper
      className={`sl-panel sl-corner-decoration ${glowClasses[glowColor] || glowClasses.blue} ${className}`}
      {...wrapperProps}
    >
      {/* Scanline inside panel */}
      <div className="sl-scanline" />

      {/* Panel Header */}
      {title && (
        <div className="relative z-10 flex items-center gap-2 px-4 py-3 border-b border-sl-panel-border">
          {icon && <span className="text-sl-blue text-lg">{icon}</span>}
          <h2 className="text-sm font-bold tracking-[0.2em] uppercase text-sl-blue sl-glow-text font-[Orbitron]">
            {title}
          </h2>
          {/* Decorative line */}
          <div className="flex-1 h-px bg-gradient-to-r from-sl-blue/30 to-transparent ml-3" />
        </div>
      )}

      {/* Panel Content */}
      <div className="relative z-10 p-4">{children}</div>
    </Wrapper>
  )
}
