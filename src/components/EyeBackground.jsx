import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import React from 'react'

const EyeBackground = () => {
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const canvasRef = useRef(null)
  
  const [isBlinking, setIsBlinking] = useState(false)
  const [upperEyelidY, setUpperEyelidY] = useState(0)
  const [lowerEyelidY, setLowerEyelidY] = useState(0)
  
  // Smooth mouse tracking with spring physics
  const smoothMouseX = useSpring(mouseX, { stiffness: 100, damping: 30 })
  const smoothMouseY = useSpring(mouseY, { stiffness: 100, damping: 30 })
  
  // Idle drift values
  const driftX = useMotionValue(0)
  const driftY = useMotionValue(0)
  
  const pupilX = useTransform([smoothMouseX, driftX], ([mx, dx]) => mx + dx)
  const pupilY = useTransform([smoothMouseY, driftY], ([my, dy]) => my + dy)
  
  // Constrain pupil movement
  const constrainedPupilX = useTransform(pupilX, [-1, 1], [-15, 15])
  const constrainedPupilY = useTransform(pupilY, [-1, 1], [-15, 15])
  
  // Iris movement (slightly follows pupil)
  const irisX = useTransform(constrainedPupilX, (x) => x * 0.3)
  const irisY = useTransform(constrainedPupilY, (y) => y * 0.3)
  
  useEffect(() => {
    const handleMouseMove = (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2
      const y = (e.clientY / window.innerHeight - 0.5) * 2
      mouseX.set(x)
      mouseY.set(y)
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [mouseX, mouseY])
  
  // Idle drift animation
  useEffect(() => {
    const driftInterval = setInterval(() => {
      driftX.set((Math.random() - 0.5) * 0.08)
      driftY.set((Math.random() - 0.5) * 0.06)
    }, 4000 + Math.random() * 3000)
    
    return () => clearInterval(driftInterval)
  }, [driftX, driftY])

  // Physical blinking animation
  useEffect(() => {
    const blink = () => {
      setIsBlinking(true)
      
      // Upper eyelid moves down
      let startTime = null
      const duration = 200
      
      const animateBlink = (timestamp) => {
        if (!startTime) startTime = timestamp
        const progress = (timestamp - startTime) / duration
        
        if (progress < 0.4) {
          // Closing phase
          const closeProgress = progress / 0.4
          setUpperEyelidY(closeProgress * 35)
          setLowerEyelidY(closeProgress * 25)
        } else if (progress < 0.6) {
          // Brief pause while closed
          setUpperEyelidY(35)
          setLowerEyelidY(25)
        } else if (progress < 1) {
          // Opening phase
          const openProgress = (progress - 0.6) / 0.4
          setUpperEyelidY(35 - openProgress * 35)
          setLowerEyelidY(25 - openProgress * 25)
        } else {
          setUpperEyelidY(0)
          setLowerEyelidY(0)
          setIsBlinking(false)
          return
        }
        
        requestAnimationFrame(animateBlink)
      }
      
      requestAnimationFrame(animateBlink)
    }
    
    const interval = setInterval(blink, 12000 + Math.random() * 5000)
    return () => clearInterval(interval)
  }, [])

  // Canvas animation for binary blood vessels
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const binaryChars = ['0', '1']
    const vessels = []
    const particles = []
    
    // Create blood vessel paths from eye center outward
    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    const eyeWidth = Math.min(canvas.width, canvas.height) * 0.7
    const eyeHeight = eyeWidth * 0.55
    const eyeRadius = eyeWidth * 0.45
    
    for (let i = 0; i < 35; i++) {
      const angle = (Math.PI * 2 * i) / 35 + Math.random() * 0.08
      const length = eyeRadius * (0.7 + Math.random() * 0.35)
      const points = []
      
      let currentX = centerX + Math.cos(angle) * eyeRadius * 0.25
      let currentY = centerY + Math.sin(angle) * eyeRadius * 0.2
      let currentAngle = angle
      
      for (let j = 0; j < length; j += 5) {
        currentAngle += Math.sin(j * 0.04) * 0.06 + Math.cos(j * 0.03) * 0.04
        const spread = Math.sin(j * 0.015) * 20
        
        currentX += Math.cos(currentAngle) * 5
        currentY += Math.sin(currentAngle) * 5 + spread
        
        points.push({ x: currentX, y: currentY })
        
        // Branching
        if (Math.random() > 0.97 && j > 35) {
          const branchLength = 25 + Math.random() * 60
          const branchAngle = currentAngle + (Math.random() - 0.5) * 0.5
          let branchX = currentX
          let branchY = currentY
          
          for (let k = 0; k < branchLength; k += 4) {
            branchX += Math.cos(branchAngle) * 4
            branchY += Math.sin(branchAngle) * 4
            points.push({ x: branchX, y: branchY })
          }
        }
      }
      
      vessels.push({
        points,
        speed: 0.4 + Math.random() * 0.8,
        brightness: 0.25 + Math.random() * 0.35
      })
      
      // Create flowing binary particles for this vessel
      const particleCount = 2 + Math.floor(Math.random() * 3)
      for (let p = 0; p < particleCount; p++) {
        particles.push({
          vesselIndex: i,
          position: Math.random() * points.length,
          speed: 0.3 + Math.random() * 0.5,
          char: binaryChars[Math.floor(Math.random() * binaryChars.length)],
          brightness: 0.15 + Math.random() * 0.25
        })
      }
    }

    let animationFrame
    let time = 0

    const animate = () => {
      ctx.fillStyle = '#000000'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      
      time += 0.016
      
      // Draw vessel paths as faint lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.015)'
      ctx.lineWidth = 0.8
      ctx.lineCap = 'round'
      
      vessels.forEach(vessel => {
        ctx.beginPath()
        vessel.points.forEach((point, index) => {
          if (index === 0) {
            ctx.moveTo(point.x, point.y)
          } else {
            ctx.lineTo(point.x, point.y)
          }
        })
        ctx.stroke()
      })
      
      // Draw flowing binary particles in vessels
      ctx.font = '6px monospace'
      
      particles.forEach(particle => {
        const vessel = vessels[particle.vesselIndex]
        const pointIndex = Math.floor(particle.position)
        
        if (pointIndex < vessel.points.length - 1) {
          const point = vessel.points[pointIndex]
          const nextPoint = vessel.points[pointIndex + 1]
          
          const t = particle.position - pointIndex
          const x = point.x + (nextPoint.x - point.x) * t
          const y = point.y + (nextPoint.y - point.y) * t
          
          const pulse = Math.sin(time * 2.5 + particle.position * 0.15) * 0.08
          ctx.globalAlpha = particle.brightness + pulse
          
          ctx.fillStyle = `rgba(255, 255, 255, ${0.25 + pulse})`
          ctx.fillText(particle.char, x, y)
          
          particle.position += particle.speed
          
          if (particle.position >= vessel.points.length - 1) {
            particle.position = 0
            particle.char = binaryChars[Math.floor(Math.random() * binaryChars.length)]
          }
        }
      })
      
      ctx.globalAlpha = 1
      animationFrame = requestAnimationFrame(animate)
    }

    animate()

    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
      cancelAnimationFrame(animationFrame)
    }
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0" />
      
      {/* Cybernetic Eye - Proper Almond Shape */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 2, ease: "easeOut" }}
          className="relative"
          style={{
            width: 'min(80vw, 80vh)',
            height: 'min(44vw, 44vh)'
          }}
        >
          {/* Outer glow */}
          <div 
            className="absolute inset-0"
            style={{
              background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.015) 0%, transparent 60%)',
              filter: 'blur(50px)'
            }}
          />
          
          {/* Eye shape container - almond form */}
          <div 
            className="relative w-full h-full"
            style={{
              borderRadius: '50% 50% 45% 45% / 60% 60% 40% 40%'
            }}
          >
            {/* Sclera - metallic cyber texture */}
            <div 
              className="absolute inset-0 overflow-hidden"
              style={{
                background: `
                  radial-gradient(ellipse at center, 
                    rgba(25, 30, 35, 0.85) 0%, 
                    rgba(15, 18, 22, 0.9) 55%,
                    rgba(8, 10, 12, 0.95) 100%
                  ),
                  repeating-linear-gradient(
                    0deg,
                    transparent,
                    transparent 2px,
                    rgba(255, 255, 255, 0.008) 2px,
                    rgba(255, 255, 255, 0.008) 4px
                  )
                `,
                borderRadius: '50% 50% 45% 45% / 60% 60% 40% 40%',
                boxShadow: `
                  inset 0 0 50px rgba(0, 0, 0, 0.7),
                  inset 0 0 15px rgba(255, 255, 255, 0.015),
                  0 0 30px rgba(255, 255, 255, 0.03)
                `
              }}
            >
              {/* Metallic sheen */}
              <div 
                className="absolute inset-0"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.02) 0%, transparent 50%, rgba(255,255,255,0.015) 100%)',
                  borderRadius: '50% 50% 45% 45% / 60% 60% 40% 40%'
                }}
              />
              
              {/* Iris container - moves slightly with pupil */}
              <motion.div
                className="absolute inset-0 flex items-center justify-center"
                style={{
                  x: irisX,
                  y: irisY
                }}
              >
                {/* Cyber Iris */}
                <motion.div
                  className="relative rounded-full"
                  style={{
                    width: '50%',
                    height: '50%',
                    background: 'radial-gradient(circle at 35% 35%, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 45%, rgba(255,255,255,0.008) 100%)',
                    boxShadow: `
                      0 0 20px rgba(255, 255, 255, 0.08),
                      inset 0 0 15px rgba(0, 0, 0, 0.6),
                      0 0 ${8 + Math.sin(Date.now() * 0.0015) * 4}px rgba(255, 255, 255, 0.04)
                    `,
                    border: '1.5px solid rgba(255, 255, 255, 0.08)'
                  }}
                >
                  {/* Very slow rotating ring */}
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 rounded-full"
                    style={{
                      border: '1px solid rgba(255, 255, 255, 0.05)',
                      background: 'conic-gradient(from 0deg, transparent, rgba(255,255,255,0.012) 20%, transparent 40%, rgba(255,255,255,0.012) 60%, transparent 80%)'
                    }}
                  />
                  
                  {/* Radial circuit details */}
                  <div className="absolute inset-0 rounded-full overflow-hidden">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <div
                        key={i}
                        className="absolute"
                        style={{
                          top: '50%',
                          left: '50%',
                          width: '100%',
                          height: '100%',
                          transform: `translate(-50%, -50%) rotate(${i * 45}deg)`,
                          background: 'linear-gradient(to right, transparent 49%, rgba(255,255,255,0.02) 49%, rgba(255,255,255,0.02) 51%, transparent 51%)'
                        }}
                      />
                    ))}
                  </div>
                  
                  {/* Subtle scanning texture */}
                  <motion.div
                    animate={{ y: ['-100%', '100%'] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 rounded-full overflow-hidden"
                    style={{
                      background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.015) 50%, transparent)',
                      opacity: 0.4
                    }}
                  />
                  
                  {/* Limbal ring */}
                  <div 
                    className="absolute inset-0 rounded-full"
                    style={{
                      border: '2px solid rgba(255, 255, 255, 0.1)',
                  boxShadow: '0 0 8px rgba(255, 255, 255, 0.04)'
                }}
              />
              
              {/* Pupil - follows mouse */}
              <motion.div
                className="absolute rounded-full"
                style={{
                  width: '38%',
                  height: '38%',
                  top: '50%',
                  left: '50%',
                  background: '#000000',
                  boxShadow: `
                    inset 0 0 12px rgba(0, 0, 0, 0.95),
                    0 0 6px rgba(255, 255, 255, 0.08)
                  `,
                  x: constrainedPupilX,
                  y: constrainedPupilY,
                  translateX: '-50%',
                  translateY: '-50%'
                }}
              >
                {/* Primary highlight */}
                <div 
                  className="absolute rounded-full"
                  style={{
                    top: '18%',
                    left: '22%',
                    width: '18%',
                    height: '18%',
                    background: 'rgba(255, 255, 255, 0.45)',
                    boxShadow: '0 0 6px rgba(255, 255, 255, 0.35)'
                  }}
                />
                {/* Secondary highlight */}
                <div 
                  className="absolute rounded-full"
                  style={{
                    bottom: '22%',
                    right: '22%',
                    width: '8%',
                    height: '8%',
                    background: 'rgba(255, 255, 255, 0.15)'
                  }}
                />
              </motion.div>
              
              {/* Faint binary pattern in iris */}
              <div className="absolute inset-0 rounded-full overflow-hidden opacity-15">
                {Array.from({ length: 8 }).map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{ opacity: [0.08, 0.2, 0.08] }}
                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.15 }}
                    className="absolute text-xs text-white font-mono"
                    style={{
                      top: `${30 + Math.random() * 40}%`,
                      left: `${30 + Math.random() * 40}%`,
                      transform: `rotate(${Math.random() * 360}deg)`
                    }}
                  >
                    {Math.random() > 0.5 ? '1' : '0'}
                  </motion.div>
                ))}
              </div>
            </motion.div>
              </motion.div>
            </div>
            
            {/* Upper eyelid - covers top 15% of iris */}
            <motion.div
              animate={{ y: upperEyelidY }}
              transition={{ duration: 0.1 }}
              className="absolute top-0 left-0 right-0 bg-black"
              style={{
                height: '35%',
                borderTopLeftRadius: '70% 75%',
                borderTopRightRadius: '70% 75%',
                borderBottomLeftRadius: '50% 85%',
                borderBottomRightRadius: '50% 85%',
                border: '1px solid rgba(255,255,255,0.08)',
                borderBottom: 'none',
                boxShadow: '0 4px 15px rgba(0,0,0,0.5)',
                zIndex: 10
              }}
            />
            
            {/* Lower eyelid - covers bottom 10% of iris */}
            <motion.div
              animate={{ y: -lowerEyelidY }}
              transition={{ duration: 0.1 }}
              className="absolute bottom-0 left-0 right-0 bg-black"
              style={{
                height: '25%',
                borderTopLeftRadius: '55% 80%',
                borderTopRightRadius: '55% 80%',
                borderBottomLeftRadius: '60% 70%',
                borderBottomRightRadius: '60% 70%',
                border: '1px solid rgba(255,255,255,0.08)',
                borderTop: 'none',
                zIndex: 10
              }}
            />
            
            {/* Eyelashes - upper */}
            <motion.div
              animate={{ y: upperEyelidY }}
              transition={{ duration: 0.1 }}
              className="absolute top-0 left-0 right-0 pointer-events-none"
              style={{
                height: '8%',
                borderTopLeftRadius: '70% 75%',
                borderTopRightRadius: '70% 75%',
                borderBottomLeftRadius: '50% 85%',
                borderBottomRightRadius: '50% 85%',
                zIndex: 11
              }}
            >
              {Array.from({ length: 14 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute bg-white/35"
                  style={{
                    left: `${7 + i * 6.5}%`,
                    top: '-1px',
                    width: '0.8px',
                    height: `${5 + Math.random() * 7}px`,
                    transform: `rotate(${-10 + i * 1.4}deg)`,
                    opacity: 0.25 + Math.random() * 0.2
                  }}
                />
              ))}
            </motion.div>
          </div>
        </motion.div>
      </div>
      
      {/* Scan lines overlay */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 0, 0, 0.08) 2px, rgba(0, 0, 0, 0.08) 4px)',
          opacity: 0.25
        }}
      />
      
      {/* Chromatic aberration */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(90deg, rgba(255,0,0,0.008) 0%, transparent 33%, transparent 66%, rgba(0,255,255,0.008) 100%)',
          mixBlendMode: 'screen',
          opacity: 0.4
        }}
      />
      
      {/* Vignette */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 35%, rgba(0, 0, 0, 0.75) 100%)'
        }}
      />
      
      {/* Subtle glitch flicker */}
      <motion.div
        animate={{ opacity: [0, 0.02, 0] }}
        transition={{ duration: 0.08, repeat: Infinity, repeatDelay: 6 + Math.random() * 8 }}
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'rgba(255, 255, 255, 0.015)'
        }}
      />
    </div>
  )
}

export default React.memo(EyeBackground)
