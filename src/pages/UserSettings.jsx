import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import GlassCard from '../components/ui/GlassCard'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import ColorSlider from '../components/ui/ColorSlider'

const API_BASE = 'https://datawirecc-api.mynameisntnick0.workers.dev'

const UserSettings = () => {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [username, setUsername] = useState('')
  const [usernameError, setUsernameError] = useState('')
  const [usernameSuccess, setUsernameSuccess] = useState('')
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [uploadSuccess, setUploadSuccess] = useState('')
  const [accentColor, setAccentColor] = useState('#6366f1')
  const [hexInput, setHexInput] = useState('#6366f1')
  const [bio, setBio] = useState('')
  const [bioError, setBioError] = useState('')
  const [bioSuccess, setBioSuccess] = useState('')
  const [backgroundFile, setBackgroundFile] = useState(null)
  const [backgroundPreview, setBackgroundPreview] = useState(null)
  const [uploadingBackground, setUploadingBackground] = useState(false)
  const [backgroundError, setBackgroundError] = useState('')
  const [backgroundSuccess, setBackgroundSuccess] = useState('')
  const [backgroundAudioFile, setBackgroundAudioFile] = useState(null)
  const [backgroundAudioPreview, setBackgroundAudioPreview] = useState(null)
  const [uploadingBackgroundAudio, setUploadingBackgroundAudio] = useState(false)
  const [backgroundAudioError, setBackgroundAudioError] = useState('')
  const [backgroundAudioSuccess, setBackgroundAudioSuccess] = useState('')
  const [muteVideoAudio, setMuteVideoAudio] = useState(false)
  const [status, setStatus] = useState('')
  const [statusError, setStatusError] = useState('')
  const [statusSuccess, setStatusSuccess] = useState('')
  const [linkingDiscord, setLinkingDiscord] = useState(false)
  const [enterText, setEnterText] = useState('ENTER')
  const [enterTextError, setEnterTextError] = useState('')
  const [enterTextSuccess, setEnterTextSuccess] = useState('')
  const [enterAnimation, setEnterAnimation] = useState('typing')
  const [embedColor, setEmbedColor] = useState('#6366f1')
  const [isAudioPlaying, setIsAudioPlaying] = useState(false)
  const [accentColorSuccess, setAccentColorSuccess] = useState('')
  const [embedColorSuccess, setEmbedColorSuccess] = useState('')

  useEffect(() => {
    fetchUserProfile()
    // Load saved accent color
    const savedColor = localStorage.getItem('accentColor')
    if (savedColor) {
      setAccentColor(savedColor)
      setHexInput(savedColor)
    }
  }, [])

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('auth_token')
      if (!token) {
        navigate('/login')
        return
      }
      
      const response = await fetch(`${API_BASE}/api/user/profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (response.status === 401) {
        localStorage.removeItem('auth_token')
        navigate('/login')
        return
      }
      
      const data = await response.json()
      
      if (data.success) {
        setUser(data.user)
        setUsername(data.user.username || '')
        if (data.user.avatar) {
          setAvatarPreview(data.user.avatar)
        }
        if (data.user.bio) {
          setBio(data.user.bio)
        }
        if (data.user.background) {
          setBackgroundPreview(data.user.background)
        }
        if (data.user.backgroundAudio) {
          setBackgroundAudioPreview(data.user.backgroundAudio)
        }
        if (data.user.muteVideoAudio !== undefined) {
          setMuteVideoAudio(data.user.muteVideoAudio)
        }
        if (data.user.status) {
          setStatus(data.user.status)
        }
        if (data.user.enterText && typeof data.user.enterText === 'string' && data.user.enterText.trim()) {
          setEnterText(data.user.enterText.trim())
        } else {
          setEnterText('ENTER')
        }
        if (data.user.enterAnimation) {
          setEnterAnimation(data.user.enterAnimation)
        }
        if (data.user.embedColor) {
          setEmbedColor(data.user.embedColor)
        }
        if (data.user.accentColor) {
          setAccentColor(data.user.accentColor)
          setHexInput(data.user.accentColor)
          localStorage.setItem('accentColor', data.user.accentColor)
          document.documentElement.style.setProperty('--accent-color', data.user.accentColor)
        }
      } else {
        console.error('Profile fetch failed:', data.error)
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const checkUsernameAvailability = async (usernameToCheck) => {
    if (!usernameToCheck || usernameToCheck.length < 3) return
    
    try {
      const token = localStorage.getItem('auth_token')
      const response = await fetch(`${API_BASE}/api/user/check-username`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username: usernameToCheck })
      })
      const data = await response.json()
      
      if (data.success && !data.available) {
        setUsernameError('Username is already taken')
      } else {
        setUsernameError('')
      }
    } catch (error) {
      console.error('Failed to check username:', error)
    }
  }

  const handleUsernameChange = (e) => {
    const newUsername = e.target.value
    setUsername(newUsername)
    setUsernameSuccess('')
    
    // Validate format
    if (newUsername.length > 0 && !/^[a-zA-Z0-9_]+$/.test(newUsername)) {
      setUsernameError('Username can only contain letters, numbers, and underscores')
    } else if (newUsername.length > 20) {
      setUsernameError('Username must be 20 characters or less')
    } else if (newUsername.length > 0 && newUsername.length < 3) {
      setUsernameError('Username must be at least 3 characters')
    } else {
      setUsernameError('')
      
      // Check availability if it's different from current
      if (newUsername !== user?.username && newUsername.length >= 3) {
        const debounceTimer = setTimeout(() => {
          checkUsernameAvailability(newUsername)
        }, 500)
        return () => clearTimeout(debounceTimer)
      }
    }
  }

  const handleUsernameUpdate = async (e) => {
    e.preventDefault()
    setUsernameSuccess('')
    setUsernameError('')
    
    if (username === user?.username) {
      setUsernameError('Username is the same as current')
      return
    }
    
    if (username.length < 3 || username.length > 20) {
      setUsernameError('Username must be between 3 and 20 characters')
      return
    }
    
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setUsernameError('Username can only contain letters, numbers, and underscores')
      return
    }
    
    try {
      const token = localStorage.getItem('auth_token')
      const response = await fetch(`${API_BASE}/api/user/username`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username })
      })
      const data = await response.json()
      
      if (data.success) {
        setUsernameSuccess('Username updated successfully!')
        setUser({ ...user, username })
      } else {
        setUsernameError(data.error || 'Failed to update username')
      }
    } catch (error) {
      setUsernameError('Network error. Please try again.')
    }
  }

  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
      if (!validTypes.includes(file.type)) {
        setUploadError('Please upload a valid image file (JPG, PNG, GIF, WebP)')
        return
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setUploadError('File size must be less than 5MB')
        return
      }
      
      setAvatarFile(file)
      setUploadError('')
      setUploadSuccess('')
      
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAvatarUpload = async (e) => {
    e.preventDefault()
    
    if (!avatarFile) {
      setUploadError('Please select an image to upload')
      return
    }
    
    setUploading(true)
    setUploadError('')
    setUploadSuccess('')
    
    try {
      // Convert file to base64
      const reader = new FileReader()
      reader.onloadend = async () => {
        const base64Data = reader.result.split(',')[1]
        
        try {
          const token = localStorage.getItem('auth_token')
          const response = await fetch(`${API_BASE}/api/user/avatar`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ imageData: base64Data })
          })
          const data = await response.json()
          
          if (data.success) {
            setUploadSuccess('Profile picture updated successfully!')
            setUser({ ...user, avatar: data.avatarUrl })
            setAvatarFile(null)
          } else {
            setUploadError(data.error || 'Failed to upload profile picture')
          }
        } catch (error) {
          setUploadError('Network error. Please try again.')
        } finally {
          setUploading(false)
        }
      }
      reader.readAsDataURL(avatarFile)
    } catch (error) {
      setUploadError('Failed to process image')
      setUploading(false)
    }
  }

  const handleColorChange = (color) => {
    setAccentColor(color)
    setHexInput(color)
    localStorage.setItem('accentColor', color)
    // Update CSS variable for accent color
    document.documentElement.style.setProperty('--accent-color', color)
  }

  const handleHexChange = (e) => {
    const hex = e.target.value
    setHexInput(hex)
    if (/^#[0-9A-Fa-f]{6}$/.test(hex)) {
      setAccentColor(hex)
      localStorage.setItem('accentColor', hex)
      document.documentElement.style.setProperty('--accent-color', hex)
    }
  }

  const presetColors = [
    '#6366f1', // Indigo
    '#8b5cf6', // Violet
    '#ec4899', // Pink
    '#f43f5e', // Rose
    '#ef4444', // Red
    '#f97316', // Orange
    '#eab308', // Yellow
    '#22c55e', // Green
    '#14b8a6', // Teal
    '#06b6d4', // Cyan
    '#3b82f6', // Blue
    '#64748b', // Slate
  ]

  const handleBioUpdate = async (e) => {
    e.preventDefault()
    setBioError('')
    setBioSuccess('')

    try {
      const token = localStorage.getItem('auth_token')
      const response = await fetch(`${API_BASE}/api/user/bio`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ bio })
      })

      const data = await response.json()

      if (data.success) {
        setBioSuccess('Bio updated successfully!')
        setUser({ ...user, bio })
      } else {
        setBioError(data.error || 'Failed to update bio')
      }
    } catch (error) {
      setBioError('Network error. Please try again.')
    }
  }

  const handleBackgroundChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validate file type (include video/quicktime for MOV files)
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/mov', 'video/quicktime', 'video/webm', 'audio/mpeg', 'audio/mp3']
      if (!validTypes.includes(file.type)) {
        setBackgroundError('Please upload a valid image, video, or audio file (JPG, PNG, GIF, WebP, MP4, MOV, WebM, MP3)')
        return
      }
      
      // Validate file size (max 50MB for videos/audio, 10MB for images, 20MB for GIFs)
      let maxSize = 10 * 1024 * 1024
      if (file.type.startsWith('video/') || file.type.startsWith('audio/')) {
        maxSize = 50 * 1024 * 1024
      } else if (file.type === 'image/gif') {
        maxSize = 20 * 1024 * 1024
      }
      
      if (file.size > maxSize) {
        const maxSizeMB = (file.type.startsWith('video/') || file.type.startsWith('audio/')) ? '50MB' : (file.type === 'image/gif' ? '20MB' : '10MB')
        setBackgroundError(`File size must be less than ${maxSizeMB}`)
        return
      }
      
      setBackgroundFile(file)
      setBackgroundError('')
      setBackgroundSuccess('')
      
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setBackgroundPreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleBackgroundUpload = async (e) => {
    e.preventDefault()
    
    if (!backgroundFile) {
      setBackgroundError('Please select a file to upload')
      return
    }
    
    setUploadingBackground(true)
    setBackgroundError('')
    setBackgroundSuccess('')
    
    try {
      const reader = new FileReader()
      reader.onloadend = async () => {
        const fileData = reader.result.split(',')[1] // Get base64 data
        
        try {
          const token = localStorage.getItem('auth_token')
          let fileType = 'image'
          
          if (backgroundFile.type.startsWith('video/')) {
            fileType = 'video'
          } else if (backgroundFile.type.startsWith('audio/')) {
            fileType = 'audio'
          }
          
          const response = await fetch(`${API_BASE}/api/user/background`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              fileData,
              fileType
            })
          })

          const data = await response.json()

          if (data.success) {
            setBackgroundSuccess('Background updated successfully!')
            setUser({ ...user, background: data.backgroundUrl, backgroundType: data.backgroundType })
            setBackgroundFile(null)
          } else {
            setBackgroundError(data.error || 'Failed to upload background')
          }
        } catch (error) {
          setBackgroundError('Network error. Please try again.')
        } finally {
          setUploadingBackground(false)
        }
      }
      reader.readAsDataURL(backgroundFile)
    } catch (error) {
      setBackgroundError('Failed to process file')
      setUploadingBackground(false)
    }
  }

  const handleBackgroundAudioChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const validTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg']
      if (!validTypes.includes(file.type)) {
        setBackgroundAudioError('Please upload a valid audio file (MP3, WAV, OGG)')
        return
      }
      
      const maxSize = 50 * 1024 * 1024
      if (file.size > maxSize) {
        setBackgroundAudioError('File size must be less than 50MB')
        return
      }
      
      setBackgroundAudioFile(file)
      setBackgroundAudioError('')
      setBackgroundAudioSuccess('')
      
      const reader = new FileReader()
      reader.onloadend = () => {
        setBackgroundAudioPreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleBackgroundAudioUpload = async (e) => {
    e.preventDefault()
    
    if (!backgroundAudioFile) {
      setBackgroundAudioError('Please select a file to upload')
      return
    }
    
    setUploadingBackgroundAudio(true)
    setBackgroundAudioError('')
    setBackgroundAudioSuccess('')
    
    try {
      const reader = new FileReader()
      reader.onloadend = async () => {
        const fileData = reader.result.split(',')[1]
        
        try {
          const token = localStorage.getItem('auth_token')
          
          const response = await fetch(`${API_BASE}/api/user/background-audio`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              fileData,
              fileType: backgroundAudioFile.type
            })
          })
          
          const data = await response.json()

          if (data.success) {
            setBackgroundAudioSuccess('Background audio updated successfully!')
            setUser({ ...user, backgroundAudio: data.backgroundAudioUrl })
            setBackgroundAudioFile(null)
          } else {
            setBackgroundAudioError(data.error || 'Failed to upload background audio')
          }
        } catch (error) {
          setBackgroundAudioError('Network error. Please try again.')
        } finally {
          setUploadingBackgroundAudio(false)
        }
      }
      reader.readAsDataURL(backgroundAudioFile)
    } catch (error) {
      setBackgroundAudioError('Failed to process file')
      setUploadingBackgroundAudio(false)
    }
  }

  const handleRemoveBackgroundAudio = async () => {
    try {
      const token = localStorage.getItem('auth_token')
      const response = await fetch(`${API_BASE}/api/user/background-audio`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })
      
      const data = await response.json()
      
      if (data.success) {
        setBackgroundAudioSuccess('Background audio removed successfully!')
        setUser({ ...user, backgroundAudio: null })
        setBackgroundAudioPreview(null)
        setBackgroundAudioFile(null)
      } else {
        setBackgroundAudioError(data.error || 'Failed to remove background audio')
      }
    } catch (error) {
      console.error('Failed to remove background audio:', error)
      setBackgroundAudioError('Network error. Please try again.')
    }
  }

  const handleMuteToggle = async () => {
    const newValue = !muteVideoAudio
    console.log('[Mute Toggle] Current state:', muteVideoAudio, 'New value:', newValue)
    setMuteVideoAudio(newValue)
    
    try {
      const token = localStorage.getItem('auth_token')
      console.log('[Mute Toggle] Sending request to backend with mute:', newValue)
      
      const response = await fetch(`${API_BASE}/api/user/mute-video-audio`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ mute: newValue })
      })
      
      const data = await response.json()
      console.log('[Mute Toggle] Backend response:', data)
      
      if (!data.success) {
        console.log('[Mute Toggle] Backend returned failure, reverting state')
        setMuteVideoAudio(!newValue)
      } else {
        console.log('[Mute Toggle] Backend confirmed update, new muteVideoAudio:', data.muteVideoAudio)
      }
    } catch (error) {
      console.error('[Mute Toggle] Failed to update mute setting:', error)
      setMuteVideoAudio(!newValue)
    }
  }

  const handleStatusUpdate = async (e) => {
    e.preventDefault()
    setStatusError('')
    setStatusSuccess('')

    try {
      const token = localStorage.getItem('auth_token')
      const response = await fetch(`${API_BASE}/api/user/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      })

      const data = await response.json()

      if (data.success) {
        setStatusSuccess('Status updated successfully!')
        setUser({ ...user, status })
      } else {
        setStatusError(data.error || 'Failed to update status')
      }
    } catch (error) {
      setStatusError('Network error. Please try again.')
    }
  }

  const handleLinkDiscord = () => {
    setLinkingDiscord(true)
    const redirectUri = 'https://datawirecc-api.mynameisntnick0.workers.dev/callback'
    const encodedRedirectUri = encodeURIComponent(redirectUri)
    const discordAuthUrl = 'https://discord.com/api/oauth2/authorize?client_id=1523193275001999400&redirect_uri=' + encodedRedirectUri + '&response_type=code&scope=email%20identify&state=link'
    window.location.href = discordAuthUrl
  }

  const handleEnterTextUpdate = async (e) => {
    e.preventDefault()
    setEnterTextError('')
    setEnterTextSuccess('')

    if (enterText.length === 0) {
      setEnterTextError('Enter text cannot be empty')
      return
    }

    if (enterText.length > 10) {
      setEnterTextError('Enter text must be 10 characters or less')
      return
    }

    console.log('[UserSettings] Saving enterText:', enterText)

    try {
      const token = localStorage.getItem('auth_token')
      const response = await fetch(`${API_BASE}/api/user/enter-text`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ enterText })
      })

      const data = await response.json()

      console.log('[UserSettings] Enter text save response:', data)

      if (data.success) {
        setEnterTextSuccess('Enter text updated successfully!')
        setUser({ ...user, enterText })
      } else {
        setEnterTextError(data.error || 'Failed to update enter text')
      }
    } catch (error) {
      console.error('[UserSettings] Enter text save error:', error)
      setEnterTextError('Network error. Please try again.')
    }
  }

  const handleEmbedColorUpdate = (color) => {
    setEmbedColor(color)
    setEmbedColorSuccess('')
  }

  const handleEnterAnimationUpdate = async (animation) => {
    try {
      const token = localStorage.getItem('auth_token')
      const response = await fetch(`${API_BASE}/api/user/enter-animation`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ enterAnimation: animation })
      })

      const data = await response.json()

      if (data.success) {
        setEnterAnimation(animation)
        setUser({ ...user, enterAnimation: animation })
      } else {
        console.error('Failed to update enter animation:', data.error)
      }
    } catch (error) {
      console.error('Failed to update enter animation:', error)
    }
  }

  const handleSaveEmbedColor = async (color) => {
    try {
      const token = localStorage.getItem('auth_token')
      const response = await fetch(`${API_BASE}/api/user/embed-color`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ embedColor: color })
      })

      const data = await response.json()

      if (data.success) {
        setUser({ ...user, embedColor: color })
        setEmbedColorSuccess('Embed color saved successfully!')
        setTimeout(() => setEmbedColorSuccess(''), 3000)
      } else {
        setEmbedColorSuccess('Failed to save embed color')
        setTimeout(() => setEmbedColorSuccess(''), 3000)
      }
    } catch (error) {
      console.error('Failed to update embed color:', error)
      setEmbedColorSuccess('Network error. Please try again.')
      setTimeout(() => setEmbedColorSuccess(''), 3000)
    }
  }

  const handleAccentColorUpdate = async (color) => {
    setAccentColor(color)
    setHexInput(color)
    localStorage.setItem('accentColor', color)
    document.documentElement.style.setProperty('--accent-color', color)
    setAccentColorSuccess('')
  }

  const handleSaveAccentColor = async (color) => {
    try {
      const token = localStorage.getItem('auth_token')
      const response = await fetch(`${API_BASE}/api/user/accent-color`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ accentColor: color })
      })

      const data = await response.json()

      if (data.success) {
        setUser({ ...user, accentColor: color })
        setAccentColorSuccess('Accent color saved successfully!')
        setTimeout(() => setAccentColorSuccess(''), 3000)
      } else {
        setAccentColorSuccess('Failed to save accent color')
        setTimeout(() => setAccentColorSuccess(''), 3000)
      }
    } catch (error) {
      console.error('Failed to update accent color:', error)
      setAccentColorSuccess('Network error. Please try again.')
      setTimeout(() => setAccentColorSuccess(''), 3000)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-12 px-4 bg-black">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors backdrop-blur-sm"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div>
              <h1 className="text-4xl font-bold text-white">User Settings</h1>
              <p className="text-osint-muted">Customize your profile</p>
            </div>
          </div>

          {/* Profile Picture Section */}
          <GlassCard className="mb-6 p-6 bg-white/5 backdrop-blur-xl border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              Profile Picture
            </h2>
            
            <div className="flex items-center gap-6 mb-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-white/20 bg-black/50 flex items-center justify-center">
                  {avatarPreview ? (
                    <img 
                      src={avatarPreview} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-3xl text-white/50">
                      {user?.username?.charAt(0).toUpperCase() || '?'}
                    </span>
                  )}
                </div>
              </div>
              
              <div className="flex-1">
                <p className="text-white mb-2">
                  Current: @{user?.username || 'No username set'}
                </p>
                <p className="text-osint-muted text-sm">
                  Upload a new profile picture. Supports JPG, PNG, GIF, and WebP formats.
                </p>
              </div>
            </div>

            <form onSubmit={handleAvatarUpload} className="space-y-4">
              <div>
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                  onChange={handleAvatarChange}
                  className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-white/10 file:text-white hover:file:bg-white/20 transition-all cursor-pointer"
                />
              </div>

              {uploadError && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm"
                >
                  {uploadError}
                </motion.div>
              )}

              {uploadSuccess && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-3 bg-green-500/20 border border-green-500/50 rounded-lg text-green-400 text-sm"
                >
                  {uploadSuccess}
                </motion.div>
              )}

              <Button
                type="submit"
                disabled={!avatarFile || uploading}
                className="w-full"
              >
                {uploading ? 'Uploading...' : 'Update Profile Picture'}
              </Button>
            </form>
          </GlassCard>

          {/* Username Section */}
          <GlassCard className="mb-6 p-6 bg-white/5 backdrop-blur-xl border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              Username
            </h2>
            
            <form onSubmit={handleUsernameUpdate} className="space-y-4">
              <div>
                <label className="block text-sm text-osint-muted mb-2">Current Username</label>
                <div className="px-4 py-3 bg-black/30 border border-white/10 rounded-lg text-white">
                  {user?.username || 'Not set'}
                </div>
              </div>

              <div>
                <label className="block text-sm text-osint-muted mb-2">New Username</label>
                <Input
                  type="text"
                  value={username}
                  onChange={handleUsernameChange}
                  placeholder="Enter new username"
                  className="w-full"
                />
                <p className="text-xs text-osint-muted mt-2">
                  3-20 characters, letters, numbers, and underscores only
                </p>
              </div>

              {usernameError && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm"
                >
                  {usernameError}
                </motion.div>
              )}

              {usernameSuccess && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-3 bg-green-500/20 border border-green-500/50 rounded-lg text-green-400 text-sm"
                >
                  {usernameSuccess}
                </motion.div>
              )}

              <Button
                type="submit"
                disabled={username === user?.username || !!usernameError || username.length < 3}
                className="w-full"
              >
                Update Username
              </Button>
            </form>
          </GlassCard>

          {/* Bio Section */}
          <GlassCard className="mb-6 p-6 bg-white/5 backdrop-blur-xl border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
              Bio
            </h2>
            
            <form onSubmit={handleBioUpdate} className="space-y-4">
              <div>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell others about yourself..."
                  className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-lg text-white placeholder-white/20 focus:outline-none focus:border-white/40 focus:bg-black/50 transition-all backdrop-blur-sm resize-none"
                  rows={4}
                  maxLength={500}
                />
                <p className="text-xs text-osint-muted mt-2">
                  {bio.length}/500 characters
                </p>
              </div>

              {bioError && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm"
                >
                  {bioError}
                </motion.div>
              )}

              {bioSuccess && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-3 bg-green-500/20 border border-green-500/50 rounded-lg text-green-400 text-sm"
                >
                  {bioSuccess}
                </motion.div>
              )}

              <Button
                type="submit"
                disabled={bio === user?.bio}
                className="w-full"
              >
                Update Bio
              </Button>
            </form>
          </GlassCard>

          {/* Background Section */}
          <GlassCard className="mb-6 p-6 bg-white/5 backdrop-blur-xl border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                <polyline points="21 15 16 10 5 21"></polyline>
              </svg>
              Profile Background
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center gap-6 mb-6">
                <div className="relative w-full h-32 rounded-lg overflow-hidden border-2 border-white/20 bg-black/50 flex items-center justify-center">
                  {backgroundPreview ? (
                    backgroundPreview.startsWith('data:video') || 
                    backgroundPreview.startsWith('data:audio') || 
                    backgroundPreview.includes('video') || 
                    backgroundPreview.includes('audio') ||
                    backgroundPreview.includes('quicktime') ||
                    backgroundPreview.includes('mp4') ||
                    backgroundPreview.includes('mov') ||
                    backgroundPreview.includes('webm') ||
                    backgroundPreview.includes('mp3') ? (
                      <video
                        src={backgroundPreview}
                        className="w-full h-full object-cover"
                        autoPlay
                        loop
                        muted
                        playsInline
                        controls={false}
                      />
                    ) : (
                      <img 
                        src={backgroundPreview} 
                        alt="Background" 
                        className="w-full h-full object-cover"
                      />
                    )
                  ) : (
                    <span className="text-white/50">No background set</span>
                  )}
                </div>
              </div>
              
              <form onSubmit={handleBackgroundUpload} className="space-y-4">
                <div>
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,video/mp4,video/mov,video/quicktime,video/webm,audio/mpeg,audio/mp3"
                    onChange={handleBackgroundChange}
                    className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-white/10 file:text-white hover:file:bg-white/20 transition-all cursor-pointer"
                  />
                  <p className="text-xs text-osint-muted mt-2">
                    Supports JPG, PNG, GIF, WebP, MP4, MOV, WebM, MP3. Max 10MB for images, 50MB for videos/audio.
                  </p>
                </div>

                {backgroundError && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm"
                  >
                    {backgroundError}
                  </motion.div>
                )}

                {backgroundSuccess && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-3 bg-green-500/20 border border-green-500/50 rounded-lg text-green-400 text-sm"
                  >
                    {backgroundSuccess}
                  </motion.div>
                )}

                <Button
                  type="submit"
                  disabled={!backgroundFile || uploadingBackground}
                  loading={uploadingBackground}
                  className="w-full"
                >
                  {uploadingBackground ? 'Uploading...' : 'Upload Background'}
                </Button>
              </form>

              {/* Background Audio Section */}
              <div className="mt-6 pt-6 border-t border-white/10">
                <h3 className="text-lg font-semibold text-white mb-4">Background Audio</h3>
                
                <div className="space-y-4">
                  <div className="relative w-full h-20 rounded-xl overflow-hidden border-2 border-white/20 bg-black/50 flex items-center justify-center">
                    {backgroundAudioPreview ? (
                      <div className="w-full px-4 flex items-center gap-3">
                        <button
                          onClick={() => {
                            const audio = document.getElementById('background-audio-preview')
                            if (audio.paused) {
                              audio.play()
                              setIsAudioPlaying(true)
                            } else {
                              audio.pause()
                              setIsAudioPlaying(false)
                            }
                          }}
                          className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
                        >
                          {isAudioPlaying ? (
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                              <rect x="6" y="4" width="4" height="16"></rect>
                              <rect x="14" y="4" width="4" height="16"></rect>
                            </svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                              <polygon points="5 3 19 12 5 21 5 3"></polygon>
                            </svg>
                          )}
                        </button>
                        <audio
                          id="background-audio-preview"
                          src={backgroundAudioPreview}
                          className="hidden"
                          onPlay={() => setIsAudioPlaying(true)}
                          onPause={() => setIsAudioPlaying(false)}
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-1 mb-2">
                            <div className="flex gap-1 items-end h-8 px-2 py-1 bg-black/30 rounded-lg border border-white/10">
                              {[...Array(16)].map((_, i) => (
                                <motion.div
                                  key={i}
                                  animate={isAudioPlaying ? {
                                    height: [4, 24, 8, 20, 4],
                                    scaleY: [1, 1.5, 0.8, 1.3, 1],
                                  } : {
                                    height: 4,
                                    scaleY: 1,
                                  }}
                                  transition={{
                                    duration: 0.8,
                                    repeat: isAudioPlaying ? Infinity : 0,
                                    delay: i * 0.08,
                                    ease: "easeInOut"
                                  }}
                                  className="w-1.5 bg-gradient-to-t from-white/40 to-white/90 rounded-full shadow-lg shadow-white/20"
                                />
                              ))}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-white text-xs font-medium">Audio Preview</span>
                            <div className="flex gap-1">
                              {[...Array(3)].map((_, i) => (
                                <motion.div
                                  key={i}
                                  animate={isAudioPlaying ? {
                                    opacity: [0.4, 1, 0.4],
                                  } : {
                                    opacity: 0.4,
                                  }}
                                  transition={{
                                    duration: 1.5,
                                    repeat: isAudioPlaying ? Infinity : 0,
                                    delay: i * 0.3,
                                  }}
                                  className="w-1 h-1 bg-green-400 rounded-full"
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={handleRemoveBackgroundAudio}
                          className="w-8 h-8 bg-red-500/20 hover:bg-red-500/30 rounded-full flex items-center justify-center transition-colors"
                          title="Remove background audio"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-400">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/30">
                          <path d="M9 18V5l12-2v13"></path>
                          <circle cx="6" cy="18" r="3"></circle>
                          <circle cx="18" cy="16" r="3"></circle>
                        </svg>
                        <span className="text-white/30 text-sm">No audio selected</span>
                      </div>
                    )}
                  </div>
                  
                  <form onSubmit={handleBackgroundAudioUpload} className="space-y-4">
                    <div>
                      <input
                        type="file"
                        accept="audio/mpeg,audio/mp3,audio/wav,audio/ogg"
                        onChange={handleBackgroundAudioChange}
                        className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-white/10 file:text-white hover:file:bg-white/20 transition-all cursor-pointer"
                      />
                      <p className="text-xs text-osint-muted mt-2">
                        Supports MP3, WAV, OGG. Max 50MB.
                      </p>
                    </div>

                    {backgroundAudioError && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm"
                      >
                        {backgroundAudioError}
                      </motion.div>
                    )}

                    {backgroundAudioSuccess && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="p-3 bg-green-500/20 border border-green-500/50 rounded-lg text-green-400 text-sm"
                      >
                        {backgroundAudioSuccess}
                      </motion.div>
                    )}

                    <Button
                      type="submit"
                      disabled={!backgroundAudioFile || uploadingBackgroundAudio}
                      loading={uploadingBackgroundAudio}
                      className="w-full"
                    >
                      {uploadingBackgroundAudio ? 'Uploading...' : 'Upload Background Audio'}
                    </Button>
                  </form>
                </div>
              </div>

              {/* Mute Toggle */}
              <div className="mt-6 pt-6 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-white">Mute Video Audio</h3>
                    <p className="text-sm text-osint-muted">Mute audio from video backgrounds</p>
                  </div>
                  <button
                    onClick={handleMuteToggle}
                    className={`relative w-14 h-8 rounded-full transition-colors ${
                      muteVideoAudio ? 'bg-white' : 'bg-white/20'
                    }`}
                  >
                    <div
                      className={`absolute top-1 w-6 h-6 bg-black rounded-full transition-transform ${
                        muteVideoAudio ? 'translate-x-7' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>

            </div>
          </GlassCard>

          {/* Account Info */}
          <GlassCard className="mb-6 p-6 bg-white/5 backdrop-blur-xl border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              Account Information
            </h2>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-white/10">
                <span className="text-osint-muted">Member Since</span>
                <span className="text-white">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-white/10">
                <span className="text-osint-muted">Balance</span>
                <span className="text-white font-semibold">${user?.balanceUsd || '0.00'}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-white/10">
                <span className="text-osint-muted">Total Searches</span>
                <span className="text-white">{user?.totalSearches || 0}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-white/10">
                <span className="text-osint-muted">Plan</span>
                <span className="text-white capitalize">{user?.plan || 'No Plan'}</span>
              </div>
              {user?.plan && user.planExpiresAt && user.plan !== 'lifetime' && (
                <div className="flex justify-between items-center py-2 border-b border-white/10">
                  <span className="text-osint-muted">Plan Expires</span>
                  <span className="text-white">
                    {new Date(user.planExpiresAt).toLocaleDateString()}
                  </span>
                </div>
              )}
              {user?.dailyCredits !== undefined && (
                <div className="flex justify-between items-center py-2">
                  <span className="text-osint-muted">Daily Credits</span>
                  <span className="text-white">{user.dailyCredits}</span>
                </div>
              )}
            </div>
          </GlassCard>

          {/* Discord Link Section */}
          <GlassCard className="mb-6 p-6 bg-white/5 backdrop-blur-xl border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="text-purple-400">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
              </svg>
              Discord Account
            </h2>
            
            <div className="space-y-4">
              {user?.discordId ? (
                <div className="flex items-center gap-4 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                  <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-white font-medium">Discord Linked</p>
                    <p className="text-osint-muted text-sm">Connected as {user.global_name || user.username}</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-lg">
                  <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                    <svg className="w-6 h-6 text-white/50" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium">Link Discord Account</p>
                    <p className="text-osint-muted text-sm">Connect your Discord to enable profile status</p>
                  </div>
                  <Button
                    onClick={handleLinkDiscord}
                    disabled={linkingDiscord}
                    className="bg-[#5865F2] hover:bg-[#4752C4] text-white"
                  >
                    {linkingDiscord ? 'Linking...' : 'Link Discord'}
                  </Button>
                </div>
              )}
            </div>
          </GlassCard>

          {/* Status Section */}
          <GlassCard className="mb-6 p-6 bg-white/5 backdrop-blur-xl border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-400">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              Profile Status
            </h2>
            
            <form onSubmit={handleStatusUpdate} className="space-y-4">
              <div>
                <textarea
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  placeholder="Set your status message..."
                  className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-lg text-white placeholder-white/20 focus:outline-none focus:border-white/40 focus:bg-black/50 transition-all backdrop-blur-sm resize-none"
                  rows={2}
                  maxLength={100}
                />
                <p className="text-xs text-osint-muted mt-2">
                  {status.length}/100 characters
                </p>
              </div>

              {statusError && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm"
                >
                  {statusError}
                </motion.div>
              )}

              {statusSuccess && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-3 bg-green-500/20 border border-green-500/50 rounded-lg text-green-400 text-sm"
                >
                  {statusSuccess}
                </motion.div>
              )}

              <Button
                type="submit"
                disabled={status === user?.status}
                className="w-full"
              >
                Update Status
              </Button>
            </form>
          </GlassCard>

          {/* Enter Text Section */}
          <GlassCard className="mb-6 p-6 bg-white/5 backdrop-blur-xl border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                <polyline points="13 2 13 9 20 9"></polyline>
              </svg>
              Enter Text
            </h2>
            
            <form onSubmit={handleEnterTextUpdate} className="space-y-4">
              <div>
                <Input
                  type="text"
                  value={enterText}
                  onChange={(e) => setEnterText(e.target.value)}
                  placeholder="ENTER"
                  className="w-full uppercase"
                  maxLength={10}
                />
                <p className="text-xs text-osint-muted mt-2">
                  {enterText.length}/10 characters (shown on profile page)
                </p>
              </div>

              <div>
                <label className="block text-white text-sm font-medium mb-2">Animation Style</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleEnterAnimationUpdate('typing')}
                    className={`p-3 rounded-lg border transition-all ${
                      enterAnimation === 'typing'
                        ? 'bg-white/20 border-white/40 text-white'
                        : 'bg-black/30 border-white/10 text-white/60 hover:bg-white/10'
                    }`}
                  >
                    <div className="text-xs font-medium">Typing</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleEnterAnimationUpdate('flicker')}
                    className={`p-3 rounded-lg border transition-all ${
                      enterAnimation === 'flicker'
                        ? 'bg-white/20 border-white/40 text-white'
                        : 'bg-black/30 border-white/10 text-white/60 hover:bg-white/10'
                    }`}
                  >
                    <div className="text-xs font-medium">Flicker</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleEnterAnimationUpdate('fadeblink')}
                    className={`p-3 rounded-lg border transition-all ${
                      enterAnimation === 'fadeblink'
                        ? 'bg-white/20 border-white/40 text-white'
                        : 'bg-black/30 border-white/10 text-white/60 hover:bg-white/10'
                    }`}
                  >
                    <div className="text-xs font-medium">Fade+Blink</div>
                  </button>
                </div>
              </div>

              {enterTextError && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm"
                >
                  {enterTextError}
                </motion.div>
              )}

              {enterTextSuccess && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-3 bg-green-500/20 border border-green-500/50 rounded-lg text-green-400 text-sm"
                >
                  {enterTextSuccess}
                </motion.div>
              )}

              <Button
                type="submit"
                disabled={enterText === user?.enterText}
                className="w-full"
              >
                Update Enter Text
              </Button>
            </form>
          </GlassCard>

            {/* Accent Color Section */}
          <GlassCard className="mb-6 p-6 bg-white/5 backdrop-blur-xl border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                <circle cx="13.5" cy="6.5" r=".5"></circle>
                <circle cx="17.5" cy="10.5" r=".5"></circle>
                <circle cx="8.5" cy="7.5" r=".5"></circle>
                <circle cx="6" cy="12.5" r=".5"></circle>
                <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"></path>
              </svg>
              Accent Color
            </h2>
            
            <ColorSlider 
              value={accentColor} 
              onChange={handleAccentColorUpdate}
              onSave={handleSaveAccentColor}
              label="Dashboard Accent Color"
            />

            {accentColorSuccess && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`mt-4 p-3 rounded-lg text-sm ${accentColorSuccess.includes('success') ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}
              >
                {accentColorSuccess}
              </motion.div>
            )}

            {/* Reset Button */}
            <Button
              onClick={() => {
                handleAccentColorUpdate('#ffffff')
                handleSaveAccentColor('#ffffff')
              }}
              variant="outline"
              className="w-full mt-4"
            >
              Reset to Default
            </Button>
          </GlassCard>

          {/* Embed Color Section */}
          <GlassCard className="mb-6 p-6 bg-white/5 backdrop-blur-xl border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                <polyline points="13 2 13 9 20 9"></polyline>
              </svg>
              Profile Embed Color
            </h2>
            
            <ColorSlider 
              value={embedColor} 
              onChange={handleEmbedColorUpdate}
              onSave={handleSaveEmbedColor}
              label="Discord Embed Color"
            />

            {embedColorSuccess && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`mt-4 p-3 rounded-lg text-sm ${embedColorSuccess.includes('success') ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}
              >
                {embedColorSuccess}
              </motion.div>
            )}

            <p className="text-xs text-white/50 mt-3">
              This color appears on Discord embeds when your profile is shared
            </p>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  )
}

export default UserSettings
