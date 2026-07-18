import { motion } from 'framer-motion'
import { cn } from '../../lib/utils'
import { useState } from 'react'

const Input = ({ 
  label, 
  placeholder, 
  value, 
  onChange, 
  type = 'text',
  icon,
  className,
  ...props 
}) => {
  const [focused, setFocused] = useState(false)

  return (
    <div className="relative">
      {label && (
        <motion.label
          className={cn(
            'block text-xs font-medium tracking-wide mb-2 transition-colors duration-200',
            focused ? 'text-white' : 'text-white/50'
          )}
          animate={{ color: focused ? 'rgba(255,255,255,1)' : 'rgba(255,255,255,0.5)' }}
        >
          {label}
        </motion.label>
      )}
      
      <div className="relative">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 transition-colors duration-200">
            {icon}
          </div>
        )}
        
        <motion.input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={cn(
            'w-full px-4 py-3 rounded-xl',
            'bg-white/[0.05] border border-white/[0.08]',
            'text-white placeholder:text-white/30',
            'transition-all duration-300 ease-out',
            'focus:bg-white/[0.08] focus:border-white/[0.2]',
            'focus:shadow-[0_0_0_3px_rgba(255,255,255,0.05)]',
            icon && 'pl-12',
            className
          )}
          whileFocus={{ scale: 1.01 }}
          {...props}
        />
      </div>
    </div>
  )
}

export default Input
