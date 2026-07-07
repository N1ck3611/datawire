import { motion } from 'framer-motion'
import { useState } from 'react'

const ProviderScroll = () => {
  const [hoveredProvider, setHoveredProvider] = useState(null)

  const providers = [
    { 
      name: "SEON", 
      description: "Fraud prevention & digital intelligence",
    },
    { 
      name: "HUDSON ROCK", 
      description: "Infostealer intelligence solutions",
    },
    { 
      name: "SHODAN", 
      description: "Internet-connected device search",
    },
    { 
      name: "INTELX", 
      description: "Deep web data archive",
    },
    { 
      name: "SNUSBASE", 
      description: "Database breach search engine",
    },
    { 
      name: "DEHASHED", 
      description: "Breach intelligence platform",
    },
    { 
      name: "LEAKCHECK", 
      description: "Credential exposure monitoring",
    },
    { 
      name: "CRIMINAL IP", 
      description: "Cyber threat intelligence",
    },
    { 
      name: "HIBP", 
      description: "Data breach checker",
    },
  ]

  const duplicatedProviders = [...providers, ...providers, ...providers]

  return (
    <div className="relative overflow-hidden py-12 bg-osint-card/30 border-y border-osint-border">
      {/* Gradient fade effects */}
      <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-osint-bg to-transparent z-10" />
      <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-osint-bg to-transparent z-10" />

      {/* Header */}
      <div className="text-center mb-8 relative z-20">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-2xl md:text-3xl font-bold text-white mb-2"
        >
          Integrated Intelligence Providers
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-gray-400 text-sm"
        >
          Access 9+ premium OSINT APIs through a single platform
        </motion.p>
      </div>

      {/* Scrolling container */}
      <div className="relative">
        <motion.div
          className="flex gap-8 px-8"
          animate={{
            x: [0, -1000],
          }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: "loop",
              duration: 30,
              ease: "linear",
            },
          }}
        >
          {duplicatedProviders.map((provider, index) => (
            <motion.div
              key={`${provider.name}-${index}`}
              className="flex-shrink-0 group relative"
              onHoverStart={() => setHoveredProvider(provider.name)}
              onHoverEnd={() => setHoveredProvider(null)}
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              {/* Card */}
              <div className="w-56 h-20 bg-osint-card rounded-xl border border-osint-border hover:border-white/50 transition-all duration-300 overflow-hidden relative">
                {/* Glow effect on hover */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  animate={{
                    background: hoveredProvider === provider.name 
                      ? 'radial-gradient(circle at center, rgba(255,255,255,0.1), transparent 70%)'
                      : 'transparent'
                  }}
                />
                
                {/* Content */}
                <div className="relative z-10 p-4 h-full flex flex-col justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center border border-white/20">
                      <span className="text-xs font-bold text-white">{provider.name[0]}</span>
                    </div>
                    <h3 className="font-semibold text-white text-sm">{provider.name}</h3>
                  </div>
                  
                  <p className="text-xs text-gray-400 line-clamp-2">{provider.description}</p>
                </div>

                {/* Animated border */}
                <motion.div
                  className="absolute inset-0 rounded-xl"
                  style={{
                    background: 'linear-gradient(45deg, rgba(255,255,255,0.2), transparent, rgba(255,255,255,0.2))',
                    backgroundSize: '200% 200%',
                    opacity: hoveredProvider === provider.name ? 1 : 0,
                  }}
                  animate={{
                    backgroundPosition: hoveredProvider === provider.name ? ['0% 0%', '100% 100%', '0% 0%'] : '0% 0%',
                  }}
                  transition={{
                    duration: 2,
                    repeat: hoveredProvider === provider.name ? Infinity : 0,
                  }}
                />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Stats bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3 }}
        className="flex justify-center gap-8 mt-8 relative z-20"
      >
        {[
          { label: "Providers", value: "40+" },
          { label: "API Calls", value: "10M+" },
          { label: "Data Points", value: "1.6T+" },
          { label: "Uptime", value: "99.9%" },
        ].map((stat, index) => (
          <div key={index} className="text-center">
            <div className="text-2xl font-bold text-white">{stat.value}</div>
            <div className="text-xs text-gray-400">{stat.label}</div>
          </div>
        ))}
      </motion.div>
    </div>
  )
}

export default ProviderScroll
