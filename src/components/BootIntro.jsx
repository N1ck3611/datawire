import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const BootIntro = ({ onComplete }) => {
  const [currentLineIndex, setCurrentLineIndex] = useState(0)
  const [showEnter, setShowEnter] = useState(false)

  const bootLines = [
    'Initializing DataWire OS v2.0...',
    'Loading kernel modules...',
    'Mounting file systems...',
    'Starting network services...',
    'Loading user profiles...',
    'Initializing graphics subsystem...',
    'Loading audio drivers...',
    'Starting music daemon...',
    'System ready.'
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentLineIndex(prev => {
        if (prev < bootLines.length - 1) {
          return prev + 1
        } else {
          clearInterval(interval)
          setTimeout(() => {
            setShowEnter(true)
          }, 500)
          return prev
        }
      })
    }, 400)

    return () => clearInterval(interval)
  }, [])

  const handleEnter = () => {
    onComplete(true)
  }

  return (
    <div className="fixed inset-0 bg-osint-bg z-50 flex flex-col items-center justify-center font-mono">
      <div className="max-w-2xl w-full px-6">
        {/* Boot Sequence */}
        <div className="space-y-2 mb-8">
          {bootLines.map((line, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={index <= currentLineIndex ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
              transition={{ delay: index * 0.1 }}
              className="text-white text-sm"
            >
              {line}
            </motion.div>
          ))}
        </div>

        {/* ENTER Button */}
        <AnimatePresence>
          {showEnter && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="text-center"
            >
              <motion.button
                onClick={handleEnter}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="text-6xl font-bold text-white hover:text-gray-300 transition-colors cursor-pointer"
                style={{ textShadow: '0 0 20px rgba(255, 255, 255, 0.3)' }}
              >
                ENTER
              </motion.button>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="text-osint-muted text-sm mt-4"
              >
                Press ENTER to continue
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Blinking Cursor */}
      <motion.div
        animate={{ opacity: [1, 0, 1] }}
        transition={{ duration: 1, repeat: Infinity }}
        className="fixed bottom-8 right-8 text-white text-xl"
      >
        _
      </motion.div>
    </div>
  )
}

export default BootIntro
