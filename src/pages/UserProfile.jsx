import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Shield, Calendar } from 'lucide-react'
import GlassCard from '../components/ui/GlassCard'
import Button from '../components/ui/Button'

const API_BASE = 'https://datawirecc-api.mynameisntnick0.workers.dev'

const UserProfile = () => {
  const { username } = useParams()
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchUserProfile()
  }, [username])

  const fetchUserProfile = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/user/public/${username}`)
      const data = await response.json()
      
      if (data.success) {
        setUser(data.user)
      } else {
        setError(data.error || 'User not found')
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error)
      setError('Failed to load user profile')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <GlassCard className="p-8 text-center">
          <h1 className="text-2xl font-bold text-white mb-4">User Not Found</h1>
          <p className="text-osint-muted mb-6">{error}</p>
          <Button onClick={() => navigate('/')}>Go Home</Button>
        </GlassCard>
      </div>
    )
  }

  const planColors = {
    weekly: 'from-blue-500 to-cyan-500',
    monthly: 'from-purple-500 to-pink-500',
    lifetime: 'from-yellow-500 to-orange-500'
  }

  return (
    <div className="min-h-screen py-12 px-4 relative">
      {/* Custom Background */}
      {user?.background && (
        <div className="fixed inset-0 -z-10">
          {user.backgroundType === 'video' ? (
            <video
              src={user.background}
              className="w-full h-full object-cover"
              autoPlay
              loop
              muted
              playsInline
            />
          ) : (
            <img
              src={user.background}
              alt="Background"
              className="w-full h-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-black/60" />
        </div>
      )}
      
      {/* Default black background */}
      {!user?.background && (
        <div className="fixed inset-0 -z-10 bg-black" />
      )}
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div>
              <h1 className="text-4xl font-bold text-white">User Profile</h1>
              <p className="text-osint-muted">View user information</p>
            </div>
          </div>

          {/* Profile Card */}
          <GlassCard className="p-8">
            {/* Avatar and Username */}
            <div className="flex flex-col items-center mb-6">
              <div className="relative mb-6">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white/20 bg-black/50 flex items-center justify-center">
                  {user?.avatar ? (
                    <img 
                      src={user.avatar} 
                      alt={user.username}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-5xl text-white/50 font-bold">
                      {user?.username?.charAt(0).toUpperCase() || '?'}
                    </span>
                  )}
                </div>
                {user?.plan && (
                  <div className={`absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-gradient-to-br ${planColors[user.plan] || 'from-gray-500 to-gray-600'} flex items-center justify-center border-2 border-black`}>
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                )}
              </div>
              
              <h2 className="text-3xl font-bold text-white mb-2">@{user?.username}</h2>
              {user?.global_name && user.global_name !== user.username && (
                <p className="text-osint-muted text-lg">{user.global_name}</p>
              )}
              
              {/* Member Since - smaller, centered, above bio */}
              <p className="text-osint-muted text-xs text-center mt-3">
                Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
              </p>
              
              {/* Bio */}
              {user?.bio && (
                <p className="text-osint-muted text-center mt-4 max-w-md">
                  {user.bio}
                </p>
              )}

              {/* Status */}
              {user?.status && (
                <p className="text-white/70 text-center mt-3 text-sm italic">
                  "{user.status}"
                </p>
              )}
            </div>

            {/* Plan Badge */}
            {user?.plan && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`mb-8 p-4 rounded-xl bg-gradient-to-r ${planColors[user.plan] || 'from-gray-500 to-gray-600'} bg-opacity-20 border border-white/20 text-center`}
              >
                <p className="text-white font-semibold text-lg capitalize">
                  {user.plan} Plan
                </p>
                {user.planExpiresAt && user.plan !== 'lifetime' && (
                  <p className="text-white/70 text-sm mt-1">
                    Expires: {new Date(user.planExpiresAt).toLocaleDateString()}
                  </p>
                )}
                {user.plan === 'lifetime' && (
                  <p className="text-white/70 text-sm mt-1">Lifetime Access</p>
                )}
              </motion.div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <GlassCard className="p-4 text-center">
                <Calendar className="w-6 h-6 text-white/50 mx-auto mb-2" />
                <p className="text-osint-muted text-sm mb-1">Daily Credits</p>
                <p className="text-white font-semibold">
                  {user.dailyCredits || 0}
                </p>
              </GlassCard>
              
              {user?.plan && (
                <GlassCard className="p-4 text-center">
                  <Shield className="w-6 h-6 text-white/50 mx-auto mb-2" />
                  <p className="text-osint-muted text-sm mb-1">Balance</p>
                  <p className="text-white font-semibold">
                    ${user.balanceUsd || '0.00'}
                  </p>
                </GlassCard>
              )}
            </div>

          </GlassCard>

          {/* Share Link */}
          <GlassCard className="mt-6 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Share Profile</h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={`${window.location.origin}/users/@${user?.username}`}
                readOnly
                className="flex-1 px-4 py-3 bg-black/30 border border-white/10 rounded-lg text-white text-sm"
              />
              <Button
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/users/@${user?.username}`)
                }}
              >
                Copy
              </Button>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  )
}

export default UserProfile
