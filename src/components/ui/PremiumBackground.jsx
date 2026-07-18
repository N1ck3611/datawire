import { motion, useScroll, useSpring } from 'framer-motion'
import { useState, useEffect } from 'react'

const PremiumBackground = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const { scrollY } = useScroll()
  const scrollYSpring = useSpring(scrollY, { stiffness: 100, damping: 30 })

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100
      })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Base gradient */}
      <div className="absolute inset-0 bg-[#080808]" />
      
      {/* Dynamic mouse-following gradient */}
      <motion.div
        className="absolute inset-0 opacity-30"
        style={{
          background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(255,255,255,0.03) 0%, transparent 50%)`,
        }}
        transition={{ type: "spring", stiffness: 50, damping: 30 }}
      />
      
      {/* Subtle radial gradient for depth */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-white/[0.02] rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-white/[0.015] rounded-full blur-[100px]" />
      </div>
      
      {/* Noise texture overlay */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />
      
      {/* Subtle vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)]" />
      
      {/* Animated blur blobs */}
      <motion.div
        className="absolute top-[20%] left-[30%] w-[400px] h-[400px] bg-white/[0.015] rounded-full blur-[80px]"
        animate={{
          x: [0, 50, 0],
          y: [0, -50, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
      <motion.div
        className="absolute bottom-[30%] right-[20%] w-[300px] h-[300px] bg-white/[0.01] rounded-full blur-[60px]"
        animate={{
          x: [0, -40, 0],
          y: [0, 40, 0],
          scale: [1, 1.15, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
      />
      
      <motion.div
        className="absolute top-[60%] left-[10%] w-[250px] h-[250px] bg-white/[0.008] rounded-full blur-[50px]"
        animate={{
          x: [0, 30, 0],
          y: [0, -30, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 4,
        }}
      />
      
      {/* Scroll parallax effect */}
      <motion.div
        className="absolute inset-0 opacity-20"
        style={{
          y: scrollYSpring,
        }}
      >
        <div className="absolute top-[10%] right-[15%] w-[200px] h-[200px] bg-white/[0.01] rounded-full blur-[40px]" />
        <div className="absolute bottom-[20%] left-[20%] w-[150px] h-[150px] bg-white/[0.008] rounded-full blur-[30px]" />
      </motion.div>
      
      {/* Interactive glow effect */}
      <motion.div
        className="fixed w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(255,255,255,0.02) 0%, transparent 70%)',
          x: mousePosition.x * 10 - 300,
          y: mousePosition.y * 10 - 300,
        }}
        transition={{ type: "spring", stiffness: 150, damping: 20 }}
      />
    </div>
  )
}

export default PremiumBackground
