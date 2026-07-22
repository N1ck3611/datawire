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
  const [isMuted, setIsMuted] = useState(() => {
    // Default to unmuted, but respect localStorage if set
    const stored = localStorage.getItem('profileMuted')
    return stored === null ? false : stored === 'true'
  })
  const [viewCount, setViewCount] = useState(0)
  const [audioEnabled, setAudioEnabled] = useState(false)
  const [showEnableAudio, setShowEnableAudio] = useState(false)
  const [hasEntered, setHasEntered] = useState(false)
  const [typingText, setTypingText] = useState('')
  const videoRef = useRef(null)
  const hasTriedUnmuteRef = useRef(false)
  const unmuteAttemptsRef = useRef(0)

  useEffect(() => {
    fetchUserProfile()
    recordView()
  }, [username])

  // Animated typing effect for intro
  useEffect(() => {
    if (hasEntered) return
    
    setTypingText('')
    
    // Ensure enterText is a proper string
    let rawEnterText = user?.enterText
    console.log('[UserProfile] Raw enterText from user:', rawEnterText, 'Type:', typeof rawEnterText)
    
    // Convert to string and handle any edge cases
    let text = "ENTER"
    if (rawEnterText) {
      if (typeof rawEnterText === 'string') {
        text = rawEnterText.trim()
      } else if (typeof rawEnterText === 'object' && rawEnterText !== null) {
        // If it's an object/array, try to convert it
        text = String(rawEnterText).trim()
      } else {
        text = String(rawEnterText).trim()
      }
    }
    
    // Ensure it's not empty after processing
    if (!text || text === 'undefined' || text === 'null') {
      text = "ENTER"
    }
    
    const animation = user?.enterAnimation || 'typing'
    console.log('[UserProfile] Final typing text:', text, 'Animation:', animation)
    
    if (animation === 'typing') {
      // Improved typing animation
      let index = 0
      const typeNextChar = () => {
        if (index < text.length) {
          const char = text.charAt(index)
          setTypingText(prev => prev + char)
          index++
          setTimeout(typeNextChar, 80)
        }
      }
      const timer = setTimeout(typeNextChar, 300)
      return () => clearTimeout(timer)
    } else if (animation === 'flicker') {
      // Random letter flicker animation
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*'
      let iterations = 0
      const maxIterations = 15
      
      const flicker = () => {
        if (iterations < maxIterations) {
          // Generate random string of same length
          let flickerText = ''
          for (let i = 0; i < text.length; i++) {
            if (i < iterations * (text.length / maxIterations)) {
              flickerText += text[i]
            } else {
              flickerText += chars.charAt(Math.floor(Math.random() * chars.length))
            }
          }
          setTypingText(flickerText)
          iterations++
          setTimeout(flicker, 50)
        } else {
          setTypingText(text)
        }
      }
      const timer = setTimeout(flicker, 300)
      return () => clearTimeout(timer)
    } else if (animation === 'fadeblink') {
      // Fade in then blink animation
      setTypingText(text)
      const timer = setTimeout(() => {
        // Text is already set, the blinking cursor handles the rest
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [hasEntered, user?.enterText, user?.enterAnimation])

  // Handle ENTER key press
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'Enter' && !hasEntered) {
        e.preventDefault()
        setHasEntered(true)
      }
    }
    
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [hasEntered])


  useEffect(() => {
    if (!user || !hasEntered) return
    
    console.log('[Playback] User loaded, backgroundType:', user.backgroundType, 'backgroundAudio:', !!user.backgroundAudio, 'muteVideoAudio:', user.muteVideoAudio)
    
    // Determine if video should be muted based on user's muteVideoAudio setting or if background audio exists
    const shouldMuteVideo = user?.muteVideoAudio === true || !!user?.backgroundAudio
    
    // Handle background audio
    if (user?.backgroundAudio) {
      if (window.backgroundAudio) {
        window.backgroundAudio.pause()
        window.backgroundAudio = null
      }
      
      const audio = new Audio(user.backgroundAudio)
      audio.loop = true
      audio.volume = 1.0
      audio.preload = 'auto'
      audio.muted = isMuted
      window.backgroundAudio = audio
      
      console.log('[Playback] Audio created, src:', user.backgroundAudio, 'muted:', audio.muted)
      
      const playAudio = () => {
        if (window.backgroundAudio) {
          console.log('[Playback] Attempting to play audio, muted:', window.backgroundAudio.muted)
          window.backgroundAudio.play()
            .then(() => console.log('[Playback] Audio playing successfully'))
            .catch(e => console.log('[Playback] Audio play error:', e))
        }
      }
      
      playAudio()
      setTimeout(playAudio, 100)
      setTimeout(playAudio, 500)
    }
    
    // Handle video playback
    if (user?.backgroundType === 'video' && videoRef.current) {
      console.log('[Playback] Video element found, src:', user.background, 'shouldMuteVideo:', shouldMuteVideo)
      
      const playVideo = () => {
        if (videoRef.current) {
          console.log('[Playback] Attempting to play video, muted:', shouldMuteVideo, 'readyState:', videoRef.current.readyState)
          videoRef.current.muted = shouldMuteVideo
          videoRef.current.volume = 1.0
          videoRef.current.play()
            .then(() => console.log('[Playback] Video playing successfully'))
            .catch(e => console.log('[Playback] Video play error:', e))
        }
      }
      
      // Wait for video to be ready
      const checkVideoReady = setInterval(() => {
        if (videoRef.current && videoRef.current.readyState >= 2) {
          console.log('[Playback] Video ready, readyState:', videoRef.current.readyState)
          clearInterval(checkVideoReady)
          playVideo()
        }
      }, 100)
      
      // Also try immediately
      setTimeout(playVideo, 100)
      setTimeout(playVideo, 500)
      setTimeout(playVideo, 1000)
      
      return () => clearInterval(checkVideoReady)
    }
    
    return () => {
      if (window.backgroundAudio) {
        window.backgroundAudio.pause()
        window.backgroundAudio = null
      }
    }
  }, [user?.background, user?.backgroundType, user?.backgroundAudio, user?.muteVideoAudio, hasEntered, isMuted])

  // Handle mute state changes
  useEffect(() => {
    console.log('[Playback] Mute state changed to:', isMuted)
    
    // For background audio, always respect the client-side mute toggle
    if (window.backgroundAudio) {
      window.backgroundAudio.muted = isMuted
      console.log('[Playback] Audio muted set to:', isMuted)
    }
    
    // For video, respect the user's muteVideoAudio setting if background audio exists
    // Otherwise use the client-side mute toggle
    const shouldMuteVideo = user?.muteVideoAudio === true || !!user?.backgroundAudio
    
    if (videoRef.current) {
      // If background audio exists, keep video muted regardless of client toggle
      // Otherwise, respect the client-side mute toggle
      if (user?.backgroundAudio) {
        videoRef.current.muted = true
        console.log('[Playback] Video kept muted (background audio present)')
      } else {
        videoRef.current.muted = shouldMuteVideo ? true : isMuted
        console.log('[Playback] Video muted set to:', videoRef.current.muted)
      }
    }
  }, [isMuted, user?.muteVideoAudio, user?.backgroundAudio])

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
        
        // Set mute state based on user's muteVideoAudio setting (only if no background audio)
        // If background audio exists, we want audio to play by default (unmuted)
        if (data.user.backgroundAudio) {
          // If background audio exists, default to unmuted so the audio plays
          setIsMuted(false)
          localStorage.setItem('profileMuted', 'false')
        } else if (data.user.muteVideoAudio !== undefined) {
          // If no background audio, respect the muteVideoAudio setting
          setIsMuted(data.user.muteVideoAudio)
          localStorage.setItem('profileMuted', data.user.muteVideoAudio)
        }
        
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
      {/* ENTER Intro Screen */}
      {!hasEntered && (
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: hasEntered ? 0 : 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-[9999] bg-black flex items-center justify-center"
          onClick={() => setHasEntered(true)}
        >
          <div className="text-center">
            <p className="text-white text-4xl font-mono tracking-wider">
              {typingText}
              <span className="animate-pulse">|</span>
            </p>
          </div>
        </motion.div>
      )}
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
              muted={isMuted}
              playsInline
              controls={false}
              disablePictureInPicture
              disableRemotePlayback
              preload="auto"
              x-webkit-airplay="allow"
              webkit-playsinline
              style={{ objectFit: 'cover' }}
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

      {/* Client-side mute toggle - outside background container */}
      {(user.backgroundType === 'video' || user?.backgroundAudio) && (
        <button
          onClick={() => {
            const newMutedState = !isMuted
            setIsMuted(newMutedState)
            localStorage.setItem('profileMuted', newMutedState)
            
            if (videoRef.current) {
              videoRef.current.muted = newMutedState
            }
            if (window.backgroundAudio) {
              window.backgroundAudio.muted = newMutedState
            }
          }}
          className="fixed bottom-4 right-4 z-[9999] bg-black/50 hover:bg-black/70 text-white p-3 rounded-full backdrop-blur-sm transition-all cursor-pointer"
          title="Toggle sound"
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
