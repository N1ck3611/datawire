import { motion, useMotionValue, useTransform, animate } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import React from 'react'

const InteractiveBackground = () => {
  const containerRef = useRef(null)
  const [particles, setParticles] = useState([])
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // Generate particles
    const newParticles = []
    for (let i = 0; i < 50; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 3 + 1,
        speedX: (Math.random() - 0.5) * 0.5,
        speedY: (Math.random() - 0.5) * 0.5,
        opacity: Math.random() * 0.5 + 0.1
      })
    }
    setParticles(newParticles)

    // Mouse tracking
    const handleMouseMove = (e) => {
      const rect = container.getBoundingClientRect()
      mouseX.set((e.clientX - rect.left) / rect.width)
      mouseY.set((e.clientY - rect.top) / rect.height)
    }

    container.addEventListener('mousemove', handleMouseMove)
    return () => container.removeEventListener('mousemove', handleMouseMove)
  }, [mouseX, mouseY])

  const glowX = useTransform(mouseX, [0, 1], [0, 100])
  const glowY = useTransform(mouseY, [0, 1], [0, 100])

  return (
    <div ref={containerRef} className="fixed inset-0 overflow-hidden pointer-events-none z-0 bg-obsidian-bg">
      {/* Grid lines */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `
          linear-gradient(to right, #ffffff 1px, transparent 1px),
          linear-gradient(to bottom, #ffffff 1px, transparent 1px)
        `,
        backgroundSize: '100px 100px'
      }} />

      {/* Interactive glow */}
      <motion.div
        style={{
          background: `radial-gradient(800px circle at ${glowX}% ${glowY}%, rgba(255, 255, 255, 0.03), transparent 50%)`,
        }}
        className="absolute inset-0"
      />

      {/* Particles */}
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          initial={{ x: `${particle.x}%`, y: `${particle.y}%` }}
          animate={{
            x: `${particle.x}%`,
            y: `${particle.y}%`,
          }}
          transition={{
            duration: 0,
          }}
          className="absolute rounded-full bg-white"
          style={{
            width: particle.size,
            height: particle.size,
            opacity: particle.opacity,
          }}
        />
      ))}

      {/* Noise texture */}
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`
      }} />

      {/* Vignette */}
      <div className="absolute inset-0 bg-gradient-to-t from-obsidian-bg via-transparent to-obsidian-bg opacity-50" />
      <div className="absolute inset-0 bg-gradient-to-b from-obsidian-bg via-transparent to-obsidian-bg opacity-50" />
    </div>
  )
}

export default React.memo(InteractiveBackground)
