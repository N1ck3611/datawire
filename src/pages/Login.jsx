import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'

const API_BASE = 'https://datawirecc-api.mynameisntnick0.workers.dev'

const Login = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [authMethod, setAuthMethod] = useState('discord') // 'discord', 'email', or 'username'
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isSignup, setIsSignup] = useState(false)
  const [step, setStep] = useState('input') // 'input' or 'verify'
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [sendingCode, setSendingCode] = useState(false)
  const [verifying, setVerifying] = useState(false)

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

  const handleDiscordLogin = () => {
    const returnUrl = searchParams.get('return') || '/dashboard'
    const workerCallbackUrl = 'https://datawirecc-api.mynameisntnick0.workers.dev/callback'
    const discordAuthUrl = `https://discord.com/oauth2/authorize?client_id=1523193275001999400&response_type=code&redirect_uri=${encodeURIComponent(workerCallbackUrl)}&scope=email+identify&state=${encodeURIComponent(returnUrl)}`
    window.location.href = discordAuthUrl
  }

  const handleEmailSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')
    setSendingCode(true)

    try {
      const endpoint = isSignup 
        ? '/api/auth/email/signup' 
        : '/api/auth/email/login'
      
      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      const data = await response.json()

      if (data.success) {
        setMessage(data.message)
        setStep('verify')
      } else {
        setError(data.error || 'Failed to send code')
      }
    } catch (error) {
      setError('Network error. Please try again.')
    } finally {
      setSendingCode(false)
    }
  }

  const handleCodeVerify = async (e) => {
    if (e) e.preventDefault()
    setError('')
    setVerifying(true)

    try {
      const endpoint = isSignup 
        ? '/api/auth/email/signup/verify' 
        : '/api/auth/email/login/verify'
      
      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code })
      })

      const data = await response.json()

      if (data.success) {
        localStorage.setItem('auth_token', data.token)
        const returnUrl = searchParams.get('return') || '/dashboard'
        navigate(returnUrl)
      } else {
        setError(data.error || 'Invalid code')
        setVerifying(false)
      }
    } catch (error) {
      setError('Network error. Please try again.')
      setVerifying(false)
    }
  }

  const handleCodeChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 6)
    setCode(value)
    setError('') // Clear error when typing
  }

  const handleResendCode = async () => {
    setError('')
    setSendingCode(true)

    try {
      const endpoint = isSignup 
        ? '/api/auth/email/signup' 
        : '/api/auth/email/login'
      
      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      const data = await response.json()

      if (data.success) {
        setMessage('New code sent to your email')
      } else {
        setError(data.error || 'Failed to resend code')
      }
    } catch (error) {
      setError('Network error. Please try again.')
    } finally {
      setSendingCode(false)
    }
  }

  const handleUsernameAuth = async (e) => {
    e.preventDefault()
    setError('')
    setVerifying(true)

    try {
      const endpoint = isSignup 
        ? '/api/auth/username/signup' 
        : '/api/auth/username/login'
      
      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })

      const data = await response.json()

      if (data.success) {
        localStorage.setItem('auth_token', data.token)
        const returnUrl = searchParams.get('return') || '/dashboard'
        navigate(returnUrl)
      } else {
        setError(data.error || 'Authentication failed')
        setVerifying(false)
      }
    } catch (error) {
      setError('Network error. Please try again.')
      setVerifying(false)
    }
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
            alt="Datawire.cc" 
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
          src="https://i.ibb.co/wFrNvxt5/Chat-GPT-Image-Jul-6-2026-09-02-01-PM-removebg-preview.png"
          alt="Datawire.cc" 
          className="w-24 h-24 mx-auto mb-6"
        />
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-2xl font-bold text-osint-secondary mb-2"
        >Welcome to Datawire.cc</motion.h1>
        
        {/* Auth Method Toggle */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex gap-2 mb-6"
        >
          <button
            onClick={() => { setAuthMethod('discord'); setStep('input'); setError(''); setMessage(''); }}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
              authMethod === 'discord' 
                ? 'bg-white text-black' 
                : 'bg-white/10 text-osint-muted hover:bg-white/20'
            }`}
          >
            Discord
          </button>
          <button
            onClick={() => { setAuthMethod('email'); setStep('input'); setError(''); setMessage(''); }}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
              authMethod === 'email' 
                ? 'bg-white text-black' 
                : 'bg-white/10 text-osint-muted hover:bg-white/20'
            }`}
          >
            Email
          </button>
          <button
            onClick={() => { setAuthMethod('username'); setStep('input'); setError(''); setMessage(''); }}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
              authMethod === 'username' 
                ? 'bg-white text-black' 
                : 'bg-white/10 text-osint-muted hover:bg-white/20'
            }`}
          >
            Username
          </button>
        </motion.div>

        {/* Discord Auth */}
        {authMethod === 'discord' && (
          <>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-osint-muted mb-8"
            >Sign in with Discord to access your dashboard and purchase credits</motion.p>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleDiscordLogin}
              className="w-full px-6 py-4 bg-white hover:bg-gray-200 text-black font-semibold rounded-xl transition-all flex items-center justify-center gap-3 hover:shadow-lg hover:shadow-white/30"
            >
              <i className='bx bxl-discord text-2xl'></i>
              Sign in with Discord
            </motion.button>
          </>
        )}

        {/* Email Auth */}
        {authMethod === 'email' && (
          <>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-osint-muted mb-6"
            >
              {isSignup ? 'Create an account with your email' : 'Sign in with your email'}
            </motion.p>

            {/* Step 1: Email Input */}
            {step === 'input' && (
              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <div className="text-left">
                  <label className="block text-sm text-osint-muted mb-2">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-lg text-white placeholder-white/20 focus:outline-none focus:border-white/40 focus:bg-black/50 transition-all backdrop-blur-sm"
                    required
                  />
                  <p className="text-xs text-osint-muted mt-2">
                    We'll verify that your email address exists
                  </p>
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm"
                  >
                    {error}
                  </motion.div>
                )}

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={sendingCode}
                  className="w-full px-6 py-4 bg-white hover:bg-gray-200 text-black font-semibold rounded-xl transition-all flex items-center justify-center gap-3 hover:shadow-lg hover:shadow-white/30 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sendingCode ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full"
                      ></motion.div>
                      Sending Code...
                    </>
                  ) : (
                    <>
                      <i className='bx bx-envelope text-2xl'></i>
                      {isSignup ? 'Send Verification Code' : 'Send Login Code'}
                    </>
                  )}
                </motion.button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setIsSignup(!isSignup)}
                    className="text-sm text-osint-muted hover:text-white transition-colors"
                  >
                    {isSignup ? 'Already have an account? Login' : "Don't have an account? Sign up"}
                  </button>
                </div>
              </form>
            )}

            {/* Step 2: Code Verification */}
            {step === 'verify' && (
              <form onSubmit={handleCodeVerify} className="space-y-4">
                <div className="text-left">
                  <label className="block text-sm text-osint-muted mb-2">Verification Code</label>
                  <input
                    type="text"
                    value={code}
                    onChange={handleCodeChange}
                    placeholder="123456"
                    maxLength={6}
                    inputMode="numeric"
                    pattern="[0-9]*"
                    className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-lg text-white placeholder-white/20 focus:outline-none focus:border-white/40 focus:bg-black/50 transition-all text-center text-2xl tracking-widest backdrop-blur-sm"
                    required
                  />
                  <p className="text-xs text-osint-muted mt-2">
                    Enter the 6-digit code sent to {email}
                  </p>
                </div>

                {message && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-3 bg-green-500/20 border border-green-500/50 rounded-lg text-green-400 text-sm"
                  >
                    {message}
                  </motion.div>
                )}

                {error && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm"
                  >
                    {error}
                  </motion.div>
                )}

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={verifying}
                  className="w-full px-6 py-4 bg-white hover:bg-gray-200 text-black font-semibold rounded-xl transition-all flex items-center justify-center gap-3 hover:shadow-lg hover:shadow-white/30 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {verifying ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full"
                      ></motion.div>
                      Verifying...
                    </>
                  ) : (
                    <>
                      <i className='bx bx-check text-2xl'></i>
                      Verify Code
                    </>
                  )}
                </motion.button>

                <div className="flex justify-between items-center text-center">
                  <button
                    type="button"
                    onClick={() => setStep('input')}
                    className="text-sm text-osint-muted hover:text-white transition-colors"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleResendCode}
                    disabled={sendingCode}
                    className="text-sm text-osint-muted hover:text-white transition-colors disabled:opacity-50"
                  >
                    {sendingCode ? 'Sending...' : 'Resend Code'}
                  </button>
                </div>
              </form>
            )}
          </>
        )}

        {/* Username Auth */}
        {authMethod === 'username' && (
          <>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-osint-muted mb-6"
            >
              {isSignup ? 'Create an account with username and password' : 'Sign in with your username and password'}
            </motion.p>

            <form onSubmit={handleUsernameAuth} className="space-y-4">
              <div className="text-left">
                <label className="block text-sm text-osint-muted mb-2">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="username"
                  className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-lg text-white placeholder-white/20 focus:outline-none focus:border-white/40 focus:bg-black/50 transition-all backdrop-blur-sm"
                  required
                />
                <p className="text-xs text-osint-muted mt-2">
                  3-20 characters, letters, numbers, underscores, and hyphens only
                </p>
              </div>

              <div className="text-left">
                <label className="block text-sm text-osint-muted mb-2">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-lg text-white placeholder-white/20 focus:outline-none focus:border-white/40 focus:bg-black/50 transition-all backdrop-blur-sm"
                  required
                />
                <p className="text-xs text-osint-muted mt-2">
                  Minimum 8 characters
                </p>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm"
                >
                  {error}
                </motion.div>
              )}

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={verifying}
                className="w-full px-6 py-4 bg-white hover:bg-gray-200 text-black font-semibold rounded-xl transition-all flex items-center justify-center gap-3 hover:shadow-lg hover:shadow-white/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {verifying ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full"
                    ></motion.div>
                      {isSignup ? 'Creating Account...' : 'Signing In...'}
                  </>
                ) : (
                  <>
                    <i className='bx bx-user text-2xl'></i>
                    {isSignup ? 'Create Account' : 'Sign In'}
                  </>
                )}
              </motion.button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setIsSignup(!isSignup)}
                  className="text-sm text-osint-muted hover:text-white transition-colors"
                >
                  {isSignup ? 'Already have an account? Login' : "Don't have an account? Sign up"}
                </button>
              </div>
            </form>
          </>
        )}

        {/* Features Section */}
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
              <span>Secure authentication</span>
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
