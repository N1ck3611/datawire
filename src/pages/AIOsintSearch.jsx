import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const AIOsintSearch = () => {
  const [identifiers, setIdentifiers] = useState({
    emails: [''],
    usernames: [''],
    fullNames: [''],
    phoneNumbers: [''],
    discordIds: [''],
    ipAddresses: [''],
    domains: [''],
    urls: [''],
    socialProfiles: [''],
    hashes: [''],
    cryptoWallets: ['']
  })

  const [isSearching, setIsSearching] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentStage, setCurrentStage] = useState('')
  const [activityLog, setActivityLog] = useState([])
  const [completedTasks, setCompletedTasks] = useState(0)
  const [totalTasks, setTotalTasks] = useState(0)
  const [investigationId, setInvestigationId] = useState(null)
  const [report, setReport] = useState(null)
  const pollIntervalRef = useRef(null)

  // Cleanup polling interval on unmount
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current)
      }
    }
  }, [])

  const stages = [
    'Initializing Investigation',
    'Planning Search Strategy',
    'Selecting Investigation Tools',
    'Running API Queries',
    'Performing Open-Source Web Research',
    'Analyzing Results',
    'Correlating Entities',
    'Building Intelligence Report',
    'Finalizing Investigation'
  ]

  const addIdentifierField = (type) => {
    setIdentifiers(prev => ({
      ...prev,
      [type]: [...prev[type], '']
    }))
  }

  const removeIdentifierField = (type, index) => {
    if (identifiers[type].length > 1) {
      setIdentifiers(prev => ({
        ...prev,
        [type]: prev[type].filter((_, i) => i !== index)
      }))
    }
  }

  const updateIdentifier = (type, index, value) => {
    setIdentifiers(prev => ({
      ...prev,
      [type]: prev[type].map((val, i) => i === index ? value : val)
    }))
  }

  const handleSearch = async () => {
    // Clear any existing polling interval
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current)
    }

    setIsSearching(true)
    setProgress(0)
    setActivityLog([])
    setCompletedTasks(0)
    setReport(null)

    // Collect all non-empty identifiers
    const searchIdentifiers = {}
    Object.entries(identifiers).forEach(([type, values]) => {
      const nonEmpty = values.filter(v => v.trim())
      if (nonEmpty.length > 0) {
        searchIdentifiers[type] = nonEmpty
      }
    })

    try {
      const token = localStorage.getItem('auth_token')
      const response = await fetch('https://datawirecc-api.mynameisntnick0.workers.dev/api/ai-osint-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ identifiers: searchIdentifiers })
      })

      if (!response.ok) {
        throw new Error('Search failed')
      }

      const data = await response.json()
      setInvestigationId(data.investigationId)

      // Start polling for progress
      pollIntervalRef.current = setInterval(async () => {
        try {
          const progressResponse = await fetch(`https://datawirecc-api.mynameisntnick0.workers.dev/api/ai-osint-progress?id=${data.investigationId}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })
          const progressData = await progressResponse.json()

          if (progressData.success) {
            setProgress(progressData.progress)
            setCurrentStage(progressData.stage)
            setActivityLog(progressData.activityLog || [])
            setCompletedTasks(progressData.completedTasks)
            setTotalTasks(progressData.totalTasks)

            if (progressData.completed) {
              clearInterval(pollIntervalRef.current)
              setIsSearching(false)
              
              // Fetch final report
              const reportResponse = await fetch(`https://datawirecc-api.mynameisntnick0.workers.dev/api/ai-osint-report?id=${data.investigationId}`, {
                headers: {
                  'Authorization': `Bearer ${token}`
                }
              })
              const reportData = await reportResponse.json()
              
              if (reportData.success) {
                setReport(reportData.report)
              }
            }
          }
        } catch (error) {
          console.error('Progress polling error:', error)
        }
      }, 1000)

    } catch (error) {
      console.error('Search error:', error)
      setIsSearching(false)
    }
  }

  const identifierConfig = {
    emails: { label: 'Email Address', placeholder: 'user@example.com', icon: 'bx-envelope' },
    usernames: { label: 'Username/Alias', placeholder: 'username123', icon: 'bx-user' },
    fullNames: { label: 'Full Name', placeholder: 'John Doe', icon: 'bx-user-circle' },
    phoneNumbers: { label: 'Phone Number', placeholder: '+1 234 567 8900', icon: 'bx-phone' },
    discordIds: { label: 'Discord User ID', placeholder: '123456789012345678', icon: 'bxl-discord' },
    ipAddresses: { label: 'IP Address', placeholder: '192.168.1.1', icon: 'bx-globe' },
    domains: { label: 'Domain', placeholder: 'example.com', icon: 'bx-world' },
    urls: { label: 'URL', placeholder: 'https://example.com/page', icon: 'bx-link' },
    socialProfiles: { label: 'Social Media Profile URL', placeholder: 'https://twitter.com/username', icon: 'bx-share-alt' },
    hashes: { label: 'Hash (MD5, SHA1, SHA256)', placeholder: '5d41402abc4b2a76b9719d911017c592', icon: 'bx-hash' },
    cryptoWallets: { label: 'Cryptocurrency Wallet Address', placeholder: '0x1234...abcd', icon: 'bx-bitcoin' }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-1 h-8 bg-white animate-pulse-glow"></div>
          <h2 className="text-2xl font-bold text-white">Live Intel</h2>
        </div>
        <p className="text-osint-muted text-sm">
          Intelligent OSINT investigation powered by AI. Enter identifiers below and let our AI orchestrator analyze across multiple sources.
        </p>
      </div>

      {/* Search Form */}
      {!isSearching && !report && (
        <div className="glass-card p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(identifiers).map(([type, values]) => {
              const config = identifierConfig[type]
              return (
                <div key={type} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-osint-secondary flex items-center gap-2">
                      <i className={`bx ${config.icon}`}></i>
                      {config.label}
                    </label>
                    <button
                      onClick={() => addIdentifierField(type)}
                      className="text-xs text-white bg-white/10 hover:bg-white/20 px-2 py-1 rounded transition-colors"
                    >
                      + Add
                    </button>
                  </div>
                  {values.map((value, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={value}
                        onChange={(e) => updateIdentifier(type, index, e.target.value)}
                        placeholder={config.placeholder}
                        className="flex-1 px-4 py-2.5 bg-black/60 backdrop-blur-xl border border-white/20 text-white placeholder:text-white/40 focus:border-white/40 focus:outline-none transition-all text-sm"
                      />
                      {values.length > 1 && (
                        <button
                          onClick={() => removeIdentifierField(type, index)}
                          className="px-2 py-2 text-red-400 hover:text-red-300 transition-colors"
                        >
                          <i className='bx bx-x'></i>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )
            })}
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={handleSearch}
              className="px-8 py-3 bg-white text-black font-semibold hover:bg-gray-200 transition-all flex items-center gap-2 shadow-lg shadow-white/20 hover:shadow-white/30"
            >
              <i className='bx bx-search'></i>
              Start Investigation
            </button>
          </div>
        </div>
      )}

      {/* Progress Panel */}
      {isSearching && (
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-8 bg-white animate-pulse-glow"></div>
            <h3 className="text-lg font-semibold text-white">AI OSINT Progress</h3>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-osint-muted">{currentStage}</span>
              <span className="text-white font-mono">{Math.round(progress)}%</span>
            </div>
            <div className="w-full h-2 bg-osint-bg/50 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-white"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <div className="flex justify-between text-xs text-osint-muted mt-1">
              <span>Tasks: {completedTasks}/{totalTasks}</span>
            </div>
          </div>

          {/* Activity Log */}
          <div className="bg-osint-bg/30 rounded-lg p-4 border border-osint-border/50 max-h-96 overflow-y-auto">
            <h4 className="text-sm font-semibold text-white mb-3">Activity Log</h4>
            <div className="space-y-2">
              <AnimatePresence>
                {activityLog.map((log, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="flex items-start gap-3 text-xs p-2 rounded bg-osint-bg/50"
                  >
                    <span className={`w-2 h-2 rounded-full mt-1.5 ${
                      log.status === 'Running' ? 'bg-yellow-400 animate-pulse' :
                      log.status === 'Completed' ? 'bg-green-400' :
                      log.status === 'Failed' ? 'bg-red-400' :
                      'bg-blue-400'
                    }`}></span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-white font-medium">{log.tool}</span>
                        <span className="text-osint-muted">•</span>
                        <span className="text-osint-muted">{log.identifier}</span>
                      </div>
                      <div className="text-osint-muted mt-1">{log.action}</div>
                      <div className={`text-xs mt-1 ${
                        log.status === 'Running' ? 'text-yellow-400' :
                        log.status === 'Completed' ? 'text-green-400' :
                        log.status === 'Failed' ? 'text-red-400' :
                        'text-blue-400'
                      }`}>
                        {log.status}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>
      )}

      {/* Report Display */}
      {report && (
        <div className="glass-card p-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-1 h-8 bg-white animate-pulse-glow"></div>
              <h3 className="text-lg font-semibold text-white">Investigation Report</h3>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  console.log('Download button clicked, report:', report);
                  if (!report) {
                    console.error('No report available to download');
                    return;
                  }
                  
                  const separator = '═'.repeat(100);
                  let content = '██████╗  █████╗ ████████╗ █████╗ ██╗    ██╗██╗██████╗ ███████╗    ██████╗ ██████╗\n';
                  content += '██╔══██╗██╔══██╗╚══██╔══╝██╔══██╗██║    ██║██║██╔══██╗██╔════╝   ██╔════╝██╔════╝\n';
                  content += '██║  ██║███████║   ██║   ███████║██║ █╗ ██║██║██████╔╝█████╗     ██║     ██║     \n';
                  content += '██║  ██║██╔══██║   ██║   ██╔══██║██║███╗██║██║██╔══██╗██╔══╝     ██║     ██║     \n';
                  content += '██████╔╝██║  ██║   ██║   ██║  ██║╚███╔███╔╝██║██║  ██║███████╗   ╚██████╗╚██████╗\n';
                  content += '╚═════╝ ╚═╝  ╚═╝   ╚═╝   ╚═╝  ╚═╝ ╚══╝╚══╝ ╚═╝╚═╝  ╚═╝╚══════╝    ╚═════╝ ╚═════╝\n\n';
                  content += separator + '\n';
                  content += 'EXECUTIVE SUMMARY\n';
                  content += separator + '\n';
                  content += (report.executiveSummary || 'No executive summary available.') + '\n\n';
                  content += separator + '\n';
                  content += 'INVESTIGATION OVERVIEW\n';
                  content += separator + '\n';
                  content += (report.investigationOverview || 'No investigation overview available.') + '\n\n';
                  content += separator + '\n';
                  content += 'DISCOVERED IDENTIFIERS\n';
                  content += separator + '\n';
                  if (report.discoveredIdentifiers && report.discoveredIdentifiers.length > 0) {
                    content += report.discoveredIdentifiers.map(i => `${i.type}: ${i.value} (${i.source})`).join('\n');
                  } else {
                    content += 'No discovered identifiers.';
                  }
                  content += '\n\n';
                  if (report.linkedAccounts && report.linkedAccounts.length > 0) {
                    content += separator + '\n';
                    content += 'LINKED ACCOUNTS\n';
                    content += separator + '\n';
                    content += report.linkedAccounts.map(a => `${a.platform}: ${a.username} (Confidence: ${a.confidence}%)`).join('\n');
                    content += '\n\n';
                  }
                  if (report.relatedEntities && report.relatedEntities.length > 0) {
                    content += separator + '\n';
                    content += 'RELATED ENTITIES\n';
                    content += separator + '\n';
                    content += report.relatedEntities.map(e => `${e.type}: ${e.value} (${e.relationship})`).join('\n');
                    content += '\n\n';
                  }
                  if (report.timeline && report.timeline.length > 0) {
                    content += separator + '\n';
                    content += 'TIMELINE\n';
                    content += separator + '\n';
                    content += report.timeline.map(t => `${t.date}: ${t.event}`).join('\n');
                    content += '\n\n';
                  }
                  if (report.evidence && report.evidence.length > 0) {
                    content += separator + '\n';
                    content += 'SUPPORTING EVIDENCE\n';
                    content += separator + '\n';
                    report.evidence.forEach(e => {
                      content += `[${e.sourceType.toUpperCase()}] ${e.source}`;
                      if (e.tool) content += ` (${e.tool})`;
                      content += '\n';
                      if (e.identifier) content += `Identifier: ${e.identifier}\n`;
                      if (e.data) {
                        content += 'Data:\n';
                        const dataStr = typeof e.data === 'string' ? e.data : JSON.stringify(e.data, null, 2);
                        content += dataStr + '\n';
                      }
                      content += '\n';
                    });
                  }
                  if (report.nextSteps && report.nextSteps.length > 0) {
                    content += separator + '\n';
                    content += 'RECOMMENDED NEXT STEPS\n';
                    content += separator + '\n';
                    content += report.nextSteps.map(s => `- ${s}`).join('\n');
                    content += '\n\n';
                  }
                  content += separator + '\n';
                  content += 'Generated by Datawire.cc AI OSINT Search\n';
                  content += 'Date: ' + new Date().toLocaleString() + '\n';
                  content += 'Powered by https://datawire.cc\n';
                  content += 'Lookup made by https://datawire.cc';
                  
                  console.log('Content length:', content.length);
                  
                  try {
                    const blob = new Blob([content], { type: 'text/plain' })
                    const url = URL.createObjectURL(blob)
                    const a = document.createElement('a')
                    a.href = url
                    a.download = `datawire-ai-osint-${Date.now()}.txt`
                    document.body.appendChild(a)
                    a.click()
                    document.body.removeChild(a)
                    setTimeout(() => URL.revokeObjectURL(url), 100)
                    console.log('Download initiated successfully');
                  } catch (error) {
                    console.error('Download failed:', error);
                  }
                }}
                className="px-4 py-2 bg-white text-black font-semibold hover:bg-gray-200 transition-colors flex items-center gap-2"
              >
                <i className='bx bx-download'></i>
                Download Report
              </button>
              <button
                onClick={() => {
                  setReport(null)
                  setProgress(0)
                  setActivityLog([])
                }}
                className="px-4 py-2 bg-osint-bg/50 hover:bg-osint-bg/70 border border-osint-border text-sm transition-colors"
              >
                New Search
              </button>
            </div>
          </div>

          <div className="prose prose-invert max-w-none">
            {/* Executive Summary */}
            <div className="bg-osint-bg/30 rounded-lg p-4 mb-4 border border-osint-border/50">
              <h4 className="text-lg font-semibold text-white mb-2">Executive Summary</h4>
              <p className="text-osint-muted text-sm">{report.executiveSummary}</p>
            </div>

            {/* Investigation Overview */}
            <div className="bg-osint-bg/30 rounded-lg p-4 mb-4 border border-osint-border/50">
              <h4 className="text-lg font-semibold text-white mb-2">Investigation Overview</h4>
              <p className="text-osint-muted text-sm">{report.investigationOverview}</p>
            </div>

            {/* Discovered Identifiers */}
            {report.discoveredIdentifiers && report.discoveredIdentifiers.length > 0 && (
              <div className="bg-osint-bg/30 rounded-lg p-4 mb-4 border border-osint-border/50">
                <h4 className="text-lg font-semibold text-white mb-2">Discovered Identifiers</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {report.discoveredIdentifiers.map((item, index) => (
                    <div key={index} className="text-sm">
                      <span className="text-osint-muted capitalize">{item.type}:</span>
                      <span className="text-white ml-2">{item.value}</span>
                      <span className="text-xs text-osint-muted ml-2">({item.source})</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Linked Accounts */}
            {report.linkedAccounts && report.linkedAccounts.length > 0 && (
              <div className="bg-osint-bg/30 rounded-lg p-4 mb-4 border border-osint-border/50">
                <h4 className="text-lg font-semibold text-white mb-2">Linked Accounts</h4>
                <div className="space-y-2">
                  {report.linkedAccounts.map((account, index) => (
                    <div key={index} className="text-sm">
                      <span className="text-white">{account.platform}:</span>
                      <span className="text-osint-muted ml-2">{account.username}</span>
                      <span className="text-xs text-osint-muted ml-2">Confidence: {account.confidence}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Related Entities */}
            {report.relatedEntities && report.relatedEntities.length > 0 && (
              <div className="bg-osint-bg/30 rounded-lg p-4 mb-4 border border-osint-border/50">
                <h4 className="text-lg font-semibold text-white mb-2">Related Entities</h4>
                <div className="space-y-2">
                  {report.relatedEntities.map((entity, index) => (
                    <div key={index} className="text-sm">
                      <span className="text-white">{entity.type}:</span>
                      <span className="text-osint-muted ml-2">{entity.value}</span>
                      <span className="text-xs text-osint-muted ml-2">({entity.relationship})</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Timeline */}
            {report.timeline && report.timeline.length > 0 && (
              <div className="bg-osint-bg/30 rounded-lg p-4 mb-4 border border-osint-border/50">
                <h4 className="text-lg font-semibold text-white mb-2">Timeline of Findings</h4>
                <div className="space-y-2">
                  {report.timeline.map((event, index) => (
                    <div key={index} className="text-sm">
                      <span className="text-osint-muted">{event.date}:</span>
                      <span className="text-white ml-2">{event.event}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Supporting Evidence */}
            {report.evidence && report.evidence.length > 0 && (
              <div className="bg-osint-bg/30 rounded-lg p-4 mb-4 border border-osint-border/50">
                <h4 className="text-lg font-semibold text-white mb-2">Supporting Evidence</h4>
                <div className="space-y-3">
                  {report.evidence.map((item, index) => (
                    <div key={index} className="text-sm">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-white font-medium">{item.source}</span>
                        {item.tool && <span className="text-xs text-osint-muted">({item.tool})</span>}
                        <span className={`text-xs px-2 py-0.5 rounded ${
                          item.sourceType === 'api' ? 'bg-blue-500/20 text-blue-400' :
                          'bg-green-500/20 text-green-400'
                        }`}>
                          {item.sourceType === 'api' ? 'API' : 'Web Search'}
                        </span>
                      </div>
                      {item.identifier && <p className="text-osint-muted text-xs mb-1">Identifier: {item.identifier}</p>}
                      {item.data && (
                        <div className="bg-black/30 rounded p-3 mt-2 overflow-auto max-h-64">
                          <pre className="text-xs text-green-400 font-mono whitespace-pre-wrap">
                            {typeof item.data === 'string' ? item.data : JSON.stringify(item.data, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommended Next Steps */}
            {report.nextSteps && report.nextSteps.length > 0 && (
              <div className="bg-osint-bg/30 rounded-lg p-4 mb-4 border border-osint-border/50">
                <h4 className="text-lg font-semibold text-white mb-2">Recommended Next Steps</h4>
                <ul className="list-disc list-inside space-y-1">
                  {report.nextSteps.map((step, index) => (
                    <li key={index} className="text-sm text-osint-muted">{step}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Watermark */}
            <div className="text-center pt-4 border-t border-osint-border/50">
              <p className="text-xs text-osint-muted">
                Report generated by Datawire.cc AI OSINT Search • {new Date().toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AIOsintSearch
