import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { parseBlob } from "music-metadata-browser"

const MusicPlayer = ({ autoPlay = false }) => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentSong, setCurrentSong] = useState(null)
  const [progress, setProgress] = useState(0)
  const [volume, setVolume] = useState(0.7)
  const [isExpanded, setIsExpanded] = useState(false)
  const audioRef = useRef(null)
  const [songs, setSongs] = useState([])
  const [albumArt, setAlbumArt] = useState(null)

  useEffect(() => {
    // List of audio files - user will add .mp3 files to public/audios
    const audioFiles = [
      'HELLBLADE, dxnkwer - CUTE JUMPSTYLE - Super Slowed.mp3',
      'chrmbchrmb - matrix (bl studio loop).mp3',
      'juno, blindheart - Solitude.mp3',
      'KREZUS, Surreal_dvd - Skins.mp3'
    ].filter(Boolean) // Filter out any undefined/null values
    
    setSongs(audioFiles)
    
    if (audioFiles.length > 0) {
      setCurrentSong(audioFiles[0])
      extractAlbumArt(audioFiles[0])
    }
  }, [])

  useEffect(() => {
    if (autoPlay && currentSong && audioRef.current) {
      audioRef.current.play()
      setIsPlaying(true)
    }
  }, [autoPlay, currentSong])

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume
    }
  }, [volume])

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleNext = () => {
    if (songs.length === 0) return
    const currentIndex = songs.indexOf(currentSong)
    const nextIndex = (currentIndex + 1) % songs.length
    setCurrentSong(songs[nextIndex])
    setProgress(0)
    setIsPlaying(true)
  }

  const handlePrevious = () => {
    if (songs.length === 0) return
    const currentIndex = songs.indexOf(currentSong)
    const prevIndex = (currentIndex - 1 + songs.length) % songs.length
    setCurrentSong(songs[prevIndex])
    setProgress(0)
    setIsPlaying(true)
  }

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const progress = (audioRef.current.currentTime / audioRef.current.duration) * 100
      setProgress(progress || 0)
    }
  }

  const handleSeek = (e) => {
    if (audioRef.current) {
      const seekTime = (e.target.value / 100) * audioRef.current.duration
      audioRef.current.currentTime = seekTime
      setProgress(e.target.value)
    }
  }

  const handleSongSelect = (song) => {
    setCurrentSong(song)
    setProgress(0)
    setIsPlaying(true)
    extractAlbumArt(song)
  }

  const extractAlbumArt = async (song) => {
    if (!song) return
    
    try {
      const response = await fetch(`/audios/${song}`)
      const blob = await response.blob()
      const metadata = await parseBlob(blob)
      
      const picture = metadata.common.picture?.[0]
      
      if (picture) {
        const pictureBlob = new Blob([picture.data], { type: picture.format })
        const url = URL.createObjectURL(pictureBlob)
        setAlbumArt(url)
      } else {
        setAlbumArt(null)
      }
    } catch (error) {
      console.log('Error extracting album art:', error)
      setAlbumArt(null)
    }
  }

  const getSongName = (filename) => {
    if (!filename) return 'No songs available'
    return filename.replace(/\.[^/.]+$/, "") // Remove file extension
  }

  if (songs.length === 0) {
    return null
  }

  return (
    <>
      <audio
        ref={audioRef}
        src={currentSong ? `/audios/${currentSong}` : ''}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleNext}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />
      
      <motion.div
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className={`fixed bottom-6 right-6 left-6 md:left-auto z-50 ${isExpanded ? 'w-auto' : 'w-auto'}`}
      >
        <motion.div
          className="glass-card rounded-2xl overflow-hidden"
          initial={false}
          animate={{
            height: isExpanded ? 'auto' : 'auto'
          }}
        >
          {/* Collapsed View */}
          {!isExpanded && (
            <div className="p-3 flex items-center space-x-3">
              {albumArt ? (
                <img 
                  src={albumArt} 
                  alt="Album Art" 
                  className="w-8 h-8 md:w-10 md:h-10 rounded-lg object-cover flex-shrink-0"
                />
              ) : (
                <button
                  onClick={handlePlayPause}
                  className="w-8 h-8 md:w-10 md:h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors flex-shrink-0"
                >
                  <i className={`bx ${isPlaying ? 'bx-pause' : 'bx-play'} text-white text-sm md:text-lg`}></i>
                </button>
              )}
              <div className="flex-1 min-w-0 overflow-hidden">
                <p className="text-[10px] md:text-xs text-osint-muted truncate">Now Playing:</p>
                <div className="overflow-hidden">
                  <motion.p 
                    animate={{ x: [0, -50, 0] }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    className="text-xs md:text-sm text-osint-muted font-medium whitespace-nowrap"
                  >
                    {getSongName(currentSong)}
                  </motion.p>
                </div>
              </div>
              <button
                onClick={handlePlayPause}
                className="w-7 h-7 md:w-8 md:h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors flex-shrink-0"
              >
                <i className={`bx ${isPlaying ? 'bx-pause' : 'bx-play'} text-white text-sm md:text-lg`}></i>
              </button>
              <button
                onClick={() => setIsExpanded(true)}
                className="w-7 h-7 md:w-8 md:h-8 hover:bg-white/10 rounded-full flex items-center justify-center transition-colors flex-shrink-0"
              >
                <i className='bx bx-expand-alt text-osint-muted text-sm md:text-base'></i>
              </button>
            </div>
          )}

          {/* Expanded View */}
          {isExpanded && (
            <div className="p-4">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  {albumArt ? (
                    <img 
                      src={albumArt} 
                      alt="Album Art" 
                      className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <i className='bx bxs-file-audio text-black'></i>
                    </div>
                  )}
                  <div className="flex-1 min-w-0 overflow-hidden">
                    <p className="text-xs text-osint-muted">Now Playing</p>
                    <div className="overflow-hidden">
                      <motion.p 
                        animate={{ x: [0, -50, 0] }}
                        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                        className="text-sm text-osint-muted font-medium whitespace-nowrap"
                      >
                        {getSongName(currentSong)}
                      </motion.p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setIsExpanded(false)}
                  className="w-8 h-8 hover:bg-white/10 rounded-full flex items-center justify-center transition-colors flex-shrink-0"
                >
                  <i className='bx bx-collapse text-osint-muted'></i>
                </button>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={progress}
                  onChange={handleSeek}
                  className="w-full h-1 bg-osint-border rounded-lg appearance-none cursor-pointer accent-white"
                  style={{
                    background: `linear-gradient(to right, #ffffff ${progress}%, #1a1a1a ${progress}%)`
                  }}
                />
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center space-x-4 mb-4">
                <button
                  onClick={handlePrevious}
                  className="w-10 h-10 hover:bg-white/10 rounded-full flex items-center justify-center transition-colors"
                >
                  <i className='bx bx-skip-previous text-osint-secondary text-xl'></i>
                </button>
                <button
                  onClick={handlePlayPause}
                  className="w-12 h-12 bg-white hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors shadow-lg shadow-white/30"
                >
                  <i className={`bx ${isPlaying ? 'bx-pause' : 'bx-play'} text-black text-2xl`}></i>
                </button>
                <button
                  onClick={handleNext}
                  className="w-10 h-10 hover:bg-white/10 rounded-full flex items-center justify-center transition-colors"
                >
                  <i className='bx bx-skip-next text-osint-secondary text-xl'></i>
                </button>
              </div>

              {/* Volume */}
              <div className="flex items-center space-x-2 mb-4">
                <i className='bx bx-volume-low text-osint-muted'></i>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="flex-1 h-1 bg-osint-border rounded-lg appearance-none cursor-pointer accent-white"
                  style={{
                    background: `linear-gradient(to right, #ffffff ${volume * 100}%, #1a1a1a ${volume * 100}%)`
                  }}
                />
                <i className='bx bx-volume-full text-osint-muted'></i>
              </div>

              {/* Playlist */}
              <div className="border-t border-osint-border pt-3">
                <p className="text-xs text-osint-muted mb-2">Playlist</p>
                <div className="space-y-1 max-h-32 overflow-y-auto custom-scrollbar">
                  {songs.map((song, index) => (
                    <button
                      key={index}
                      onClick={() => handleSongSelect(song)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                        currentSong === song
                          ? 'bg-white/20 text-white'
                          : 'hover:bg-white/10 text-gray-500 hover:text-white'
                      }`}
                    >
                      <p className="text-sm truncate">{getSongName(song)}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </>
  )
}

export default MusicPlayer
