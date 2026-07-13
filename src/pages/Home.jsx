import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useState } from 'react'
import ProviderScroll from '../components/ProviderScroll'

const Home = () => {
  const [searching, setSearching] = useState(null)
  const [results, setResults] = useState({})

  const handleSearch = (type) => {
    setSearching(type)
    
    setTimeout(() => {
      const fakeResults = {
        email: {
          breaches: [
            { name: 'Adobe', date: '2024-03-15', exposed: 'Email, Password Hash' },
            { name: 'LinkedIn', date: '2023-11-02', exposed: 'Email, Password' },
            { name: 'Dropbox', date: '2023-07-19', exposed: 'Email, Password' }
          ],
          riskScore: 87,
          lastBreach: '2024-03-15',
          totalBreaches: 12,
          passwordStrength: 'Weak (found in 3 breaches)'
        },
        username: {
          platforms: [
            { name: 'Twitter', url: 'twitter.com/johndoe', verified: true },
            { name: 'GitHub', url: 'github.com/johndoe', verified: true },
            { name: 'Reddit', url: 'reddit.com/u/johndoe', verified: false },
            { name: 'Instagram', url: 'instagram.com/johndoe', verified: true }
          ],
          totalFound: 47,
          verifiedCount: 23,
          riskLevel: 'Medium',
          lastActive: '2024-06-20'
        },
        ip: {
          location: 'Sydney, New South Wales, Australia',
          isp: 'Cloudflare Inc.',
          asn: 'AS13335',
          threatLevel: 'Low',
          vpnProxy: 'No',
          tor: 'No',
          malwareReports: 0,
          lastReported: 'Never'
        }
      }
      setResults({ [type]: fakeResults[type] })
      setSearching(null)
    }, 1500)
  }

  const features = [
    {
      icon: 'bx bx-globe',
      title: 'Global Intelligence',
      description: 'Access data from 40+ premium OSINT providers worldwide',
    },
    {
      icon: 'bx bx-shield-quarter',
      title: 'Real-time Protection',
      description: 'Instant threat detection and breach monitoring',
    },
    {
      icon: 'bx bx-data',
      title: '500B+ Data Points',
      description: 'Comprehensive database with billions of records',
    },
    {
      icon: 'bx bxs-bot',
      title: 'Discord Integration',
      description: 'Seamless bot integration for your servers',
    },
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  }

  return (
    <div className="pt-14">
      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 90, 0],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1, 1.3, 1],
              rotate: [0, -90, 0],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-white/5 rounded-full blur-3xl"
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-6xl mx-auto px-6 relative z-10 text-center"
        >
          {/* Main heading */}
          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-white mb-6"
          >
            Datawire.cc
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="text-lg sm:text-xl text-osint-muted mb-12 max-w-3xl mx-auto leading-relaxed"
          >
            Advanced OSINT intelligence platform for Discord. Access 40+ premium APIs through a single bot with real-time threat detection and comprehensive data analysis.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Link
              to="/add-bot"
              className="group relative inline-flex items-center space-x-2 bg-white hover:bg-gray-200 text-black px-8 py-4 rounded-lg font-medium transition-all duration-300 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-300/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              <i className='bx bxs-plus-circle text-xl'></i>
              <span>Add Bot to Server</span>
            </Link>
            <Link
              to="/commands"
              className="group inline-flex items-center space-x-2 border border-white/50 text-white hover:bg-white/10 px-8 py-4 rounded-lg font-medium transition-all duration-300"
            >
              <span>View Commands</span>
              <i className='bx bx-right-arrow-alt group-hover:translate-x-1 transition-transform'></i>
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            className="flex flex-wrap justify-center gap-8 mt-16"
          >
            {[
              { value: '40+', label: 'API Providers' },
              { value: '10M+', label: 'API Calls' },
              { value: '500B+', label: 'Data Points' },
              { value: '99.9%', label: 'Uptime' },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-sm text-gray-500">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>

      </section>

      {/* Provider Scroll Section */}
      <ProviderScroll />

      {/* Features Section */}
      <section className="py-24 relative">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-osint-secondary mb-4">
              Why Choose DataWire?
            </h2>
            <p className="text-osint-muted max-w-2xl mx-auto">
              Powerful features designed for modern OSINT operations and threat intelligence
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ y: -10, scale: 1.02 }}
                className="group relative bg-osint-card border border-osint-border rounded-2xl p-6 hover:border-white/30 transition-all duration-300 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                <div className="w-14 h-14 rounded-xl bg-white/10 flex items-center justify-center mb-4">
                  <i className={`${feature.icon} text-2xl text-white`}></i>
                </div>
                
                <h3 className="text-lg font-semibold text-osint-secondary mb-2">{feature.title}</h3>
                <p className="text-sm text-osint-muted">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Demo/Test Section */}
      <section className="py-24 bg-osint-card/20">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-osint-secondary mb-4">
              Live Demo
            </h2>
            <p className="text-osint-muted max-w-2xl mx-auto">
              See DataWire in action with sample lookups
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Email Lookup Demo */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 hover:border-white/40 transition-all duration-300 shadow-xl"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <i className='bx bx-envelope text-xl text-blue-400'></i>
                </div>
                <h3 className="font-semibold text-white">Email Lookup</h3>
              </div>
              <div className="bg-black/30 rounded-lg p-3 mb-4">
                <code className="text-sm text-green-400">test@gmail.com</code>
              </div>
              {searching === 'email' ? (
                <div className="flex items-center justify-center py-8">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full"
                  />
                </div>
              ) : results.email ? (
                <div className="space-y-3 text-sm max-h-64 overflow-y-auto">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Risk Score:</span>
                    <span className="text-red-400 font-bold">{results.email.riskScore}/100</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Total Breaches:</span>
                    <span className="text-white font-medium">{results.email.totalBreaches}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Last Breach:</span>
                    <span className="text-white font-medium">{results.email.lastBreach}</span>
                  </div>
                  <div className="border-t border-white/10 pt-3 mt-3">
                    <p className="text-gray-400 mb-2">Recent Breaches:</p>
                    {results.email.breaches.map((breach, idx) => (
                      <div key={idx} className="bg-black/20 rounded-lg p-2 mb-2">
                        <div className="flex justify-between">
                          <span className="text-white font-medium">{breach.name}</span>
                          <span className="text-gray-500 text-xs">{breach.date}</span>
                        </div>
                        <p className="text-gray-400 text-xs mt-1">{breach.exposed}</p>
                      </div>
                    ))}
                  </div>
                  <div className="text-yellow-400 text-xs mt-2">
                    <i className='bx bx-warning mr-1'></i>
                    {results.email.passwordStrength}
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => handleSearch('email')}
                  className="w-full bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 py-3 rounded-lg font-medium transition-all duration-300"
                >
                  Search
                </button>
              )}
            </motion.div>

            {/* Username Lookup Demo */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 hover:border-white/40 transition-all duration-300 shadow-xl"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                  <i className='bx bx-user text-xl text-purple-400'></i>
                </div>
                <h3 className="font-semibold text-white">Username Lookup</h3>
              </div>
              <div className="bg-black/30 rounded-lg p-3 mb-4">
                <code className="text-sm text-green-400">John Doe</code>
              </div>
              {searching === 'username' ? (
                <div className="flex items-center justify-center py-8">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-8 h-8 border-2 border-purple-400 border-t-transparent rounded-full"
                  />
                </div>
              ) : results.username ? (
                <div className="space-y-3 text-sm max-h-64 overflow-y-auto">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Platforms Found:</span>
                    <span className="text-white font-medium">{results.username.totalFound}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Verified:</span>
                    <span className="text-green-400 font-medium">{results.username.verifiedCount}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Risk Level:</span>
                    <span className="text-yellow-400 font-medium">{results.username.riskLevel}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Last Active:</span>
                    <span className="text-white font-medium">{results.username.lastActive}</span>
                  </div>
                  <div className="border-t border-white/10 pt-3 mt-3">
                    <p className="text-gray-400 mb-2">Top Platforms:</p>
                    {results.username.platforms.map((platform, idx) => (
                      <div key={idx} className="bg-black/20 rounded-lg p-2 mb-2 flex items-center justify-between">
                        <div>
                          <span className="text-white font-medium">{platform.name}</span>
                          <p className="text-gray-500 text-xs">{platform.url}</p>
                        </div>
                        {platform.verified ? (
                          <i className='bx bxs-check-circle text-green-400'></i>
                        ) : (
                          <i className='bx bx-question-mark text-gray-500'></i>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => handleSearch('username')}
                  className="w-full bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 py-3 rounded-lg font-medium transition-all duration-300"
                >
                  Search
                </button>
              )}
            </motion.div>

            {/* IP Lookup Demo */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 hover:border-white/40 transition-all duration-300 shadow-xl"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
                  <i className='bx bx-globe text-xl text-orange-400'></i>
                </div>
                <h3 className="font-semibold text-white">IP Lookup</h3>
              </div>
              <div className="bg-black/30 rounded-lg p-3 mb-4">
                <code className="text-sm text-green-400">1.1.1.1</code>
              </div>
              {searching === 'ip' ? (
                <div className="flex items-center justify-center py-8">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-8 h-8 border-2 border-orange-400 border-t-transparent rounded-full"
                  />
                </div>
              ) : results.ip ? (
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Location:</span>
                    <span className="text-white font-medium text-right">{results.ip.location}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">ISP:</span>
                    <span className="text-white font-medium">{results.ip.isp}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">ASN:</span>
                    <span className="text-white font-medium">{results.ip.asn}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Threat Level:</span>
                    <span className="text-green-400 font-medium">{results.ip.threatLevel}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">VPN/Proxy:</span>
                    <span className="text-white font-medium">{results.ip.vpnProxy}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">TOR:</span>
                    <span className="text-white font-medium">{results.ip.tor}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Malware Reports:</span>
                    <span className="text-white font-medium">{results.ip.malwareReports}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Last Reported:</span>
                    <span className="text-white font-medium">{results.ip.lastReported}</span>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => handleSearch('ip')}
                  className="w-full bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 py-3 rounded-lg font-medium transition-all duration-300"
                >
                  Search
                </button>
              )}
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="mt-8 text-center"
          >
            <p className="text-gray-500 text-sm">
              <i className='bx bx-info-circle mr-1'></i>
              Demo data shown above is for illustration purposes only
            </p>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-white/5 via-transparent to-white/5" />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto px-6 relative z-10"
        >
          <div className="bg-osint-card border border-osint-border rounded-3xl p-8 md:p-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-white/5" />
            
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold text-osint-secondary mb-4">
                Ready to Get Started?
              </h2>
              <p className="text-osint-muted mb-8 max-w-xl mx-auto">
                Join thousands of servers using DataWire for advanced OSINT intelligence and threat protection.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/add-bot"
                  className="inline-flex items-center justify-center space-x-2 bg-white hover:bg-gray-200 text-black px-8 py-4 rounded-lg font-medium transition-all duration-300"
                >
                  <i className='bx bxs-plus-circle text-xl'></i>
                  <span>Add Bot Now</span>
                </Link>
                <Link
                  to="/purchase"
                  className="inline-flex items-center justify-center space-x-2 border border-osint-border text-osint-secondary hover:bg-osint-cardHover px-8 py-4 rounded-lg font-medium transition-all duration-300"
                >
                  <span>View Pricing</span>
                  <i className='bx bx-right-arrow-alt'></i>
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Team Section */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.02 }}
            className="bg-osint-card border border-osint-border rounded-3xl p-8 transition-all duration-300 hover:border-white/30"
          >
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="flex-shrink-0 w-24 h-24 rounded-2xl flex items-center justify-center overflow-hidden">
                <img src="https://i.ibb.co/wFrNvxt5/Chat-GPT-Image-Jul-6-2026-09-02-01-PM-removebg-preview.png" alt="DataWire" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-2xl font-bold text-osint-secondary mb-2">DataWire Team</h2>
                <p className="text-osint-muted mb-4 max-w-lg">
                  OSINT specialists and Discord bot developers building intelligence tools for the community. Dedicated to providing cutting-edge threat detection and data analysis.
                </p>
                <Link
                  to="/own"
                  className="inline-flex items-center space-x-2 text-white hover:text-gray-300 transition-colors group"
                >
                  <span>Meet the CEOs</span>
                  <i className='bx bxs-shield-alt text-lg group-hover:translate-x-1 transition-transform'></i>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

export default Home
