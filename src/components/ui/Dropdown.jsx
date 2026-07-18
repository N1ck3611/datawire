import { motion, AnimatePresence } from 'framer-motion'
import { useState, useRef, useEffect } from 'react'
import { cn } from '../../lib/utils'

const Dropdown = ({ 
  options, 
  value, 
  onChange, 
  placeholder = 'Select option',
  searchable = false,
  grouped = false,
  className,
  ...props 
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const dropdownRef = useRef(null)
  const triggerRef = useRef(null)
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 })

  const selectedOption = options?.find(opt => opt.value === value)

  // Filter options based on search
  const filteredOptions = searchable && searchQuery
    ? options.filter(opt => 
        opt.label?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        opt.value?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : options

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) &&
          triggerRef.current && !triggerRef.current.contains(event.target)) {
        setIsOpen(false)
        setSearchQuery('')
      }
    }

    const handleScroll = () => {
      if (isOpen && triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect()
        setPosition({
          top: rect.bottom + 8,
          left: rect.left,
          width: rect.width
        })
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    window.addEventListener('scroll', handleScroll, true)
    window.addEventListener('resize', handleScroll)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      window.removeEventListener('scroll', handleScroll, true)
      window.removeEventListener('resize', handleScroll)
    }
  }, [isOpen])

  const handleToggle = () => {
    if (!isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      setPosition({
        top: rect.bottom + 8,
        left: rect.left,
        width: rect.width
      })
    }
    setIsOpen(!isOpen)
  }

  const handleSelect = (option) => {
    onChange(option.value)
    setIsOpen(false)
    setSearchQuery('')
  }

  return (
    <>
      <div ref={triggerRef} className={cn('relative', className)}>
        <motion.button
          onClick={handleToggle}
          className={cn(
            'w-full px-4 py-3 rounded-xl',
            'bg-white/[0.05] border border-white/[0.08]',
            'text-left flex items-center justify-between',
            'transition-all duration-300 ease-out',
            'hover:bg-white/[0.08] hover:border-white/[0.15]',
            'focus:outline-none focus:ring-2 focus:ring-white/[0.1]',
            isOpen && 'border-white/[0.2] bg-white/[0.08]'
          )}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          {...props}
        >
          <span className={cn(
            'text-sm transition-colors',
            selectedOption ? 'text-white' : 'text-white/40'
          )}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="text-white/40"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </motion.div>
        </motion.button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <motion.div
              ref={dropdownRef}
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="fixed z-50"
              style={{
                top: `${position.top}px`,
                left: `${position.left}px`,
                width: `${position.width}px`
              }}
            >
              <div className={cn(
                'rounded-xl overflow-hidden',
                'bg-[#0a0a0f] border border-white/[0.1]',
                'shadow-[0_20px_60px_rgba(0,0,0,0.5)]',
                'backdrop-blur-xl'
              )}>
                {searchable && (
                  <div className="p-3 border-b border-white/[0.08]">
                    <input
                      type="text"
                      placeholder="Search..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-white/[0.05] border border-white/[0.08] text-white placeholder:text-white/30 text-sm focus:outline-none focus:border-white/[0.15]"
                      autoFocus
                    />
                  </div>
                )}
                
                <div className="max-h-64 overflow-y-auto custom-scrollbar">
                  {filteredOptions.length === 0 ? (
                    <div className="p-4 text-center text-white/40 text-sm">
                      No results found
                    </div>
                  ) : grouped ? (
                    Object.entries(
                      filteredOptions.reduce((acc, opt) => {
                        const group = opt.group || 'Other'
                        acc[group] = acc[group] || []
                        acc[group].push(opt)
                        return acc
                      }, {})
                    ).map(([group, groupOptions]) => (
                      <div key={group}>
                        <div className="px-4 py-2 text-xs font-medium text-white/30 uppercase tracking-wider">
                          {group}
                        </div>
                        {groupOptions.map((option) => (
                          <motion.button
                            key={option.value}
                            onClick={() => handleSelect(option)}
                            className={cn(
                              'w-full px-4 py-3 text-left text-sm transition-colors',
                              'flex items-center gap-3',
                              option.value === value
                                ? 'bg-white/[0.1] text-white'
                                : 'text-white/60 hover:bg-white/[0.05] hover:text-white'
                            )}
                            whileHover={{ x: 4 }}
                          >
                            {option.icon && (
                              <span className="text-white/40">{option.icon}</span>
                            )}
                            <span className="flex-1">{option.label}</span>
                            {option.value === value && (
                              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </motion.button>
                        ))}
                      </div>
                    ))
                  ) : (
                    filteredOptions.map((option) => (
                      <motion.button
                        key={option.value}
                        onClick={() => handleSelect(option)}
                        className={cn(
                          'w-full px-4 py-3 text-left text-sm transition-colors',
                          'flex items-center gap-3',
                          option.value === value
                            ? 'bg-white/[0.1] text-white'
                            : 'text-white/60 hover:bg-white/[0.05] hover:text-white'
                        )}
                        whileHover={{ x: 4 }}
                      >
                        {option.icon && (
                          <span className="text-white/40">{option.icon}</span>
                        )}
                        <span className="flex-1">{option.label}</span>
                        {option.value === value && (
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </motion.button>
                    ))
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

export default Dropdown
