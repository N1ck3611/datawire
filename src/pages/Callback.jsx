import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'

const API_BASE = 'https://datawirecc-api.mynameisntnick0.workers.dev'

const Callback = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [status, setStatus] = useState('loading')
  const [message, setMessage] = useState('Authenticating...')

  useEffect(() => {
    handleCallback()
  }, [])

  const handleCallback = async () => {
    const code = searchParams.get('code')
    const error = searchParams.get('error')
    const state = searchParams.get('state') // This contains the return URL or 'link' for Discord linking

    if (error) {
      setStatus('error')
      setMessage(error === 'access_denied' ? 'You cancelled the authentication' : 'An error occurred')
      setTimeout(() => navigate('/login'), 3000)
      return
    }

    if (!code) {
      setStatus('error')
      setMessage('No authorization code found')
      setTimeout(() => navigate('/login'), 3000)
      return
    }

    try {
      const isLinkOperation = state === 'link'
      const token = localStorage.getItem('auth_token')
      
      const response = await fetch(`${API_BASE}/api/auth/callback`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token && isLinkOperation ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ code, link: isLinkOperation })
      })

      const data = await response.json()

      if (data.success) {
        if (isLinkOperation) {
          // Discord linking successful
          setStatus('success')
          setMessage('Discord account linked successfully!')
          setTimeout(() => navigate('/settings'), 1000)
        } else {
          // Normal Discord login
          localStorage.setItem('auth_token', data.token)
          setStatus('success')
          setMessage('Authentication successful!')
          const returnUrl = '/dashboard'
          setTimeout(() => navigate(returnUrl), 1000)
        }
      } else {
        throw new Error(data.error || 'Authentication failed')
      }
    } catch (error) {
      setStatus('error')
      setMessage(error.message)
      setTimeout(() => navigate('/login'), 3000)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-osint-bg">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center max-w-md px-6"
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
          className={`text-2xl font-bold mb-2 ${
            status === 'success' ? 'text-white' :
            status === 'error' ? 'text-red-400' : 'text-osint-secondary'
          }`}
        >
          {status === 'loading' ? 'Authenticating...' :
           status === 'success' ? 'Success!' :
           'Authentication Failed'}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-osint-muted"
        >{message}</motion.p>
        {status === 'loading' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="w-16 h-16 mx-auto mt-4 border-4 border-white/30 border-t-white rounded-full"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-full h-full rounded-full"
            ></motion.div>
          </motion.div>
        )}
        {status === 'success' && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
            className="mt-4"
          >
            <i className='bx bx-check-circle text-5xl text-white'></i>
          </motion.div>
        )}
        {status === 'error' && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
            className="mt-4"
          >
            <i className='bx bx-x-circle text-5xl text-red-400'></i>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}

export default Callback
