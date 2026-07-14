import { motion } from 'framer-motion'
import { useState } from 'react'

const ProviderScroll = () => {
  const [hoveredProvider, setHoveredProvider] = useState(null)

  const providers = [
    { 
      name: "INTELX", 
      logo: "https://logos.osint.ly/intelx.io",
      url: "https://intelx.io",
    },
    { 
      name: "HUDSON ROCK", 
      logo: "https://logos.osint.ly/hudsonrock.com",
      url: "https://hudsonrock.com",
    },
    { 
      name: "SEON", 
      logo: "https://logos.osint.ly/seon.io",
      url: "https://seon.io",
    },
    { 
      name: "SHODAN", 
      logo: "https://logos.osint.ly/shodan.io",
      url: "https://shodan.io",
    },
    { 
      name: "DEHASHED", 
      logo: "https://logos.osint.ly/dehashed.com",
      url: "https://dehashed.com",
    },
    { 
      name: "LEAKCHECK", 
      logo: "https://logos.osint.ly/leakcheck.io",
      url: "https://leakcheck.io",
    },
    { 
      name: "SNUSBASE", 
      logo: "https://logos.osint.ly/snusbase.com",
      url: "https://snusbase.com",
    },
    { 
      name: "CRIMINAL IP", 
      logo: "https://logos.osint.ly/criminalip.io",
      url: "https://criminalip.io",
    },
    { 
      name: "HIBP", 
      logo: "https://logos.osint.ly/haveibeenpwned.com",
      url: "https://haveibeenpwned.com",
    },
    { 
      name: "CENSYS", 
      logo: "https://logos.osint.ly/search.censys.io",
      url: "https://search.censys.io",
    },
    { 
      name: "ZOOMEYE", 
      logo: "https://logos.osint.ly/zoomeye.org",
      url: "https://zoomeye.org",
    },
    { 
      name: "FOFA", 
      logo: "https://logos.osint.ly/fofa.info",
      url: "https://fofa.info",
    },
    { 
      name: "BREACHDIR", 
      logo: "https://logos.osint.ly/breachdirectory.org",
      url: "https://breachdirectory.org",
    },
    { 
      name: "CORD.CAT", 
      logo: "https://www.google.com/s2/favicons?domain=cord.cat&sz=64",
      url: "https://cord.cat",
    },
    { 
      name: "NOSINT", 
      logo: "https://www.google.com/s2/favicons?domain=nosint.org&sz=64",
      url: "https://nosint.org",
    },
    { 
      name: "SEEKRIA", 
      logo: "https://www.google.com/s2/favicons?domain=seekria.cc&sz=64",
      url: "https://seekria.cc",
    },
    { 
      name: "SEEKNOW", 
      logo: "https://www.google.com/s2/favicons?domain=see-know.icu&sz=64",
      url: "https://see-know.icu",
    },
    { 
      name: "DATAVOID", 
      logo: "https://www.google.com/s2/favicons?domain=datavoid.sh&sz=64",
      url: "https://datavoid.sh",
    },
    { 
      name: "TRACECSINT", 
      logo: "https://www.google.com/s2/favicons?domain=tracecsint.org&sz=64",
      url: "https://tracecsint.org",
    },
    { 
      name: "NBRS", 
      logo: "https://www.google.com/s2/favicons?domain=nbrs.site&sz=64",
      url: "https://nbrs.site",
    },
    { 
      name: "ROOM101", 
      logo: "https://www.google.com/s2/favicons?domain=think-pol.com&sz=64",
      url: "https://think-pol.com",
    },
    { 
      name: "NOTALIVEX", 
      logo: "https://www.google.com/s2/favicons?domain=notalivex.xyz&sz=64",
      url: "https://notalivex.xyz",
    },
    { 
      name: "OPENARCHIVE", 
      logo: "https://www.google.com/s2/favicons?domain=openarchive.lol&sz=64",
      url: "https://openarchive.lol",
    },
    { 
      name: "DATAHOUND", 
      logo: "https://www.google.com/s2/favicons?domain=datahound.tools&sz=64",
      url: "https://datahound.tools",
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
          Access 40+ premium OSINT APIs through a single platform
        </motion.p>
      </div>

      {/* Scrolling container */}
      <div className="relative">
        <motion.div
          className="flex gap-8 px-8"
          animate={{
            x: [0, -(providers.length * 192)],
          }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: "loop",
              duration: 40,
              ease: "linear",
            },
          }}
        >
          {duplicatedProviders.map((provider, index) => (
            <motion.a
              key={`${provider.name}-${index}`}
              href={provider.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0 group relative"
              onHoverStart={() => setHoveredProvider(provider.name)}
              onHoverEnd={() => setHoveredProvider(null)}
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              {/* Card */}
              <div className="w-40 h-16 bg-osint-card rounded-xl transition-all duration-300 overflow-hidden relative">
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
                <div className="relative z-10 p-3 h-full flex items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 flex items-center justify-center overflow-hidden rounded-lg flex-shrink-0">
                      {provider.logo ? (
                        <img 
                          src={provider.logo} 
                          alt={provider.name}
                          className="w-full h-full object-contain p-1 mix-blend-multiply"
                          style={{ filter: 'grayscale(100%) brightness(0.7)' }}
                          onError={(e) => {
                            e.target.style.display = 'none'
                            const span = document.createElement('span')
                            span.className = 'text-xs font-bold text-white'
                            span.textContent = provider.name[0]
                            e.target.parentElement.appendChild(span)
                          }}
                        />
                      ) : (
                        <span className="text-xs font-bold text-white">{provider.name[0]}</span>
                      )}
                    </div>
                    <h3 className="font-semibold text-white text-xs truncate max-w-[80px]">{provider.name}</h3>
                  </div>
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
            </motion.a>
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
          { label: "Data Points", value: "500B+" },
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
