import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { ArrowLeft, Shield, Calendar, Eye } from 'lucide-react'
import GlassCard from '../components/ui/GlassCard'
import Button from '../components/ui/Button'

const API_BASE = 'https://datawirecc-api.mynameisntnick0.workers.dev'

const UserProfile = () => {
  const { username } = useParams()
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isMuted, setIsMuted] = useState(true)
  const [viewCount, setViewCount] = useState(0)
  const [audioEnabled, setAudioEnabled] = useState(false)
  const [showEnableAudio, setShowEnableAudio] = useState(false)
  const videoRef = useRef(null)
  const hasTriedUnmuteRef = useRef(false)
  const unmuteAttemptsRef = useRef(0)

  useEffect(() => {
    fetchUserProfile()
    recordView()
  }, [username])


  useEffect(() => {
    // Initialize mute state based on user's Firebase setting
    if (!user) return
    
    const userMuteSetting = user.muteVideoAudio === true
    console.log('FIREBASE muteVideoAudio value:', user.muteVideoAudio, 'Type:', typeof user.muteVideoAudio)
    console.log('Computed userMuteSetting:', userMuteSetting)
    
    // Set isMuted based on user setting
    setIsMuted(userMuteSetting)
    
    // Try to play video when user data loads (start muted for autoplay compliance)
    if (user?.backgroundType === 'video') {
      console.log('Video background detected, attempting to play')
      const playVideo = () => {
        if (videoRef.current) {
          console.log('Attempting to play video, readyState:', videoRef.current.readyState, 'paused:', videoRef.current.paused)
          // Start muted to ensure autoplay works
          videoRef.current.muted = true
          videoRef.current.volume = 1.0
          videoRef.current.play().then(() => {
            console.log('Video playing successfully (muted for autoplay)')
            // Try to unmute after a short delay
            setTimeout(() => {
              if (videoRef.current) {
                videoRef.current.muted = false
                videoRef.current.play().then(() => {
                  console.log('Video unmuted successfully')
                  setIsMuted(false)
                }).catch(e => {
                  console.log('Could not unmute video, needs user interaction:', e)
                  videoRef.current.muted = true
                })
              }
            }, 500)
          }).catch(e => {
            console.log('Video play error:', e)
          })
        } else {
          console.log('Video ref not available yet')
        }
      }
      
      // Try immediately and with delays
      playVideo()
      setTimeout(playVideo, 100)
      setTimeout(playVideo, 500)
      setTimeout(playVideo, 1000)
      setTimeout(playVideo, 2000)
    }

    // Add document click handler to unmute audio/video after user interaction
    const handleUserInteraction = () => {
      console.log('User interaction detected, attempting to unmute')
      
      // Unmute video
      if (videoRef.current && videoRef.current.muted) {
        videoRef.current.muted = false
        videoRef.current.play().then(() => {
          console.log('Video unmuted after user interaction')
          setIsMuted(false)
        }).catch(e => console.log('Could not unmute video:', e))
      }
      
      // Unmute background audio
      if (window.backgroundAudio && window.backgroundAudio.muted) {
        window.backgroundAudio.muted = false
        window.backgroundAudio.play().then(() => {
          console.log('Background audio unmuted after user interaction')
          setIsMuted(false)
        }).catch(e => console.log('Could not unmute background audio:', e))
      }
      
      // Remove listener after first interaction
      document.removeEventListener('click', handleUserInteraction)
      document.removeEventListener('touchstart', handleUserInteraction)
    }

    document.addEventListener('click', handleUserInteraction)
    document.addEventListener('touchstart', handleUserInteraction)
    
    // Handle background audio (MP3) - plays in addition to video/image background
    if (user?.backgroundAudio) {
      console.log('Setting up background audio:', user.backgroundAudio)
      console.log('User mute setting:', userMuteSetting)
      
      // Clean up existing audio if any
      if (window.backgroundAudio) {
        window.backgroundAudio.pause()
        window.backgroundAudio = null
      }
      
      const audio = new Audio(user.backgroundAudio)
      audio.loop = true
      audio.volume = 1.0
      audio.preload = 'auto'
      
      // Start muted for autoplay compliance
      audio.muted = true
      
      // Store audio reference for mute toggle
      window.backgroundAudio = audio
      
      // Try to play muted first for autoplay compliance
      const playAudio = () => {
        if (window.backgroundAudio) {
          window.backgroundAudio.play().then(() => {
            console.log('Background audio playing (muted for autoplay)')
            // Try to unmute after a short delay if user wants audio
            if (!userMuteSetting) {
              setTimeout(() => {
                if (window.backgroundAudio) {
                  window.backgroundAudio.muted = false
                  window.backgroundAudio.play().then(() => {
                    console.log('Background audio unmuted successfully')
                    setIsMuted(false)
                  }).catch(e => {
                    console.log('Could not unmute audio, needs user interaction:', e)
                    window.backgroundAudio.muted = true
                  })
                }
              }, 500)
            }
          }).catch(e => {
            console.log('Background audio play error:', e)
          })
        }
      }
      
      playAudio()
      setTimeout(playAudio, 100)
      setTimeout(playAudio, 500)
      setTimeout(playAudio, 1000)
      
      console.log('Background audio element created')
    } else {
      console.log('No background audio found for user')
    }
    
    return () => {
      // Cleanup audio on unmount
      if (window.backgroundAudio) {
        window.backgroundAudio.pause()
        window.backgroundAudio = null
      }
      // Remove event listeners
      document.removeEventListener('click', handleUserInteraction)
      document.removeEventListener('touchstart', handleUserInteraction)
    }
  }, [user?.background, user?.backgroundType, user?.muteVideoAudio, user?.backgroundAudio])

  const handleEnableAudio = () => {
    console.log('Enable audio button clicked')
    if (window.backgroundAudio) {
      window.backgroundAudio.muted = false
      window.backgroundAudio.volume = 1.0
      window.backgroundAudio.play().then(() => {
        console.log('Background audio playing after button click')
        setAudioEnabled(true)
        setShowEnableAudio(false)
      }).catch(e => console.log('Failed to play audio:', e))
    }
    
    if (videoRef.current && user?.muteVideoAudio !== true) {
      videoRef.current.muted = false
      setIsMuted(false)
      console.log('Video audio enabled after button click')
    }
  }


  const recordView = async () => {
    try {
      await fetch(`${API_BASE}/api/user/public/${username}/view`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })
    } catch (error) {
      console.error('Failed to record view:', error)
    }
  }

  const fetchUserProfile = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/user/public/${username}`)
      const data = await response.json()
      
      if (data.success) {
        setUser(data.user)
        setViewCount(data.user.viewCount || 0)
        
        // Refresh Discord data if user has Discord linked
        if (data.user.discordId) {
          try {
            await fetch(`${API_BASE}/api/user/public/refresh-discord`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ username })
            })
            // Fetch updated profile data after refresh
            const refreshResponse = await fetch(`${API_BASE}/api/user/public/${username}`)
            const refreshData = await refreshResponse.json()
            if (refreshData.success) {
              setUser(refreshData.user)
              setViewCount(refreshData.user.viewCount || 0)
            }
          } catch (refreshError) {
            console.error('Failed to refresh Discord data:', refreshError)
            // Don't fail the whole profile load if refresh fails
          }
        }
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
      <Helmet>
        <title>@{user?.username || 'User'} | DataWire.cc</title>
        <meta name="theme-color" content="#000000" />
        <meta name="description" content={`${user?.bio || ''}${user?.bio && user?.status ? ' | ' : ''}${user?.status || ''}`} />
        <meta property="og:title" content={`@${user?.username || 'User'} | DataWire.cc`} />
        <meta property="og:description" content={`${user?.bio || ''}${user?.bio && user?.status ? ' | ' : ''}${user?.status || ''}`} />
        <meta property="og:image" content={user?.avatar || 'https://datawire.cc/default-avatar.png'} />
        <meta property="og:url" content={`${window.location.origin}/users/${user?.username}`} />
        <meta property="og:type" content="profile" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`@${user?.username || 'User'} | DataWire.cc`} />
        <meta name="twitter:description" content={`${user?.bio || ''}${user?.bio && user?.status ? ' | ' : ''}${user?.status || ''}`} />
        <meta name="twitter:image" content={user?.avatar || 'https://datawire.cc/default-avatar.png'} />
      </Helmet>
      {/* Custom Background */}
      {user?.background && (
        <div className="fixed inset-0 -z-10">
          {user.backgroundType === 'video' ? (
            <video
              ref={videoRef}
              src={user.background}
              className="w-full h-full object-cover"
              autoPlay
              loop
              muted={false}
              playsInline
              controls={false}
              onLoadedData={() => {
                console.log('Video loaded data, ready to play')
                console.log('Video src:', user.background)
                console.log('Video readyState:', videoRef.current?.readyState)
                console.log('User muteVideoAudio:', user.muteVideoAudio)
                
                // Try to play with audio first
                const attemptPlayWithAudio = () => {
                  if (videoRef.current) {
                    videoRef.current.muted = false
                    videoRef.current.play().then(() => {
                      console.log('Video playing successfully with audio')
                    }).catch(e => {
                      console.log('Autoplay with audio blocked, trying muted:', e)
                      // Fallback to muted autoplay
                      if (videoRef.current) {
                        videoRef.current.muted = true
                        videoRef.current.play().then(() => {
                          console.log('Video playing muted (fallback)')
                        }).catch(err => console.log('Video play error even muted:', err))
                      }
                    })
                  }
                }
                
                attemptPlayWithAudio()
                setTimeout(attemptPlayWithAudio, 100)
                setTimeout(attemptPlayWithAudio, 500)
              }}
              onPlay={() => {
                console.log('Video playing, muted:', videoRef.current?.muted, 'isMuted state:', isMuted)
              }}
              onError={(e) => {
                console.log('Video error:', e)
                console.log('Video src:', user.background)
                console.log('Video readyState:', videoRef.current?.readyState)
              }}
            />
          ) : user.backgroundType === 'audio' ? (
            // Audio is handled programmatically in useEffect
            <div className="hidden" />
          ) : (
            <img
              src={user.background}
              alt="Background"
              className="w-full h-full object-cover"
              loading="eager"
            />
          )}
          {/* Enable Audio Button (shows when autoplay is blocked) */}
          {showEnableAudio && (
            <button
              onClick={handleEnableAudio}
              className="fixed top-4 right-4 z-50 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-full backdrop-blur-sm transition-all cursor-pointer flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
              </svg>
              <span>Enable Audio</span>
            </button>
          )}
          {/* Sound toggle indicator */}
          {(user.backgroundType === 'video' || user?.backgroundAudio) && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                
                // Toggle mute state - React will handle the rest
                const newMutedState = !isMuted
                setIsMuted(newMutedState)
                
                // Handle background audio mute (needs manual control since it's not a React component)
                if (window.backgroundAudio) {
                  window.backgroundAudio.muted = newMutedState
                  window.backgroundAudio.volume = 1.0
                  if (!newMutedState) {
                    window.backgroundAudio.play().catch(err => console.log('Background audio play error:', err))
                  }
                  console.log('Background audio muted:', newMutedState)
                }
                
                console.log('Mute toggled - new isMuted state:', newMutedState)
              }}
              className="fixed bottom-4 right-4 z-50 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full backdrop-blur-sm transition-all cursor-pointer"
              title="Click to toggle sound"
            >
              {isMuted ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="1" y1="1" x2="23" y2="23"></line>
                  <path d="M9 9v6a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"></path>
                  <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"></path>
                  <line x1="12" y1="19" x2="12" y2="23"></line>
                  <line x1="8" y1="23" x2="16" y2="23"></line>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                </svg>
              )}
            </button>
          )}
          <div className="absolute inset-0 bg-black/60" />
        </div>
      )}
      
      {/* Default black background */}
      {!user?.background && (
        <div className="fixed inset-0 -z-10 bg-black" />
      )}
      
      {/* View Counter */}
      <div className="fixed bottom-4 left-4 z-50 bg-black/50 hover:bg-black/70 text-white px-4 py-2 rounded-full backdrop-blur-sm transition-all">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4" />
          <span className="text-sm font-semibold">{viewCount.toLocaleString()}</span>
        </div>
      </div>
      
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
            </div>

            {/* Discord Profile - guns.lol style */}
            {user?.discordId && (
              <div className="mt-6">
                <div className="bg-[#1a1b26] rounded-xl overflow-hidden border border-[#5865F2]/20">
                  {/* Discord Header */}
                  <div className="bg-gradient-to-r from-[#5865F2] to-[#7289da] px-4 py-3">
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                      </svg>
                      <span className="text-white font-semibold text-sm">Discord</span>
                    </div>
                  </div>
                  
                  {/* Discord Content */}
                  <div className="p-4">
                    <div className="flex items-start gap-4">
                      {/* Avatar */}
                      <div className="relative flex-shrink-0">
                        <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[#5865F2]/30">
                          {user.discordAvatar ? (
                            <img 
                              src={user.discordAvatar} 
                              alt="Discord Avatar" 
                              className="w-full h-full object-cover" 
                            />
                          ) : (
                            <div className="w-full h-full bg-[#5865F2]/20 flex items-center justify-center">
                              <svg className="w-8 h-8 text-[#5865F2]/50" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-[#1a1b26] ${
                          user.discordStatus === 'online' ? 'bg-green-500' :
                          user.discordStatus === 'dnd' ? 'bg-red-500' :
                          user.discordStatus === 'idle' ? 'bg-yellow-500' : 'bg-gray-500'
                        }`} />
                      </div>
                      
                      {/* User Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-white font-semibold truncate">{user.discordGlobalName || user.discordUsername}</p>
                          {user.discordDiscriminator && user.discordDiscriminator !== '0' && (
                            <span className="text-white/50 text-sm">#{user.discordDiscriminator}</span>
                          )}
                        </div>
                        <p className="text-white/50 text-xs mb-2">@{user.discordUsername}</p>
                        
                        {/* Status */}
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-medium capitalize ${
                            user.discordStatus === 'online' ? 'text-green-400' :
                            user.discordStatus === 'dnd' ? 'text-red-400' :
                            user.discordStatus === 'idle' ? 'text-yellow-400' : 'text-gray-400'
                          }`}>
                            {user.discordStatus === 'online' ? 'Online' :
                             user.discordStatus === 'dnd' ? 'Do Not Disturb' :
                             user.discordStatus === 'idle' ? 'Idle' : 'Offline'}
                          </span>
                          {user.lastSeen && user.discordStatus !== 'online' && (
                            <span className="text-white/30 text-xs">• Last seen {new Date(user.lastSeen).toLocaleString()}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Badges */}
                    {user.discordBadgesList && user.discordBadgesList.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-white/5">
                        {user.discordBadgesList.map((badge, index) => (
                          <div 
                            key={index}
                            className="flex items-center gap-1.5 px-2 py-1 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                            title={badge.name}
                          >
                            {badge.icon && (
                              <img 
                                src={badge.icon} 
                                alt={badge.name}
                                className="w-4 h-4"
                              />
                            )}
                            <span className="text-white/70 text-xs">{badge.name}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Guilds */}
                    {user.discordGuilds && user.discordGuilds.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {user.discordGuilds.slice(0, 6).map(guild => (
                          <div 
                            key={guild.id}
                            className="flex items-center gap-2 px-2 py-1 bg-[#5865F2]/10 rounded-lg hover:bg-[#5865F2]/20 transition-colors"
                            title={guild.name}
                          >
                            {guild.icon ? (
                              <img 
                                src={guild.icon}
                                alt={guild.name}
                                className="w-4 h-4 rounded"
                              />
                            ) : (
                              <div className="w-4 h-4 rounded bg-[#5865F2]/30 flex items-center justify-center">
                                <span className="text-[8px] text-white/70">{guild.name.charAt(0)}</span>
                              </div>
                            )}
                            <span className="text-white/60 text-xs truncate max-w-[100px]">{guild.name}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
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
                value={`${window.location.origin}/users/${user?.username}`}
                readOnly
                className="flex-1 px-4 py-3 bg-black/30 border border-white/10 rounded-lg text-white text-sm"
              />
              <Button
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/users/${user?.username}`)
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
