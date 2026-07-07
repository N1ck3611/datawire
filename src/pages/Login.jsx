import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'

const API_BASE = 'https://datawirecc-api.mynameisntnick0.workers.dev'

const Login = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    // Check localStorage for existing token
    const token = localStorage.getItem('auth_token')
    if (token) {
      try {
        const response = await fetch(`${API_BASE}/api/user/profile`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        if (response.ok) {
          const data = await response.json()
          if (data.success) {
            setIsLoggedIn(true)
            // User is already logged in, redirect to dashboard or return URL
            const returnUrl = searchParams.get('return') || '/dashboard'
            setTimeout(() => navigate(returnUrl), 1000)
            return
          }
        }
      } catch (error) {
        // Token invalid, remove it
        localStorage.removeItem('auth_token')
      }
    }
    setLoading(false)
  }

  const handleLogin = () => {
    const returnUrl = searchParams.get('return') || '/dashboard'
    const workerCallbackUrl = 'https://datawirecc-api.mynameisntnick0.workers.dev/callback'
    const discordAuthUrl = `https://discord.com/oauth2/authorize?client_id=1523193275001999400&response_type=code&redirect_uri=${encodeURIComponent(workerCallbackUrl)}&scope=email+identify&state=${encodeURIComponent(returnUrl)}`
    window.location.href = discordAuthUrl
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-osint-bg">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 mx-auto mb-4 border-4 border-white/30 border-t-white rounded-full"
          ></motion.div>
          <p className="text-osint-muted">Checking authentication status...</p>
        </motion.div>
      </div>
    )
  }

  if (isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-osint-bg">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.img 
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            src="https://i.ibb.co/wFrNvxt5/Chat-GPT-Image-Jul-6-2026-09-02-01-PM-removebg-preview.png" 
            alt="DataWire" 
            className="w-24 h-24 mx-auto mb-6"
          />
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-2xl font-bold text-osint-secondary mb-2"
          >Already Logged In</motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-osint-muted mb-6"
          >Redirecting to dashboard...</motion.p>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 mx-auto border-4 border-white/30 border-t-white rounded-full"
          ></motion.div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-osint-bg pt-20 px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass-card rounded-2xl p-8 max-w-md w-full text-center border border-osint-border hover:border-white/30 transition-all duration-300"
      >
        <motion.img 
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          src="https://i.ibb.co/DHF6GRQH/logo.png" 
          alt="DataWire" 
          className="w-24 h-24 mx-auto mb-6"
        />
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-2xl font-bold text-osint-secondary mb-2"
        >Welcome to DataWire</motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-osint-muted mb-8"
        >Sign in with Discord to access your dashboard and purchase credits</motion.p>
        
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleLogin}
          className="w-full px-6 py-4 bg-white hover:bg-gray-200 text-black font-semibold rounded-xl transition-all flex items-center justify-center gap-3 hover:shadow-lg hover:shadow-white/30"
        >
          <i className='bx bxl-discord text-2xl'></i>
          Sign in with Discord
        </motion.button>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 text-left"
        >
          <p className="text-sm text-osint-muted mb-4 font-medium">Features:</p>
          <div className="space-y-3">
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="flex items-center gap-3 text-sm text-osint-muted"
            >
              <i className='bx bx-check-circle text-white'></i>
              <span>Secure Discord authentication</span>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="flex items-center gap-3 text-sm text-osint-muted"
            >
              <i className='bx bx-check-circle text-white'></i>
              <span>Manage your balance</span>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
              className="flex items-center gap-3 text-sm text-osint-muted"
            >
              <i className='bx bx-check-circle text-white'></i>
              <span>Crypto deposits (BTC, ETH, LTC, SOL, USDT)</span>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 }}
              className="flex items-center gap-3 text-sm text-osint-muted"
            >
              <i className='bx bx-check-circle text-white'></i>
              <span>Transaction history</span>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default Login
