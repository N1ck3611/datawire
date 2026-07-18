import { motion } from 'framer-motion'

const PremiumBackground = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      {/* Base gradient */}
      <div className="absolute inset-0 bg-[#080808]" />
      
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
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.3)_100%)]" />
      
      {/* Animated subtle blur blobs */}
      <motion.div
        className="absolute top-[20%] left-[30%] w-[400px] h-[400px] bg-white/[0.01] rounded-full blur-[80px]"
        animate={{
          x: [0, 30, 0],
          y: [0, -30, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
      <motion.div
        className="absolute bottom-[30%] right-[20%] w-[300px] h-[300px] bg-white/[0.008] rounded-full blur-[60px]"
        animate={{
          x: [0, -20, 0],
          y: [0, 20, 0],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </div>
  )
}

export default PremiumBackground
