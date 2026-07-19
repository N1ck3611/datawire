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
              
              {/* Member Since - round container with calendar icon */}
              <div className="flex items-center gap-2 mt-3 px-4 py-2 bg-white/10 rounded-full">
                <Calendar className="w-4 h-4 text-white/70" />
                <span className="text-white/70 text-xs">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
                </span>
              </div>
              
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

              {/* Discord Display Name - below bio/status */}
              {user?.global_name && user.global_name !== user.username && (
                <p className="text-osint-muted text-center mt-2 text-sm">{user.global_name}</p>
              )}
            </div>

            {/* Discord Activity Status - guns.lol style */}
            {user?.discordId && (
              <div className="mt-4 p-4 bg-[#5865F2]/5 border border-[#5865F2]/20 rounded-xl">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full bg-[#5865F2]/20 flex items-center justify-center overflow-hidden border-2 border-[#5865F2]/30">
                      {user.discordAvatar ? (
                        <img 
                          src={`https://cdn.discordapp.com/avatars/${user.discordId}/${user.discordAvatar}.png?size=256`} 
                          alt="Discord" 
                          className="w-full h-full object-cover" 
                        />
                      ) : user.avatar ? (
                        <img src={user.avatar} alt="Discord" className="w-full h-full object-cover" />
                      ) : (
                        <svg className="w-10 h-10 text-[#5865F2]" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                        </svg>
                      )}
                    </div>
                    <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-3 border-black ${
                      user.discordStatus === 'online' ? 'bg-green-500' :
                      user.discordStatus === 'dnd' ? 'bg-red-500' :
                      user.discordStatus === 'idle' ? 'bg-yellow-500' : 'bg-gray-500'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-semibold text-base">{user.global_name || user.username}</p>
                    <p className="text-white/50 text-sm">@{user.username}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-medium capitalize ${
                      user.discordStatus === 'online' ? 'text-green-400' :
                      user.discordStatus === 'dnd' ? 'text-red-400' :
                      user.discordStatus === 'idle' ? 'text-yellow-400' : 'text-gray-400'
                    }`}>
                      {user.discordStatus === 'online' ? 'Online' :
                       user.discordStatus === 'dnd' ? 'Do Not Disturb' :
                       user.discordStatus === 'idle' ? 'Idle' : 'Offline'}
                    </p>
                    {user.lastSeen && user.discordStatus !== 'online' && (
                      <p className="text-white/40 text-xs mt-1">
                        Last seen: {user.lastSeen}
                      </p>
                    )}
                  </div>
                </div>

                {/* Discord Badges */}
                {user.discordBadges > 0 && (
                  <div className="flex gap-2 mt-3 pt-3 border-t border-[#5865F2]/10">
                    {user.discordPremium === 1 && (
                      <div className="px-2 py-1 bg-[#5865F2]/20 rounded text-[#5865F2] text-xs font-medium">
                        Nitro Classic
                      </div>
                    )}
                    {user.discordPremium === 2 && (
                      <div className="px-2 py-1 bg-gradient-to-r from-[#9b59b6] to-[#8e44ad] rounded text-white text-xs font-medium">
                        Nitro
                      </div>
                    )}
                    {user.discordPremium === 3 && (
                      <div className="px-2 py-1 bg-gradient-to-r from-[#f1c40f] to-[#f39c12] rounded text-white text-xs font-medium">
                        Nitro Basic
                      </div>
                    )}
                  </div>
                )}

                {/* Discord Guilds */}
                {user.discordGuilds && user.discordGuilds.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-[#5865F2]/10">
                    <p className="text-white/60 text-xs mb-2">Guilds ({user.discordGuilds.length})</p>
                    <div className="flex flex-wrap gap-2">
                      {user.discordGuilds.slice(0, 6).map(guild => (
                        <div 
                          key={guild.id}
                          className="flex items-center gap-2 px-2 py-1 bg-white/5 rounded-lg"
                          title={guild.name}
                        >
                          {guild.icon ? (
                            <img 
                              src={`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png?size=32`}
                              alt={guild.name}
                              className="w-5 h-5 rounded"
                            />
                          ) : (
                            <div className="w-5 h-5 rounded bg-[#5865F2]/30 flex items-center justify-center">
                              <span className="text-[10px] text-white/70">{guild.name.charAt(0)}</span>
                            </div>
                          )}
                          <span className="text-white/70 text-xs truncate max-w-[100px]">{guild.name}</span>
                        </div>
                      ))}
                      {user.discordGuilds.length > 6 && (
                        <div className="px-2 py-1 bg-white/5 rounded-lg text-white/50 text-xs">
                          +{user.discordGuilds.length - 6} more
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Discord Connections */}
                {user.discordConnections && user.discordConnections.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-[#5865F2]/10">
                    <p className="text-white/60 text-xs mb-2">Connections</p>
                    <div className="flex flex-wrap gap-2">
                      {user.discordConnections.map(conn => (
                        <div 
                          key={conn.id}
                          className="flex items-center gap-2 px-2 py-1 bg-white/5 rounded-lg"
                        >
                          {conn.type === 'spotify' && (
                            <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                            </svg>
                          )}
                          {conn.type === 'github' && (
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                            </svg>
                          )}
                          {conn.type === 'steam' && (
                            <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                            </svg>
                          )}
                          {conn.type === 'twitch' && (
                            <svg className="w-4 h-4 text-purple-500" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z"/>
                            </svg>
                          )}
                          {conn.type === 'twitter' && (
                            <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                            </svg>
                          )}
                          <span className="text-white/70 text-xs capitalize">{conn.name || conn.type}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Bottom Info Bar */}
            <div className="flex justify-between items-center mt-6 pt-4 border-t border-white/10">
              <div className="text-left">
                <p className="text-white/60 text-xs mb-1">Balance</p>
                <p className="text-white font-semibold">${user?.balanceUsd || '0.00'}</p>
              </div>
              <div className="text-center">
                <p className="text-white/60 text-xs mb-1">Usage</p>
                <p className="text-white font-semibold">{user?.actualUsage || '0'}</p>
              </div>
              <div className="text-right">
                <p className="text-white/60 text-xs mb-1">Plan</p>
                <p className="text-white font-semibold capitalize">{user?.plan || 'No Plan'}</p>
              </div>
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
