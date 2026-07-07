import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

const AddBot = () => {
  const features = [
    { 
      icon: 'bx bxs-shield-quarter', 
      title: "9+ Premium APIs", 
      description: "Access SEON, HudsonRock, Snusbase, and more",
    },
    { 
      icon: 'bx bxs-bolt', 
      title: "Lightning Fast", 
      description: "Instant OSINT results with optimized queries",
    },
    { 
      icon: 'bx bxs-data', 
      title: "Comprehensive Data", 
      description: "Billions of records across multiple databases",
    }
  ]

  const benefits = [
    "Access to all 9+ integrated APIs",
    "Real-time OSINT intelligence",
    "Premium support in our Discord",
    "Regular updates and new features",
    "Advanced threat detection",
    "Customizable search parameters"
  ]

  return (
    <div className="pt-16 pb-16">
      <div className="max-w-5xl mx-auto px-6">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-8"
        >
          <Link
            to="/"
            className="inline-flex items-center space-x-2 text-gray-500 hover:text-white text-sm transition-colors group"
          >
            <i className='bx bx-arrow-back text-lg group-hover:-translate-x-1 transition-transform'></i>
            <span>Back to Home</span>
          </Link>
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 20 }}
            className="mb-8 flex justify-center"
          >
            <div className="relative">
              <motion.div
                animate={{ 
                  boxShadow: [
                    "0 0 20px rgba(255, 255, 255, 0.1)",
                    "0 0 40px rgba(255, 255, 255, 0.2)",
                    "0 0 20px rgba(255, 255, 255, 0.1)"
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-24 h-24 rounded-2xl bg-white/10 border-2 border-white/30 flex items-center justify-center"
              >
                <img src="https://i.ibb.co/wFrNvxt5/Chat-GPT-Image-Jul-6-2026-09-02-01-PM-removebg-preview.png" alt="DataWire" className="w-16 h-16 object-contain" />
              </motion.div>
            </div>
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-4xl sm:text-5xl md:text-6xl font-bold text-osint-secondary mb-4"
          >
            Add DataWire to Discord
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-base sm:text-lg text-osint-muted max-w-2xl mx-auto"
          >
            Get instant access to premium OSINT tools directly in your Discord server. Powerful intelligence at your fingertips.
          </motion.p>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-16"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 + index * 0.1 }}
              whileHover={{ y: -10, scale: 1.02 }}
              className="group relative bg-osint-card border border-osint-border rounded-2xl p-6 text-center hover:border-white/30 transition-all duration-300 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <div className="relative z-10">
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                  className="w-16 h-16 mx-auto mb-4 rounded-xl bg-white/10 flex items-center justify-center border border-white/30"
                >
                  <i className={`${feature.icon} text-3xl text-white`}></i>
                </motion.div>
                <h3 className="font-semibold text-osint-secondary text-lg mb-2">{feature.title}</h3>
                <p className="text-sm text-osint-muted">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="text-center mb-16"
        >
          <motion.a
            href="https://discord.com/oauth2/authorize?client_id=1518027467745525870"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="group relative inline-flex items-center space-x-4 bg-white hover:bg-gray-200 text-black px-10 py-5 rounded-2xl font-semibold transition-all duration-300 text-lg overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
            <i className='bx bxl-discord text-2xl'></i>
            <span>Add to Discord</span>
            <i className='bx bx-right-arrow-alt group-hover:translate-x-1 transition-transform'></i>
          </motion.a>
          <p className="text-sm text-gray-500 mt-4">
            Requires Discord server with <span className="text-white">Manage Server</span> permissions
          </p>
        </motion.div>

        {/* Benefits */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
          className="bg-osint-card border border-osint-border rounded-3xl p-8"
        >
          <h3 className="font-semibold text-osint-secondary text-xl mb-6 text-center">What you'll get:</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.2 + index * 0.05 }}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors"
              >
                <motion.div
                  whileHover={{ scale: 1.2 }}
                  className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0"
                >
                  <i className='bx bxs-check-circle text-white'></i>
                </motion.div>
                <span className="text-sm text-gray-400">{benefit}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default AddBot
