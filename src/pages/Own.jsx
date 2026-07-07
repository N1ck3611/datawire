import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useState } from 'react'
import SnowBackground from '../components/SnowBackground'
import MusicPlayer from '../components/MusicPlayer'
import BootIntro from '../components/BootIntro'

const Team = () => {
  const [showIntro, setShowIntro] = useState(true)
  const [autoPlayMusic, setAutoPlayMusic] = useState(false)
  const owners = [
    {
      name: "hbhb",
      role: "CEO",
      bio: "@hbhb on discord",
      pfp: "https://i.ibb.co/chzVk9nj/hbhb.png",
      socials: {
        telegram: "https://t.me/kiro791",
        discord: "https://discord.gg/datawire"
      }
    },
    {
      name: "wrath",
      role: "CEO",
      bio: "Incase of term on discord please add @ockz or @rpmm",
      pfp: "https://i.ibb.co/sJyDFybc/wrath.png",
      socials: {
        discord: "https://discord.gg/datawire"
      }
    }
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  }

  return (
    <>
      {showIntro && <BootIntro onComplete={(shouldAutoPlay) => { setShowIntro(false); setAutoPlayMusic(shouldAutoPlay); }} />}
      {!showIntro && (
        <div className="h-screen relative overflow-hidden">
          <SnowBackground />
          
          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed top-6 left-6 z-50"
          >
            <Link
              to="/"
              className="inline-flex items-center space-x-2 text-white hover:text-gray-300 text-sm transition-colors"
            >
              <i className='bx bx-arrow-back text-lg'></i>
              <span>back</span>
            </Link>
          </motion.div>

          <div className="relative z-10 h-full flex items-center justify-center pt-16 pb-16 px-4 sm:px-6">
            <div className="max-w-5xl mx-auto w-full">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8 sm:mb-12"
          >
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-osint-secondary mb-2">Datawire.cc Team</h1>
            <p className="text-sm sm:text-base text-osint-muted">Building the future of OSINT intelligence</p>
          </motion.div>

          {/* Team Cards */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8"
          >
            {owners.map((owner, index) => (
              <motion.div
                key={index}
                variants={cardVariants}
                whileHover={{ scale: 1.02, y: -5 }}
                className="glass-card p-5 rounded-3xl transition-all duration-300 hover:shadow-lg hover:shadow-white/20"
              >
                {/* Avatar */}
                <div className="flex justify-center mb-4">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className="w-16 h-16 rounded-full overflow-hidden shadow-lg shadow-white/30"
                  >
                    <img src={owner.pfp} alt={owner.name} className="w-full h-full object-cover" />
                  </motion.div>
                </div>

                {/* Name & Role */}
                <div className="text-center mb-4">
                  <h2 className="text-xl font-bold text-osint-secondary mb-2">{owner.name}</h2>
                  <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-white/10 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full animate-shine"></div>
                    <i className='bx bxs-crown text-black text-xs'></i>
                    <span className="text-black text-xs font-semibold">{owner.role}</span>
                  </div>
                </div>

                {/* Social Links */}
                <div className="flex justify-center space-x-6">
                  {owner.socials.telegram && (
                    <motion.a
                      whileHover={{ scale: 1.1, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      href={owner.socials.telegram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-500 hover:text-white transition-colors"
                    >
                      <i className='bx bxl-telegram text-2xl'></i>
                    </motion.a>
                  )}
                  {owner.socials.discord && (
                    <motion.a
                      whileHover={{ scale: 1.1, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      href={owner.socials.discord}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-500 hover:text-white transition-colors"
                    >
                      <i className='bx bxl-discord text-2xl'></i>
                    </motion.a>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Footer Info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-12 text-center"
          >
            <div className="inline-flex items-center space-x-2 text-osint-muted text-sm">
              <i className='bx bxl-discord text-lg'></i>
              <span>Join our Discord community</span>
            </div>
          </motion.div>
        </div>
      </div>
      <MusicPlayer autoPlay={autoPlayMusic} />
    </div>
      )}
    </>
  )
}

export default Team
