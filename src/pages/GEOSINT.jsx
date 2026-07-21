import React, { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Upload, MapPin, AlertCircle, Loader2 } from 'lucide-react'
import GlassCard from '../components/ui/GlassCard'
import Button from '../components/ui/Button'

const GEOSINT = () => {
  const [image, setImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [results, setResults] = useState(null)
  const [error, setError] = useState('')
  const fileInputRef = useRef(null)

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError('Image size must be less than 10MB')
        return
      }
      
      setImage(file)
      setResults(null)
      setError('')
      
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const analyzeImage = async () => {
    if (!image) return

    setAnalyzing(true)
    setError('')
    setResults(null)

    try {
      // Convert image to base64
      const base64Image = await new Promise((resolve) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result)
        reader.readAsDataURL(image)
      })

      const API_BASE = 'https://datawirecc-api.mynameisntnick0.workers.dev'

      const response = await fetch(`${API_BASE}/api/geosint/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ imageData: base64Image })
      })

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.success && data.results) {
        setResults(data.results)
      } else {
        throw new Error(data.error || 'Failed to analyze image')
      }

    } catch (err) {
      console.error('GEOSINT analysis error:', err)
      setError(err.message || 'Failed to analyze image')
    } finally {
      setAnalyzing(false)
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) {
      const event = { target: { files: [file] } }
      handleImageUpload(event)
    }
  }

  return (
    <div className="min-h-screen py-12 px-4 bg-black">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2">GEOSINT</h1>
          <p className="text-white/60">AI-powered geolocation analysis using computer vision</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upload Section */}
          <GlassCard className="p-6 bg-white/5 backdrop-blur-xl border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-4">Upload Image</h2>
            
            <div
              className="relative border-2 border-dashed border-white/20 rounded-xl p-8 text-center hover:border-white/40 transition-colors cursor-pointer"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              
              {imagePreview ? (
                <div className="space-y-4">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="max-h-64 mx-auto rounded-lg"
                  />
                  <p className="text-white/60 text-sm">Click to change image</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <Upload className="w-16 h-16 mx-auto text-white/40" />
                  <div>
                    <p className="text-white font-medium">Drop image here or click to upload</p>
                    <p className="text-white/40 text-sm mt-1">Supports JPG, PNG, WebP (max 10MB)</p>
                  </div>
                </div>
              )}
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg flex items-center gap-2 text-red-400"
              >
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">{error}</span>
              </motion.div>
            )}

            <Button
              onClick={analyzeImage}
              disabled={!image || analyzing}
              className="w-full mt-4"
            >
              {analyzing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                'Analyze Location'
              )}
            </Button>
          </GlassCard>

          {/* Results Section */}
          <GlassCard className="p-6 bg-white/5 backdrop-blur-xl border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-4">Analysis Results</h2>
            
            {analyzing ? (
              <div className="flex flex-col items-center justify-center h-64 space-y-4">
                <Loader2 className="w-12 h-12 text-white/40 animate-spin" />
                <p className="text-white/60">Analyzing image with AI...</p>
                <p className="text-white/40 text-sm">This may take a few moments</p>
              </div>
            ) : results ? (
              <div className="space-y-3">
                {results.map((result, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-4 p-4 bg-white/5 rounded-lg border border-white/10"
                  >
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/10 text-white font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-white/60" />
                        <p className="text-white font-medium">{result.location}</p>
                      </div>
                      <div className="mt-2 h-2 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${result.confidence}%` }}
                          transition={{ duration: 0.5, delay: index * 0.1 + 0.2 }}
                          className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                        />
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-bold">{result.confidence}%</p>
                      <p className="text-white/40 text-xs">confidence</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 space-y-4">
                <MapPin className="w-12 h-12 text-white/20" />
                <p className="text-white/40">Upload an image to see analysis results</p>
              </div>
            )}
          </GlassCard>
        </div>

        {/* Info Section */}
        <GlassCard className="mt-6 p-6 bg-white/5 backdrop-blur-xl border border-white/10">
          <h3 className="text-lg font-semibold text-white mb-3">How GEOSINT Works</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-white/60 text-sm">
            <div>
              <p className="font-medium text-white mb-1">🔍 Visual Analysis</p>
              <p>AI analyzes landmarks, architecture, vegetation, and terrain features</p>
            </div>
            <div>
              <p className="font-medium text-white mb-1">🌍 Geographic Matching</p>
              <p>Compares visual patterns against global geographic databases</p>
            </div>
            <div>
              <p className="font-medium text-white mb-1">📊 Confidence Scoring</p>
              <p>Provides probability-based location predictions with confidence levels</p>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  )
}

export default GEOSINT
