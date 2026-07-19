import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import GlassCard from '../components/ui/GlassCard'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'

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
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/mov', 'video/webm']
      if (!validTypes.includes(file.type)) {
        setBackgroundError('Please upload a valid image or video file (JPG, PNG, GIF, WebP, MP4, MOV, WebM)')
        return
      }
      
      // Validate file size (max 50MB for videos, 10MB for images)
      const maxSize = file.type.startsWith('video/') ? 50 * 1024 * 1024 : 10 * 1024 * 1024
      if (file.size > maxSize) {
        setBackgroundError(`File size must be less than ${file.type.startsWith('video/') ? '50MB' : '10MB'}`)
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
          const fileType = backgroundFile.type.startsWith('video/') ? 'video' : 'image'
          
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
            setUser({ ...user, background: data.backgroundUrl })
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div>
              <h1 className="text-4xl font-bold text-white">User Settings</h1>
              <p className="text-osint-muted">Customize your profile</p>
            </div>
          </div>

          {/* Profile Picture Section */}
          <GlassCard className="mb-6 p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Profile Picture</h2>
            
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
          <GlassCard className="p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Username</h2>
            
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
          <GlassCard className="mt-6 p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Bio</h2>
            
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
          <GlassCard className="mt-6 p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Profile Background</h2>
            
            <div className="space-y-4">
              <div className="flex items-center gap-6 mb-6">
                <div className="relative w-full h-32 rounded-lg overflow-hidden border-2 border-white/20 bg-black/50 flex items-center justify-center">
                  {backgroundPreview ? (
                    backgroundPreview.startsWith('data:video') ? (
                      <video
                        src={backgroundPreview}
                        className="w-full h-full object-cover"
                        autoPlay
                        loop
                        muted
                        playsInline
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
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,video/mp4,video/mov,video/webm"
                    onChange={handleBackgroundChange}
                    className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-white/10 file:text-white hover:file:bg-white/20 transition-all cursor-pointer"
                  />
                  <p className="text-xs text-osint-muted mt-2">
                    Supports JPG, PNG, GIF, WebP, MP4, MOV, WebM. Max 10MB for images, 50MB for videos.
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
            </div>
          </GlassCard>

          {/* Account Info */}
          <GlassCard className="mt-6 p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Account Information</h2>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-white/10">
                <span className="text-osint-muted">Email</span>
                <span className="text-white">{user?.email || 'Not set'}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-white/10">
                <span className="text-osint-muted">Auth Type</span>
                <span className="text-white capitalize">{user?.authType || 'Unknown'}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-white/10">
                <span className="text-osint-muted">Member Since</span>
                <span className="text-white">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
                </span>
              </div>
            </div>
          </GlassCard>

          {/* Accent Color Section */}
          <GlassCard className="mt-6 p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Accent Color</h2>
            
            <div className="space-y-6">
              {/* Color Preview */}
              <div className="flex items-center gap-4">
                <div 
                  className="w-16 h-16 rounded-xl border-2 border-white/20 shadow-lg"
                  style={{ backgroundColor: accentColor }}
                />
                <div>
                  <p className="text-white font-medium">Current Accent</p>
                  <p className="text-osint-muted text-sm">{accentColor}</p>
                </div>
              </div>

              {/* Preset Colors */}
              <div>
                <label className="block text-sm text-osint-muted mb-3">Preset Colors</label>
                <div className="grid grid-cols-6 gap-3">
                  {presetColors.map((color) => (
                    <motion.button
                      key={color}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleColorChange(color)}
                      className={`w-12 h-12 rounded-lg border-2 transition-all ${
                        accentColor === color 
                          ? 'border-white shadow-lg scale-110' 
                          : 'border-white/20 hover:border-white/50'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              {/* Custom Color Picker */}
              <div>
                <label className="block text-sm text-osint-muted mb-3">Custom Color</label>
                <div className="flex items-center gap-4">
                  <input
                    type="color"
                    value={accentColor}
                    onChange={(e) => handleColorChange(e.target.value)}
                    className="w-16 h-12 rounded-lg cursor-pointer border-2 border-white/20 bg-transparent"
                  />
                  <div className="flex-1">
                    <Input
                      type="text"
                      value={hexInput}
                      onChange={handleHexChange}
                      placeholder="#000000"
                      className="w-full uppercase"
                      maxLength={7}
                    />
                  </div>
                </div>
              </div>

              {/* Reset Button */}
              <Button
                onClick={() => handleColorChange('#6366f1')}
                variant="outline"
                className="w-full"
              >
                Reset to Default
              </Button>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  )
}

export default UserSettings
