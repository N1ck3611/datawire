import React, { useState, useCallback, useRef, useEffect } from 'react'
import { ChromePicker } from 'react-color'
import { motion, AnimatePresence } from 'framer-motion'
import { Copy, Check, X } from 'lucide-react'

const DiscordColorPicker = ({ 
  value = '#6366f1', 
  onChange, 
  label,
  showAlpha = false,
  showEyeDropper = true,
  showRecentColors = true,
  maxRecentColors = 12,
  onSave
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [localColor, setLocalColor] = useState({ hex: value })
  const [copied, setCopied] = useState(false)
  const [recentColors, setRecentColors] = useState([])
  const pickerRef = useRef(null)
  const containerRef = useRef(null)

  // Sync local color with prop value when not dragging
  useEffect(() => {
    setLocalColor({ hex: value })
  }, [value])

  // Load recent colors from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentColors')
    if (saved) {
      try {
        setRecentColors(JSON.parse(saved))
      } catch (e) {
        console.error('Failed to parse recent colors:', e)
      }
    }
  }, [])

  // Add color to recent colors
  const addToRecentColors = useCallback((color) => {
    setRecentColors(prev => {
      const filtered = prev.filter(c => c !== color)
      const updated = [color, ...filtered].slice(0, maxRecentColors)
      localStorage.setItem('recentColors', JSON.stringify(updated))
      return updated
    })
  }, [maxRecentColors])

  // Handle color change
  const handleColorChange = useCallback((newColor) => {
    setLocalColor(newColor)
    onChange(newColor.hex)
  }, [onChange])

  // Handle save
  const handleSave = useCallback(() => {
    addToRecentColors(localColor.hex)
    if (onSave) {
      onSave(localColor.hex)
    }
    setIsOpen(false)
  }, [localColor, addToRecentColors, onSave])

  // Handle copy to clipboard
  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(localColor.hex)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (e) {
      console.error('Failed to copy:', e)
    }
  }, [localColor])

  // Handle eye dropper
  const handleEyeDropper = useCallback(async () => {
    if (!window.EyeDropper) {
      alert('EyeDropper API is not supported in your browser')
      return
    }

    try {
      const eyeDropper = new window.EyeDropper()
      const result = await eyeDropper.open()
      handleColorChange({ hex: result.sRGBHex })
    } catch (e) {
      console.error('EyeDropper cancelled or failed:', e)
    }
  }, [handleColorChange])

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  return (
    <div className="relative" ref={containerRef}>
      {/* Color Preview Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-4 py-3 bg-black/60 backdrop-blur-xl border border-white/20 rounded-xl hover:border-white/30 transition-all group"
      >
        <div 
          className="w-8 h-8 rounded-lg shadow-inner border-2 border-white/20"
          style={{ backgroundColor: localColor.hex }}
        />
        <div className="flex-1 text-left">
          {label && <p className="text-xs text-white/40 mb-1">{label}</p>}
          <p className="text-sm font-mono text-white/90 uppercase">{localColor.hex}</p>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-white/50"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </motion.div>
      </button>

      {/* Color Picker Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={pickerRef}
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute bottom-full left-0 right-0 mb-2 z-[9999]"
          >
            <div className="bg-[#1e1f22] border border-white/10 rounded-xl shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                <h3 className="text-sm font-semibold text-white">Color Picker</h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 text-white/50 hover:text-white hover:bg-white/10 rounded transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Color Picker */}
              <div className="p-4">
                <div className="flex gap-4">
                  {/* Main Color Picker */}
                  <div className="flex-1">
                    <ChromePicker
                      color={localColor}
                      onChange={handleColorChange}
                      disableAlpha={!showAlpha}
                      styles={{
                        default: {
                          picker: {
                            background: 'transparent',
                            boxShadow: 'none',
                            borderRadius: '0',
                          },
                          header: {
                            display: 'none'
                          },
                          body: {
                            padding: '0'
                          },
                          saturation: {
                            paddingBottom: '10px',
                            borderRadius: '8px',
                            overflow: 'hidden'
                          },
                          Hue: {
                            height: '12px',
                            borderRadius: '6px',
                            marginBottom: '10px'
                          },
                          Alpha: {
                            height: '12px',
                            borderRadius: '6px',
                            marginBottom: '10px'
                          },
                          color: {
                            display: 'none'
                          },
                          swatch: {
                            display: 'none'
                          }
                        }
                      }}
                    />
                  </div>

                  {/* Sidebar */}
                  <div className="w-48 space-y-3">
                    {/* Current Color Preview */}
                    <div className="p-3 bg-black/30 rounded-lg">
                      <div 
                        className="w-full h-12 rounded-lg shadow-inner border-2 border-white/20"
                        style={{ backgroundColor: localColor.hex }}
                      />
                      <p className="text-xs text-white/50 mt-2 text-center font-mono uppercase">
                        {localColor.hex}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      {showEyeDropper && (
                        <button
                          onClick={handleEyeDropper}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 text-white text-xs rounded-lg transition-colors"
                          title="Pick color from screen"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="m2 22 1-1h3l9-9"/>
                            <path d="M3 21v-8l9-9"/>
                            <path d="M18 11l-5-5"/>
                            <path d="M13 6l5-5"/>
                            <path d="M21 3l-5 5"/>
                          </svg>
                          <span>Pick</span>
                        </button>
                      )}
                      <button
                        onClick={handleCopy}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 text-white text-xs rounded-lg transition-colors"
                        title="Copy to clipboard"
                      >
                        {copied ? <Check size={14} /> : <Copy size={14} />}
                        <span>{copied ? 'Copied!' : 'Copy'}</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Color Input */}
                <div className="mt-4 flex gap-2">
                  <input
                    type="text"
                    value={localColor.hex}
                    onChange={(e) => {
                      const value = e.target.value
                      if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
                        handleColorChange({ hex: value })
                      }
                      setLocalColor(prev => ({ ...prev, hex: value }))
                    }}
                    className="flex-1 px-3 py-2 bg-black/30 border border-white/20 rounded-lg text-white text-sm font-mono focus:outline-none focus:border-white/40 transition-colors"
                    placeholder="#000000"
                  />
                </div>

                {/* Recent Colors */}
                {showRecentColors && recentColors.length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs text-white/40 mb-2">Recent Colors</p>
                    <div className="flex flex-wrap gap-2">
                      {recentColors.map((color, index) => (
                        <button
                          key={`${color}-${index}`}
                          onClick={() => handleColorChange({ hex: color })}
                          className="w-8 h-8 rounded-lg border-2 border-white/20 hover:border-white/40 hover:scale-110 transition-all shadow-inner"
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-4 py-3 border-t border-white/10 flex justify-end gap-2">
                <button
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-[#5865f2] hover:bg-[#4752c4] text-white text-sm rounded-lg transition-colors font-medium"
                >
                  Save Color
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default DiscordColorPicker
