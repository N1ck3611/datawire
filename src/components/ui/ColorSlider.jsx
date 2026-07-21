import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

const ColorSlider = ({ value, onChange, label }) => {
  const [hue, setHue] = useState(0)
  const [saturation, setSaturation] = useState(100)
  const [lightness, setLightness] = useState(50)

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

  const handleHueChange = (e) => {
    const newHue = parseInt(e.target.value)
    setHue(newHue)
    const hex = hslToHex(newHue, saturation, lightness)
    onChange(hex)
  }

  const handleSaturationChange = (e) => {
    const newSaturation = parseInt(e.target.value)
    setSaturation(newSaturation)
    const hex = hslToHex(hue, newSaturation, lightness)
    onChange(hex)
  }

  const handleLightnessChange = (e) => {
    const newLightness = parseInt(e.target.value)
    setLightness(newLightness)
    const hex = hslToHex(hue, saturation, newLightness)
    onChange(hex)
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
        <div>
          <p className="text-white font-medium">Current Color</p>
          <p className="text-white/60 text-sm font-mono">{currentColor.toUpperCase()}</p>
        </div>
      </div>

      {/* Hue Slider */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-white/60">
          <span>Hue</span>
          <span>{hue}°</span>
        </div>
        <div className="relative h-6 rounded-lg overflow-hidden">
          <div 
            className="absolute inset-0 rounded-lg"
            style={{
              background: `linear-gradient(to right, 
                hsl(0, 100%, 50%), 
                hsl(60, 100%, 50%), 
                hsl(120, 100%, 50%), 
                hsl(180, 100%, 50%), 
                hsl(240, 100%, 50%), 
                hsl(300, 100%, 50%), 
                hsl(360, 100%, 50%))`
            }}
          />
          <input
            type="range"
            min="0"
            max="360"
            value={hue}
            onChange={handleHueChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <motion.div
            className="absolute top-0 bottom-0 w-1 bg-white rounded shadow-lg pointer-events-none"
            style={{ left: `${(hue / 360) * 100}%` }}
            animate={{ left: `${(hue / 360) * 100}%` }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
        </div>
      </div>

      {/* Saturation Slider */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-white/60">
          <span>Saturation</span>
          <span>{saturation}%</span>
        </div>
        <div className="relative h-6 rounded-lg overflow-hidden">
          <div 
            className="absolute inset-0 rounded-lg"
            style={{
              background: `linear-gradient(to right, 
                hsl(${hue}, 0%, ${lightness}%), 
                hsl(${hue}, 100%, ${lightness}%))`
            }}
          />
          <input
            type="range"
            min="0"
            max="100"
            value={saturation}
            onChange={handleSaturationChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <motion.div
            className="absolute top-0 bottom-0 w-1 bg-white rounded shadow-lg pointer-events-none"
            style={{ left: `${(saturation / 100) * 100}%` }}
            animate={{ left: `${(saturation / 100) * 100}%` }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
        </div>
      </div>

      {/* Lightness Slider */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-white/60">
          <span>Lightness</span>
          <span>{lightness}%</span>
        </div>
        <div className="relative h-6 rounded-lg overflow-hidden">
          <div 
            className="absolute inset-0 rounded-lg"
            style={{
              background: `linear-gradient(to right, 
                hsl(${hue}, ${saturation}%, 0%), 
                hsl(${hue}, ${saturation}%, 50%), 
                hsl(${hue}, ${saturation}%, 100%))`
            }}
          />
          <input
            type="range"
            min="0"
            max="100"
            value={lightness}
            onChange={handleLightnessChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <motion.div
            className="absolute top-0 bottom-0 w-1 bg-white rounded shadow-lg pointer-events-none"
            style={{ left: `${(lightness / 100) * 100}%` }}
            animate={{ left: `${(lightness / 100) * 100}%` }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
        </div>
      </div>
    </div>
  )
}

export default ColorSlider
