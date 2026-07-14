import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'

// Manual provider definitions - matching newapi.txt exactly
const MANUAL_PROVIDERS = {
  snusbase: [
    { name: 'search', description: 'Snusbase search', path: '/snusbase', queryParam: 'query' },
    { name: 'combo-lookup', description: 'Combo lookup', path: '/snusbase/combo-lookup', queryParam: 'query', extraParams: { type: '' } },
    { name: 'hash-lookup', description: 'Hash lookup', path: '/snusbase/hash-lookup', queryParam: 'hash' },
    { name: 'ip-whois', description: 'IP WHOIS', path: '/snusbase/ip-whois', queryParam: 'ip' }
  ],
  leakosint: [
    { name: 'search', description: 'LeakOSint search', path: '/leakosint', queryParam: 'query' }
  ],
  leakcheck: [
    { name: 'search', description: 'LeakCheck V2', path: '/leakcheck/v2', queryParam: 'query' }
  ],
  breachbase: [
    { name: 'search', description: 'BreachBase search', path: '/breachbase', queryParam: 'query', extraParams: { type: '' } }
  ],
  intelvault: [
    { name: 'search', description: 'IntelVault search', path: '/intelvault', queryParam: 'query' },
    { name: 'breaches', description: 'IntelVault breaches', path: '/intelvault/breaches', queryParam: 'query' },
    { name: 'stealer-logs', description: 'IntelVault stealer logs', path: '/intelvault/stealer-logs', queryParam: 'query' }
  ],
  breachdirectory: [
    { name: 'search', description: 'BreachDirectory search', path: '/breachdirectory', queryParam: 'query' }
  ],
  hackcheck: [
    { name: 'search', description: 'HackCheck search', path: '/hackcheck', queryParam: 'query' }
  ],
  osintkit: [
    { name: 'search', description: 'OSINTKit search', path: '/osintkit', queryParam: 'query' }
  ],
  breachvip: [
    { name: 'search', description: 'BreachVIP search', path: '/breachvip', queryParam: 'query' }
  ],
  cordcat: [
    { name: 'search', description: 'Cordcat search', path: '/cordcat', queryParam: 'query' },
    { name: 'user', description: 'Cordcat user', path: '/cordcat/user', queryParam: 'id' },
    { name: 'invite', description: 'Cordcat invite', path: '/cordcat/invite', queryParam: 'code' },
    { name: 'guild-widget', description: 'Cordcat guild widget', path: '/cordcat/guild-widget', queryParam: 'id' },
    { name: 'ip', description: 'Cordcat IP', path: '/cordcat/ip', queryParam: 'ip' }
  ],
  intelx: [
    { name: 'download', description: 'IntelX file download', path: '/intelx', queryParam: 'query' }
  ],
  osintcat: [
    { name: 'database-search', description: 'OSINTCat database search', path: '/osintcat/database-search', queryParam: 'query' },
    { name: 'ip', description: 'OSINTCat IP', path: '/osintcat/ip', queryParam: 'ip' },
    { name: 'twitter-osint', description: 'OSINTCat Twitter OSINT', path: '/osintcat/twitter-osint', queryParam: 'username' },
    { name: 'machine-viewer-search', description: 'Machine viewer search', path: '/osintcat/machine-viewer/search', queryParam: 'query' },
    { name: 'machine-info', description: 'Machine info', path: '/osintcat/machine-viewer/machines/{machine_id}/info', queryParam: 'machine_id', pathIncludesQuery: true },
    { name: 'machine-files', description: 'Machine files', path: '/osintcat/machine-viewer/machines/{machine_id}/files/treeview', queryParam: 'machine_id', pathIncludesQuery: true },
    { name: 'machine-download', description: 'Machine download', path: '/osintcat/machine-viewer/machines/{machine_id}/download', queryParam: 'machine_id', pathIncludesQuery: true, responseType: 'binary' },
    { name: 'file-info', description: 'File info', path: '/osintcat/machine-viewer/files/{file_id}/info', queryParam: 'file_id', pathIncludesQuery: true },
    { name: 'file-download', description: 'File download', path: '/osintcat/machine-viewer/files/{file_id}/download', queryParam: 'file_id', pathIncludesQuery: true, responseType: 'binary' }
  ],
  xosint: [
    { name: 'search', description: 'XOSINT search', path: '/xosint/search', queryParam: 'query' }
  ],
  seeknow: [
    { name: 'search', description: 'Seeknow search', path: '/seeknow/search', queryParam: 'query', method: 'POST' },
    { name: 'stealer', description: 'Seeknow stealer', path: '/seeknow/stealer', queryParam: 'query', method: 'POST' },
    { name: 'discord-user', description: 'Discord user', path: '/seeknow/discord/user', queryParam: 'id' },
    { name: 'discord-to-roblox', description: 'Discord to Roblox', path: '/seeknow/discord/to-roblox', queryParam: 'id' },
    { name: 'github', description: 'GitHub username', path: '/seeknow/username/github', queryParam: 'username' },
    { name: 'twitter', description: 'Twitter username', path: '/seeknow/username/twitter', queryParam: 'username' },
    { name: 'tiktok', description: 'TikTok username', path: '/seeknow/username/tiktok', queryParam: 'username' },
    { name: 'reddit', description: 'Reddit username', path: '/seeknow/username/reddit', queryParam: 'username' },
    { name: 'social', description: 'Social username', path: '/seeknow/username/social', queryParam: 'username' },
    { name: 'history', description: 'Username history', path: '/seeknow/username/history', queryParam: 'username' },
    { name: 'network-ip', description: 'Network IP', path: '/seeknow/network/ip', queryParam: 'ip' },
    { name: 'network-email-check', description: 'Network email check', path: '/seeknow/network/email-check', queryParam: 'email' },
    { name: 'network-phone', description: 'Network phone', path: '/seeknow/network/phone', queryParam: 'phone' },
    { name: 'domain-intel', description: 'Domain intel', path: '/seeknow/domain/intel', queryParam: 'domain' },
    { name: 'domain-whois', description: 'Domain WHOIS', path: '/seeknow/domain/whois', queryParam: 'domain' },
    { name: 'xbox', description: 'Xbox gamertag', path: '/seeknow/gaming/xbox', queryParam: 'gamertag' },
    { name: 'roblox', description: 'Roblox username', path: '/seeknow/gaming/roblox', queryParam: 'username' },
    { name: 'minecraft', description: 'Minecraft username', path: '/seeknow/gaming/minecraft', queryParam: 'username' }
  ],
  seekria: [
    { name: 'user-footprint', description: 'User footprint', path: '/seekria/user-footprint', queryParam: 'query' },
    { name: 'email-osint', description: 'Email OSINT', path: '/seekria/email-osint', queryParam: 'email' },
    { name: 'domain-lookup', description: 'Domain lookup', path: '/seekria/domain-lookup', queryParam: 'domain' },
    { name: 'discord', description: 'Discord', path: '/seekria/discord', queryParam: 'id' },
    { name: 'roblox', description: 'Roblox', path: '/seekria/roblox', queryParam: 'username' },
    { name: 'minecraft', description: 'Minecraft', path: '/seekria/minecraft', queryParam: 'username' },
    { name: 'ip', description: 'IP', path: '/seekria/ip', queryParam: 'ip' },
    { name: 'dns-resolver', description: 'DNS resolver', path: '/seekria/dns-resolver', queryParam: 'domain' },
    { name: 'email-breach', description: 'Email breach', path: '/seekria/email-breach', queryParam: 'email' },
    { name: 'username-breach', description: 'Username breach', path: '/seekria/username-breach', queryParam: 'username' },
    { name: 'phone-breach', description: 'Phone breach', path: '/seekria/phone-breach', queryParam: 'phone' },
    { name: 'discord-profile', description: 'Discord profile', path: '/seekria/discord-profile', queryParam: 'id' },
    { name: 'discord-to-rat', description: 'Discord to RAT', path: '/seekria/discord-to-rat', queryParam: 'id' },
    { name: 'fivem', description: 'FiveM', path: '/seekria/fivem', queryParam: 'identifier' },
    { name: 'minecraft-osint', description: 'Minecraft OSINT', path: '/seekria/minecraft-osint', queryParam: 'username' },
    { name: 'name-history', description: 'Name history', path: '/seekria/name-history', queryParam: 'uuid' },
    { name: 'laby-stats', description: 'Laby stats', path: '/seekria/laby-stats', queryParam: 'username' },
    { name: 'minecraft-texture', description: 'Minecraft texture', path: '/seekria/minecraft-texture', queryParam: 'uuid' },
    { name: 'tiktok-lookup', description: 'TikTok lookup', path: '/seekria/tiktok-lookup', queryParam: 'username' },
    { name: 'tiktok-breach', description: 'TikTok breach', path: '/seekria/tiktok-breach', queryParam: 'username' },
    { name: 'snusbase-breach', description: 'Snusbase breach', path: '/seekria/snusbase-breach', queryParam: 'query' },
    { name: 'leakcheck-breach', description: 'LeakCheck breach', path: '/seekria/leakcheck-breach', queryParam: 'query' }
  ],
  wentyn: [
    { name: 'search', description: 'Wentyn search', path: '/wentyn', queryParam: 'query' }
  ],
  hudsonrock: [
    { name: 'search-by-domain', description: 'Search by domain', path: '/hudsonrock/search-by-domain', queryParam: 'domain' },
    { name: 'domain-overview', description: 'Domain overview', path: '/hudsonrock/search-by-domain/overview', queryParam: 'domain' },
    { name: 'domain-assessment', description: 'Domain assessment', path: '/hudsonrock/search-by-domain/assessment', queryParam: 'domain' },
    { name: 'domain-discovery', description: 'Domain discovery', path: '/hudsonrock/search-by-domain/discovery', queryParam: 'domain' },
    { name: 'login-emails', description: 'Login emails', path: '/hudsonrock/search-by-login/emails', queryParam: 'login' },
    { name: 'login-usernames', description: 'Login usernames', path: '/hudsonrock/search-by-login/usernames', queryParam: 'login' },
    { name: 'search-by-ip', description: 'Search by IP', path: '/hudsonrock/search-by-ip', queryParam: 'ip' },
    { name: 'search-by-keyword', description: 'Search by keyword', path: '/hudsonrock/search-by-keyword', queryParam: 'keyword' },
    { name: 'keyword-urls', description: 'Keyword URLs', path: '/hudsonrock/search-by-keyword/urls', queryParam: 'keyword' },
    { name: 'stealer-infection', description: 'Stealer infection analysis', path: '/hudsonrock/search-by-stealer/infection-analysis', queryParam: 'query' }
  ],
  leaksight: [
    { name: 'search', description: 'Leaksight search', path: '/leaksight', queryParam: 'query' }
  ],
  nbrs: [
    { name: 'roblox', description: 'NBRS Roblox', path: '/nbrs/roblox', queryParam: 'id' }
  ],
  room101: [
    { name: 'analyze', description: 'Room101 analyze', path: '/room101/analyze', queryParam: 'username' },
    { name: 'search', description: 'Room101 search', path: '/room101/search', queryParam: 'query' },
    { name: 'v2-search', description: 'Room101 V2 search', path: '/room101/v2/search', queryParam: 'query' },
    { name: 'user', description: 'Room101 user', path: '/room101/user', queryParam: 'username' },
    { name: 'subreddit', description: 'Room101 subreddit', path: '/room101/subreddit', queryParam: 'name' }
  ],
  seon: [
    { name: 'phone', description: 'SEON phone', path: '/seon/phone', queryParam: 'phone' },
    { name: 'email', description: 'SEON email', path: '/seon/email', queryParam: 'email' },
    { name: 'ip', description: 'SEON IP', path: '/seon/ip', queryParam: 'ip' },
    { name: 'bin', description: 'SEON BIN', path: '/seon/bin', queryParam: 'bin' },
    { name: 'email-verification', description: 'SEON email verification', path: '/seon/email-verification', queryParam: 'email' }
  ],
  oathnet: [
    { name: 'breach', description: 'Oathnet breach', path: '/oathnet/breach', queryParam: 'query' },
    { name: 'stealer', description: 'Oathnet stealer', path: '/oathnet/stealer', queryParam: 'query' },
    { name: 'stealer-subdomain', description: 'Stealer subdomain', path: '/oathnet/stealer-subdomain', queryParam: 'domain' },
    { name: 'victims', description: 'Victims list', path: '/oathnet/victims', queryParam: '' },
    { name: 'victim-info', description: 'Victim info', path: '/oathnet/victims/{log_id}', queryParam: 'log_id', pathIncludesQuery: true },
    { name: 'victim-file', description: 'Victim file', path: '/oathnet/victims/{log_id}/files/{file_id}', queryParam: 'log_id', pathIncludesQuery: true },
    { name: 'victim-archive', description: 'Victim archive', path: '/oathnet/victims/{log_id}/archive', queryParam: 'log_id', pathIncludesQuery: true },
    { name: 'discord-to-roblox', description: 'Discord to Roblox', path: '/oathnet/discord-to-roblox', queryParam: 'id' },
    { name: 'discord-userinfo', description: 'Discord userinfo', path: '/oathnet/discord-userinfo', queryParam: 'id' },
    { name: 'discord-username-history', description: 'Discord username history', path: '/oathnet/discord-username-history', queryParam: 'id' },
    { name: 'steam', description: 'Steam', path: '/oathnet/steam', queryParam: 'id' },
    { name: 'xbox', description: 'Xbox', path: '/oathnet/xbox', queryParam: 'gamertag' },
    { name: 'roblox-userinfo', description: 'Roblox userinfo', path: '/oathnet/roblox-userinfo', queryParam: 'id' },
    { name: 'mc-history', description: 'Minecraft history', path: '/oathnet/mc-history', queryParam: 'username' },
    { name: 'ip-info', description: 'IP info', path: '/oathnet/ip-info', queryParam: 'ip' },
    { name: 'holehe', description: 'Holehe', path: '/oathnet/holehe', queryParam: 'email' },
    { name: 'ghunt', description: 'GHunt', path: '/oathnet/ghunt', queryParam: 'email' },
    { name: 'extract-subdomain', description: 'Extract subdomain', path: '/oathnet/extract-subdomain', queryParam: 'domain' }
  ],
  memory: [
    { name: 'search', description: 'Memory.lol search', path: '/memory', queryParam: 'username' }
  ],
  nosint: [
    { name: 'search', description: 'NoSINT search', path: '/nosint/search', queryParam: 'query' },
    { name: 'ip', description: 'NoSINT IP', path: '/nosint/ip', queryParam: 'ip' }
  ],
  reconly: [
    { name: 'search', description: 'Reconly search', path: '/reconly', queryParam: 'query' }
  ],
  tiktok: [
    { name: 'search', description: 'TikTok OSINT', path: '/tiktok', queryParam: 'username' }
  ],
  binlist: [
    { name: 'search', description: 'Binlist', path: '/binlist', queryParam: 'bin' }
  ],
  inf0sec: [
    { name: 'search', description: 'Inf0sec', path: '/inf0sec', queryParam: 'query' }
  ],
  vin: [
    { name: 'search', description: 'VIN Recorder', path: '/vin', queryParam: 'vin' }
  ],
  propertyradar: [
    { name: 'search', description: 'PropertyRadar search', path: '/propertyradar/search', queryParam: 'query' },
    { name: 'persons', description: 'PropertyRadar persons', path: '/propertyradar/persons', queryParam: 'query' },
    { name: 'phone', description: 'PropertyRadar phone', path: '/propertyradar/phone', queryParam: 'phone' },
    { name: 'email', description: 'PropertyRadar email', path: '/propertyradar/email', queryParam: 'email' },
    { name: 'skiptrace', description: 'PropertyRadar skiptrace', path: '/propertyradar/skiptrace', queryParam: 'query' }
  ],
  datavoid: [
    { name: 'recovery', description: 'Datavoid recovery', path: '/datavoid/recovery', queryParam: 'query' },
    { name: 'us', description: 'Datavoid US', path: '/datavoid/us', queryParam: 'query' },
    { name: 'ca', description: 'Datavoid CA', path: '/datavoid/ca', queryParam: 'query' },
    { name: 'il', description: 'Datavoid IL', path: '/datavoid/il', queryParam: 'query' },
    { name: 'stealer', description: 'Datavoid stealer', path: '/datavoid/stealer', queryParam: 'query' },
    { name: 'geocode', description: 'Datavoid geocode', path: '/datavoid/geocode', extraParams: { address: '' }, method: 'POST' },
    { name: 'reverse-geocode', description: 'Datavoid reverse geocode', path: '/datavoid/reverse-geocode', extraParams: { lat: '', lon: '' }, method: 'POST' },
    { name: 'automotive', description: 'Datavoid automotive', path: '/datavoid/automotive', queryParam: 'query' },
    { name: 'automotive-check', description: 'Datavoid automotive check', path: '/datavoid/automotive/check', queryParam: 'vin' },
    { name: 'company', description: 'Datavoid company', path: '/datavoid/company', queryParam: 'query' },
    { name: 'discord', description: 'Datavoid Discord', path: '/datavoid/discord', queryParam: 'id' },
    { name: 'instagram', description: 'Datavoid Instagram', path: '/datavoid/instagram', extraParams: { query: '' }, method: 'POST' },
    { name: 'twitter', description: 'Datavoid Twitter', path: '/datavoid/twitter', queryParam: 'query' },
    { name: 'google-docs', description: 'Datavoid Google Docs', path: '/datavoid/google-docs', extraParams: { query: '' }, method: 'POST' },
    { name: 'fivem', description: 'Datavoid FiveM', path: '/datavoid/fivem', queryParam: 'identifier' },
    { name: 'roblox', description: 'Datavoid Roblox', path: '/datavoid/roblox', queryParam: 'username' }
  ],
  checko: [
    { name: 'search', description: 'Checko', path: '/checko', queryParam: 'query' }
  ],
  github: [
    { name: 'search', description: 'GitHub OSINT', path: '/github', queryParam: 'query' }
  ],
  discord: [
    { name: 'user', description: 'Discord user', path: '/discord/user', queryParam: 'id' },
    { name: 'history', description: 'Discord history', path: '/discord/history', queryParam: 'query' },
    { name: 'export', description: 'Discord export', path: '/discord/export', queryParam: 'query' },
    { name: 'snowflake', description: 'Discord snowflake', path: '/discord/snowflake', queryParam: 'id' }
  ],
  telegram: [
    { name: 'username', description: 'Telegram username', path: '/telegram/username', queryParam: 'username' },
    { name: 'id', description: 'Telegram ID', path: '/telegram/id', queryParam: 'id' },
    { name: 'phone', description: 'Telegram phone', path: '/telegram/phone', queryParam: 'phone' }
  ],
  snapchat: [
    { name: 'search', description: 'Snapchat OSINT', path: '/snapchat', queryParam: 'username' }
  ],
  instagram: [
    { name: 'search', description: 'Instagram OSINT', path: '/instagram', queryParam: 'query' },
    { name: 'id', description: 'Instagram ID', path: '/instagram/id', queryParam: 'id' }
  ],
  medal: [
    { name: 'search', description: 'Medal.tv OSINT', path: '/medal', queryParam: 'username' }
  ]
}

const Commands = () => {
  const [providers, setProviders] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedProviders, setExpandedProviders] = useState({})

  useEffect(() => {
    fetchProviders()
  }, [])

  const fetchProviders = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Use manual providers instead of API call
      setProviders(MANUAL_PROVIDERS)
    } catch (error) {
      console.error('Failed to fetch providers:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const toggleProvider = (provider) => {
    setExpandedProviders(prev => ({
      ...prev,
      [provider]: !prev[provider]
    }))
  }

  const providerLogos = {
    snusbase: 'https://logos.osint.ly/snusbase.com',
    leakosint: 'https://www.google.com/s2/favicons?domain=leakosint.io&sz=64',
    leakcheck: 'https://logos.osint.ly/leakcheck.io',
    breachbase: 'https://www.google.com/s2/favicons?domain=breachbase.com&sz=64',
    intelvault: 'https://www.google.com/s2/favicons?domain=intelvault.io&sz=64',
    breachdirectory: 'https://logos.osint.ly/breachdirectory.org',
    hackcheck: 'https://www.google.com/s2/favicons?domain=hackcheck.io&sz=64',
    osintkit: 'https://www.google.com/s2/favicons?domain=osintkit.io&sz=64',
    breachvip: 'https://www.google.com/s2/favicons?domain=breachvip.com&sz=64',
    cordcat: 'https://www.google.com/s2/favicons?domain=cord.cat&sz=64',
    intelx: 'https://logos.osint.ly/intelx.io',
    osintcat: 'https://www.google.com/s2/favicons?domain=osintcat.io&sz=64',
    xosint: 'https://www.google.com/s2/favicons?domain=xosint.io&sz=64',
    seeknow: 'https://www.google.com/s2/favicons?domain=see-know.icu&sz=64',
    seekria: 'https://www.google.com/s2/favicons?domain=seekria.cc&sz=64',
    wentyn: 'https://www.google.com/s2/favicons?domain=wentyn.io&sz=64',
    hudsonrock: 'https://logos.osint.ly/hudsonrock.com',
    leaksight: 'https://www.google.com/s2/favicons?domain=leaksight.io&sz=64',
    nbrs: 'https://www.google.com/s2/favicons?domain=nbrs.site&sz=64',
    room101: 'https://www.google.com/s2/favicons?domain=think-pol.com&sz=64',
    seon: 'https://logos.osint.ly/seon.io',
    oathnet: 'https://www.google.com/s2/favicons?domain=oathnet.io&sz=64',
    memory: 'https://www.google.com/s2/favicons?domain=memory.lol&sz=64',
    nosint: 'https://www.google.com/s2/favicons?domain=nosint.org&sz=64',
    reconly: 'https://www.google.com/s2/favicons?domain=reconly.io&sz=64',
    tiktok: 'https://www.google.com/s2/favicons?domain=tiktok.com&sz=64',
    binlist: 'https://www.google.com/s2/favicons?domain=binlist.net&sz=64',
    inf0sec: 'https://www.google.com/s2/favicons?domain=inf0sec.com&sz=64',
    vin: 'https://www.google.com/s2/favicons?domain=vindecoder.net&sz=64',
    propertyradar: 'https://www.google.com/s2/favicons?domain=propertyradar.com&sz=64',
    datavoid: 'https://www.google.com/s2/favicons?domain=datavoid.sh&sz=64',
    checko: 'https://www.google.com/s2/favicons?domain=checko.io&sz=64',
    github: 'https://logos.osint.ly/github.com',
    discord: 'https://www.google.com/s2/favicons?domain=discord.com&sz=64',
    telegram: 'https://www.google.com/s2/favicons?domain=telegram.org&sz=64',
    snapchat: 'https://www.google.com/s2/favicons?domain=snapchat.com&sz=64',
    instagram: 'https://www.google.com/s2/favicons?domain=instagram.com&sz=64',
    medal: 'https://www.google.com/s2/favicons?domain=medal.tv&sz=64',
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 }
    }
  }

  const filteredProviders = providers ? Object.entries(providers).reduce((acc, [provider, commands]) => {
    const filteredCommands = commands.filter(cmd => 
      cmd.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cmd.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
    if (filteredCommands.length > 0) {
      acc[provider] = filteredCommands
    }
    return acc
  }, {}) : {}

  return (
    <div className="pt-16 pb-16">
      <div className="max-w-5xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 mb-6"
          >
            <i className='bx bx-command text-white'></i>
            <span className="text-sm text-white">API Documentation</span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-4xl sm:text-5xl font-bold text-osint-secondary mb-4"
          >
            OSINT Providers
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-base text-osint-muted max-w-2xl mx-auto"
          >
            Browse available OSINT providers and their search commands. Access 40+ premium APIs through our unified interface.
          </motion.p>
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <div className="relative">
            <motion.div
              animate={{ 
                boxShadow: searchQuery ? "0 0 30px rgba(255, 255, 255, 0.1)" : "0 0 0 rgba(255, 255, 255, 0)"
              }}
              transition={{ duration: 0.3 }}
              className="relative"
            >
              <i className='bx bx-search absolute left-4 top-1/2 transform -translate-y-1/2 text-osint-muted text-xl'></i>
              <input
                type="text"
                placeholder="Search commands, providers, or endpoints..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-osint-card border border-osint-border rounded-xl pl-12 pr-4 py-4 text-osint-secondary placeholder-osint-muted text-base focus:outline-none focus:border-white/50 transition-all duration-300"
              />
              {searchQuery && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-osint-muted hover:text-white transition-colors"
                >
                  <i className='bx bx-x text-xl'></i>
                </motion.button>
              )}
            </motion.div>
          </div>
        </motion.div>

        {/* Error State */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-6 bg-red-500/10 border border-red-500/30 rounded-2xl"
          >
            <div className="flex items-center gap-3 mb-3">
              <i className='bx bx-error-circle text-red-400 text-2xl'></i>
              <p className="text-red-400 font-semibold">Error loading providers</p>
            </div>
            <p className="text-red-300/70 text-sm mb-4">{error}</p>
            <button
              onClick={fetchProviders}
              className="px-6 py-3 bg-red-500/20 text-red-400 rounded-xl text-sm hover:bg-red-500/30 transition-all duration-300 inline-flex items-center gap-2"
            >
              <i className='bx bx-refresh'></i>
              <span>Retry</span>
            </button>
          </motion.div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-20">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 mx-auto mb-6 border-4 border-white/20 border-t-white rounded-full"
            />
            <p className="text-osint-muted text-base">Loading providers...</p>
          </div>
        )}

        {/* Providers */}
        {!loading && providers && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-4"
          >
            {Object.entries(filteredProviders).map(([provider, commands]) => (
              <motion.div
                key={provider}
                variants={itemVariants}
                className="bg-osint-card border border-osint-border rounded-2xl overflow-hidden hover:border-white/30 transition-all duration-300"
              >
                <motion.button
                  onClick={() => toggleProvider(provider)}
                  className="w-full p-5 flex items-center justify-between hover:bg-white/5 transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    <motion.div
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                      className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center border border-white/30 overflow-hidden"
                    >
                      <img 
                        src={providerLogos[provider] || 'https://www.google.com/s2/favicons?domain=' + provider + '.com&sz=64'}
                        alt={provider}
                        className="w-full h-full object-contain p-1 mix-blend-multiply"
                        style={{ filter: 'grayscale(100%) brightness(0.7)' }}
                        onError={(e) => {
                          e.target.style.display = 'none'
                          e.target.parentElement.innerHTML = `<i className='bx bx-cog text-2xl text-white'></i>`
                        }}
                      />
                    </motion.div>
                    <div className="text-left">
                      <h3 className="font-semibold text-osint-secondary text-lg">
                        {provider.charAt(0).toUpperCase() + provider.slice(1)}
                      </h3>
                      <p className="text-xs text-osint-muted">{commands.length} commands available</p>
                    </div>
                  </div>
                  <motion.i
                    animate={{ rotate: expandedProviders[provider] ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    className='bx bx-chevron-down text-osint-muted text-xl group-hover:text-white transition-colors'
                  />
                </motion.button>
                
                <motion.div
                  initial={false}
                  animate={{
                    height: expandedProviders[provider] ? 'auto' : 0,
                    opacity: expandedProviders[provider] ? 1 : 0
                  }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="p-5 pt-0 space-y-3">
                    {commands.map((cmd, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="p-4 bg-osint-bg/50 rounded-xl border border-osint-border/50 hover:border-white/30 transition-all duration-300 group"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <code className="text-sm font-mono text-white font-semibold">{cmd.name}</code>
                          <span className="text-xs px-2 py-1 rounded-full bg-white/10 text-white font-medium">
                            {cmd.method || 'GET'}
                          </span>
                        </div>
                        <p className="text-sm text-osint-muted">{cmd.description}</p>
                        {cmd.path && (
                          <div className="mt-2 text-xs text-osint-muted/70 font-mono bg-osint-card/50 px-2 py-1 rounded">
                            {cmd.path}
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* No Results */}
        {searchQuery && Object.keys(filteredProviders).length === 0 && providers && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-osint-card border border-osint-border flex items-center justify-center">
              <i className='bx bx-search text-3xl text-osint-muted'></i>
            </div>
            <p className="text-osint-muted text-base mb-2">No commands found</p>
            <p className="text-osint-muted/60 text-sm">Try adjusting your search query</p>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default Commands
