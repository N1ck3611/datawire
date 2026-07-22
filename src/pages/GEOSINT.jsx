import React, { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Upload, MapPin, AlertCircle, Loader2, Globe, Navigation, Eye, Brain, CheckCircle, XCircle, ExternalLink, Download } from 'lucide-react'
import GlassCard from '../components/ui/GlassCard'
import Button from '../components/ui/Button'

const GEOSINT = () => {
  const [image, setImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [results, setResults] = useState(null)
  const [error, setError] = useState('')
  const [geosintId, setGeosintId] = useState(null)
  const [progress, setProgress] = useState(0)
  const [stage, setStage] = useState('')
  const [activityLog, setActivityLog] = useState([])
  const fileInputRef = useRef(null)
  const progressIntervalRef = useRef(null)

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
    console.log('[GEOSINT] Starting analysis')
    if (!image) {
      console.log('[GEOSINT] No image, returning')
      return
    }

    setAnalyzing(true)
    setError('')
    setResults(null)
    setProgress(0)
    setStage('')
    setActivityLog([])

    try {
      console.log('[GEOSINT] Converting image to base64')
      // Convert image to base64
      const base64Image = await new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => {
          console.log('[GEOSINT] FileReader loaded')
          resolve(reader.result)
        }
        reader.onerror = (error) => {
          console.error('[GEOSINT] FileReader error:', error)
          reject(error)
        }
        reader.readAsDataURL(image)
      })

      console.log('[GEOSINT] Base64 conversion complete, length:', base64Image.length)

      const token = localStorage.getItem('auth_token')
      console.log('[GEOSINT] Token present:', !!token)
      if (!token) {
        throw new Error('Please login to use GEOSINT')
      }

      const API_BASE = 'https://datawirecc-api.mynameisntnick0.workers.dev'
      console.log('[GEOSINT] Sending fetch request to:', `${API_BASE}/api/geosint/analyze`)

      const response = await fetch(`${API_BASE}/api/geosint/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ imageData: base64Image })
      })

      console.log('[GEOSINT] Response received, status:', response.status)

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`)
      }

      const data = await response.json()
      console.log('[GEOSINT] Response data:', data)

      if (data.success && data.geosintId) {
        setGeosintId(data.geosintId)
        // Start polling for progress
        startProgressPolling(data.geosintId, token, API_BASE)
      } else if (data.success && data.results) {
        setResults(data.results)
      } else {
        throw new Error(data.error || 'Failed to analyze image')
      }

    } catch (err) {
      console.error('[GEOSINT] Analysis error:', err)
      setError(err.message || 'Failed to analyze image')
      setAnalyzing(false)
    }
  }

  const startProgressPolling = (id, token, apiBase) => {
    const pollProgress = async () => {
      try {
        const response = await fetch(`${apiBase}/api/geosint-progress?id=${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (response.ok) {
          const data = await response.json()
          if (data.success) {
            setProgress(data.progress)
            setStage(data.stage)
            setActivityLog(data.activityLog || [])

            if (data.completed && data.results) {
              setResults(data.results)
              setAnalyzing(false)
              clearInterval(progressIntervalRef.current)
            } else if (data.stage === 'error') {
              setError('Analysis failed during processing')
              setAnalyzing(false)
              clearInterval(progressIntervalRef.current)
            }
          }
        }
      } catch (err) {
        console.error('[GEOSINT] Progress polling error:', err)
      }
    }

    // Initial poll
    pollProgress()

    // Poll every 2 seconds
    progressIntervalRef.current = setInterval(pollProgress, 2000)
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
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">GeoINT Analysis Report</h2>
              {results && (
                <button
                  onClick={() => {
                    const separator = '═'.repeat(100);
                    let content = '██████╗  █████╗ ████████╗ █████╗ ██╗    ██╗██╗██████╗ ███████╗    ██████╗ ██████╗\n';
                    content += '██╔══██╗██╔══██╗╚══██╔══╝██╔══██╗██║    ██║██║██╔══██╗██╔════╝   ██╔════╝██╔════╝\n';
                    content += '██║  ██║███████║   ██║   ███████║██║ █╗ ██║██║██████╔╝█████╗     ██║     ██║     \n';
                    content += '██║  ██║██╔══██║   ██║   ██╔══██║██║███╗██║██║██╔══██╗██╔══╝     ██║     ██║     \n';
                    content += '██████╔╝██║  ██║   ██║   ██║  ██║╚███╔███╔╝██║██║  ██║███████╗   ╚██████╗╚██████╗\n';
                    content += '╚═════╝ ╚═╝  ╚═╝   ╚═╝   ╚═╝  ╚═╝ ╚══╝╚══╝ ╚═╝╚═╝  ╚═╝╚══════╝    ╚═════╝ ╚═════╝\n\n';
                    content += separator + '\n';
                    content += 'GEOSPATIAL INTELLIGENCE ANALYSIS REPORT\n';
                    content += separator + '\n\n';
                    
                    if (results.classification) {
                      content += 'ANALYSIS MODE\n';
                      content += separator + '\n';
                      content += results.classification + '\n\n';
                    }
                    
                    if (results.country || results.region || results.city || results.area || results.estimated_address) {
                      content += 'ESTIMATED LOCATION\n';
                      content += separator + '\n';
                      if (results.country) content += `Country: ${results.country}\n`;
                      if (results.region) content += `Region: ${results.region}\n`;
                      if (results.city) content += `City: ${results.city}\n`;
                      if (results.area) content += `Area: ${results.area}\n`;
                      if (results.estimated_address) content += `Address: ${results.estimated_address}\n`;
                      content += '\n';
                    }
                    
                    if (results.latitude && results.longitude) {
                      content += 'COORDINATES\n';
                      content += separator + '\n';
                      content += 'Latitude: ' + results.latitude + '\n';
                      content += 'Longitude: ' + results.longitude + '\n';
                      content += 'Google Maps: https://www.google.com/maps?q=' + results.latitude + ',' + results.longitude + '\n';
                      content += 'Street View: https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=' + results.latitude + ',' + results.longitude + '\n';
                      content += 'OpenStreetMap: https://www.openstreetmap.org/?mlat=' + results.latitude + '&mlon=' + results.longitude + '\n';
                      content += '\n';
                    }
                    
                    if (results.confidence) {
                      content += 'CONFIDENCE ASSESSMENT\n';
                      content += separator + '\n';
                      content += `Confidence Score: ${results.confidence}%\n`;
                      if (results.original_confidence && results.original_confidence !== results.confidence) {
                        content += `Original Confidence: ${results.original_confidence}%\n`;
                      }
                      content += '\n';
                    }
                    
                    if (results.analysis_summary) {
                      content += 'AI REASONING\n';
                      content += separator + '\n';
                      content += results.analysis_summary + '\n\n';
                    }
                    
                    if (results.visual_evidence && results.visual_evidence.length > 0) {
                      content += 'EVIDENCE FOUND\n';
                      content += separator + '\n';
                      results.visual_evidence.forEach((evidence, idx) => {
                        content += `${idx + 1}. ${evidence}\n`;
                      });
                      content += '\n';
                    }
                    
                    if (results.alternative_locations && results.alternative_locations.length > 0) {
                      content += 'ALTERNATIVE LOCATIONS\n';
                      content += separator + '\n';
                      results.alternative_locations.forEach((alt, idx) => {
                        content += `${idx + 1}. ${alt.location} (Confidence: ${alt.confidence}%)\n`;
                      });
                      content += '\n';
                    }
                    
                    if (results.reviewer_analysis) {
                      content += 'INDEPENDENT VERIFICATION\n';
                      content += separator + '\n';
                      if (results.reviewer_analysis.review_summary) {
                        content += `Review Summary: ${results.reviewer_analysis.review_summary}\n\n`;
                      }
                      if (results.reviewer_analysis.weaknesses && results.reviewer_analysis.weaknesses.length > 0) {
                        content += 'Identified Weaknesses:\n';
                        results.reviewer_analysis.weaknesses.forEach((weakness, idx) => {
                          content += `  ${idx + 1}. ${weakness}\n`;
                        });
                        content += '\n';
                      }
                      if (results.reviewer_analysis.missing_evidence && results.reviewer_analysis.missing_evidence.length > 0) {
                        content += 'Missing Evidence:\n';
                        results.reviewer_analysis.missing_evidence.forEach((evidence, idx) => {
                          content += `  ${idx + 1}. ${evidence}\n`;
                        });
                        content += '\n';
                      }
                      if (results.reviewer_analysis.reproducibility) {
                        content += `Reproducibility: ${results.reviewer_analysis.reproducibility}\n`;
                      }
                      content += '\n';
                    }
                    
                    content += separator + '\n';
                    content += 'Generated by Datawire.cc GEOSINT Analysis\n';
                    content += 'Date: ' + new Date().toLocaleString() + '\n';
                    content += 'Powered by https://datawire.cc\n';
                    content += 'Analysis made by https://datawire.cc';
                    
                    const blob = new Blob([content], { type: 'text/plain' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `datawire-geosint-${Date.now()}.txt`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    setTimeout(() => URL.revokeObjectURL(url), 100);
                  }}
                  className="px-4 py-2 bg-white text-black font-semibold hover:bg-gray-200 transition-colors flex items-center gap-2 text-sm"
                >
                  <Download className="w-4 h-4" />
                  Download Report
                </button>
              )}
            </div>
            
            {analyzing ? (
              <div className="flex flex-col items-center justify-center h-64 space-y-4">
                <Loader2 className="w-12 h-12 text-white/40 animate-spin" />
                <p className="text-white/60">Analyzing image with AI...</p>
                <p className="text-white/40 text-sm">Running 4-phase GeoINT workflow</p>
              </div>
            ) : results ? (
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                {/* Classification Badge */}
                {results.classification && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 p-3 bg-blue-500/20 border border-blue-500/30 rounded-lg"
                  >
                    <Brain className="w-5 h-5 text-blue-400" />
                    <div>
                      <p className="text-blue-400 text-sm font-medium">Analysis Mode</p>
                      <p className="text-white">{results.classification}</p>
                    </div>
                  </motion.div>
                )}

                {/* Primary Location */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-white/5 rounded-lg border border-white/10"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <MapPin className="w-5 h-5 text-green-400" />
                    <h3 className="text-white font-semibold">📍 Estimated Location</h3>
                  </div>
                  <div className="space-y-2 text-sm">
                    {(results.country || results.region || results.city) && (
                      <div className="grid grid-cols-2 gap-2">
                        {results.country && (
                          <div>
                            <p className="text-white/40">Country</p>
                            <p className="text-white font-medium">{results.country}</p>
                          </div>
                        )}
                        {results.region && (
                          <div>
                            <p className="text-white/40">Region</p>
                            <p className="text-white font-medium">{results.region}</p>
                          </div>
                        )}
                        {results.city && (
                          <div>
                            <p className="text-white/40">City</p>
                            <p className="text-white font-medium">{results.city}</p>
                          </div>
                        )}
                        {results.area && (
                          <div>
                            <p className="text-white/40">Area</p>
                            <p className="text-white font-medium">{results.area}</p>
                          </div>
                        )}
                      </div>
                    )}
                    {results.estimated_address && (
                      <div>
                        <p className="text-white/40">Estimated Address</p>
                        <p className="text-white font-medium">{results.estimated_address}</p>
                      </div>
                    )}
                  </div>
                </motion.div>

                {/* Coordinates */}
                {results.latitude && results.longitude && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="p-4 bg-white/5 rounded-lg border border-white/10"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <Navigation className="w-5 h-5 text-purple-400" />
                      <h3 className="text-white font-semibold">🌐 Coordinates</h3>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <p className="text-white/40">Latitude</p>
                          <p className="text-white font-mono">{results.latitude}</p>
                        </div>
                        <div>
                          <p className="text-white/40">Longitude</p>
                          <p className="text-white font-mono">{results.longitude}</p>
                        </div>
                      </div>
                      {/* Map Links */}
                      <div className="flex flex-wrap gap-2 mt-3">
                        <a
                          href={`https://www.google.com/maps?q=${results.latitude},${results.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 px-3 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg text-blue-400 text-xs transition-colors"
                        >
                          <Globe className="w-3 h-3" />
                          Google Maps
                          <ExternalLink className="w-3 h-3" />
                        </a>
                        <a
                          href={`https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${results.latitude},${results.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 px-3 py-1.5 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-lg text-green-400 text-xs transition-colors"
                        >
                          <Eye className="w-3 h-3" />
                          Street View
                          <ExternalLink className="w-3 h-3" />
                        </a>
                        <a
                          href={`https://www.openstreetmap.org/?mlat=${results.latitude}&mlon=${results.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 px-3 py-1.5 bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/30 rounded-lg text-orange-400 text-xs transition-colors"
                        >
                          <Globe className="w-3 h-3" />
                          OpenStreetMap
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Confidence Score */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="p-4 bg-white/5 rounded-lg border border-white/10"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <AlertCircle className="w-5 h-5 text-yellow-400" />
                    <h3 className="text-white font-semibold">⚠️ Confidence Assessment</h3>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-white/60 text-sm">Confidence Score</span>
                      <span className="text-white font-bold text-lg">
                        {results.confidence}%
                        {results.original_confidence && results.original_confidence !== results.confidence && (
                          <span className="text-white/40 text-sm ml-2">
                            (was {results.original_confidence}%)
                          </span>
                        )}
                      </span>
                    </div>
                    <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${results.confidence}%` }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        className={`h-full ${
                          parseInt(results.confidence) >= 70
                            ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                            : parseInt(results.confidence) >= 40
                            ? 'bg-gradient-to-r from-yellow-500 to-orange-500'
                            : 'bg-gradient-to-r from-red-500 to-pink-500'
                        }`}
                      />
                    </div>
                  </div>
                </motion.div>

                {/* Analysis Summary */}
                {results.analysis_summary && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="p-4 bg-white/5 rounded-lg border border-white/10"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <Brain className="w-5 h-5 text-cyan-400" />
                      <h3 className="text-white font-semibold">🧠 AI Reasoning</h3>
                    </div>
                    <p className="text-white/80 text-sm leading-relaxed">{results.analysis_summary}</p>
                  </motion.div>
                )}

                {/* Visual Evidence */}
                {results.visual_evidence && results.visual_evidence.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="p-4 bg-white/5 rounded-lg border border-white/10"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <Eye className="w-5 h-5 text-pink-400" />
                      <h3 className="text-white font-semibold">🔍 Evidence Found</h3>
                    </div>
                    <ul className="space-y-1.5">
                      {results.visual_evidence.map((evidence, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                          <span className="text-white/80">{evidence}</span>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                )}

                {/* Alternative Locations */}
                {results.alternative_locations && results.alternative_locations.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="p-4 bg-white/5 rounded-lg border border-white/10"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <MapPin className="w-5 h-5 text-white/60" />
                      <h3 className="text-white font-semibold">📌 Alternative Locations</h3>
                    </div>
                    <div className="space-y-2">
                      {results.alternative_locations.map((alt, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                          <span className="text-white/80 text-sm">{alt.location}</span>
                          <span className="text-white/60 text-xs">{alt.confidence}%</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Reviewer Analysis */}
                {results.reviewer_analysis && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="p-4 bg-purple-500/10 rounded-lg border border-purple-500/20"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <Brain className="w-5 h-5 text-purple-400" />
                      <h3 className="text-white font-semibold">🧪 Independent Verification</h3>
                    </div>
                    <div className="space-y-3 text-sm">
                      {results.reviewer_analysis.review_summary && (
                        <div>
                          <p className="text-purple-400/80 font-medium mb-1">Review Summary</p>
                          <p className="text-white/80">{results.reviewer_analysis.review_summary}</p>
                        </div>
                      )}
                      {results.reviewer_analysis.weaknesses && results.reviewer_analysis.weaknesses.length > 0 && (
                        <div>
                          <p className="text-red-400/80 font-medium mb-1">Identified Weaknesses</p>
                          <ul className="space-y-1">
                            {results.reviewer_analysis.weaknesses.map((weakness, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-white/80">
                                <XCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                                <span>{weakness}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {results.reviewer_analysis.missing_evidence && results.reviewer_analysis.missing_evidence.length > 0 && (
                        <div>
                          <p className="text-yellow-400/80 font-medium mb-1">Missing Evidence</p>
                          <ul className="space-y-1">
                            {results.reviewer_analysis.missing_evidence.map((evidence, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-white/80">
                                <AlertCircle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                                <span>{evidence}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {results.reviewer_analysis.reproducibility && (
                        <div className="flex items-center gap-2 p-2 bg-white/5 rounded-lg">
                          <CheckCircle className={`w-4 h-4 ${
                            results.reviewer_analysis.reproducibility === 'yes' ? 'text-green-400' :
                            results.reviewer_analysis.reproducibility === 'partially' ? 'text-yellow-400' :
                            'text-red-400'
                          }`} />
                          <span className="text-white/80">
                            Reproducibility: <span className="font-medium">{results.reviewer_analysis.reproducibility}</span>
                          </span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 space-y-4">
                <MapPin className="w-12 h-12 text-white/20" />
                <p className="text-white/40">Upload an image to see analysis results</p>
              </div>
            )}
          </GlassCard>
        </div>

        {/* Progress Bar Section */}
        {analyzing && (
          <GlassCard className="mt-6 p-6 bg-white/5 backdrop-blur-xl border border-white/10">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Analysis Progress</h3>
                <span className="text-white font-bold text-xl">{progress}%</span>
              </div>

              {/* Progress Bar */}
              <div className="h-4 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5 }}
                  className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
                />
              </div>

              {/* Current Stage */}
              {stage && (
                <div className="flex items-center gap-2 text-white/80">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="font-medium">{stage.replace(/_/g, ' ').toUpperCase()}</span>
                </div>
              )}

              {/* Activity Log */}
              {activityLog.length > 0 && (
                <div className="space-y-2">
                  <p className="text-white/60 text-sm font-medium">Activity Log:</p>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {activityLog.map((activity, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="flex items-center gap-2 text-sm"
                      >
                        <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                        <span className="text-white/80">{activity}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </GlassCard>
        )}

        {/* Info Section */}
        <GlassCard className="mt-6 p-6 bg-white/5 backdrop-blur-xl border border-white/10">
          <h3 className="text-lg font-semibold text-white mb-3">Professional GeoINT Analysis Pipeline</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-white/60 text-sm">
            <div>
              <p className="font-medium text-white mb-1">🔍 Phase 1: Visual Collection</p>
              <p>Extracts all geographic indicators: text, signs, architecture, terrain, vegetation, and cultural markers</p>
            </div>
            <div>
              <p className="font-medium text-white mb-1">🧠 Phase 2: Geographic Reasoning</p>
              <p>Generates multiple candidate locations, compares evidence, and identifies strongest matches</p>
            </div>
            <div>
              <p className="font-medium text-white mb-1">📊 Phase 3: Intelligence Report</p>
              <p>Returns structured JSON with coordinates, confidence, evidence, and alternative locations</p>
            </div>
            <div>
              <p className="font-medium text-white mb-1">🧪 Phase 4: Independent Verification</p>
              <p>Senior analyst reviewer validates findings, adjusts confidence, and assesses reproducibility</p>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  )
}

export default GEOSINT
