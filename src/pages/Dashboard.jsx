import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import ReactFlow, {
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  BackgroundVariant,
  MarkerType,
  Handle,
  Position
} from 'reactflow'
import 'reactflow/dist/style.css'
import AIOsintSearch from './AIOsintSearch'
import GeolocationMap from '../components/GeolocationMap'
import GlassCard from '../components/ui/GlassCard'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Dropdown from '../components/ui/Dropdown'
import EmptyState from '../components/ui/EmptyState'
import PremiumBackground from '../components/ui/PremiumBackground'
import { 
  Search, 
  Brain, 
  CloudDownload, 
  Map, 
  Link2, 
  History, 
  Receipt, 
  Settings, 
  Menu, 
  X, 
  ChevronDown,
  Download,
  Trash,
  Plus,
  Upload,
  ZoomIn,
  ZoomOut,
  Maximize2,
  CheckCircle,
  XCircle,
  Info,
  Clock,
  Globe,
  Phone,
  MapPin,
  Mail as Envelope,
  User,
  Server,
  Database,
  Shield,
  Vault,
  Book,
  Wrench,
  Crown,
  Cloud,
  Archive,
  Users,
  ShieldX,
  Eye,
  Compass,
  CreditCard,
  Terminal,
  Car,
  Building,
  HelpCircle,
  ChevronRight,
  LogOut,
  DollarSign,
  Video,
  DoorOpen,
  HelpCircle as QuestionMark
} from 'lucide-react'

// Provider icons mapping - using Lucide React icons
const PROVIDER_ICONS = {
  snusbase: Database,
  leakosint: Search,
  leakcheck: Shield,
  breachbase: Server,
  intelvault: Vault,
  breachdirectory: Book,
  hackcheck: Wrench,
  osintkit: Wrench,
  breachvip: Crown,
  cordcat: HelpCircle,
  intelx: CloudDownload,
  osintcat: HelpCircle,
  xosint: Search,
  seeknow: Search,
  seekria: Compass,
  datahound: HelpCircle,
  openarchive: Archive,
  telegram: HelpCircle,
  tiktok: Video,
  roblox: HelpCircle,
  minecraft: HelpCircle,
  xbox: HelpCircle,
  steam: HelpCircle,
  fivem: Car,
  twitter: HelpCircle,
  instagram: HelpCircle,
  github: HelpCircle,
  snapchat: HelpCircle,
  reddit: HelpCircle,
  ip: Globe,
  domain: Globe,
  dns: HelpCircle,
  whois: Info,
  hudsonrock: ShieldX,
  leaksight: Eye,
  nbrs: User,
  room101: DoorOpen,
  seon: HelpCircle,
  memory: HelpCircle,
  nosint: Search,
  reconly: Compass,
  binlist: CreditCard,
  inf0sec: Terminal,
  vin: Car,
  propertyradar: Building,
  datavoid: HelpCircle,
  checko: CheckCircle,
  medal: HelpCircle,
  discord: HelpCircle,
  oathnet: Shield
}

// Provider categories with logos (kept for reference)
const PROVIDER_CATEGORIES = {
  footprint: {
    label: 'Footprint',
    icon: 'bx-user-voice',
    providers: ['seekria', 'seeknow', 'xosint', 'datahound']
  },
  discord: {
    label: 'Discord',
    icon: 'bxl-discord',
    providers: ['cordcat', 'oathnet', 'datavoid']
  },
  telegram: {
    label: 'Telegram',
    icon: 'bxl-telegram',
    providers: ['telegram']
  },
  tiktok: {
    label: 'TikTok',
    icon: 'bxl-tiktok',
    providers: ['tiktok', 'seeknow', 'seekria']
  },
  gaming: {
    label: 'Gaming',
    icon: 'bx-gamepad',
    providers: ['roblox', 'minecraft', 'xbox', 'steam', 'fivem']
  },
  social: {
    label: 'Social',
    icon: 'bx-group',
    providers: ['twitter', 'instagram', 'github', 'snapchat', 'reddit']
  },
  breach: {
    label: 'Breach',
    icon: 'bx-shield-alt',
    providers: ['snusbase', 'leakcheck', 'breachbase', 'intelvault', 'breachdirectory', 'hackcheck', 'osintkit', 'breachvip', 'leakosint']
  },
  network: {
    label: 'Network',
    icon: 'bx-globe',
    providers: ['ip', 'domain', 'dns', 'whois']
  },
  other: {
    label: 'Other',
    icon: 'bx-dots-horizontal-rounded',
    providers: ['intelx', 'osintcat', 'hudsonrock', 'leaksight', 'nbrs', 'room101', 'seon', 'memory', 'nosint', 'reconly', 'binlist', 'inf0sec', 'vin', 'propertyradar', 'datavoid', 'checko', 'medal', 'openarchive', 'wolfeye']
  }
}

// Social media logos - using favicons
const SOCIAL_LOGOS = {
  twitter: 'https://www.google.com/s2/favicons?domain=x.com&sz=64',
  instagram: 'https://www.google.com/s2/favicons?domain=instagram.com&sz=64',
  github: 'https://www.google.com/s2/favicons?domain=github.com&sz=64',
  snapchat: 'https://www.google.com/s2/favicons?domain=snapchat.com&sz=64',
  reddit: 'https://www.google.com/s2/favicons?domain=reddit.com&sz=64',
  discord: 'https://www.google.com/s2/favicons?domain=discord.com&sz=64',
  telegram: 'https://www.google.com/s2/favicons?domain=t.me&sz=64',
  tiktok: 'https://www.google.com/s2/favicons?domain=tiktok.com&sz=64'
}

// Provider logos
const PROVIDER_LOGOS = {
  datahound: 'https://www.google.com/s2/favicons?domain=datahound.tools&sz=64',
  osintcat: 'https://www.google.com/s2/favicons?domain=osintcat.net&sz=64',
  noticed: 'https://www.google.com/s2/favicons?domain=noticed.wtf&sz=64',
  snusbase: 'https://logos.osint.ly/snusbase.com',
  leakosint: 'https://www.google.com/s2/favicons?domain=leakosint.io&sz=64',
  leakcheck: 'https://logos.osint.ly/leakcheck.io',
  breachbase: 'https://www.google.com/s2/favicons?domain=breachbase.io&sz=64',
  intelvault: 'https://www.google.com/s2/favicons?domain=intelvault.io&sz=64',
  breachdirectory: 'https://logos.osint.ly/breachdirectory.org',
  hackcheck: 'https://www.google.com/s2/favicons?domain=hackcheck.io&sz=64',
  osintkit: 'https://www.google.com/s2/favicons?domain=osintkit.io&sz=64',
  breachvip: 'https://www.google.com/s2/favicons?domain=breachvip.io&sz=64',
  cordcat: 'https://www.google.com/s2/favicons?domain=cord.cat&sz=64',
  intelx: 'https://logos.osint.ly/intelx.io',
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
  tiktok: 'bx-tiktok',
  binlist: 'https://www.google.com/s2/favicons?domain=binlist.net&sz=64',
  inf0sec: 'https://www.google.com/s2/favicons?domain=inf0sec.xyz&sz=64',
  vin: 'https://www.google.com/s2/favicons?domain=vindecoderz.com&sz=64',
  propertyradar: 'https://www.google.com/s2/favicons?domain=propertyradar.com&sz=64',
  datavoid: 'https://www.google.com/s2/favicons?domain=datavoid.sh&sz=64',
  checko: 'https://www.google.com/s2/favicons?domain=checko.io&sz=64',
  github: 'bx-github',
  discord: 'bx-discord-alt',
  telegram: 'bx-telegram',
  snapchat: 'bx-snapchat',
  instagram: 'bx-instagram',
  medal: 'https://www.google.com/s2/favicons?domain=medal.tv&sz=64',
  openarchive: 'https://www.google.com/s2/favicons?domain=openarchive.lol&sz=64',
  wolfeye: 'https://www.wolfeye.xyz/logo.png',
  ip: 'https://www.google.com/s2/favicons?domain=ipinfo.io&sz=64',
  domain: 'https://www.google.com/s2/favicons?domain=who.is&sz=64',
  dns: 'https://www.google.com/s2/favicons?domain=dns.google&sz=64',
  whois: 'https://www.google.com/s2/favicons?domain=whois.com&sz=64',
  roblox: 'bx-game',
  minecraft: 'bx-cube',
  xbox: 'bx-xbox',
  steam: 'bx-steam',
  fivem: 'https://www.google.com/s2/favicons?domain=fivem.net&sz=64',
  twitter: 'bx-twitter',
  reddit: 'bx-reddit'
}


// Custom Node Component - Premium styling
const CustomNode = ({ data, selected }) => {
  const IconComponent = data.icon || QuestionMark
  
  return (
    <div className="relative flex flex-col items-center w-32 p-3">
      {/* Connection handles */}
      <Handle
        type="target"
        position={Position.Top}
        id="top"
        className="w-3 h-3 bg-white border-2 border-[#0a0a0f] rounded-full"
        style={{ top: '-6px' }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom"
        className="w-3 h-3 bg-white border-2 border-[#0a0a0f] rounded-full"
        style={{ bottom: '-6px' }}
      />
      <Handle
        type="target"
        position={Position.Left}
        id="left"
        className="w-3 h-3 bg-white border-2 border-[#0a0a0f] rounded-full"
        style={{ left: '-6px' }}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        className="w-3 h-3 bg-white border-2 border-[#0a0a0f] rounded-full"
        style={{ right: '-6px' }}
      />
      
      {/* Type label */}
      <div className="absolute -top-6 text-[10px] text-white/60 uppercase tracking-wider font-medium whitespace-nowrap">
        {data.type}
      </div>
      
      {/* Premium node circle */}
      <motion.div
        className="relative w-16 h-16 rounded-full flex items-center justify-center cursor-pointer"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.02) 100%)',
          border: selected ? '2px solid rgba(255,255,255,0.4)' : '1px solid rgba(255,255,255,0.15)',
          boxShadow: selected 
            ? '0 0 30px rgba(255,255,255,0.15), 0 0 0 1px rgba(255,255,255,0.1) inset'
            : '0 8px 24px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.05) inset',
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <IconComponent className="w-6 h-6 text-white/80" />
      </motion.div>
      
      {/* Value label */}
      <div className="mt-2 text-[10px] text-white/40 text-center max-w-full overflow-hidden text-ellipsis whitespace-nowrap font-medium">
        {data.label}
      </div>
    </div>
  )
}

// Register custom node type
const nodeTypes = {
  custom: CustomNode
}

const API_BASE = 'https://datawirecc-api.mynameisntnick0.workers.dev'
const SEARCH_COST = '0.10'

// Manual provider definitions - matching newapi.txt exactly
const MANUAL_PROVIDERS = {
  snusbase: [
    { name: 'search', description: 'Snusbase search', path: '/snusbase', queryParam: 'query', inputType: 'text', example: 'username or email' },
    { name: 'combo-lookup', description: 'Combo lookup', path: '/snusbase/combo-lookup', queryParam: 'query', inputType: 'text', example: 'username:password' },
    { name: 'hash-lookup', description: 'Hash lookup', path: '/snusbase/hash-lookup', queryParam: 'hash', inputType: 'text', example: 'md5_hash' },
    { name: 'ip-whois', description: 'IP WHOIS', path: '/snusbase/ip-whois', queryParam: 'ip', inputType: 'text', example: '1.1.1.1' }
  ],
  leakosint: [
    { name: 'search', description: 'LeakOSint search', path: '/leakosint', queryParam: 'query', inputType: 'text', example: 'username or email' }
  ],
  leakcheck: [
    { name: 'search', description: 'LeakCheck V2', path: '/leakcheck/v2', queryParam: 'query' }
  ],
  breachbase: [
    { name: 'search', description: 'BreachBase search', path: '/breachbase', queryParam: 'query', inputType: 'text', example: 'username or email' }
  ],
  intelvault: [
    { name: 'search', description: 'IntelVault search', path: '/intelvault', queryParam: 'query', inputType: 'text', example: 'username or email' },
    { name: 'breaches', description: 'IntelVault breaches', path: '/intelvault/breaches', queryParam: 'query', inputType: 'text', example: 'username or email' },
    { name: 'stealer-logs', description: 'IntelVault stealer logs', path: '/intelvault/stealer-logs', queryParam: 'query', inputType: 'text', example: 'username or email' }
  ],
  breachdirectory: [
    { name: 'search', description: 'BreachDirectory search', path: '/breachdirectory', queryParam: 'query', inputType: 'text', example: 'username or email' }
  ],
  hackcheck: [
    { name: 'search', description: 'HackCheck search', path: '/hackcheck', queryParam: 'query' }
  ],
  osintkit: [
    { name: 'search', description: 'OSINTKit search', path: '/osintkit', queryParam: 'query', inputType: 'text', example: 'username or email' }
  ],
  breachvip: [
    { name: 'search', description: 'BreachVIP search', path: '/breachvip', queryParam: 'query', inputType: 'text', example: 'username or email' }
  ],
  cordcat: [
    { name: 'search', description: 'Cordcat search', path: '/cordcat', queryParam: 'query', inputType: 'text', example: 'username or email' },
    { name: 'user', description: 'Cordcat user', path: '/cordcat/user', queryParam: 'id', inputType: 'text', example: '123456789012345678' },
    { name: 'invite', description: 'Cordcat invite', path: '/cordcat/invite', queryParam: 'code', inputType: 'text', example: 'invite_code' },
    { name: 'guild-widget', description: 'Cordcat guild widget', path: '/cordcat/guild-widget', queryParam: 'id', inputType: 'text', example: '123456789012345678' },
    { name: 'ip', description: 'Cordcat IP', path: '/cordcat/ip', queryParam: 'ip', inputType: 'text', example: '1.1.1.1' }
  ],
  intelx: [
    { name: 'download', description: 'IntelX file download', path: '/intelx', queryParam: 'query', inputType: 'text', example: 'search query' }
  ],
  osintcat: [
    { name: 'user', description: 'OsintCat user info', path: '/user', queryParam: '', inputType: 'none', example: '' },
    { name: 'breach', description: 'OsintCat breach lookup', path: '/breach', queryParam: 'query', inputType: 'text', example: 'username or email' },
    { name: 'discord', description: 'OsintCat Discord lookup', path: '/discord', queryParam: 'query', inputType: 'text', example: 'username or ID' },
    { name: 'roblox', description: 'OsintCat Roblox lookup', path: '/roblox', queryParam: 'query', inputType: 'text', example: 'username' },
    { name: 'discord-to-roblox', description: 'Discord to Roblox', path: '/discord-to-roblox', queryParam: 'query', inputType: 'text', example: '123456789012345678' },
    { name: 'email-osint', description: 'Email OSINT', path: '/email-osint', queryParam: 'email', inputType: 'email', example: 'user@domain.com' },
    { name: 'phone-osint', description: 'Phone OSINT', path: '/phone-osint', queryParam: 'phone', inputType: 'phone', example: '+1-555-123-4567' },
    { name: 'ip', description: 'IP Info', path: '/ip', queryParam: 'ip', inputType: 'text', example: '1.1.1.1' },
    { name: 'dns-resolver', description: 'DNS Resolver', path: '/dns-resolver', queryParam: 'domain', inputType: 'text', example: 'example.com' },
    { name: 'domain', description: 'Domain lookup', path: '/domain', queryParam: 'domain', inputType: 'text', example: 'example.com' },
    { name: 'user-footprint', description: 'Username footprint', path: '/user-footprint', queryParam: 'username', inputType: 'text', example: 'username' },
    { name: 'email-footprint', description: 'Email footprint', path: '/email-footprint', queryParam: 'email', inputType: 'email', example: 'user@domain.com' },
    { name: 'minecraft', description: 'Minecraft lookup', path: '/minecraft', queryParam: 'username', inputType: 'text', example: 'Steve123' },
    { name: 'minecraft-osint', description: 'Minecraft OSINT', path: '/minecraft-osint', queryParam: 'username', inputType: 'text', example: 'Steve123' },
    { name: 'vin', description: 'VIN lookup', path: '/vin', queryParam: 'vin', inputType: 'text', example: '1HGCM82633A123456' }
  ],
  xosint: [
    { name: 'search', description: 'XOSINT search', path: '/xosint/search', queryParam: 'query', inputType: 'text', example: 'username or email' }
  ],
  seeknow: [
    { name: 'search', description: 'Seeknow search', path: '/seeknow/search', queryParam: 'query', method: 'POST', inputType: 'text', example: 'username or email' },
    { name: 'stealer', description: 'Seeknow stealer', path: '/seeknow/stealer', queryParam: 'query', method: 'POST', inputType: 'text', example: 'username or email' },
    { name: 'discord-user', description: 'Discord user', path: '/seeknow/discord/user', queryParam: 'id', inputType: 'text', example: '123456789012345678' },
    { name: 'discord-to-roblox', description: 'Discord to Roblox', path: '/seeknow/discord/to-roblox', queryParam: 'id', inputType: 'text', example: '123456789012345678' },
    { name: 'github', description: 'GitHub username', path: '/seeknow/username/github', queryParam: 'username', inputType: 'text', example: 'username' },
    { name: 'twitter', description: 'Twitter username', path: '/seeknow/username/twitter', queryParam: 'username', inputType: 'text', example: '@username' },
    { name: 'tiktok', description: 'TikTok username', path: '/seeknow/username/tiktok', queryParam: 'username', inputType: 'text', example: '@username' },
    { name: 'reddit', description: 'Reddit username', path: '/seeknow/username/reddit', queryParam: 'username', inputType: 'text', example: 'username' },
    { name: 'social', description: 'Social username', path: '/seeknow/username/social', queryParam: 'username', inputType: 'text', example: 'username' },
    { name: 'history', description: 'Username history', path: '/seeknow/username/history', queryParam: 'username', inputType: 'text', example: 'username' },
    { name: 'network-ip', description: 'Network IP', path: '/seeknow/network/ip', queryParam: 'ip', inputType: 'text', example: '1.1.1.1' },
    { name: 'network-email-check', description: 'Network email check', path: '/seeknow/network/email-check', queryParam: 'email', inputType: 'email', example: 'user@domain.com' },
    { name: 'network-phone', description: 'Network phone', path: '/seeknow/network/phone', queryParam: 'phone', inputType: 'phone', example: '+1-555-123-4567' },
    { name: 'domain-intel', description: 'Domain intel', path: '/seeknow/domain/intel', queryParam: 'domain', inputType: 'text', example: 'example.com' },
    { name: 'domain-whois', description: 'Domain WHOIS', path: '/seeknow/domain/whois', queryParam: 'domain', inputType: 'text', example: 'example.com' },
    { name: 'xbox', description: 'Xbox gamertag', path: '/seeknow/gaming/xbox', queryParam: 'gamertag', inputType: 'text', example: 'Gamertag' },
    { name: 'roblox', description: 'Roblox username', path: '/seeknow/gaming/roblox', queryParam: 'username', inputType: 'text', example: 'username' },
    { name: 'minecraft', description: 'Minecraft username', path: '/seeknow/gaming/minecraft', queryParam: 'username', inputType: 'text', example: 'Steve123' }
  ],
  seekria: [
    { name: 'user-footprint', description: 'User footprint', path: '/seekria/user-footprint', queryParam: 'query', inputType: 'text', example: 'username or email' },
    { name: 'email-osint', description: 'Email OSINT', path: '/seekria/email-osint', queryParam: 'email', inputType: 'email', example: 'user@domain.com' },
    { name: 'domain-lookup', description: 'Domain lookup', path: '/seekria/domain-lookup', queryParam: 'domain', inputType: 'text', example: 'example.com' },
    { name: 'discord', description: 'Discord', path: '/seekria/discord', queryParam: 'id', inputType: 'text', example: '123456789012345678' },
    { name: 'roblox', description: 'Roblox', path: '/seekria/roblox', queryParam: 'username', inputType: 'text', example: 'username' },
    { name: 'minecraft', description: 'Minecraft', path: '/seekria/minecraft', queryParam: 'username', inputType: 'text', example: 'Steve123' },
    { name: 'ip', description: 'IP', path: '/seekria/ip', queryParam: 'ip', inputType: 'text', example: '1.1.1.1' },
    { name: 'dns-resolver', description: 'DNS resolver', path: '/seekria/dns-resolver', queryParam: 'domain', inputType: 'text', example: 'example.com' },
    { name: 'email-breach', description: 'Email breach', path: '/seekria/email-breach', queryParam: 'email', inputType: 'email', example: 'user@domain.com' },
    { name: 'username-breach', description: 'Username breach', path: '/seekria/username-breach', queryParam: 'username', inputType: 'text', example: 'username' },
    { name: 'phone-breach', description: 'Phone breach', path: '/seekria/phone-breach', queryParam: 'phone', inputType: 'phone', example: '+1-555-123-4567' },
    { name: 'discord-profile', description: 'Discord profile', path: '/seekria/discord-profile', queryParam: 'id', inputType: 'text', example: '123456789012345678' },
    { name: 'discord-to-rat', description: 'Discord to RAT', path: '/seekria/discord-to-rat', queryParam: 'id', inputType: 'text', example: '123456789012345678' },
    { name: 'fivem', description: 'FiveM', path: '/seekria/fivem', queryParam: 'identifier', inputType: 'text', example: 'license:abc123' },
    { name: 'minecraft-osint', description: 'Minecraft OSINT', path: '/seekria/minecraft-osint', queryParam: 'username', inputType: 'text', example: 'Steve123' },
    { name: 'name-history', description: 'Name history', path: '/seekria/name-history', queryParam: 'uuid', inputType: 'text', example: 'uuid' },
    { name: 'laby-stats', description: 'Laby stats', path: '/seekria/laby-stats', queryParam: 'username', inputType: 'text', example: 'Steve123' },
    { name: 'minecraft-texture', description: 'Minecraft texture', path: '/seekria/minecraft-texture', queryParam: 'uuid', inputType: 'text', example: 'uuid' },
    { name: 'tiktok-lookup', description: 'TikTok lookup', path: '/seekria/tiktok-lookup', queryParam: 'username', inputType: 'text', example: '@username' },
    { name: 'tiktok-breach', description: 'TikTok breach', path: '/seekria/tiktok-breach', queryParam: 'username', inputType: 'text', example: '@username' },
    { name: 'snusbase-breach', description: 'Snusbase breach', path: '/seekria/snusbase-breach', queryParam: 'query', inputType: 'text', example: 'username or email' },
    { name: 'leakcheck-breach', description: 'LeakCheck breach', path: '/seekria/leakcheck-breach', queryParam: 'query', inputType: 'text', example: 'username or email' }
  ],
  datahound: [
    { name: 'username', description: 'DataHound username OSINT', path: '/username', queryParam: 'query', inputType: 'text', example: 'username123' },
    { name: 'email', description: 'DataHound email OSINT', path: '/email', queryParam: 'query', inputType: 'email', example: 'user@domain.com' },
    { name: 'phone', description: 'DataHound phone OSINT', path: '/phone', queryParam: 'query', inputType: 'phone', example: '+1-555-123-4567' },
    { name: 'ip', description: 'DataHound IP OSINT', path: '/ip', queryParam: 'query', inputType: 'text', example: '1.1.1.1' },
    { name: 'stealer', description: 'DataHound stealer logs', path: '/stealer', queryParam: 'query', inputType: 'text', example: 'username or email' },
    { name: 'hudsonrock-ip', description: 'Hudson Rock IP', path: '/hudsonrock/ip', queryParam: 'query', inputType: 'text', example: '1.1.1.1' },
    { name: 'hudsonrock-email', description: 'Hudson Rock Email', path: '/hudsonrock/email', queryParam: 'query', inputType: 'email', example: 'user@domain.com' },
    { name: 'hudsonrock-username', description: 'Hudson Rock Username', path: '/hudsonrock/username', queryParam: 'query', inputType: 'text', example: 'username123' }
  ],
  wentyn: [
    { name: 'search', description: 'Wentyn search', path: '/wentyn', queryParam: 'query' }
  ],
  hudsonrock: [
    { name: 'search-by-domain', description: 'Search by domain', path: '/hudsonrock/search-by-domain', queryParam: 'domain', inputType: 'text', example: 'example.com' },
    { name: 'domain-overview', description: 'Domain overview', path: '/hudsonrock/search-by-domain/overview', queryParam: 'domain', inputType: 'text', example: 'example.com' },
    { name: 'domain-assessment', description: 'Domain assessment', path: '/hudsonrock/search-by-domain/assessment', queryParam: 'domain', inputType: 'text', example: 'example.com' },
    { name: 'domain-discovery', description: 'Domain discovery', path: '/hudsonrock/search-by-domain/discovery', queryParam: 'domain', inputType: 'text', example: 'example.com' },
    { name: 'login-emails', description: 'Login emails', path: '/hudsonrock/search-by-login/emails', queryParam: 'login', inputType: 'text', example: 'username' },
    { name: 'login-usernames', description: 'Login usernames', path: '/hudsonrock/search-by-login/usernames', queryParam: 'login', inputType: 'text', example: 'username' },
    { name: 'search-by-ip', description: 'Search by IP', path: '/hudsonrock/search-by-ip', queryParam: 'ip', inputType: 'text', example: '1.1.1.1' },
    { name: 'search-by-keyword', description: 'Search by keyword', path: '/hudsonrock/search-by-keyword', queryParam: 'keyword', inputType: 'text', example: 'keyword' },
    { name: 'keyword-urls', description: 'Keyword URLs', path: '/hudsonrock/search-by-keyword/urls', queryParam: 'keyword', inputType: 'text', example: 'keyword' },
    { name: 'stealer-infection', description: 'Stealer infection analysis', path: '/hudsonrock/search-by-stealer/infection-analysis', queryParam: 'query', inputType: 'text', example: 'username or email' }
  ],
  leaksight: [
    { name: 'search', description: 'Leaksight search', path: '/leaksight', queryParam: 'query', inputType: 'text', example: 'username or email' }
  ],
  nbrs: [
    { name: 'roblox', description: 'NBRS Roblox', path: '/nbrs/roblox', queryParam: 'id', inputType: 'text', example: '123456789' }
  ],
  room101: [
    { name: 'analyze', description: 'Room101 analyze', path: '/room101/analyze', queryParam: 'username', inputType: 'text', example: 'username' },
    { name: 'search', description: 'Room101 search', path: '/room101/search', queryParam: 'query', inputType: 'text', example: 'username or email' },
    { name: 'v2-search', description: 'Room101 V2 search', path: '/room101/v2/search', queryParam: 'query', inputType: 'text', example: 'username or email' },
    { name: 'user', description: 'Room101 user', path: '/room101/user', queryParam: 'username', inputType: 'text', example: 'username' },
    { name: 'subreddit', description: 'Room101 subreddit', path: '/room101/subreddit', queryParam: 'name', inputType: 'text', example: 'subreddit_name' }
  ],
  seon: [
    { name: 'phone', description: 'SEON phone', path: '/seon/phone', queryParam: 'phone', inputType: 'phone', example: '+1-555-123-4567' },
    { name: 'email', description: 'SEON email', path: '/seon/email', queryParam: 'email', inputType: 'email', example: 'user@domain.com' },
    { name: 'ip', description: 'SEON IP', path: '/seon/ip', queryParam: 'ip', inputType: 'text', example: '1.1.1.1' },
    { name: 'bin', description: 'SEON BIN', path: '/seon/bin', queryParam: 'bin', inputType: 'text', example: '123456' },
    { name: 'email-verification', description: 'SEON email verification', path: '/seon/email-verification', queryParam: 'email', inputType: 'email', example: 'user@domain.com' }
  ],
  oathnet: [
    { name: 'breach', description: 'Oathnet breach', path: '/oathnet/breach', queryParam: 'query', inputType: 'text', example: 'username or email' },
    { name: 'stealer', description: 'Oathnet stealer', path: '/oathnet/stealer', queryParam: 'query', inputType: 'text', example: 'username or email' },
    { name: 'stealer-subdomain', description: 'Stealer subdomain', path: '/oathnet/stealer-subdomain', queryParam: 'domain', inputType: 'text', example: 'example.com' },
    { name: 'victims', description: 'Victims list', path: '/oathnet/victims', queryParam: '', inputType: 'none', example: '' },
    { name: 'victim-info', description: 'Victim info', path: '/oathnet/victims/{log_id}', queryParam: 'log_id', pathIncludesQuery: true, inputType: 'text', example: 'log_12345' },
    { name: 'victim-file', description: 'Victim file', path: '/oathnet/victims/{log_id}/files/{file_id}', queryParam: 'log_id', pathIncludesQuery: true, extraParams: ['file_id'], inputType: 'text', example: 'log_12345' },
    { name: 'victim-archive', description: 'Victim archive', path: '/oathnet/victims/{log_id}/archive', queryParam: 'log_id', pathIncludesQuery: true, inputType: 'text', example: 'log_12345' },
    { name: 'discord-to-roblox', description: 'Discord to Roblox', path: '/oathnet/discord-to-roblox', queryParam: 'id', inputType: 'text', example: '123456789012345678' },
    { name: 'discord-userinfo', description: 'Discord userinfo', path: '/oathnet/discord-userinfo', queryParam: 'id', inputType: 'text', example: '123456789012345678' },
    { name: 'discord-username-history', description: 'Discord username history', path: '/oathnet/discord-username-history', queryParam: 'id', inputType: 'text', example: '123456789012345678' },
    { name: 'steam', description: 'Steam', path: '/oathnet/steam', queryParam: 'id', inputType: 'text', example: 'steam_id' },
    { name: 'xbox', description: 'Xbox', path: '/oathnet/xbox', queryParam: 'gamertag', inputType: 'text', example: 'Gamertag' },
    { name: 'roblox-userinfo', description: 'Roblox userinfo', path: '/oathnet/roblox-userinfo', queryParam: 'id', inputType: 'text', example: '123456789' },
    { name: 'mc-history', description: 'Minecraft history', path: '/oathnet/mc-history', queryParam: 'username', inputType: 'text', example: 'Steve123' },
    { name: 'ip-info', description: 'IP info', path: '/oathnet/ip-info', queryParam: 'ip', inputType: 'text', example: '1.1.1.1' },
    { name: 'holehe', description: 'Holehe', path: '/oathnet/holehe', queryParam: 'email', inputType: 'email', example: 'user@domain.com' },
    { name: 'ghunt', description: 'GHunt', path: '/oathnet/ghunt', queryParam: 'email', inputType: 'email', example: 'user@domain.com' },
    { name: 'extract-subdomain', description: 'Extract subdomain', path: '/oathnet/extract-subdomain', queryParam: 'domain', inputType: 'text', example: 'example.com' }
  ],
  memory: [
    { name: 'search', description: 'Memory.lol search', path: '/memory', queryParam: 'username', inputType: 'text', example: 'username' }
  ],
  nosint: [
    { name: 'search', description: 'NoSINT search', path: '/nosint/search', queryParam: 'query', inputType: 'text', example: 'username or email' },
    { name: 'ip', description: 'NoSINT IP', path: '/nosint/ip', queryParam: 'ip', inputType: 'text', example: '1.1.1.1' }
  ],
  reconly: [
    { name: 'search', description: 'Reconly search', path: '/reconly', queryParam: 'query', inputType: 'text', example: 'username or email' }
  ],
  tiktok: [
    { name: 'search', description: 'TikTok OSINT', path: '/tiktok', queryParam: 'username', inputType: 'text', example: '@username' }
  ],
  binlist: [
    { name: 'search', description: 'Binlist', path: '/binlist', queryParam: 'bin', inputType: 'text', example: '123456' }
  ],
  inf0sec: [
    { name: 'search', description: 'Inf0sec', path: '/inf0sec', queryParam: 'query', inputType: 'text', example: 'username or email' }
  ],
  vin: [
    { name: 'search', description: 'VIN Recorder', path: '/vin', queryParam: 'vin', inputType: 'text', example: '1HGCM82633A123456' }
  ],
  propertyradar: [
    { name: 'search', description: 'PropertyRadar search', path: '/propertyradar/search', queryParam: 'query', inputType: 'text', example: 'address or name' },
    { name: 'persons', description: 'PropertyRadar persons', path: '/propertyradar/persons', queryParam: 'query', inputType: 'text', example: 'name' },
    { name: 'phone', description: 'PropertyRadar phone', path: '/propertyradar/phone', queryParam: 'phone', inputType: 'phone', example: '+1-555-123-4567' },
    { name: 'email', description: 'PropertyRadar email', path: '/propertyradar/email', queryParam: 'email', inputType: 'email', example: 'user@domain.com' },
    { name: 'skiptrace', description: 'PropertyRadar skiptrace', path: '/propertyradar/skiptrace', queryParam: 'query', inputType: 'text', example: 'name or address' }
  ],
  datavoid: [
    { name: 'recovery', description: 'Datavoid recovery', path: '/datavoid/recovery', queryParam: 'query', inputType: 'text', example: 'username or email' },
    { name: 'us', description: 'Datavoid US', path: '/datavoid/us', queryParam: 'query', inputType: 'text', example: 'username or email' },
    { name: 'ca', description: 'Datavoid CA', path: '/datavoid/ca', queryParam: 'query', inputType: 'text', example: 'username or email' },
    { name: 'il', description: 'Datavoid IL', path: '/datavoid/il', queryParam: 'query', inputType: 'text', example: 'username or email' },
    { name: 'stealer', description: 'Datavoid stealer', path: '/datavoid/stealer', queryParam: 'query', inputType: 'text', example: 'username or email' },
    { name: 'geocode', description: 'Datavoid geocode', path: '/datavoid/geocode', queryParam: 'address', method: 'POST', inputType: 'text', example: '123 Main St, City' },
    { name: 'reverse-geocode', description: 'Datavoid reverse geocode', path: '/datavoid/reverse-geocode', queryParam: 'lat', method: 'POST', inputType: 'text', example: 'latitude,longitude' },
    { name: 'automotive', description: 'Datavoid automotive', path: '/datavoid/automotive', queryParam: 'query', inputType: 'text', example: 'VIN or plate' },
    { name: 'automotive-check', description: 'Datavoid automotive check', path: '/datavoid/automotive/check', queryParam: 'vin', inputType: 'text', example: '1HGCM82633A123456' },
    { name: 'company', description: 'Datavoid company', path: '/datavoid/company', queryParam: 'query', inputType: 'text', example: 'company name' },
    { name: 'discord', description: 'Datavoid Discord', path: '/datavoid/discord', queryParam: 'id', inputType: 'text', example: '123456789012345678' },
    { name: 'instagram', description: 'Datavoid Instagram', path: '/datavoid/instagram', queryParam: 'query', method: 'POST', inputType: 'text', example: 'username' },
    { name: 'twitter', description: 'Datavoid Twitter', path: '/datavoid/twitter', queryParam: 'query', inputType: 'text', example: '@username' },
    { name: 'google-docs', description: 'Datavoid Google Docs', path: '/datavoid/google-docs', queryParam: 'query', method: 'POST', inputType: 'text', example: 'email' },
    { name: 'fivem', description: 'Datavoid FiveM', path: '/datavoid/fivem', queryParam: 'identifier', inputType: 'text', example: 'license:abc123' },
    { name: 'roblox', description: 'Datavoid Roblox', path: '/datavoid/roblox', queryParam: 'username', inputType: 'text', example: 'username' }
  ],
  checko: [
    { name: 'search', description: 'Checko', path: '/checko', queryParam: 'query', inputType: 'text', example: 'username or email' }
  ],
  github: [
    { name: 'search', description: 'GitHub OSINT', path: '/github', queryParam: 'query', inputType: 'text', example: 'username or repo' }
  ],
  discord: [
    { name: 'user', description: 'Discord user', path: '/discord/user', queryParam: 'id', inputType: 'text', example: '123456789012345678' },
    { name: 'history', description: 'Discord history', path: '/discord/history', queryParam: 'query', inputType: 'text', example: 'username or email' },
    { name: 'export', description: 'Discord export', path: '/discord/export', queryParam: 'query', inputType: 'text', example: 'username or email' },
    { name: 'snowflake', description: 'Discord snowflake', path: '/discord/snowflake', queryParam: 'id', inputType: 'text', example: '123456789012345678' }
  ],
  telegram: [
    { name: 'username', description: 'Telegram username', path: '/telegram/username', queryParam: 'username', inputType: 'text', example: '@username' },
    { name: 'id', description: 'Telegram ID', path: '/telegram/id', queryParam: 'id', inputType: 'text', example: '123456789' },
    { name: 'phone', description: 'Telegram phone', path: '/telegram/phone', queryParam: 'phone', inputType: 'phone', example: '+1-555-123-4567' }
  ],
  snapchat: [
    { name: 'search', description: 'Snapchat OSINT', path: '/snapchat', queryParam: 'username', inputType: 'text', example: 'username' }
  ],
  instagram: [
    { name: 'search', description: 'Instagram OSINT', path: '/instagram', queryParam: 'query', inputType: 'text', example: 'username' },
    { name: 'id', description: 'Instagram ID', path: '/instagram/id', queryParam: 'id', inputType: 'text', example: '123456789' }
  ],
  medal: [
    { name: 'search', description: 'Medal.tv OSINT', path: '/medal', queryParam: 'username', inputType: 'text', example: 'username' }
  ],
  openarchive: [
    { name: 'search', description: 'Multi-source search', path: '/search', queryParam: 'query' },
    { name: 'source', description: 'Query OpenArchive source', path: '/source/openarchive', queryParam: 'query' },
    { name: 'sources', description: 'List available sources', path: '/sources', queryParam: '' },
    { name: 'usage', description: 'API usage statistics', path: '/usage', queryParam: '' },
    { name: 'status', description: 'API operational status', path: '/status', queryParam: '' }
  ],
  wolfeye: [
    { name: 'email', description: 'Email search', path: '/search', queryParam: 'q', inputType: 'email', example: 'target@domain.com' },
    { name: 'phone', description: 'Phone search', path: '/search', queryParam: 'q', inputType: 'phone', example: '+39 333 1234567' },
    { name: 'telegram', description: 'Telegram search', path: '/search', queryParam: 'q', inputType: 'text', example: '@username or 123456789' },
    { name: 'doxbin', description: 'Doxbin username search', path: '/search', queryParam: 'q', inputType: 'text', example: 'username' },
    { name: 'dox-search', description: 'Dox search', path: '/search', queryParam: 'q', inputType: 'text', example: 'First Last or nickname' },
    { name: 'fiscal-code', description: 'Fiscal code search', path: '/search', queryParam: 'q', inputType: 'text', example: 'RSSMRA85M01H501Z' },
    { name: 'vat-search', description: 'VAT search', path: '/search', queryParam: 'q', inputType: 'text', example: '12345678901 or DE123456789' },
    { name: 'business-search', description: 'Business search', path: '/search', queryParam: 'q', inputType: 'text', example: 'Acme Srl or P.IVA' },
    { name: 'iban-intel', description: 'IBAN intelligence', path: '/search', queryParam: 'q', inputType: 'text', example: 'IT60X0542811101000000123456' },
    { name: 'tax-id-search', description: 'Tax ID search', path: '/search', queryParam: 'q', inputType: 'text', example: 'CF, P.IVA, EIN, VAT or IBAN' },
    { name: 'partial-recovery', description: 'Partial recovery', path: '/search', queryParam: 'q', inputType: 'text', example: 'email or +39...' },
    { name: 'phone-to-email', description: 'Phone to email', path: '/search', queryParam: 'q', inputType: 'phone', example: '+39 333 1234567' },
    { name: 'email-to-phone', description: 'Email to phone', path: '/search', queryParam: 'q', inputType: 'email', example: 'target@domain.com' },
    { name: 'shadow-leak', description: 'Shadow leak search', path: '/search', queryParam: 'q', inputType: 'text', example: 'email, phone or username' },
    { name: 'fivem-hunter', description: 'FiveM hunter', path: '/search', queryParam: 'q', inputType: 'text', example: 'username, steam, license, discord id' },
    { name: 'discord-grave', description: 'Discord graveyard', path: '/search', queryParam: 'q', inputType: 'text', example: 'username, email or discord id' },
    { name: 'paypal-trace', description: 'PayPal trace', path: '/search', queryParam: 'q', inputType: 'text', example: 'email, username or IP' },
    { name: 'doordash', description: 'DoorDash recovery', path: '/search', queryParam: 'q', inputType: 'email', example: 'email' },
    { name: 'paypal', description: 'PayPal recovery', path: '/search', queryParam: 'q', inputType: 'email', example: 'email' },
    { name: 'dataavoid', description: 'DataAvoid recovery', path: '/search', queryParam: 'q', inputType: 'email', example: 'email' },
    { name: 'stripe', description: 'Stripe dashboard', path: '/search', queryParam: 'q', inputType: 'email', example: 'merchant@email.com' },
    { name: 'discord', description: 'Discord ID search', path: '/search', queryParam: 'q', inputType: 'text', example: '123456789012345678' },
    { name: 'ip', description: 'IP search', path: '/search', queryParam: 'q', inputType: 'text', example: '192.168.1.1' },
    { name: 'domain', description: 'Domain search', path: '/search', queryParam: 'q', inputType: 'text', example: 'example.com' },
    { name: 'folder', description: 'Folder analysis', path: '/search', queryParam: 'q', inputType: 'text', example: 'breach/subfolder' },
    { name: 'username', description: 'Username search', path: '/search', queryParam: 'q', inputType: 'text', example: 'handle' },
    { name: 'github', description: 'GitHub search', path: '/search', queryParam: 'q', inputType: 'text', example: 'username or github.com/owner/repo' },
    { name: 'minecraft', description: 'Minecraft search', path: '/search', queryParam: 'q', inputType: 'text', example: 'Steve123' },
    { name: 'fivem', description: 'FiveM search', path: '/search', queryParam: 'q', inputType: 'text', example: 'license:abc123 or username' },
    { name: 'wolflocate', description: 'WolfLocate photo upload', path: '/wolflocate', queryParam: '', inputType: 'file', example: 'Upload photo' },
    { name: 'health', description: 'Health check', path: '/health', queryParam: '', inputType: 'none', example: '' },
    { name: 'status', description: 'Plan and usage status', path: '/status', queryParam: '', inputType: 'none', example: '' },
    { name: 'analytics', description: 'Search statistics and history', path: '/analytics', queryParam: '', inputType: 'none', example: '' },
    { name: 'horus-modules', description: 'List Horus modules', path: '/horus/modules', queryParam: '', inputType: 'none', example: '' }
  ]
}



const Dashboard = () => {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [balance, setBalance] = useState('0.00')
  const [plan, setPlan] = useState(null)
  const [planExpiresAt, setPlanExpiresAt] = useState(null)
  const [dailyCredits, setDailyCredits] = useState(0)
  const [dailyIntelxUses, setDailyIntelxUses] = useState(0)
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)
  const [activeTab, setActiveTab] = useState('search')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [timeRemaining, setTimeRemaining] = useState(null)
  const [expiredModal, setExpiredModal] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())
  
  // OSINT Search State
  const [providers, setProviders] = useState(null)
  const [selectedProvider, setSelectedProvider] = useState('datahound')
  const [selectedCommand, setSelectedCommand] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('footprint')
  const [query, setQuery] = useState('')
  const [extraParams, setExtraParams] = useState({})
  const [searching, setSearch] = useState(false)
  const [searchResults, setSearchResults] = useState(null)
  const [searchHistory, setSearchHistory] = useState([])
  const [cooldown, setCooldown] = useState(false)
  const [providerDropdownOpen, setProviderDropdownOpen] = useState(false)
  const [searchMode, setSearchMode] = useState('main') // 'main' or 'provider'
  
  // IntelX State
  const [intelxSystemId, setIntelxSystemId] = useState('')
  const [intelxDownloading, setIntelxDownloading] = useState(false)
  
  // Geolocation State
  const [geoLocations, setGeoLocations] = useState([])
  const [showMap, setShowMap] = useState(false)
  const [manualInput, setManualInput] = useState({ value: '', type: 'address' })
  const [addingLocation, setAddingLocation] = useState(false)
  
  // Lead Mapping State - Graph
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [nodeSearch, setNodeSearch] = useState('')
  const [selectedEntityType, setSelectedEntityType] = useState('all')
  const [selectedRelationshipType, setSelectedRelationshipType] = useState('all')
  const [selectedNode, setSelectedNode] = useState(null)
  const [newLead, setNewLead] = useState({ type: '', value: '', source: '' })
  const [leadTypeDropdownOpen, setLeadTypeDropdownOpen] = useState(false)
  const [entityTypeDropdownOpen, setEntityTypeDropdownOpen] = useState(false)
  const [relationshipTypeDropdownOpen, setRelationshipTypeDropdownOpen] = useState(false)

  const getCategoryProviders = (category) => {
    const categoryData = PROVIDER_CATEGORIES[category]
    if (!categoryData) return []
    return categoryData.providers.filter(p => providers && providers[p])
  }

  const showToast = (message, type = 'info') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  useEffect(() => {
    fetchUserData()
    fetchProviders()
    
    // Update time every second
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    
    return () => clearInterval(timeInterval)
  }, [])

  useEffect(() => {
    if (planExpiresAt) {
      const checkExpiration = () => {
        const now = new Date()
        const expires = new Date(planExpiresAt)
        const diff = expires - now
        
        if (diff <= 0) {
          setTimeRemaining(null)
          setExpiredModal(true)
        } else {
          const days = Math.floor(diff / (1000 * 60 * 60 * 24))
          const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
          setTimeRemaining(`${days}d ${hours}h ${minutes}m`)
        }
      }
      
      checkExpiration()
      const interval = setInterval(checkExpiration, 60000)
      return () => clearInterval(interval)
    }
  }, [planExpiresAt])

  const fetchUserData = async () => {
    try {
      setLoading(true)
      
      const token = localStorage.getItem('auth_token')
      if (!token) {
        navigate('/login?return=/dashboard')
        return
      }
      
      const headers = { 'Authorization': `Bearer ${token}` }
      
      // Reset daily credits on login
      await fetch(`${API_BASE}/api/user/resetCredits`, { 
        method: 'POST',
        headers 
      })
      
      const [profileRes, balanceRes, txRes] = await Promise.all([
        fetch(`${API_BASE}/api/user/profile`, { headers }),
        fetch(`${API_BASE}/api/user/balance`, { headers }),
        fetch(`${API_BASE}/api/user/transactions`, { headers })
      ])

      if (profileRes.status === 401 || balanceRes.status === 401) {
        localStorage.removeItem('auth_token')
        navigate('/login?return=/dashboard')
        return
      }

      const profileData = await profileRes.json()
      const balanceData = await balanceRes.json()
      const txData = await txRes.json()

      if (profileData.success) setUser(profileData.user)
      if (balanceData.success) {
        setBalance(balanceData.balance)
        setPlan(balanceData.plan)
        setPlanExpiresAt(balanceData.planExpiresAt)
        setDailyCredits(balanceData.dailyCredits)
        setDailyIntelxUses(balanceData.dailyIntelxUses)
      }
      if (txData.success) setTransactions(txData.transactions || [])
    } catch (error) {
      console.error('Failed to fetch user data:', error)
      showToast('Failed to load user data', 'error')
      navigate('/login?return=/dashboard')
    } finally {
      setLoading(false)
    }
  }

  const fetchProviders = async () => {
    try {
      // Use manual providers instead of API call
      setProviders(MANUAL_PROVIDERS)
      setSelectedProvider('datahound')
      if (MANUAL_PROVIDERS.datahound && MANUAL_PROVIDERS.datahound[0]) {
        setSelectedCommand(MANUAL_PROVIDERS.datahound[0].name)
      }
    } catch (error) {
      console.error('Failed to load providers:', error)
    }
  }

  const handleSearch = async () => {
    if (!query.trim()) {
      showToast('Please enter a search query', 'error')
      return
    }

    if (!selectedCommand) {
      showToast('Please select a command', 'error')
      return
    }

    try {
      setSearch(true)
      const token = localStorage.getItem('auth_token')
      
      const response = await fetch(`${API_BASE}/api/osint/search`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          provider: selectedProvider,
          command: selectedCommand,
          query: query.trim(),
          extraParams: extraParams
        })
      })

      const data = await response.json()

      if (data.success) {
        setSearchResults(data.result)
        setBalance(data.balance)
        if (data.dailyCredits !== undefined) setDailyCredits(data.dailyCredits)
        if (data.dailyIntelxUses !== undefined) setDailyIntelxUses(data.dailyIntelxUses)
        setSearchHistory(prev => [{
          provider: selectedProvider,
          command: selectedCommand,
          query: query.trim(),
          result: data.result,
          timestamp: new Date()
        }, ...prev.slice(0, 9)])
        
        // Add node to graph automatically
        addNodeFromSearch(data.result, query.trim())
        
        // Extract geolocation data if present
        extractGeoLocation(data.result, query.trim())
        
        showToast('Search completed successfully', 'success')
        
        setCooldown(true)
        setTimeout(() => setCooldown(false), 2000)
      } else {
        showToast(data.error || 'Search failed', 'error')
      }
    } catch (error) {
      console.error('Search failed:', error)
      showToast('Search failed', 'error')
    } finally {
      setSearch(false)
    }
  }

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('auth_token')
      await fetch(`${API_BASE}/api/auth/logout`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      })
    } catch (error) {
      console.error('Logout failed:', error)
    }
    localStorage.removeItem('auth_token')
    navigate('/')
  }

  const extractGeoLocation = (result, query) => {
    if (!result || typeof result !== 'object') return
    
    const locations = []
    
    // Check for IP geolocation data - more comprehensive check
    if (result.ip || result.ip_info || result.location || result.geolocation || result.geo) {
      const ipData = result.ip_info || result.location || result.geolocation || result.geo || result
      if (ipData.lat && ipData.lng) {
        locations.push({
          lat: ipData.lat,
          lng: ipData.lng,
          title: `IP: ${query}`,
          address: ipData.city || ipData.country || ipData.region || 'Unknown',
          icon: 'bx-globe',
          color: '#ff6b6b',
          source: 'IP Geolocation'
        })
      } else if (ipData.latitude && ipData.longitude) {
        locations.push({
          lat: ipData.latitude,
          lng: ipData.longitude,
          title: `IP: ${query}`,
          address: ipData.city || ipData.country || ipData.region || 'Unknown',
          icon: 'bx-globe',
          color: '#ff6b6b',
          source: 'IP Geolocation'
        })
      }
    }
    
    // Check for phone number location
    if (result.phone_location || result.carrier || result.phone) {
      const phoneData = result.phone_location || result
      if (phoneData.lat && phoneData.lng) {
        locations.push({
          lat: phoneData.lat,
          lng: phoneData.lng,
          title: `Phone: ${query}`,
          address: phoneData.city || phoneData.country || 'Unknown',
          icon: 'bx-phone',
          color: '#4ecdc4',
          source: 'Phone Location'
        })
      }
    }
    
    // Check for domain/hosting location
    if (result.hosting || result.server_location || result.domain) {
      const hostingData = result.hosting || result.server_location || result
      if (hostingData.lat && hostingData.lng) {
        locations.push({
          lat: hostingData.lat,
          lng: hostingData.lng,
          title: `Domain: ${query}`,
          address: hostingData.city || hostingData.country || 'Unknown',
          icon: 'bx-world',
          color: '#ffe66d',
          source: 'Domain Hosting'
        })
      }
    }
    
    // Also check if the query itself looks like an IP and try to geocode it
    const ipRegex = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/
    if (ipRegex.test(query) && locations.length === 0) {
      // Try to geocode the IP directly using free API
      fetch(`https://ipwhois.app/json/${query}`, {
        headers: {
          'Accept': 'application/json'
        }
      })
        .then(res => {
          const contentType = res.headers.get('content-type');
          if (!contentType || !contentType.includes('application/json')) {
            throw new Error('API rate limited');
          }
          return res.json();
        })
        .then(data => {
          if (data.success && data.latitude && data.longitude) {
            setGeoLocations(prev => [...prev, {
              lat: data.latitude,
              lng: data.longitude,
              title: `IP: ${query}`,
              address: `${data.city}, ${data.region}, ${data.country}`,
              icon: 'bx-globe',
              color: '#ff6b6b',
              source: 'IP Geolocation'
            }])
            setShowMap(true)
          }
        })
        .catch(err => console.log('IP geocoding failed:', err))
    }
    
    if (locations.length > 0) {
      setGeoLocations(prev => [...prev, ...locations])
      setShowMap(true)
      showToast(`Found ${locations.length} location(s)`, 'success')
    }
  }

  const handleAddManualLocation = async () => {
    const { value, type } = manualInput
    
    if (!value.trim()) {
      showToast('Please enter a value', 'error')
      return
    }

    setAddingLocation(true)
    
    try {
      let locationData = null

      if (type === 'address') {
        // Use Nominatim (OpenStreetMap) for address geocoding
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(value)}`)
        const data = await response.json()
        if (data && data.length > 0) {
          locationData = {
            lat: parseFloat(data[0].lat),
            lng: parseFloat(data[0].lon),
            title: value,
            address: data[0].display_name,
            icon: 'bx-map',
            color: '#ff6b6b',
            source: 'Address Geocoding'
          }
        }
      } else if (type === 'ip') {
        // Use worker API for IP geolocation
        const token = localStorage.getItem('auth_token')
        const response = await fetch(`${API_BASE}/api/geolocation/ip?ip=${encodeURIComponent(value)}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        const data = await response.json()
        if (data.success) {
          locationData = {
            lat: data.lat,
            lng: data.lon,
            title: `IP: ${value}`,
            address: `${data.city}, ${data.region}, ${data.country}`,
            icon: 'bx-globe',
            color: '#4ecdc4',
            source: 'IP Geolocation'
          }
        } else {
          throw new Error(data.error || 'IP geolocation failed')
        }
      } else if (type === 'phone') {
        // Extract area code and use approximate location
        const cleanedPhone = value.replace(/\D/g, '')
        if (cleanedPhone.length >= 3) {
          const areaCode = cleanedPhone.substring(0, 3)
          // US area code approximate locations
          const areaCodeLocations = {
            '212': { lat: 40.7128, lng: -74.0060, city: 'New York, NY' },
            '310': { lat: 34.0522, lng: -118.2437, city: 'Los Angeles, CA' },
            '415': { lat: 37.7749, lng: -122.4194, city: 'San Francisco, CA' },
            '312': { lat: 41.8781, lng: -87.6298, city: 'Chicago, IL' },
            '617': { lat: 42.3601, lng: -71.0589, city: 'Boston, MA' },
            '305': { lat: 25.7617, lng: -80.1918, city: 'Miami, FL' },
            '206': { lat: 47.6062, lng: -122.3321, city: 'Seattle, WA' },
            '713': { lat: 29.7604, lng: -95.3698, city: 'Houston, TX' },
            '404': { lat: 33.7490, lng: -84.3880, city: 'Atlanta, GA' },
            '303': { lat: 39.7392, lng: -104.9903, city: 'Denver, CO' },
          }
          
          if (areaCodeLocations[areaCode]) {
            locationData = {
              lat: areaCodeLocations[areaCode].lat,
              lng: areaCodeLocations[areaCode].lng,
              title: `Phone: ${value}`,
              address: `Area Code ${areaCode} - ${areaCodeLocations[areaCode].city}`,
              icon: 'bx-phone',
              color: '#ffe66d',
              source: 'Phone Area Code'
            }
          } else {
            // Default to US center if area code not found
            locationData = {
              lat: 39.8283,
              lng: -98.5795,
              title: `Phone: ${value}`,
              address: `Area Code ${areaCode} - Unknown location (US)`,
              icon: 'bx-phone',
              color: '#ffe66d',
              source: 'Phone Area Code'
            }
          }
        }
      } else if (type === 'email') {
        // Extract domain and geocode
        const domain = value.split('@')[1]
        if (domain) {
          const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(domain)}`)
          const data = await response.json()
          if (data && data.length > 0) {
            locationData = {
              lat: parseFloat(data[0].lat),
              lng: parseFloat(data[0].lon),
              title: `Email: ${value}`,
              address: `Domain: ${domain} - ${data[0].display_name}`,
              icon: 'bx-envelope',
              color: '#a855f7',
              source: 'Email Domain'
            }
          }
        }
      }

      if (locationData) {
        setGeoLocations(prev => [...prev, locationData])
        setManualInput({ value: '', type: 'address' })
        showToast('Location added successfully', 'success')
      } else {
        showToast('Could not find location for this input', 'error')
      }
    } catch (error) {
      console.error('Error geocoding:', error)
      showToast('Error geocoding location', 'error')
    } finally {
      setAddingLocation(false)
    }
  }

  const handleIntelxDownload = async () => {
    if (!intelxSystemId.trim()) {
      showToast('Please enter a System ID', 'error')
      return
    }
    
    try {
      setIntelxDownloading(true)
      const token = localStorage.getItem('auth_token')
      
      const response = await fetch(`${API_BASE}/api/osint/search`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          provider: 'intelx',
          command: 'download',
          query: intelxSystemId.trim()
        })
      })

      const data = await response.json()
      console.log('IntelX download response:', data)
      
      if (data.success) {
        setBalance(data.balance)
        if (data.dailyCredits !== undefined) setDailyCredits(data.dailyCredits)
        if (data.dailyIntelxUses !== undefined) setDailyIntelxUses(data.dailyIntelxUses)
        
        // Handle different response formats
        const result = data.result || data
        console.log('IntelX result:', result)
        
        // Handle binary download as .txt with ASCII art
        if (result.binary || result.file || result.data) {
          const binaryData = result.binary || result.file || result.data
          const downloadedBytes = result.downloadedBytes || result.size || binaryData.length
          
          // Format the data with proper line breaks
          const formattedData = binaryData.replace(/\\r\\n/g, '\n').replace(/\\n/g, '\n')
          
          const asciiArt = `██████╗  █████╗ ████████╗ █████╗ ██╗    ██╗██╗██████╗ ███████╗    ██████╗ ██████╗
██╔══██╗██╔══██╗╚══██╔══╝██╔══██╗██║    ██║██║██╔══██╗██╔════╝   ██╔════╝██╔════╝
██║  ██║███████║   ██║   ███████║██║ █╗ ██║██║██████╔╝█████╗     ██║     ██║     
██║  ██║██╔══██║   ██║   ██╔══██║██║███╗██║██║██╔══██╗██╔══╝     ██║     ██║     
██████╔╝██║  ██║   ██║   ██║  ██║╚███╔███╔╝██║██║  ██║███████╗██╗╚██████╗╚██████╗
╚═════╝ ╚═╝  ╚═╝   ╚═╝   ╚═╝  ╚═╝ ╚══╝╚══╝ ╚═╝╚═╝  ╚═╝╚══════╝╚═╝ ╚═════╝ ╚═════╝
                                                                                 

IntelX File Download
System ID: ${intelxSystemId}
Downloaded: ${new Date().toLocaleString()}
File Size: ${downloadedBytes} bytes
══════════════════════════════════════════════════════════════

Downloaded Data:
${formattedData}

══════════════════════════════════════════════════════════════
Powered by https://datawire.cc
Lookup made by https://datawire.cc
`;
          const blob = new Blob([asciiArt], { type: 'text/plain' })
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = `intelx-${intelxSystemId}.txt`
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
          setTimeout(() => URL.revokeObjectURL(url), 100)
          showToast('File downloaded successfully', 'success')
        } else if (result.url || result.downloadUrl) {
          // Handle URL-based download
          const downloadUrl = result.url || result.downloadUrl
          const a = document.createElement('a')
          a.href = downloadUrl
          a.download = `intelx-${intelxSystemId}`
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
          showToast('File downloaded successfully', 'success')
        } else {
          // Handle raw result
          const asciiArt = `██████╗  █████╗ ████████╗ █████╗ ██╗    ██╗██╗██████╗ ███████╗    ██████╗ ██████╗
██╔══██╗██╔══██╗╚══██╔══╝██╔══██╗██║    ██║██║██╔══██╗██╔════╝   ██╔════╝██╔════╝
██║  ██║███████║   ██║   ███████║██║ █╗ ██║██║██████╔╝█████╗     ██║     ██║     
██║  ██║██╔══██║   ██║   ██╔══██║██║███╗██║██║██╔══██╗██╔══╝     ██║     ██║     
██████╔╝██║  ██║   ██║   ██║  ██║╚███╔███╔╝██║██║  ██║███████╗██╗╚██████╗╚██████╗
╚═════╝ ╚═╝  ╚═╝   ╚═╝   ╚═╝  ╚═╝ ╚══╝╚══╝ ╚═╝╚═╝  ╚═╝╚══════╝╚═╝ ╚═════╝ ╚═════╝
                                                                                 

IntelX File Download
System ID: ${intelxSystemId}
Downloaded: ${new Date().toLocaleString()}
══════════════════════════════════════════════════════════════

Result Data:
${JSON.stringify(result, null, 2)}

══════════════════════════════════════════════════════════════
Powered by https://datawire.cc
Lookup made by https://datawire.cc
`;
          const blob = new Blob([asciiArt], { type: 'text/plain' })
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = `intelx-${intelxSystemId}.txt`
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
          setTimeout(() => URL.revokeObjectURL(url), 100)
          showToast('File downloaded successfully', 'success')
        }
      } else {
        showToast(data.error || 'Download failed', 'error')
      }
    } catch (error) {
      console.error('IntelX download failed:', error)
      showToast('Download failed', 'error')
    } finally {
      setIntelxDownloading(false)
    }
  }

  const addLeadConnection = () => {
    if (!newLead.type || !newLead.value) {
      showToast('Please fill in lead type and value', 'error')
      return
    }
    
    setLeadConnections(prev => [...prev, {
      ...newLead,
      id: Date.now(),
      timestamp: new Date()
    }])
    setNewLead({ type: '', value: '', source: '' })
    showToast('Lead connection added', 'success')
  }

  const removeLeadConnection = (id) => {
    setLeadConnections(prev => prev.filter(lead => lead.id !== id))
    showToast('Lead connection removed', 'success')
  }

  // Graph functions
  const onConnect = (params) => {
    setEdges((eds) => addEdge({ ...params, markerEnd: { type: MarkerType.ArrowClosed } }, eds))
  }

  const getEntityIcon = (type) => {
    const icons = {
      email: Envelope,
      phone: Phone,
      ip: Globe,
      crypto: Database,
      username: User,
      domain: World,
      name: User,
      unknown: QuestionMark
    }
    return icons[type] || icons.unknown
  }

  const addNodeFromSearch = (result, searchQuery) => {
    const newNodeId = `node-${Date.now()}`
    const entityType = determineEntityType(searchQuery)
    const newNode = {
      id: newNodeId,
      type: 'custom',
      position: { x: Math.random() * 400, y: Math.random() * 400 },
      data: { 
        label: searchQuery,
        type: entityType,
        source: 'OSINT Search',
        icon: getEntityIcon(entityType)
      }
    }
    setNodes((nds) => [...nds, newNode])
    
    // Auto-connect to existing nodes with matching values
    autoConnectNodes(newNodeId, searchQuery, result)
  }

  const determineEntityType = (value) => {
    if (value.includes('@')) return 'email'
    if (/^\d{10,15}$/.test(value)) return 'phone'
    if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(value)) return 'ip'
    if (value.startsWith('0x')) return 'crypto'
    if (value.match(/^[a-f0-9]{32}$/i)) return 'md5'
    if (value.match(/^[a-f0-9]{40}$/i)) return 'sha1'
    if (value.match(/^[a-f0-9]{64}$/i)) return 'sha256'
    return 'unknown'
  }

  const autoConnectNodes = (newNodeId, query, result) => {
    const connections = []
    
    nodes.forEach(node => {
      const nodeValue = node.data.label.toLowerCase()
      const queryLower = query.toLowerCase()
      
      // Check for shared identifiers
      if (nodeValue === queryLower) {
        connections.push({
          id: `edge-${Date.now()}-${node.id}`,
          source: newNodeId,
          target: node.id,
          label: 'same_value',
          type: 'smoothstep',
          animated: true,
          style: { stroke: '#ffffff', strokeWidth: 2 },
          markerEnd: { type: MarkerType.ArrowClosed }
        })
      }
      
      // Check for email/phone/IP matches in result data
      if (result && typeof result === 'object') {
        const resultStr = JSON.stringify(result).toLowerCase()
        if (resultStr.includes(nodeValue)) {
          connections.push({
            id: `edge-${Date.now()}-${node.id}`,
            source: newNodeId,
            target: node.id,
            label: 'found_in_result',
            type: 'smoothstep',
            animated: true,
            style: { stroke: '#ffffff', strokeWidth: 2 },
            markerEnd: { type: MarkerType.ArrowClosed }
          })
        }
      }
    })
    
    setEdges((eds) => [...eds, ...connections])
  }

  const addManualNode = (type, value, source) => {
    const newNodeId = `node-${Date.now()}`
    const newNode = {
      id: newNodeId,
      type: 'custom',
      position: { x: Math.random() * 400, y: Math.random() * 400 },
      data: { 
        label: value,
        type: type,
        source: source,
        icon: getEntityIcon(type)
      }
    }
    setNodes((nds) => [...nds, newNode])
  }

  const deleteNode = (nodeId) => {
    setNodes((nds) => nds.filter((n) => n.id !== nodeId))
    setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId))
  }

  const mergeNodes = (nodeId1, nodeId2) => {
    const node1 = nodes.find(n => n.id === nodeId1)
    const node2 = nodes.find(n => n.id === nodeId2)
    if (!node1 || !node2) return
    
    const mergedLabel = `${node1.data.label} + ${node2.data.label}`
    const mergedNode = {
      ...node1,
      data: {
        ...node1.data,
        label: mergedLabel
      }
    }
    
    setNodes((nds) => nds.filter((n) => n.id !== nodeId1 && n.id !== nodeId2).concat(mergedNode))
    setEdges((eds) => eds.filter((e) => e.source !== nodeId2 && e.target !== nodeId2).map((e) => {
      if (e.source === nodeId1) return { ...e, source: mergedNode.id }
      if (e.target === nodeId1) return { ...e, target: mergedNode.id }
      return e
    }))
  }

  const filterNodes = () => {
    let filtered = nodes
    
    if (nodeSearch) {
      filtered = filtered.filter(n => 
        n.data.label.toLowerCase().includes(nodeSearch.toLowerCase()) ||
        n.data.type.toLowerCase().includes(nodeSearch.toLowerCase())
      )
    }
    
    if (selectedEntityType !== 'all') {
      filtered = filtered.filter(n => n.data.type === selectedEntityType)
    }
    
    return filtered
  }

  const filterEdges = () => {
    let filtered = edges
    
    if (selectedRelationshipType !== 'all') {
      filtered = filtered.filter(e => e.label === selectedRelationshipType)
    }
    
    return filtered
  }

  const clearGraph = () => {
    setNodes([])
    setEdges([])
    showToast('Graph cleared', 'success')
  }

  const exportGraph = () => {
    const timestamp = new Date().toLocaleString()
    let output = `══════════════════════════════════════════════════════════════\n`
    output += `                    OSINT LEAD MAPPING EXPORT\n`
    output += `══════════════════════════════════════════════════════════════\n`
    output += `Exported: ${timestamp}\n`
    output += `Total Nodes: ${nodes.length}\n`
    output += `Total Connections: ${edges.length}\n`
    output += `══════════════════════════════════════════════════════════════\n\n`

    output += `██████╗  █████╗ ████████╗ █████╗ ██╗    ██╗██╗██████╗ ███████╗    ██████╗ ██████╗\n`
    output += `██╔══██╗██╔══██╗╚══██╔══╝██╔══██╗██║    ██║██║██╔══██╗██╔════╝   ██╔════╝██╔════╝\n`
    output += `██║  ██║███████║   ██║   ███████║██║ █╗ ██║██║██████╔╝█████╗     ██║     ██║     \n`
    output += `██║  ██║██╔══██║   ██║   ██╔══██║██║███╗██║██║██╔══██╗██╔══╝     ██║     ██║     \n`
    output += `██████╔╝██║  ██║   ██║   ██║  ██║╚███╔███╔╝██║██║  ██║███████╗██╗╚██████╗╚██████╗\n`
    output += `╚═════╝ ╚═╝  ╚═╝   ╚═╝   ╚═╝  ╚═╝ ╚══╝╚══╝ ╚═╝╚═╝  ╚═╝╚══════╝╚═╝ ╚═════╝ ╚═════╝\n`
    output += `                                                                                  \n\n`
    output += `══════════════════════════════════════════════════════════════\n\n`

    output += `┌─────────────────────────────────────────────────────────────┐\n`
    output += `│                        NODES                                    │\n`
    output += `└─────────────────────────────────────────────────────────────┘\n\n`

    nodes.forEach((node, index) => {
      output += `Node ${index + 1}:\n`
      output += `  Type: ${node.data.type}\n`
      output += `  Value: ${node.data.label}\n`
      output += `  Source: ${node.data.source || 'Manual'}\n`
      output += `  Position: X=${Math.round(node.position.x)}, Y=${Math.round(node.position.y)}\n`
      output += `  ───────────────────────────────────────────────────────────\n`
    })

    output += `\n┌─────────────────────────────────────────────────────────────┐\n`
    output += `│                    CONNECTIONS                               │\n`
    output += `└─────────────────────────────────────────────────────────────┘\n\n`

    edges.forEach((edge, index) => {
      const sourceNode = nodes.find(n => n.id === edge.source)
      const targetNode = nodes.find(n => n.id === edge.target)
      output += `Connection ${index + 1}:\n`
      output += `  From: ${sourceNode?.data.label || edge.source} (${sourceNode?.data.type || 'unknown'})\n`
      output += `  To: ${targetNode?.data.label || edge.target} (${targetNode?.data.type || 'unknown'})\n`
      output += `  Relationship: ${edge.label || 'connected'}\n`
      output += `  ───────────────────────────────────────────────────────────\n`
    })

    output += `\n══════════════════════════════════════════════════════════════\n`
    output += `DATAWIRE.CC OSINT MAPPING - END OF EXPORT\n`
    output += `Powered by https://datawire.cc\n`
    output += `══════════════════════════════════════════════════════════════\n`

    output += `\n\n<!-- DATAWIRE.CC_JSON_START -->\n`
    output += JSON.stringify({ nodes, edges, timestamp }, null, 2)
    output += `\n<!-- DATAWIRE.CC_JSON_END -->`

    const blob = new Blob([output], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `osint-mapping-${Date.now()}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    showToast('Mapping exported successfully', 'success')
  }

  const importGraph = (event) => {
    const file = event.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target.result
      const jsonMatch = content.match(/<!-- DATAWIRE.CC_JSON_START -->([\s\S]*?)<!-- DATAWIRE.CC_JSON_END -->/)
      
      if (jsonMatch) {
        try {
          const data = JSON.parse(jsonMatch[1].trim())
          setNodes(data.nodes || [])
          setEdges(data.edges || [])
          showToast('Mapping imported successfully', 'success')
        } catch (error) {
          showToast('Failed to parse mapping data', 'error')
        }
      } else {
        showToast('Invalid mapping file format', 'error')
      }
    }
    reader.readAsText(file)
    
    event.target.value = ''
  }

  const saveGraphLayout = () => {
    const layout = { nodes, edges }
    localStorage.setItem('osint-graph-layout', JSON.stringify(layout))
    showToast('Graph layout saved', 'success')
  }

  const loadGraphLayout = () => {
    const saved = localStorage.getItem('osint-graph-layout')
    if (saved) {
      const layout = JSON.parse(saved)
      setNodes(layout.nodes)
      setEdges(layout.edges)
      showToast('Graph layout loaded', 'success')
    } else {
      showToast('No saved layout found', 'error')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
          <p className="text-white/50">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  const currentCommands = providers?.[selectedProvider] || []

  // Prepare dropdown options
  const providerOptions = providers ? Object.keys(providers).map(provider => ({
    value: provider,
    label: provider.charAt(0).toUpperCase() + provider.slice(1)
  })) : []

  const commandOptions = currentCommands.map(cmd => ({
    value: cmd.name,
    label: `${cmd.name} - ${cmd.description}`
  }))

  const sidebarItems = [
    { id: 'search', icon: Search, label: 'Search' },
    { id: 'ai-osint', icon: Brain, label: 'AI OSINT' },
    { id: 'intelx', icon: CloudDownload, label: 'IntelX' },
    { id: 'geolocation', icon: Map, label: 'Geolocation' },
    { id: 'mapping', icon: Link2, label: 'Lead Mapping' },
    { id: 'history', icon: History, label: 'Search History' },
    { id: 'transactions', icon: Receipt, label: 'Transactions' },
    { id: 'settings', icon: Settings, label: 'Settings' }
  ]

  return (
    <div className="min-h-screen bg-background text-white flex">
      <PremiumBackground />
      
      {/* Sidebar */}
      <div className={`fixed lg:relative z-50 w-72 h-screen lg:h-auto bg-surface/80 backdrop-blur-xl border-r border-border flex flex-col transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        {/* Logo */}
        <div className="p-6 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-3">
            <img 
              src="https://i.ibb.co/wFrNvxt5/Chat-GPT-Image-Jul-6-2026-09-02-01-PM-removebg-preview.png" 
              alt="DataWire" 
              className="w-10 h-10 rounded-xl"
              onError={(e) => {
                e.target.style.display = 'none'
                e.target.nextSibling.style.display = 'flex'
              }}
            />
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center border border-white/10 hidden">
              <span className="text-xl font-bold text-white">DW</span>
            </div>
            <div>
              <h1 className="font-bold text-lg tracking-tight">Datawire.cc</h1>
              <p className="text-xs text-white/40 tracking-wider uppercase">OSINT Platform</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto custom-scrollbar">
          {/* Main Navigation Items */}
          {sidebarItems.map((item, index) => {
            const IconComponent = item.icon
            return (
              <motion.button
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
                whileHover={{ scale: 1.02, x: 4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setActiveTab(item.id)
                  if (item.id === 'search') setSearchMode('main')
                  setSidebarOpen(false)
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 transition-all border-l-2 relative overflow-hidden rounded-lg ${
                  activeTab === item.id 
                    ? 'bg-white/10 text-white border-white' 
                    : 'text-white/50 border-transparent hover:bg-white/5 hover:text-white'
                }`}
              >
                <AnimatePresence>
                  {activeTab === item.id && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent"
                    />
                  )}
                </AnimatePresence>
                <IconComponent className="w-5 h-5 relative z-10" />
                <span className="font-medium tracking-wide text-sm relative z-10">{item.label}</span>
              </motion.button>
            )
          })}

          {/* Providers Section */}
          <div className="mt-6 pt-4 border-t border-border">
            <p className="text-xs text-white/30 uppercase tracking-wider mb-3 px-4 font-medium">Providers</p>
            <div className="space-y-1 max-h-96 overflow-y-auto custom-scrollbar">
              {Object.keys(providers || {}).map((provider) => {
                const logoUrl = PROVIDER_LOGOS[provider]
                
                return (
                  <motion.button
                    key={provider}
                    whileHover={{ scale: 1.02, x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setSelectedProvider(provider)
                      setSelectedCommand(providers?.[provider]?.[0]?.name || '')
                      setActiveTab('search')
                      setSearchMode('provider')
                      setSidebarOpen(false)
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 transition-all border-l-2 rounded-lg ${
                      selectedProvider === provider && activeTab === 'search' && searchMode === 'provider'
                        ? 'bg-white/10 text-white border-white' 
                        : 'text-white/50 border-transparent hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                      {logoUrl && !logoUrl.startsWith('bx-') ? (
                        <img 
                          src={logoUrl} 
                          alt={provider}
                          className="w-5 h-5 rounded"
                          onError={(e) => {
                            e.target.style.display = 'none'
                            e.target.nextSibling.style.display = 'flex'
                          }}
                        />
                      ) : null}
                      <QuestionMark className="w-4 h-4 hidden" />
                    </div>
                    <span className="font-medium text-sm capitalize">{provider}</span>
                  </motion.button>
                )
              })}
            </div>
          </div>
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 mb-4">
            {user?.avatar && user?.id ? (
              <img 
                src={`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`}
                alt={user.username}
                className="w-10 h-10 rounded-xl border border-white/20"
                onError={(e) => {
                  e.target.style.display = 'none'
                  e.target.nextSibling.style.display = 'flex'
                }}
              />
            ) : user?.discriminator ? (
              <img 
                src={`https://cdn.discordapp.com/embed/avatars/${parseInt(user.discriminator) % 5}.png`}
                alt={user.username}
                className="w-10 h-10 rounded-xl border border-white/20"
                onError={(e) => {
                  e.target.style.display = 'none'
                  e.target.nextSibling.style.display = 'flex'
                }}
              />
            ) : null}
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20 hidden">
              <span className="font-bold text-white text-sm">
                {user?.username?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate text-sm">{user?.global_name || user?.username}</p>
              {plan ? (
                <p className="text-xs text-white/40 font-mono capitalize">{plan} Plan</p>
              ) : (
                <p className="text-xs text-white/40 font-mono">${balance} USD</p>
              )}
            </div>
          </div>
          {plan && (
            <div className="space-y-2 mb-4">
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center justify-between text-xs"
              >
                <span className="text-white/40">Daily Credits:</span>
                <span className="text-white font-semibold font-mono">{dailyCredits}</span>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="flex items-center justify-between text-xs"
              >
                <span className="text-white/40">IntelX Uses:</span>
                <span className="text-white font-semibold font-mono">{dailyIntelxUses}</span>
              </motion.div>
              {planExpiresAt && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="flex items-center justify-between text-xs"
                >
                  <span className="text-white/40">Expires:</span>
                  <span className="text-white font-semibold font-mono">
                    {timeRemaining || new Date(planExpiresAt).toLocaleDateString()}
                  </span>
                </motion.div>
              )}
            </div>
          )}
          <div className="space-y-2">
            <Button
              onClick={() => navigate('/purchase')}
              variant="primary"
              size="sm"
              className="w-full"
            >
              <DollarSign className="w-4 h-4 mr-2" />
              Add Funds
            </Button>
            <Button
              onClick={() => navigate('/')}
              variant="secondary"
              size="sm"
              className="w-full"
            >
              Back to Site
            </Button>
            <Button
              onClick={handleLogout}
              variant="danger"
              size="sm"
              className="w-full"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col relative z-10">
        {/* Top Bar */}
        <motion.div 
          className="h-16 bg-surface/80 backdrop-blur-xl border-b border-border flex items-center justify-between px-4 md:px-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-4">
            <motion.button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="lg:hidden p-2 text-white/50 hover:text-white transition-colors"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </motion.button>
            <motion.h2 
              className="text-lg font-semibold tracking-tight capitalize"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              key={activeTab}
            >
              {activeTab}
            </motion.h2>
          </div>
          <div className="flex items-center gap-4 md:gap-6">
            <motion.div 
              className="text-sm text-white/50"
              whileHover={{ scale: 1.05 }}
            >
              Available Searches: <span className="text-white font-semibold font-mono">
                {Math.floor(parseFloat(balance) / parseFloat(SEARCH_COST))}
              </span>
            </motion.div>
            <motion.div 
              className="text-sm text-white/50 hidden md:block"
              whileHover={{ scale: 1.05 }}
            >
              Plan: <span className="text-white font-semibold font-mono capitalize">
                {plan || 'No Plan'}
              </span>
            </motion.div>
            <motion.div 
              className="text-sm text-white/50 font-mono hidden md:block"
              whileHover={{ scale: 1.05 }}
            >
              {currentTime.toLocaleTimeString()}
            </motion.div>
          </div>
        </motion.div>

        {/* Content Area */}
        <div className="flex-1 p-4 md:p-8 overflow-y-auto custom-scrollbar">
          {activeTab === 'search' && (
            <div className="max-w-5xl mx-auto space-y-8">
              {/* Main Search Form - only shown when searchMode is 'main' */}
              {searchMode === 'main' && (
                <GlassCard className="p-8">
                  <motion.div 
                    className="flex items-center gap-3 mb-8"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <div className="w-1 h-8 bg-white/80 rounded-full" />
                    <h3 className="text-xl font-semibold tracking-tight">OSINT Search</h3>
                  </motion.div>
                  
                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <Dropdown
                      options={getCategoryProviders(selectedCategory).map(p => ({
                        value: p,
                        label: p.charAt(0).toUpperCase() + p.slice(1)
                      }))}
                      value={selectedProvider}
                      onChange={(provider) => {
                        setSelectedProvider(provider)
                        setSelectedCommand(providers?.[provider]?.[0]?.name || '')
                      }}
                      placeholder="Select provider"
                      label="Provider"
                    />
                    
                    <Dropdown
                      options={commandOptions}
                      value={selectedCommand}
                      onChange={setSelectedCommand}
                      placeholder="Select command"
                      label="Command"
                    />
                  </div>

                  <div className="mb-6">
                    <Input
                      label="Search Query"
                      placeholder="Example: user@email.com, 1.1.1.1, username123, or ID..."
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                      icon={<Search className="w-5 h-5" />}
                    />
                  </div>

                  <motion.div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <motion.p 
                      className="text-sm text-white/50"
                      animate={{ opacity: searching ? 0.5 : 1 }}
                    >
                      Cost: <span className="text-white font-semibold font-mono">${SEARCH_COST}</span> per search
                    </motion.p>
                    <Button
                      onClick={handleSearch}
                      disabled={searching || cooldown}
                      loading={searching}
                      size="lg"
                    >
                      <Search className="w-4 h-4 mr-2" />
                      {cooldown ? 'Cooldown...' : 'Search'}
                    </Button>
                  </motion.div>
                </GlassCard>
              )}

              {/* Provider-Specific Search Form - shown when searchMode is 'provider' */}
              {searchMode === 'provider' && (
                <GlassCard className="p-8">
                  <div className="flex items-center gap-3 mb-8">
                    {(() => {
                      const IconComponent = PROVIDER_ICONS[selectedProvider] || Search
                      return <IconComponent className="w-8 h-8 text-white/80" />
                    })()}
                    <h3 className="text-xl font-semibold tracking-tight capitalize">
                      {selectedProvider} Search
                    </h3>
                  </div>

                  <div className="space-y-6">
                    {/* Command Dropdown */}
                    {selectedProvider && (
                      <Dropdown
                        options={providers?.[selectedProvider]?.map(cmd => ({
                          value: cmd.name,
                          label: cmd.description || cmd.name
                        })) || []}
                        value={selectedCommand}
                        onChange={setSelectedCommand}
                        placeholder="Select command"
                        label="Command"
                      />
                    )}

                    {/* Dynamic Input Fields */}
                    {selectedProvider && selectedCommand && (() => {
                      const command = providers?.[selectedProvider]?.find(cmd => cmd.name === selectedCommand)
                      if (!command) return null
                      
                      // Handle commands with extraParams (multiple parameters)
                      if (command.extraParams) {
                        return (
                          <div className="space-y-4">
                            {Object.entries(command.extraParams).map(([paramName, paramValue]) => (
                              <Input
                                key={paramName}
                                label={paramName}
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                placeholder={`Enter ${paramName}...`}
                              />
                            ))}
                          </div>
                        )
                      }
                      
                      // Handle commands that need path parameters
                      if (command.pathIncludesQuery) {
                        return (
                          <div className="space-y-4">
                            <Input
                              label={command.queryParam}
                              type={command.inputType || 'text'}
                              value={query}
                              onChange={(e) => setQuery(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                              placeholder={command.example || `Example: log_12345`}
                            />
                            {command.extraParams && command.extraParams.map((param) => (
                              <Input
                                key={param}
                                label={param}
                                value={extraParams[param] || ''}
                                onChange={(e) => setExtraParams(prev => ({ ...prev, [param]: e.target.value }))}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                placeholder={`Example: file_${param}`}
                              />
                            ))}
                          </div>
                        )
                      }
                      
                      // Regular single parameter commands
                      return (
                        <div className="space-y-4">
                          {command.inputType !== 'none' && (
                            <>
                              {command.inputType === 'file' ? (
                                <div>
                                  <label className="block text-xs font-medium text-white/50 mb-2 tracking-wide">
                                    {command.queryParam}
                                  </label>
                                  <input
                                    type="file"
                                    onChange={(e) => setQuery(e.target.files[0])}
                                    className="w-full px-4 py-3 rounded-xl bg-white/[0.05] border border-border text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-white/10 file:text-white/50 file:cursor-pointer hover:file:bg-white/20"
                                  />
                                </div>
                              ) : (
                                <Input
                                  label={command.queryParam}
                                  type={command.inputType || 'text'}
                                  value={query}
                                  onChange={(e) => setQuery(e.target.value)}
                                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                  placeholder={command.example || `Enter ${command.queryParam}...`}
                                />
                              )}
                            </>
                          )}
                        </div>
                      )
                    })()}

                    {/* Search Button */}
                    {selectedProvider && selectedCommand && (
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4">
                        <motion.p 
                          className="text-sm text-white/50"
                          animate={{ opacity: searching ? 0.5 : 1 }}
                        >
                          Cost: <span className="text-white font-semibold font-mono">${SEARCH_COST}</span> per search
                        </motion.p>
                        <Button
                          onClick={handleSearch}
                          disabled={searching || cooldown}
                          loading={searching}
                          size="lg"
                        >
                          <Search className="w-4 h-4 mr-2" />
                          {cooldown ? 'Cooldown...' : 'Search'}
                        </Button>
                      </div>
                    )}
                  </div>
                </GlassCard>
              )}

              {/* Search Results */}
              {searchResults && (
                <GlassCard className="p-8">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                    <h3 className="text-xl font-semibold tracking-tight">Search Results</h3>
                    <Button
                      onClick={() => {
                        const asciiArt = `██████╗  █████╗ ████████╗ █████╗ ██╗    ██╗██╗██████╗ ███████╗    ██████╗ ██████╗
██╔══██╗██╔══██╗╚══██╔══╝██╔══██╗██║    ██║██║██╔══██╗██╔════╝   ██╔════╝██╔════╝
██║  ██║███████║   ██║   ███████║██║ █╗ ██║██║██████╔╝█████╗     ██║     ██║     
██║  ██║██╔══██║   ██║   ██╔══██║██║███╗██║██║██╔══██╗██╔══╝     ██║     ██║     
██████╔╝██║  ██║   ██║   ██║  ██║╚███╔███╔╝██║██║  ██║███████╗██╗╚██████╗╚██████╗
╚═════╝ ╚═╝  ╚═╝   ╚═╝   ╚═╝  ╚═╝ ╚══╝╚══╝ ╚═╝╚═╝  ╚═╝╚══════╝╚═╝ ╚═════╝ ╚═════╝
                                                                                 

OSINT Search Results
Provider: ${selectedProvider}
Command: ${selectedCommand}
Query: ${query}
Downloaded: ${new Date().toLocaleString()}
═════════════════════════════════════════════════════════════

${JSON.stringify(searchResults.result || searchResults, null, 2)}

═════════════════════════════════════════════════════════════
Powered by https://datawire.cc
Lookup made by https://datawire.cc
`;
                        const blob = new Blob([asciiArt], { type: 'text/plain' })
                        const url = URL.createObjectURL(blob)
                        const a = document.createElement('a')
                        a.href = url
                        a.download = `search-results-${Date.now()}.txt`
                        document.body.appendChild(a)
                        a.click()
                        document.body.removeChild(a)
                        URL.revokeObjectURL(url)
                      }}
                      variant="secondary"
                      size="sm"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download .txt
                    </Button>
                  </div>
                  <div className="bg-white/[0.02] p-6 rounded-xl overflow-auto border border-border custom-scrollbar" style={{ maxHeight: '400px' }}>
                    <pre className="text-sm text-white/70 whitespace-pre-wrap font-mono">
                      {JSON.stringify(searchResults.result || searchResults, null, 2)}
                    </pre>
                  </div>
                </GlassCard>
              )}

              {/* Recent Searches */}
              {searchHistory.length > 0 && (
                <GlassCard className="p-8">
                  <h3 className="text-xl font-semibold mb-6 tracking-tight">Recent Searches</h3>
                  <div className="space-y-3">
                    {searchHistory.map((search, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 + index * 0.05 }}
                        whileHover={{ scale: 1.01, x: 4 }}
                        onClick={() => {
                          setSearchResults(search.result)
                          setQuery(search.query)
                          setSelectedProvider(search.provider)
                          setSelectedCommand(search.command)
                        }}
                        className="p-4 bg-white/[0.03] border border-border hover:border-border-hover cursor-pointer transition-all rounded-xl"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-white/90">
                            {search.provider} / {search.command}
                          </span>
                          <span className="text-xs text-white/40 font-mono">
                            {new Date(search.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-sm text-white/50 truncate">{search.query}</p>
                      </motion.div>
                    ))}
                  </div>
                </GlassCard>
              )}
          </div>
          )}

          {activeTab === 'intelx' && (
            <div className="max-w-4xl mx-auto">
              <GlassCard className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-1 h-8 bg-white/80 rounded-full" />
                  <h3 className="text-xl font-semibold tracking-tight">IntelX File Download</h3>
                </div>
                <p className="text-sm text-white/50 mb-6">Download files from IntelX by System ID</p>
                
                <div className="mb-6">
                  <Input
                    label="System ID"
                    value={intelxSystemId}
                    onChange={(e) => setIntelxSystemId(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleIntelxDownload()}
                    placeholder="Enter IntelX System ID (UUID format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)"
                  />
                </div>

                <Button
                  onClick={handleIntelxDownload}
                  disabled={intelxDownloading}
                  loading={intelxDownloading}
                  size="lg"
                >
                  <CloudDownload className="w-4 h-4 mr-2" />
                  Download File
                </Button>
              </GlassCard>
            </div>
          )}

          {activeTab === 'geolocation' && (
            <div className="h-full flex flex-col">
              <GlassCard className="p-6 mb-4">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-semibold tracking-tight flex items-center gap-2">
                      <Map className="w-5 h-5" />
                      Geolocation Map
                    </h3>
                    <p className="text-sm text-white/50 mt-1">Track locations from IP addresses, phone numbers, and domains</p>
                  </div>
                  <Button
                    onClick={() => setGeoLocations([])}
                    variant="danger"
                    size="sm"
                  >
                    <Trash className="w-4 h-4 mr-2" />
                    Clear
                  </Button>
                </div>
                
                {/* Manual Location Input */}
                <div className="mt-6 pt-6 border-t border-border">
                  <div className="flex items-center gap-2 mb-4">
                    <Plus className="w-4 h-4 text-white/40" />
                    <span className="text-sm font-medium text-white/50">Add Location by Input</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Dropdown
                      options={[
                        { value: 'address', label: 'Address' },
                        { value: 'ip', label: 'IP Address' },
                        { value: 'phone', label: 'Phone Number' },
                        { value: 'email', label: 'Email' }
                      ]}
                      value={manualInput.type}
                      onChange={(value) => setManualInput(prev => ({ ...prev, type: value }))}
                      placeholder="Select type"
                    />
                    <Input
                      placeholder={manualInput.type === 'address' ? 'Enter address...' : manualInput.type === 'ip' ? 'Enter IP address...' : manualInput.type === 'phone' ? 'Enter phone number...' : 'Enter email...'}
                      value={manualInput.value}
                      onChange={(e) => setManualInput(prev => ({ ...prev, value: e.target.value }))}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddManualLocation()}
                      className="md:col-span-3"
                    />
                  </div>
                  <Button
                    onClick={handleAddManualLocation}
                    disabled={addingLocation}
                    loading={addingLocation}
                    variant="secondary"
                    size="sm"
                    className="mt-4"
                  >
                    <MapPin className="w-4 h-4 mr-2" />
                    Add Location
                  </Button>
                </div>
              </GlassCard>
              
              <div className="flex-1 glass-card overflow-hidden relative border border-border" style={{ height: 'calc(100vh - 300px)', minHeight: '500px' }}>
                {geoLocations.length > 0 ? (
                  <GeolocationMap 
                    locations={geoLocations}
                    onLocationClick={(location) => console.log('Location clicked:', location)}
                  />
                ) : (
                  <EmptyState
                    icon={<Map className="w-12 h-12" />}
                    title="No locations tracked yet"
                    description="Search for IP addresses, phone numbers, or domains to see their locations on the map"
                  />
                )}
              </div>
            </div>
          )}

          {activeTab === 'ai-osint' && (
            <AIOsintSearch />
          )}

          {activeTab === 'mapping' && (
            <div className="h-full flex flex-col">
              {/* Graph Controls */}
              <GlassCard className="p-4 mb-4">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex-1 min-w-[200px]">
                    <Input
                      placeholder="Search nodes by value (email, phone, IP, username)..."
                      value={nodeSearch}
                      onChange={(e) => setNodeSearch(e.target.value)}
                      icon={<Search className="w-4 h-4" />}
                    />
                  </div>
                  
                  <Dropdown
                    options={['all', 'email', 'phone', 'ip', 'crypto', 'username', 'name', 'domain', 'unknown'].map(type => ({
                      value: type,
                      label: type === 'all' ? 'All Types' : type
                    }))}
                    value={selectedEntityType}
                    onChange={setSelectedEntityType}
                    placeholder="All Types"
                  />
                  
                  <Dropdown
                    options={['all', 'same_value', 'found_in_result'].map(type => ({
                      value: type,
                      label: type === 'all' ? 'All Relationships' : type.replace('_', ' ')
                    }))}
                    value={selectedRelationshipType}
                    onChange={setSelectedRelationshipType}
                    placeholder="All Relationships"
                  />
                  
                  <Button
                    onClick={exportGraph}
                    variant="secondary"
                    size="sm"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                  
                  <label className="cursor-pointer">
                    <Button variant="secondary" size="sm">
                      <Upload className="w-4 h-4 mr-2" />
                      Import
                    </Button>
                    <input
                      type="file"
                      accept=".txt"
                      onChange={importGraph}
                      className="hidden"
                    />
                  </label>
                  
                  <Button
                    onClick={clearGraph}
                    variant="danger"
                    size="sm"
                  >
                    <Trash className="w-4 h-4 mr-2" />
                    Clear
                  </Button>
                </div>
              </GlassCard>
              
              {/* Graph Container */}
              <div className="flex-1 glass-card overflow-hidden relative border border-border" style={{ height: '600px', minHeight: '400px' }}>
                <ReactFlow
                  nodes={filterNodes()}
                  edges={filterEdges()}
                  onNodesChange={onNodesChange}
                  onEdgesChange={onEdgesChange}
                  onConnect={onConnect}
                  fitView
                  nodeTypes={nodeTypes}
                  className="bg-background"
                  style={{ background: '#080808', width: '100%', height: '100%' }}
                  defaultViewport={{ x: 0, y: 0, zoom: 1 }}
                  minZoom={0.1}
                  maxZoom={4}
                >
                  <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="rgba(255,255,255,0.05)" />
                </ReactFlow>
                
                {/* Custom Zoom Controls */}
                <div className="absolute bottom-4 right-4 flex flex-col gap-2">
                  <button
                    onClick={() => {
                      const reactFlowInstance = window.reactFlowInstance
                      if (reactFlowInstance) {
                        reactFlowInstance.zoomIn()
                      }
                    }}
                    className="w-10 h-10 bg-surface border border-border rounded-lg flex items-center justify-center text-white hover:border-border-hover transition-all"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      const reactFlowInstance = window.reactFlowInstance
                      if (reactFlowInstance) {
                        reactFlowInstance.zoomOut()
                      }
                    }}
                    className="w-10 h-10 bg-surface border border-border rounded-lg flex items-center justify-center text-white hover:border-border-hover transition-all"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      const reactFlowInstance = window.reactFlowInstance
                      if (reactFlowInstance) {
                        reactFlowInstance.fitView()
                      }
                    }}
                    className="w-10 h-10 bg-surface border border-border rounded-lg flex items-center justify-center text-white hover:border-border-hover transition-all"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              {/* Manual Node Addition */}
              <GlassCard className="p-6 mt-4">
                <h4 className="text-sm font-semibold mb-4 text-white tracking-wide">Add Manual Node</h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Dropdown
                    options={['email', 'phone', 'ip', 'crypto', 'username', 'name', 'domain', 'unknown'].map(type => ({
                      value: type,
                      label: type
                    }))}
                    value={newLead.type}
                    onChange={(type) => setNewLead(prev => ({ ...prev, type }))}
                    placeholder="Select type"
                    label="Type"
                  />
                  
                  <div className="md:col-span-2">
                    <Input
                      label="Value"
                      placeholder="Enter value (email, phone, IP, username, etc.)"
                      value={newLead.value}
                      onChange={(e) => setNewLead(prev => ({ ...prev, value: e.target.value }))}
                    />
                  </div>
                  
                  <div>
                    <Input
                      label="Source"
                      placeholder="Example: snusbase, leakcheck, or https://example.com"
                      value={newLead.source}
                      onChange={(e) => setNewLead(prev => ({ ...prev, source: e.target.value }))}
                    />
                  </div>
                </div>
                
                <div className="mt-4 flex justify-end">
                  <Button
                    onClick={() => addManualNode(newLead.type, newLead.value, newLead.source)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Node
                  </Button>
                </div>
              </GlassCard>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="max-w-4xl mx-auto">
              <GlassCard className="p-8">
                <h3 className="text-xl font-semibold mb-6 tracking-tight">Search History</h3>
                {searchHistory.length > 0 ? (
                  <div className="space-y-3">
                    {searchHistory.map((search, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ scale: 1.01, x: 4 }}
                        onClick={() => {
                          setActiveTab('search')
                          setSearchResults(search.result)
                          setQuery(search.query)
                          setSelectedProvider(search.provider)
                          setSelectedCommand(search.command)
                        }}
                        className="p-4 bg-white/[0.03] border border-border hover:border-border-hover cursor-pointer transition-all rounded-xl"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-white/90">
                            {search.provider} / {search.command}
                          </span>
                          <span className="text-xs text-white/40 font-mono">
                            {new Date(search.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm text-white/50 truncate">{search.query}</p>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    icon={<History className="w-12 h-12" />}
                    title="No search history yet"
                    description="Your recent searches will appear here"
                  />
                )}
              </GlassCard>
            </div>
          )}

          {activeTab === 'transactions' && (
            <div className="max-w-4xl mx-auto">
              <GlassCard className="p-8">
                <h3 className="text-xl font-semibold mb-6 tracking-tight">Transaction History</h3>
                {transactions.length > 0 ? (
                  <div className="space-y-3">
                    {transactions.map(tx => (
                      <div key={tx.id} className="p-4 bg-white/[0.03] border border-border rounded-xl">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium capitalize text-white/90">{tx.type}</span>
                          <span className={`text-xs px-2 py-1 rounded-lg ${
                            tx.status === 'completed' ? 'bg-white/10 text-white' :
                            tx.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500' :
                            'bg-red-500/10 text-red-500'
                          }`}>
                            {tx.status}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-white/50 font-mono">${tx.amount}</span>
                          <span className="text-white/40 font-mono">
                            {new Date(tx.createdAt).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    icon={<Receipt className="w-12 h-12" />}
                    title="No transactions yet"
                    description="Your transaction history will appear here"
                  />
                )}
              </GlassCard>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="max-w-4xl mx-auto">
              <GlassCard className="p-8">
                <h3 className="text-xl font-semibold mb-6 tracking-tight">Account Settings</h3>
                <div className="space-y-4">
                  <div className="p-4 bg-white/[0.03] border border-border rounded-xl">
                    <p className="text-xs text-white/40 mb-1 tracking-wide uppercase">Username</p>
                    <p className="font-medium text-white">{user?.username}</p>
                  </div>
                  <div className="p-4 bg-white/[0.03] border border-border rounded-xl">
                    <p className="text-xs text-white/40 mb-1 tracking-wide uppercase">Display Name</p>
                    <p className="font-medium text-white">{user?.global_name || user?.username}</p>
                  </div>
                  <div className="p-4 bg-white/[0.03] border border-border rounded-xl">
                    <p className="text-xs text-white/40 mb-1 tracking-wide uppercase">Discord ID</p>
                    <p className="font-medium font-mono text-white">{user?.discordId}</p>
                  </div>
                  <div className="p-4 bg-white/[0.03] border border-border rounded-xl">
                    <p className="text-xs text-white/40 mb-1 tracking-wide uppercase">Member Since</p>
                    <p className="font-medium text-white">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</p>
                  </div>
                </div>
              </GlassCard>
            </div>
          )}
        </div>
      </div>

      {/* Custom Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className={`fixed bottom-6 right-6 px-6 py-4 shadow-lg z-[200] ${
              toast.type === 'success' ? 'bg-white/10 border border-white/20 text-white' :
              toast.type === 'error' ? 'bg-red-500/10 border border-red-500/20 text-red-400' :
              'bg-surface border border-border text-white/80'
            } rounded-xl backdrop-blur-xl`}
          >
            <div className="flex items-center gap-3">
              {toast.type === 'success' && <CheckCircle className="w-5 h-5 text-green-400" />}
              {toast.type === 'error' && <XCircle className="w-5 h-5 text-red-400" />}
              {toast.type === 'info' && <InfoCircle className="w-5 h-5 text-blue-400" />}
              <span className="text-sm font-medium">{toast.message}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Plan Expired Modal */}
      <AnimatePresence>
        {expiredModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[300]"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="glass-card rounded-2xl p-8 max-w-md w-full mx-4 border border-border"
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20">
                  <Clock className="w-8 h-8 text-red-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Plan Expired</h3>
                <p className="text-white/60">
                  Your {plan} plan has expired. Your daily credits have been reset to 0.
                </p>
              </div>
              <div className="space-y-3">
                <Button
                  onClick={() => {
                    setExpiredModal(false)
                    navigate('/purchase')
                  }}
                  variant="primary"
                  className="w-full"
                >
                  Renew Plan
                </Button>
                <Button
                  onClick={() => setExpiredModal(false)}
                  variant="secondary"
                  className="w-full"
                >
                  Continue to Dashboard
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Dashboard
