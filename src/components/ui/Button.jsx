import { motion } from 'framer-motion'
import { cn } from '../../lib/utils'

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  loading = false, 
  disabled = false,
  className,
  ...props 
}) => {
  const variants = {
    primary: 'bg-white text-black hover:bg-gray-100 shadow-lg shadow-white/10 hover:shadow-white/20',
    secondary: 'bg-white/[0.08] text-white border border-white/[0.15] hover:bg-white/[0.12] hover:border-white/[0.25]',
    danger: 'bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20 hover:border-red-500/40',
    ghost: 'bg-transparent text-white/70 hover:bg-white/[0.05] hover:text-white',
  }

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-sm',
    lg: 'px-8 py-4 text-base',
  }

  return (
    <motion.button
      className={cn(
        'relative overflow-hidden rounded-xl font-medium',
        'transition-all duration-300 ease-out',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled || loading}
      whileHover={{ scale: 1.02, y: -1 }}
      whileTap={{ scale: 0.98 }}
      whileFocus={{ scale: 1.01 }}
      {...props}
    >
      {/* Ripple effect container */}
      <span className="absolute inset-0" />
      
      {/* Loading spinner */}
      {loading && (
        <motion.span
          className="inline-block mr-2"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        </motion.span>
      )}
      
      {children}
    </motion.button>
  )
}

export default Button
