import { motion } from 'framer-motion'

export default function GlowingButton({
  children,
  onClick,
  variant = 'primary', // primary, danger, gold, success
  size = 'md',         // sm, md, lg
  disabled = false,
  className = '',
  fullWidth = false,
}) {
  const variants = {
    primary: {
      bg: 'from-sl-blue/20 to-sl-blue/5',
      border: 'border-sl-blue/40 hover:border-sl-blue/80',
      shadow: 'hover:shadow-[0_0_20px_rgba(0,168,255,0.3)]',
      text: 'text-sl-blue',
    },
    danger: {
      bg: 'from-sl-red/20 to-sl-red/5',
      border: 'border-sl-red/40 hover:border-sl-red/80',
      shadow: 'hover:shadow-[0_0_20px_rgba(255,51,51,0.3)]',
      text: 'text-sl-red',
    },
    gold: {
      bg: 'from-sl-gold/20 to-sl-gold/5',
      border: 'border-sl-gold/40 hover:border-sl-gold/80',
      shadow: 'hover:shadow-[0_0_20px_rgba(255,215,0,0.3)]',
      text: 'text-sl-gold',
    },
    success: {
      bg: 'from-sl-green/20 to-sl-green/5',
      border: 'border-sl-green/40 hover:border-sl-green/80',
      shadow: 'hover:shadow-[0_0_20px_rgba(0,255,136,0.3)]',
      text: 'text-sl-green',
    },
  }

  const sizes = {
    sm: 'px-3 py-1 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  }

  const v = variants[variant]

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      className={`
        relative overflow-hidden font-semibold tracking-wider uppercase rounded
        bg-gradient-to-br ${v.bg} border ${v.border} ${v.text} ${v.shadow}
        transition-all duration-300 font-[Rajdhani]
        ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
      whileHover={disabled ? {} : { scale: 1.03 }}
      whileTap={disabled ? {} : { scale: 0.97 }}
    >
      {/* Shimmer effect */}
      {!disabled && (
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="absolute top-0 -left-full w-full h-full"
            style={{
              background:
                'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)',
              animation: 'buttonShimmer 3s infinite',
            }}
          />
        </div>
      )}
      <span className="relative z-10">{children}</span>
    </motion.button>
  )
}
