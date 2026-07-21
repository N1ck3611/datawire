import React, { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

const ColorSlider = ({ value, onChange, label, onSave }) => {
  const [hue, setHue] = useState(0)
  const [saturation, setSaturation] = useState(100)
  const [lightness, setLightness] = useState(50)
  const [isDragging, setIsDragging] = useState(false)
  const canvasRef = useRef(null)
  const sliderRef = useRef(null)

  useEffect(() => {
    if (value) {
      const hsl = hexToHSL(value)
      setHue(hsl.h)
      setSaturation(hsl.s)
      setLightness(hsl.l)
    }
  }, [value])

  const hexToHSL = (hex) => {
    let r = parseInt(hex.slice(1, 3), 16) / 255
    let g = parseInt(hex.slice(3, 5), 16) / 255
    let b = parseInt(hex.slice(5, 7), 16) / 255

    let max = Math.max(r, g, b), min = Math.min(r, g, b)
    let h, s, l = (max + min) / 2

    if (max === min) {
      h = s = 0
    } else {
      let d = max - min
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
        case g: h = ((b - r) / d + 2) / 6; break
        case b: h = ((r - g) / d + 4) / 6; break
      }
    }

    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) }
  }

  const hslToHex = (h, s, l) => {
    s /= 100
    l /= 100
    let c = (1 - Math.abs(2 * l - 1)) * s
    let x = c * (1 - Math.abs((h / 60) % 2 - 1))
    let m = l - c / 2
    let r = 0, g = 0, b = 0

    if (0 <= h < 60) { r = c; g = x; b = 0 }
    else if (60 <= h < 120) { r = x; g = c; b = 0 }
    else if (120 <= h < 180) { r = 0; g = c; b = x }
    else if (180 <= h < 240) { r = 0; g = x; b = c }
    else if (240 <= h < 300) { r = x; g = 0; b = c }
    else if (300 <= h < 360) { r = c; g = 0; b = x }

    r = Math.round((r + m) * 255).toString(16).padStart(2, '0')
    g = Math.round((g + m) * 255).toString(16).padStart(2, '0')
    b = Math.round((b + m) * 255).toString(16).padStart(2, '0')

    return `#${r}${g}${b}`
  }

  const handleColorPickerClick = (e) => {
    const rect = sliderRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    const newSaturation = Math.round((x / rect.width) * 100)
    const newLightness = Math.round(100 - (y / rect.height) * 100)
    
    setSaturation(newSaturation)
    setLightness(newLightness)
    const hex = hslToHex(hue, newSaturation, newLightness)
    onChange(hex)
  }

  const handleColorPickerDrag = (e) => {
    if (!isDragging) return
    handleColorPickerClick(e)
  }

  const currentColor = hslToHex(hue, saturation, lightness)

  return (
    <div className="space-y-4">
      {label && <p className="text-sm text-white font-medium mb-3">{label}</p>}
      
      {/* Color Preview */}
      <div className="flex items-center gap-4 mb-4">
        <div 
          className="w-16 h-16 rounded-xl border-2 border-white/20 shadow-lg"
          style={{ backgroundColor: currentColor }}
        />
        <div className="flex-1">
          <p className="text-white font-medium">Current Color</p>
          <p className="text-white/60 text-sm font-mono">{currentColor.toUpperCase()}</p>
        </div>
        {onSave && (
          <button
            onClick={() => onSave(currentColor)}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white text-sm transition-colors"
          >
            Save
          </button>
        )}
      </div>

      {/* Color Picker Area (Saturation/Lightness) */}
      <div className="space-y-2">
        <div 
          ref={sliderRef}
          className="relative h-40 rounded-lg overflow-hidden cursor-crosshair border border-white/20"
          style={{
            background: `linear-gradient(to bottom, transparent, black), linear-gradient(to right, white, transparent), hsl(${hue}, 100%, 50%)`
          }}
          onMouseDown={(e) => {
            setIsDragging(true)
            handleColorPickerClick(e)
          }}
          onMouseMove={handleColorPickerDrag}
          onMouseUp={() => setIsDragging(false)}
          onMouseLeave={() => setIsDragging(false)}
        >
          {/* Color selector circle */}
          <div
            className="absolute w-4 h-4 rounded-full border-2 border-white shadow-lg pointer-events-none transform -translate-x-1/2 -translate-y-1/2"
            style={{
              left: `${saturation}%`,
              top: `${100 - lightness}%`,
              backgroundColor: currentColor
            }}
          />
        </div>
      </div>

      {/* Hue Slider */}
      <div className="space-y-2">
        <div className="relative h-6 rounded-lg overflow-hidden border border-white/20">
          <div 
            className="absolute inset-0 rounded-lg"
            style={{
              background: `linear-gradient(to right, 
                #ff0000 0%, 
                #ffff00 17%, 
                #00ff00 33%, 
                #00ffff 50%, 
                #0000ff 67%, 
                #ff00ff 83%, 
                #ff0000 100%)`
            }}
          />
          <input
            type="range"
            min="0"
            max="360"
            value={hue}
            onChange={(e) => {
              const newHue = parseInt(e.target.value)
              setHue(newHue)
              const hex = hslToHex(newHue, saturation, lightness)
              onChange(hex)
            }}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div
            className="absolute top-0 bottom-0 w-1 bg-white rounded shadow-lg pointer-events-none transform -translate-x-1/2"
            style={{ left: `${(hue / 360) * 100}%` }}
          />
        </div>
      </div>
    </div>
  )
}

export default ColorSlider
