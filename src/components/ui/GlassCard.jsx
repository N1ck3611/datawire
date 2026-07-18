import { motion } from 'framer-motion'
import { cn } from '../../lib/utils'

const GlassCard = ({ children, className, hover = true, ...props }) => {
  return (
    <motion.div
      className={cn(
        'relative overflow-hidden rounded-2xl',
        'bg-gradient-to-br from-white/[0.08] to-white/[0.02]',
        'backdrop-blur-xl',
        'border border-white/[0.08]',
        'shadow-[0_8px_32px_rgba(0,0,0,0.4),0_0_0_1px_rgba(255,255,255,0.05)_inset]',
        hover && 'hover:border-white/[0.15] hover:shadow-[0_20px_60px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.1)_inset]',
        'transition-all duration-500 ease-out',
        className
      )}
      whileHover={hover ? { y: -4 } : {}}
      {...props}
    >
      {/* Subtle noise texture overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
      }} />
      
      {/* Subtle gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
      
      {children}
    </motion.div>
  )
}

export default GlassCard
