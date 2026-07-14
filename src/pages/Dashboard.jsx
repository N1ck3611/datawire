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

// Provider icons mapping
const PROVIDER_ICONS = {
  snusbase: 'bx-database',
  leakosint: 'bx-file-find',
  leakcheck: 'bx-shield-quarter',
  breachbase: 'bx-server',
  intelvault: 'bx-vault',
  breachdirectory: 'bx-book',
  hackcheck: 'bx-hacker',
  osintkit: 'bx-toolbox',
  breachvip: 'bx-crown',
  cordcat: 'bxl-discord',
  intelx: 'bx-cloud-download',
  osintcat: 'bx-cat',
  xosint: 'bx-search-alt',
  seeknow: 'bx-search',
  seekria: 'bx-radar',
  telegram: 'bxl-telegram',
  tiktok: 'bxl-tiktok',
  roblox: 'bx-game',
  minecraft: 'bx-cube',
  xbox: 'bx-x',
  steam: 'bx-steam',
  fivem: 'bx-car',
  twitter: 'bxl-twitter',
  instagram: 'bxl-instagram',
  github: 'bxl-github',
  snapchat: 'bxl-snapchat',
  reddit: 'bxl-reddit',
  ip: 'bx-globe',
  domain: 'bx-world',
  dns: 'bx-network-chart',
  whois: 'bx-info-circle',
  hudsonrock: 'bx-shield-x',
  leaksight: 'bx-eye',
  nbrs: 'bx-user',
  room101: 'bx-door-open',
  seon: 'bx-fingerprint',
  memory: 'bx-memory-card',
  nosint: 'bx-search',
  reconly: 'bx-compass',
  binlist: 'bx-credit-card',
  inf0sec: 'bx-terminal',
  vin: 'bx-car',
  propertyradar: 'bx-building',
  datavoid: 'bx-data',
  checko: 'bx-check-circle',
  medal: 'bx-medal',
  discord: 'bxl-discord',
  oathnet: 'bx-shield'
}

// Provider categories with logos (kept for reference)
const PROVIDER_CATEGORIES = {
  footprint: {
    label: 'Footprint',
    icon: 'bx-user-voice',
    providers: ['seekria', 'seeknow', 'xosint']
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
    providers: ['intelx', 'osintcat', 'hudsonrock', 'leaksight', 'nbrs', 'room101', 'seon', 'memory', 'nosint', 'reconly', 'binlist', 'inf0sec', 'vin', 'propertyradar', 'datavoid', 'checko', 'medal']
  }
}

// Social media logos
const SOCIAL_LOGOS = {
  twitter: 'https://seeklogo.com/vector-logo/492396/twitter-x',
  instagram: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Instagram_logo_2022.svg/512px-Instagram_logo_2022.svg.png',
  github: 'https://dl.svgcdn.com/svg/logos/github.svg',
  snapchat: 'https://upload.wikimedia.org/wikipedia/en/thumb/c/c4/Snapchat_logo.svg/512px-Snapchat_logo.svg.png',
  reddit: 'https://brandfetch.com/reddit.com/logo'
}

// Hide ReactFlow watermark
const style = document.createElement('style')
style.textContent = `
  .react-flow__attribution {
    display: none !important;
  }
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  @keyframes slideIn {
    from { opacity: 0; transform: translateX(-20px); }
    to { opacity: 1; transform: translateX(0); }
  }
  
  @keyframes scaleIn {
    from { opacity: 0; transform: scale(0.95); }
    to { opacity: 1; transform: scale(1); }
  }
  
  @keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }
  
  @keyframes pulse-glow {
    0%, 100% { box-shadow: 0 0 5px rgba(255, 255, 255, 0.1); }
    50% { box-shadow: 0 0 20px rgba(255, 255, 255, 0.2); }
  }
  
  @keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-5px); }
  }
  
  .animate-fade-in {
    animation: fadeIn 0.4s ease-out;
  }
  
  .animate-slide-in {
    animation: slideIn 0.4s ease-out;
  }
  
  .animate-scale-in {
    animation: scaleIn 0.3s ease-out;
  }
  
  .animate-shimmer {
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
    background-size: 200% 100%;
    animation: shimmer 2s infinite;
  }
  
  .animate-pulse-glow {
    animation: pulse-glow 2s ease-in-out infinite;
  }
  
  .animate-float {
    animation: float 3s ease-in-out infinite;
  }
  
  .glass-card {
    background: linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.05) 0%,
      rgba(255, 255, 255, 0.02) 50%,
      rgba(255, 255, 255, 0.05) 100%
    );
    backdrop-filter: blur(40px) saturate(200%);
    -webkit-backdrop-filter: blur(40px) saturate(200%);
    border: 1px solid rgba(255, 255, 255, 0.15);
    transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;
    box-shadow: 
      0 8px 32px rgba(0, 0, 0, 0.4),
      inset 0 1px 0 rgba(255, 255, 255, 0.1),
      inset 0 -1px 0 rgba(0, 0, 0, 0.1);
  }
  
  .glass-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg, 
      transparent, 
      rgba(255, 255, 255, 0.1), 
      transparent
    );
    transition: left 1s ease;
  }
  
  .glass-card::after {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(
      circle,
      rgba(255, 255, 255, 0.03) 0%,
      transparent 70%
    );
    pointer-events: none;
  }
  
  .glass-card:hover::before {
    left: 100%;
  }
  
  .glass-card:hover {
    border-color: rgba(255, 255, 255, 0.3);
    box-shadow: 
      0 25px 80px rgba(0, 0, 0, 0.6),
      0 0 0 1px rgba(255, 255, 255, 0.15),
      inset 0 1px 0 rgba(255, 255, 255, 0.2),
      0 0 40px rgba(255, 255, 255, 0.05);
    transform: translateY(-6px) scale(1.02);
  }
  
  button {
    position: relative;
    overflow: hidden;
  }
  
  button::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 50%;
    transform: translate(-50%, -50%);
    transition: width 0.6s, height 0.6s;
  }
  
  button:active::after {
    width: 300px;
    height: 300px;
  }
  
  /* Enhanced input styles */
  input, select {
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    transition: all 0.3s ease;
  }
  
  input:focus, select:focus {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.3);
    box-shadow: 
      0 0 20px rgba(255, 255, 255, 0.1),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
  }
  
  /* Scrollbar styling */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  
  ::-webkit-scrollbar-track {
    background: rgba(10, 10, 16, 0.5);
    border-radius: 4px;
  }
  
  ::-webkit-scrollbar-thumb {
    background: linear-gradient(
      180deg,
      rgba(255, 255, 255, 0.2) 0%,
      rgba(255, 255, 255, 0.1) 100%
    );
    border-radius: 4px;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }
  
  ::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(
      180deg,
      rgba(255, 255, 255, 0.3) 0%,
      rgba(255, 255, 255, 0.2) 100%
    );
  }
  
  /* Glow effects */
  .glow-effect {
    box-shadow: 
      0 0 20px rgba(255, 255, 255, 0.1),
      0 0 40px rgba(255, 255, 255, 0.05);
  }
  
  .glow-effect-purple {
    box-shadow: 
      0 0 20px rgba(168, 85, 247, 0.3),
      0 0 40px rgba(168, 85, 247, 0.1);
  }
  
  .glow-effect-blue {
    box-shadow: 
      0 0 20px rgba(59, 130, 246, 0.3),
      0 0 40px rgba(59, 130, 246, 0.1);
  }
  
  .glow-effect-green {
    box-shadow: 
      0 0 20px rgba(34, 197, 94, 0.3),
      0 0 40px rgba(34, 197, 94, 0.1);
  }
  
  /* Gradient text */
  .gradient-text {
    background: linear-gradient(
      135deg,
      #ffffff 0%,
      #a855f7 50%,
      #3b82f6 100%
    );
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  
  /* Animated border */
  .animated-border {
    position: relative;
    overflow: hidden;
  }
  
  .animated-border::before {
    content: '';
    position: absolute;
    top: -2px;
    left: -2px;
    right: -2px;
    bottom: -2px;
    background: linear-gradient(
      45deg,
      #ff6b6b,
      #4ecdc4,
      #45b7d1,
      #96ceb4,
      #ffeaa7,
      #dfe6e9,
      #ff6b6b
    );
    background-size: 400% 400%;
    animation: gradient-border 3s ease infinite;
    border-radius: inherit;
    z-index: -1;
  }
  
  @keyframes gradient-border {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
  
  /* Floating particles effect */
  .particles {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    pointer-events: none;
  }
  
  .particle {
    position: absolute;
    width: 4px;
    height: 4px;
    background: rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    animation: float-particle 10s infinite;
  }
  
  @keyframes float-particle {
    0%, 100% {
      transform: translateY(100vh) rotate(0deg);
      opacity: 0;
    }
    10% {
      opacity: 1;
    }
    90% {
      opacity: 1;
    }
    100% {
      transform: translateY(-100vh) rotate(720deg);
      opacity: 0;
    }
  }
  
  input:focus {
    box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.1);
  }
`
document.head.appendChild(style)

// Custom Node Component
const CustomNode = ({ data, selected }) => {
  return (
    <div style={{
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      width: '140px',
      padding: '10px'
    }}>
      {/* Connection handles */}
      <Handle
        type="target"
        position={Position.Top}
        id="top"
        style={{
          background: '#ffffff',
          border: '2px solid #1a1a2e',
          width: '12px',
          height: '12px',
          top: '-6px'
        }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom"
        style={{
          background: '#ffffff',
          border: '2px solid #1a1a2e',
          width: '12px',
          height: '12px',
          bottom: '-6px'
        }}
      />
      <Handle
        type="target"
        position={Position.Left}
        id="left"
        style={{
          background: '#ffffff',
          border: '2px solid #1a1a2e',
          width: '12px',
          height: '12px',
          left: '-6px'
        }}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        style={{
          background: '#ffffff',
          border: '2px solid #1a1a2e',
          width: '12px',
          height: '12px',
          right: '-6px'
        }}
      />
      
      {/* Type label outside circle */}
      <div style={{
        position: 'absolute',
        top: '-25px',
        fontSize: '11px',
        color: '#ffffff',
        textTransform: 'capitalize',
        fontWeight: '500',
        whiteSpace: 'nowrap'
      }}>
        {data.type}
      </div>
      
      {/* Circle with icon */}
      <div style={{
        width: '70px',
        height: '70px',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
        border: selected ? '3px solid #ffffff' : '2px solid #ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: selected ? '0 0 30px rgba(255, 255, 255, 0.3)' : '0 0 20px rgba(255, 255, 255, 0.2)',
        position: 'relative',
        cursor: 'pointer'
      }}>
        <i className={`bx ${data.icon || 'bx-question-mark'}`} style={{
          fontSize: '28px',
          color: '#ffffff'
        }}></i>
      </div>
      
      {/* Value under icon */}
      <div style={{
        marginTop: '8px',
        fontSize: '11px',
        color: '#a0a0c0',
        textAlign: 'center',
        maxWidth: '100%',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap'
      }}>
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
    { name: 'search', description: 'Snusbase search', path: '/snusbase', queryParam: 'query' },
    { name: 'combo-lookup', description: 'Combo lookup', path: '/snusbase/combo-lookup', queryParam: 'query' },
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
    { name: 'search', description: 'BreachBase search', path: '/breachbase', queryParam: 'query' }
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
    { name: 'geocode', description: 'Datavoid geocode', path: '/datavoid/geocode', queryParam: 'address', method: 'POST' },
    { name: 'reverse-geocode', description: 'Datavoid reverse geocode', path: '/datavoid/reverse-geocode', queryParam: 'lat', method: 'POST' },
    { name: 'automotive', description: 'Datavoid automotive', path: '/datavoid/automotive', queryParam: 'query' },
    { name: 'automotive-check', description: 'Datavoid automotive check', path: '/datavoid/automotive/check', queryParam: 'vin' },
    { name: 'company', description: 'Datavoid company', path: '/datavoid/company', queryParam: 'query' },
    { name: 'discord', description: 'Datavoid Discord', path: '/datavoid/discord', queryParam: 'id' },
    { name: 'instagram', description: 'Datavoid Instagram', path: '/datavoid/instagram', queryParam: 'query', method: 'POST' },
    { name: 'twitter', description: 'Datavoid Twitter', path: '/datavoid/twitter', queryParam: 'query' },
    { name: 'google-docs', description: 'Datavoid Google Docs', path: '/datavoid/google-docs', queryParam: 'query', method: 'POST' },
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

// Custom Dropdown Component
const CustomDropdown = ({ options, value, onChange, placeholder, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)
  const dropdownMenuRef = useRef(null)
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0, width: 0 })

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) && 
          dropdownMenuRef.current && !dropdownMenuRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    
    const handleScroll = () => {
      if (isOpen && dropdownRef.current) {
        const rect = dropdownRef.current.getBoundingClientRect()
        setMenuPosition({
          top: rect.bottom + 4,
          left: rect.left,
          width: rect.width
        })
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    window.addEventListener('scroll', handleScroll, true)
    window.addEventListener('resize', handleScroll)
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      window.removeEventListener('scroll', handleScroll, true)
      window.removeEventListener('resize', handleScroll)
    }
  }, [isOpen])

  const toggleDropdown = () => {
    if (!isOpen && dropdownRef.current) {
      const rect = dropdownRef.current.getBoundingClientRect()
      setMenuPosition({
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width
      })
    }
    setIsOpen(!isOpen)
  }

  const selectedOption = options?.find(opt => opt.value === value)

  return (
    <>
      <div ref={dropdownRef} className={`relative ${className}`}>
        <button
          onClick={toggleDropdown}
          className="w-full px-4 py-3 bg-osint-bg/50 border border-osint-border focus:border-white focus:outline-none transition-colors text-left flex items-center justify-between"
        >
          <span className={selectedOption ? 'text-osint-secondary' : 'text-osint-muted'}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <i className={`bx bx-chevron-down text-osint-muted transition-transform ${isOpen ? 'rotate-180' : ''}`}></i>
        </button>
      </div>

      {isOpen && createPortal(
        <div 
          ref={dropdownMenuRef}
          className="fixed z-[999999] bg-osint-card border border-osint-border shadow-2xl max-h-64 overflow-y-auto animate-scale-in"
          style={{
            top: `${menuPosition.top}px`,
            left: `${menuPosition.left}px`,
            width: `${menuPosition.width}px`
          }}
        >
          {options?.map((option) => (
            <button
              key={option.value}
              onMouseDown={(e) => {
                e.preventDefault()
                onChange(option.value)
                setIsOpen(false)
              }}
              className={`w-full px-4 py-3 text-left hover:bg-white/10 transition-colors ${
                option.value === value ? 'bg-white/20 text-white' : 'text-osint-secondary'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>,
        document.body
      )}
    </>
  )
}

// Categorized Provider Dropdown Component
const CategorizedProviderDropdown = ({ providers, selectedCategory, selectedProvider, onCategoryChange, onProviderChange }) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)
  const dropdownMenuRef = useRef(null)
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0, width: 0 })

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) && 
          dropdownMenuRef.current && !dropdownMenuRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    
    const handleScroll = () => {
      if (isOpen && dropdownRef.current) {
        const rect = dropdownRef.current.getBoundingClientRect()
        setMenuPosition({
          top: rect.bottom + 4,
          left: rect.left,
          width: rect.width
        })
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    window.addEventListener('scroll', handleScroll, true)
    window.addEventListener('resize', handleScroll)
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      window.removeEventListener('scroll', handleScroll, true)
      window.removeEventListener('resize', handleScroll)
    }
  }, [isOpen])

  const getCategoryProviders = (category) => {
    const categoryData = PROVIDER_CATEGORIES[category]
    if (!categoryData) return []
    return categoryData.providers.filter(p => providers && providers[p])
  }

  const currentCategory = PROVIDER_CATEGORIES[selectedCategory]
  const availableProviders = getCategoryProviders(selectedCategory)

  const toggleDropdown = () => {
    if (!isOpen && dropdownRef.current) {
      const rect = dropdownRef.current.getBoundingClientRect()
      setMenuPosition({
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width
      })
    }
    setIsOpen(!isOpen)
  }

  return (
    <>
      <div ref={dropdownRef} className="relative">
        <button
          onClick={toggleDropdown}
          className="w-full px-4 py-3 bg-osint-bg/50 border border-osint-border focus:border-white focus:outline-none transition-colors text-left flex items-center justify-between"
        >
          <span className="text-osint-secondary">
            {currentCategory?.label || 'Select Category'}
          </span>
          <i className={`bx bx-chevron-down text-osint-muted transition-transform ${isOpen ? 'rotate-180' : ''}`}></i>
        </button>
      </div>

      {isOpen && createPortal(
        <div 
          ref={dropdownMenuRef}
          className="fixed z-[1000000] bg-osint-card border border-osint-border shadow-2xl max-h-96 overflow-y-auto animate-scale-in"
          style={{
            top: `${menuPosition.top}px`,
            left: `${menuPosition.left}px`,
            width: `${menuPosition.width}px`
          }}
        >
          {Object.entries(PROVIDER_CATEGORIES).map(([key, category]) => (
            <div key={key}>
              <button
                onMouseDown={(e) => {
                  e.preventDefault()
                  onCategoryChange(key)
                  const providers = getCategoryProviders(key)
                  if (providers.length > 0) {
                    onProviderChange(providers[0])
                  }
                }}
                className={`w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-white/10 transition-colors ${
                  key === selectedCategory ? 'bg-white/20 text-white' : 'text-osint-secondary'
                }`}
              >
                {category.logo ? (
                  <img 
                    src={category.logo} 
                    alt={category.label}
                    className="w-6 h-6 object-contain filter grayscale brightness-0 contrast-100"
                  />
                ) : (
                  <i className={`bx ${category.icon} text-lg`}></i>
                )}
                <span className="font-medium">{category.label}</span>
                <span className="text-xs text-osint-muted ml-auto">
                  {getCategoryProviders(key).length}
                </span>
              </button>
              
              {key === selectedCategory && (
                <div className="pl-8 border-l border-osint-border/50 ml-4">
                  {availableProviders.map(provider => (
                    <button
                      key={provider}
                      onMouseDown={(e) => {
                        e.preventDefault()
                        onProviderChange(provider)
                        setIsOpen(false)
                      }}
                      className={`w-full px-4 py-2 text-left text-sm hover:bg-white/10 transition-colors ${
                        provider === selectedProvider ? 'text-white' : 'text-gray-500'
                      }`}
                    >
                      {provider.charAt(0).toUpperCase() + provider.slice(1)}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>,
        document.body
      )}
    </>
  )
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
  
  // OSINT Search State
  const [providers, setProviders] = useState(null)
  const [selectedProvider, setSelectedProvider] = useState('datahound')
  const [selectedCommand, setSelectedCommand] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('footprint')
  const [query, setQuery] = useState('')
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
  }, [])

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
          query: query.trim()
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
      email: 'bx-envelope',
      phone: 'bx-phone',
      ip: 'bx-globe',
      crypto: 'bx-bitcoin',
      username: 'bx-user',
      domain: 'bx-world',
      name: 'bx-user-pin',
      unknown: 'bx-question-mark'
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
      <div className="min-h-screen flex items-center justify-center bg-osint-bg">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
          <p className="text-osint-muted">Loading dashboard...</p>
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
    { id: 'search', icon: 'bx-search', label: 'Search', isCategory: false },
    { id: 'ai-osint', icon: 'bx-brain', label: 'AI OSINT', isCategory: false },
    { id: 'intelx', icon: 'bx-cloud-download', label: 'IntelX', isCategory: false },
    { id: 'geolocation', icon: 'bx-map', label: 'Geolocation', isCategory: false },
    { id: 'mapping', icon: 'bx-link', label: 'Lead Mapping', isCategory: false },
    { id: 'history', icon: 'bx-history', label: 'Search History', isCategory: false },
    { id: 'transactions', icon: 'bx-receipt', label: 'Transactions', isCategory: false },
    { id: 'settings', icon: 'bx-cog', label: 'Settings', isCategory: false }
  ]

  return (
    <div className="min-h-screen bg-osint-bg text-osint-secondary flex">
      {/* Sidebar */}
      <div className={`fixed lg:relative z-50 w-72 h-screen lg:h-auto bg-osint-card border-r border-osint-border flex flex-col transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        {/* Logo */}
        <div className="p-6 border-b border-osint-border flex-shrink-0">
          <div className="flex items-center gap-3">
            <img 
              src="https://i.ibb.co/wFrNvxt5/Chat-GPT-Image-Jul-6-2026-09-02-01-PM-removebg-preview.png" 
              alt="Datawire.cc" 
              className="w-10 h-10"
            />
            <div>
              <h1 className="font-bold text-xl tracking-tight">Datawire.cc</h1>
              <p className="text-xs text-osint-muted tracking-wider uppercase">OSINT Platform</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto overflow-x-hidden">
          {/* Main Navigation Items */}
          {sidebarItems.map((item, index) => (
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
              className={`w-full flex items-center gap-3 px-4 py-3 transition-all border-l-2 relative overflow-hidden ${
                activeTab === item.id 
                  ? 'bg-white/10 text-white border-white' 
                  : 'text-gray-500 border-transparent hover:bg-osint-bg/30 hover:text-white'
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
              <i className={`bx ${item.icon} text-lg relative z-10`}></i>
              <span className="font-medium tracking-wide relative z-10">{item.label}</span>
            </motion.button>
          ))}

          {/* Providers Section */}
          <div className="mt-6 pt-4 border-t border-osint-border">
            <p className="text-xs text-osint-muted uppercase tracking-wider mb-3 px-4">Providers</p>
            <div className="space-y-1 max-h-96 overflow-y-auto">
              {Object.keys(providers || {}).map((provider) => {
                const icon = PROVIDER_ICONS[provider] || 'bx-search'
                
                return (
                  <button
                    key={provider}
                    onClick={() => {
                      setSelectedProvider(provider)
                      setSelectedCommand(providers?.[provider]?.[0]?.name || '')
                      setActiveTab('search')
                      setSearchMode('provider')
                      setSidebarOpen(false)
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 transition-all border-l-2 ${
                      selectedProvider === provider && activeTab === 'search' && searchMode === 'provider'
                        ? 'bg-white/10 text-white border-white' 
                        : 'text-gray-500 border-transparent hover:bg-osint-bg/30 hover:text-white'
                    }`}
                  >
                    <i className={`bx ${icon} text-lg`}></i>
                    <span className="font-medium text-sm capitalize">{provider}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-osint-border">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-white/10 flex items-center justify-center border border-white/30">
              <span className="font-bold text-white">
                {user?.username?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate text-sm">{user?.global_name || user?.username}</p>
              {plan ? (
                <p className="text-xs text-osint-muted font-mono capitalize">{plan} Plan</p>
              ) : (
                <p className="text-xs text-osint-muted font-mono">${balance} USD</p>
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
                <span className="text-osint-muted">Daily Credits:</span>
                <span className="text-white font-semibold font-mono">{dailyCredits}</span>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="flex items-center justify-between text-xs"
              >
                <span className="text-osint-muted">IntelX Uses:</span>
                <span className="text-white font-semibold font-mono">{dailyIntelxUses}</span>
              </motion.div>
              {planExpiresAt && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="flex items-center justify-between text-xs"
                >
                  <span className="text-osint-muted">Expires:</span>
                  <span className="text-white font-semibold font-mono">
                    {new Date(planExpiresAt).toLocaleDateString()}
                  </span>
                </motion.div>
              )}
            </div>
          )}
          <div className="space-y-2">
            <button
              onClick={() => navigate('/purchase')}
              className="w-full px-4 py-2.5 bg-white text-black font-semibold text-sm hover:bg-gray-200 transition-all tracking-wide"
            >
              Add Funds
            </button>
            <button
              onClick={() => navigate('/')}
              className="w-full px-4 py-2 border border-osint-border text-osint-muted text-sm hover:bg-osint-bg/30 transition-all tracking-wide"
            >
              Back to Site
            </button>
            <button
              onClick={handleLogout}
              className="w-full px-4 py-2 border border-red-500/20 text-red-400 text-sm hover:bg-red-500/10 transition-all tracking-wide"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <motion.div 
          className="h-16 bg-osint-card/80 backdrop-blur-xl border-b border-osint-border flex items-center justify-between px-4 md:px-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            boxShadow: '0 4px 30px rgba(0, 0, 0, 0.3)'
          }}
        >
          <div className="flex items-center gap-4">
            <motion.button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="lg:hidden p-2 text-osint-muted hover:text-osint-secondary transition-colors"
            >
              <motion.i 
                className={`bx ${sidebarOpen ? 'bx-x' : 'bx-menu'} text-xl`}
                animate={{ rotate: sidebarOpen ? 90 : 0 }}
                transition={{ duration: 0.2 }}
              ></motion.i>
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
              className="text-sm text-osint-muted"
              whileHover={{ scale: 1.05 }}
            >
              Available Searches: <span className="text-white font-semibold font-mono">
                {Math.floor(parseFloat(balance) / parseFloat(SEARCH_COST))}
              </span>
            </motion.div>
          </div>
        </motion.div>

        {/* Content Area */}
        <div className="flex-1 p-4 md:p-8 overflow-y-auto">
          {activeTab === 'search' && (
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Main Search Form - only shown when searchMode is 'main' */}
              {searchMode === 'main' && (
                <motion.div 
                  className="glass-card p-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <motion.div 
                    className="flex items-center gap-3 mb-6"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <motion.div 
                      className="w-1 h-8 bg-white animate-pulse-glow"
                      initial={{ height: 0 }}
                      animate={{ height: 32 }}
                      transition={{ duration: 0.3 }}
                    ></motion.div>
                    <h3 className="text-lg font-semibold tracking-tight">OSINT Search</h3>
                  </motion.div>
                  
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm text-osint-muted mb-2 tracking-wide">Provider</label>
                      <CustomDropdown
                        options={getCategoryProviders(selectedCategory).map(p => ({
                          value: p,
                          label: p.charAt(0).toUpperCase() + p.slice(1)
                        }))}
                        value={selectedProvider}
                        onChange={(provider) => {
                          setSelectedProvider(provider)
                          setSelectedCommand(providers?.[provider]?.[0]?.name || '')
                        }}
                        placeholder="Select provider (e.g., snusbase, leakcheck, breachbase)"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm text-osint-muted mb-2 tracking-wide">Command</label>
                      <CustomDropdown
                        options={commandOptions}
                        value={selectedCommand}
                        onChange={setSelectedCommand}
                        placeholder="Select command (e.g., search, combo-lookup, hash-lookup)"
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm text-osint-muted mb-2 tracking-wide">Search Query</label>
                    <motion.div 
                      className="relative"
                      whileFocus={{ scale: 1.01 }}
                    >
                      <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        placeholder="Enter username, email, IP address, or ID..."
                        className="w-full px-4 py-3 pl-12 bg-osint-bg/50 border border-osint-border focus:border-white focus:outline-none transition-all"
                      />
                      <motion.i 
                        className='bx bx-search absolute left-4 top-1/2 -translate-y-1/2 text-osint-muted'
                        animate={query ? { color: '#ffffff', scale: 1.1 } : { color: '#6b7280', scale: 1 }}
                        transition={{ duration: 0.2 }}
                      ></motion.i>
                    </motion.div>
                  </div>

                  <motion.div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <motion.p 
                      className="text-sm text-osint-muted"
                      animate={{ opacity: searching ? 0.5 : 1 }}
                    >
                      Cost: <span className="text-white font-semibold font-mono">${SEARCH_COST}</span> per search
                    </motion.p>
                    <motion.button
                      onClick={handleSearch}
                      disabled={searching || cooldown}
                      whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(255, 255, 255, 0.3)' }}
                      whileTap={{ scale: 0.95 }}
                      className="w-full sm:w-auto px-8 py-3 bg-white text-black font-semibold hover:bg-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-white/20 hover:shadow-white/30"
                    >
                      {searching ? (
                        <>
                          <motion.i 
                            className='bx bx-loader-alt'
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          ></motion.i>
                          Searching...
                        </>
                      ) : cooldown ? (
                        <>
                          <i className='bx bx-time'></i>
                          Cooldown...
                        </>
                      ) : (
                        <>
                          <i className='bx bx-search'></i>
                          Search
                        </>
                      )}
                    </motion.button>
                  </motion.div>
                </motion.div>
              )}

              {/* Provider-Specific Search Form - shown when searchMode is 'provider' */}
              {searchMode === 'provider' && (
                <motion.div 
                  className="glass-card p-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="flex items-center gap-3 mb-6">
                    <i className={`bx ${PROVIDER_ICONS[selectedProvider] || 'bx-search'} text-2xl text-white`}></i>
                    <h3 className="text-lg font-semibold tracking-tight capitalize">
                      {selectedProvider} Search
                    </h3>
                  </div>

                  <div className="space-y-4">
                    {/* Command Dropdown */}
                    {selectedProvider && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <label className="block text-sm text-osint-muted mb-2 tracking-wide">Command</label>
                        <CustomDropdown
                          options={providers?.[selectedProvider]?.map(cmd => ({
                            value: cmd.name,
                            label: cmd.description || cmd.name
                          })) || []}
                          value={selectedCommand}
                          onChange={setSelectedCommand}
                          placeholder="Select command"
                        />
                      </motion.div>
                    )}

                    {/* Dynamic Input Fields */}
                    {selectedProvider && selectedCommand && (() => {
                      const command = providers?.[selectedProvider]?.find(cmd => cmd.name === selectedCommand)
                      if (!command) return null
                      
                      // Handle commands with extraParams (multiple parameters)
                      if (command.extraParams) {
                        return (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            className="space-y-4"
                          >
                            {Object.entries(command.extraParams).map(([paramName, paramValue]) => (
                              <div key={paramName} className="space-y-2">
                                <label className="block text-sm text-osint-muted mb-2 tracking-wide capitalize">
                                  {paramName}
                                </label>
                                <motion.input
                                  type="text"
                                  value={query}
                                  onChange={(e) => setQuery(e.target.value)}
                                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                  placeholder={`Enter ${paramName}...`}
                                  className="w-full px-4 py-3 bg-osint-bg/50 border border-osint-border focus:border-white focus:outline-none transition-all"
                                  whileFocus={{ scale: 1.01 }}
                                />
                              </div>
                            ))}
                          </motion.div>
                        )
                      }
                      
                      // Handle commands that need path parameters
                      if (command.pathIncludesQuery) {
                        return (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            className="space-y-3"
                          >
                            <label className="block text-sm text-osint-muted mb-2 tracking-wide">
                              {command.queryParam}
                            </label>
                            <motion.input
                              type="text"
                              value={query}
                              onChange={(e) => setQuery(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                              placeholder={`Enter ${command.queryParam}...`}
                              className="w-full px-4 py-3 bg-osint-bg/50 border border-osint-border focus:border-white focus:outline-none transition-all"
                              whileFocus={{ scale: 1.01 }}
                            />
                          </motion.div>
                        )
                      }
                      
                      // Regular single parameter commands
                      return (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                          className="space-y-3"
                        >
                          <label className="block text-sm text-osint-muted mb-2 tracking-wide">
                            {command.queryParam}
                          </label>
                          <motion.input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            placeholder={`Enter ${command.queryParam}...`}
                            className="w-full px-4 py-3 bg-osint-bg/50 border border-osint-border focus:border-white focus:outline-none transition-all"
                            whileFocus={{ scale: 1.01 }}
                          />
                        </motion.div>
                      )
                    })()}

                    {/* Search Button */}
                    {selectedProvider && selectedCommand && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                      >
                        <motion.p 
                          className="text-sm text-osint-muted"
                          animate={{ opacity: searching ? 0.5 : 1 }}
                        >
                          Cost: <span className="text-white font-semibold font-mono">${SEARCH_COST}</span> per search
                        </motion.p>
                        <motion.button
                          onClick={handleSearch}
                          disabled={searching || cooldown}
                          whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(255, 255, 255, 0.3)' }}
                          whileTap={{ scale: 0.95 }}
                          className="w-full sm:w-auto px-8 py-3 bg-white text-black font-semibold hover:bg-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-white/20 hover:shadow-white/30"
                        >
                          {searching ? (
                            <>
                              <motion.i 
                                className='bx bx-loader-alt'
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                              ></motion.i>
                              Searching...
                            </>
                          ) : cooldown ? (
                            <>
                              <i className='bx bx-time'></i>
                              Cooldown...
                            </>
                          ) : (
                            <>
                              <i className='bx bx-search'></i>
                              Search
                            </>
                          )}
                        </motion.button>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              )}

                {/* Search Results */}
                {searchResults && (
                  <motion.div 
                    className="glass-card p-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4">
                      <h3 className="text-lg font-semibold tracking-tight">Search Results</h3>
                      <button
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
                        className="px-4 py-2 bg-white/10 text-white border border-white/30 hover:bg-white/20 transition-all text-sm flex items-center gap-2"
                      >
                        <i className='bx bx-download'></i>
                        Download .txt
                      </button>
                    </div>
                    <div className="bg-osint-bg/50 p-4 overflow-auto border border-osint-border" style={{ maxHeight: '400px' }}>
                      <pre className="text-sm text-osint-secondary whitespace-pre-wrap font-mono">
                        {JSON.stringify(searchResults.result || searchResults, null, 2)}
                      </pre>
                    </div>
                  </motion.div>
                )}

                {/* Recent Searches */}
                {searchHistory.length > 0 && (
                  <motion.div 
                    className="glass-card p-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                  >
                    <h3 className="text-lg font-semibold mb-4 tracking-tight">Recent Searches</h3>
                    <div className="space-y-3">
                      {searchHistory.map((search, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.4 + index * 0.1 }}
                          whileHover={{ scale: 1.02, x: 5 }}
                          onClick={() => {
                            setSearchResults(search.result)
                            setQuery(search.query)
                            setSelectedProvider(search.provider)
                            setSelectedCommand(search.command)
                          }}
                          className="p-4 bg-osint-bg/50 border border-osint-border/50 hover:border-white/50 cursor-pointer transition-all rounded-xl"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">
                              {search.provider} / {search.command}
                            </span>
                            <span className="text-xs text-osint-muted font-mono">
                              {new Date(search.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                          <p className="text-sm text-osint-muted truncate">{search.query}</p>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
          </div>
          )}

          {activeTab === 'intelx' && (
            <motion.div 
              className="max-w-4xl mx-auto space-y-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <motion.div 
                className="glass-card p-6"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1, duration: 0.4 }}
              >
                <motion.div 
                  className="flex items-center gap-3 mb-4"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <motion.div 
                    className="w-1 h-8 bg-white animate-pulse-glow"
                    initial={{ height: 0 }}
                    animate={{ height: 32 }}
                    transition={{ duration: 0.3 }}
                  ></motion.div>
                  <h3 className="text-lg font-semibold tracking-tight">IntelX File Download</h3>
                </motion.div>
                <p className="text-sm text-osint-muted mb-4">Download files from IntelX by System ID</p>
                
                <motion.div 
                  className="mb-4"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <label className="block text-sm text-osint-muted mb-2 tracking-wide">System ID</label>
                  <motion.input
                    type="text"
                    value={intelxSystemId}
                    onChange={(e) => setIntelxSystemId(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleIntelxDownload()}
                    placeholder="Enter IntelX System ID (UUID format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)"
                    className="w-full px-4 py-3 bg-osint-bg/50 border border-osint-border focus:border-white focus:outline-none transition-all rounded-xl"
                    whileFocus={{ scale: 1.02, borderColor: 'rgba(255, 255, 255, 0.3)' }}
                  />
                </motion.div>

                <motion.button
                  onClick={handleIntelxDownload}
                  disabled={intelxDownloading}
                  whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(255, 255, 255, 0.2)' }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="px-6 py-3 bg-white text-black font-semibold hover:bg-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 rounded-xl shadow-lg shadow-white/10"
                >
                  {intelxDownloading ? (
                    <>
                      <motion.i 
                        className='bx bx-loader-alt'
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      ></motion.i>
                      Downloading...
                    </>
                  ) : (
                    <>
                      <i className='bx bx-cloud-download'></i>
                      Download File
                    </>
                  )}
                </motion.button>
              </motion.div>
            </motion.div>
          )}

          {activeTab === 'geolocation' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="h-full flex flex-col"
            >
              <motion.div 
                className="glass-card p-6 mb-4"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <motion.div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold tracking-tight flex items-center gap-2">
                      <i className='bx bx-map text-xl'></i>
                      Geolocation Map
                    </h3>
                    <p className="text-sm text-osint-muted mt-1">Track locations from IP addresses, phone numbers, and domains</p>
                  </div>
                  <motion.div className="flex items-center gap-2">
                    <motion.button
                      onClick={() => setGeoLocations([])}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-4 py-2 bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20 transition-all text-sm flex items-center gap-2"
                    >
                      <i className='bx bx-trash'></i>
                      Clear
                    </motion.button>
                  </motion.div>
                </motion.div>
                
                {/* Manual Location Input */}
                <motion.div 
                  className="mt-4 pt-4 border-t border-osint-border"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <i className='bx bx-plus-circle text-sm text-osint-muted'></i>
                    <span className="text-sm font-medium text-osint-muted">Add Location by Input</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <CustomDropdown
                      options={[
                        { value: 'address', label: 'Address' },
                        { value: 'ip', label: 'IP Address' },
                        { value: 'phone', label: 'Phone Number' },
                        { value: 'email', label: 'Email' }
                      ]}
                      value={manualInput.type}
                      onChange={(value) => setManualInput(prev => ({ ...prev, type: value }))}
                      placeholder="Select type"
                      className="md:col-span-1"
                    />
                    <motion.input
                      type="text"
                      placeholder={manualInput.type === 'address' ? 'Enter address...' : manualInput.type === 'ip' ? 'Enter IP address...' : manualInput.type === 'phone' ? 'Enter phone number...' : 'Enter email...'}
                      value={manualInput.value}
                      onChange={(e) => setManualInput(prev => ({ ...prev, value: e.target.value }))}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddManualLocation()}
                      className="md:col-span-3 px-3 py-2 bg-osint-bg/50 border border-osint-border focus:border-white focus:outline-none transition-all text-sm rounded-lg"
                      whileFocus={{ scale: 1.02 }}
                    />
                  </div>
                  <motion.button
                    onClick={handleAddManualLocation}
                    disabled={addingLocation}
                    whileHover={{ scale: 1.02, boxShadow: '0 0 20px rgba(168, 85, 247, 0.3)' }}
                    whileTap={{ scale: 0.98 }}
                    className="mt-3 px-4 py-2 bg-purple-500/20 text-purple-400 border border-purple-500/30 hover:bg-purple-500/30 transition-all text-sm flex items-center gap-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {addingLocation ? (
                      <>
                        <motion.i 
                          className='bx bx-loader-alt'
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        ></motion.i>
                        Geocoding...
                      </>
                    ) : (
                      <>
                        <i className='bx bx-map-pin'></i>
                        Add Location
                      </>
                    )}
                  </motion.button>
                </motion.div>
              </motion.div>
              
              <div className="flex-1 glass-card overflow-hidden relative border border-osint-border" style={{ height: 'calc(100vh - 300px)', minHeight: '500px' }}>
                {geoLocations.length > 0 ? (
                  <GeolocationMap 
                    locations={geoLocations}
                    onLocationClick={(location) => console.log('Location clicked:', location)}
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center"
                    >
                      <i className='bx bx-map text-6xl text-osint-muted mb-4'></i>
                      <p className="text-osint-muted">No locations tracked yet</p>
                      <p className="text-sm text-osint-muted mt-2">Search for IP addresses, phone numbers, or domains to see their locations on the map</p>
                    </motion.div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'ai-osint' && (
            <AIOsintSearch />
          )}

          {activeTab === 'mapping' && (
            <div className="h-full flex flex-col">
              {/* Graph Controls */}
              <div className="glass-card p-4 mb-4 animate-fade-in">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex-1 min-w-[200px]">
                    <input
                      type="text"
                      placeholder="Search nodes by value (email, phone, IP, username)..."
                      value={nodeSearch}
                      onChange={(e) => setNodeSearch(e.target.value)}
                      className="w-full px-4 py-3 bg-osint-bg/50 border border-osint-border focus:border-white focus:outline-none transition-all text-sm hover:border-white/30"
                    />
                  </div>
                  
                  {/* Custom Entity Type Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setEntityTypeDropdownOpen(!entityTypeDropdownOpen)}
                      className="px-4 py-3 bg-osint-bg/50 border border-osint-border focus:border-white focus:outline-none transition-all text-sm text-left flex items-center gap-2 min-w-[140px] hover:border-white/30"
                    >
                      <span className="capitalize">{selectedEntityType === 'all' ? 'All Types' : selectedEntityType}</span>
                      <i className={`bx bx-chevron-down transition-transform ${entityTypeDropdownOpen ? 'rotate-180' : ''}`}></i>
                    </button>
                    {entityTypeDropdownOpen && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-osint-card border border-osint-border shadow-xl z-[99999] max-h-60 overflow-y-auto">
                        {['all', 'email', 'phone', 'ip', 'crypto', 'username', 'name', 'domain', 'unknown'].map(type => (
                          <button
                            key={type}
                            onClick={() => {
                              setSelectedEntityType(type)
                              setEntityTypeDropdownOpen(false)
                            }}
                            className="w-full px-4 py-3 text-left text-sm text-osint-secondary hover:bg-white/10 hover:text-white transition-colors capitalize"
                          >
                            {type === 'all' ? 'All Types' : type}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* Custom Relationship Type Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setRelationshipTypeDropdownOpen(!relationshipTypeDropdownOpen)}
                      className="px-4 py-3 bg-osint-bg/50 border border-osint-border focus:border-white focus:outline-none transition-all text-sm text-left flex items-center gap-2 min-w-[180px] hover:border-white/30"
                    >
                      <span className="capitalize">{selectedRelationshipType === 'all' ? 'All Relationships' : selectedRelationshipType.replace('_', ' ')}</span>
                      <i className={`bx bx-chevron-down transition-transform ${relationshipTypeDropdownOpen ? 'rotate-180' : ''}`}></i>
                    </button>
                    {relationshipTypeDropdownOpen && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-osint-card border border-osint-border shadow-xl z-[99999] max-h-60 overflow-y-auto">
                        {['all', 'same_value', 'found_in_result'].map(type => (
                          <button
                            key={type}
                            onClick={() => {
                              setSelectedRelationshipType(type)
                              setRelationshipTypeDropdownOpen(false)
                            }}
                            className="w-full px-4 py-3 text-left text-sm text-osint-secondary hover:bg-white/10 hover:text-white transition-colors capitalize"
                          >
                            {type === 'all' ? 'All Relationships' : type.replace('_', ' ')}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <button
                    onClick={exportGraph}
                    className="px-4 py-3 bg-white/10 text-white border border-white/30 hover:bg-white/20 transition-all text-sm flex items-center gap-2"
                  >
                    <i className='bx bx-download'></i>
                    Export
                  </button>
                  
                  <label className="px-4 py-3 bg-white/10 text-white border border-white/30 hover:bg-white/20 transition-all text-sm flex items-center gap-2 cursor-pointer">
                    <i className='bx bx-upload'></i>
                    Import
                    <input
                      type="file"
                      accept=".txt"
                      onChange={importGraph}
                      className="hidden"
                    />
                  </label>
                  
                  <button
                    onClick={clearGraph}
                    className="px-4 py-3 bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20 transition-all text-sm flex items-center gap-2"
                  >
                    <i className='bx bx-trash'></i>
                    Clear
                  </button>
                </div>
              </div>
              
              {/* Graph Container */}
              <div className="flex-1 glass-card overflow-hidden relative border border-osint-border" style={{ height: '600px', minHeight: '400px' }}>
                <ReactFlow
                  nodes={filterNodes()}
                  edges={filterEdges()}
                  onNodesChange={onNodesChange}
                  onEdgesChange={onEdgesChange}
                  onConnect={onConnect}
                  fitView
                  nodeTypes={nodeTypes}
                  className="bg-osint-bg"
                  style={{ background: '#0a0a14', width: '100%', height: '100%' }}
                  defaultViewport={{ x: 0, y: 0, zoom: 1 }}
                  minZoom={0.1}
                  maxZoom={4}
                >
                  <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#1a1a2e" />
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
                    className="w-10 h-10 bg-osint-card border border-osint-border rounded-lg flex items-center justify-center text-white hover:border-white transition-all"
                  >
                    <i className='bx bx-plus'></i>
                  </button>
                  <button
                    onClick={() => {
                      const reactFlowInstance = window.reactFlowInstance
                      if (reactFlowInstance) {
                        reactFlowInstance.zoomOut()
                      }
                    }}
                    className="w-10 h-10 bg-osint-card border border-osint-border flex items-center justify-center text-white hover:border-white transition-all"
                  >
                    <i className='bx bx-minus'></i>
                  </button>
                  <button
                    onClick={() => {
                      const reactFlowInstance = window.reactFlowInstance
                      if (reactFlowInstance) {
                        reactFlowInstance.fitView()
                      }
                    }}
                    className="w-10 h-10 bg-osint-card border border-osint-border flex items-center justify-center text-white hover:border-white transition-all"
                  >
                    <i className='bx bx-expand'></i>
                  </button>
                </div>
              </div>
              
              {/* Manual Node Addition */}
              <div className="glass-card p-6 mt-4">
                <h4 className="text-sm font-semibold mb-4 text-white tracking-wide">Add Manual Node</h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* Custom Dropdown for Type */}
                  <div className="relative">
                    <label className="block text-xs text-osint-muted mb-2 tracking-wide">Type</label>
                    <div className="relative">
                      <button
                        onClick={() => setLeadTypeDropdownOpen(!leadTypeDropdownOpen)}
                        className="w-full px-4 py-3 bg-osint-bg/50 border border-osint-border focus:border-white focus:outline-none transition-all text-sm text-left flex items-center justify-between hover:border-white/50"
                      >
                        <span className={newLead.type ? 'text-osint-secondary' : 'text-osint-muted'}>
                          {newLead.type || 'Select type'}
                        </span>
                        <i className={`bx bx-chevron-down transition-transform ${leadTypeDropdownOpen ? 'rotate-180' : ''}`}></i>
                      </button>
                      {leadTypeDropdownOpen && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-osint-card border border-osint-border shadow-xl z-[99999] max-h-60 overflow-y-auto">
                          {['email', 'phone', 'ip', 'crypto', 'username', 'name', 'domain', 'unknown'].map(type => (
                            <button
                              key={type}
                              onClick={() => {
                                setNewLead(prev => ({ ...prev, type }))
                                setLeadTypeDropdownOpen(false)
                              }}
                              className="w-full px-4 py-3 text-left text-sm text-osint-secondary hover:bg-white/10 hover:text-white transition-colors capitalize"
                            >
                              {type}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-xs text-osint-muted mb-2 tracking-wide">Value</label>
                    <input
                      type="text"
                      placeholder="Enter value (email, phone, IP, username, etc.)"
                      value={newLead.value}
                      onChange={(e) => setNewLead(prev => ({ ...prev, value: e.target.value }))}
                      className="w-full px-4 py-3 bg-osint-bg/50 border border-osint-border focus:border-white focus:outline-none transition-all text-sm hover:border-white/30"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs text-osint-muted mb-2 tracking-wide">Source</label>
                    <input
                      type="text"
                      placeholder="Enter source (provider name or URL)..."
                      value={newLead.source}
                      onChange={(e) => setNewLead(prev => ({ ...prev, source: e.target.value }))}
                      className="w-full px-4 py-3 bg-osint-bg/50 border border-osint-border focus:border-white focus:outline-none transition-all text-sm hover:border-white/30"
                    />
                  </div>
                </div>
                
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() => addManualNode(newLead.type, newLead.value, newLead.source)}
                    className="px-6 py-3 bg-white text-black font-semibold hover:bg-gray-200 transition-all text-sm flex items-center gap-2"
                  >
                    <i className='bx bx-plus'></i>
                    Add Node
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="max-w-4xl mx-auto">
              <div className="glass-card p-6 animate-fade-in">
                <h3 className="text-lg font-semibold mb-4 tracking-tight">Search History</h3>
                {searchHistory.length > 0 ? (
                  <div className="space-y-3">
                    {searchHistory.map((search, index) => (
                      <div
                        key={index}
                        onClick={() => {
                          setActiveTab('search')
                          setSearchResults(search.result)
                          setQuery(search.query)
                          setSelectedProvider(search.provider)
                          setSelectedCommand(search.command)
                        }}
                        className="p-4 bg-osint-bg/50 border border-osint-border/50 hover:border-white/50 cursor-pointer transition-all"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">
                            {search.provider} / {search.command}
                          </span>
                          <span className="text-xs text-osint-muted font-mono">
                            {new Date(search.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm text-osint-muted truncate">{search.query}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-osint-muted text-center py-8">No search history yet</p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'transactions' && (
            <div className="max-w-4xl mx-auto">
              <div className="glass-card p-6 animate-fade-in">
                <h3 className="text-lg font-semibold mb-4 tracking-tight">Transaction History</h3>
                {transactions.length > 0 ? (
                  <div className="space-y-3">
                    {transactions.map(tx => (
                      <div key={tx.id} className="p-4 bg-osint-bg/50 border border-osint-border/50">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium capitalize">{tx.type}</span>
                          <span className={`text-xs px-2 py-1 ${
                            tx.status === 'completed' ? 'bg-white/20 text-white' :
                            tx.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' :
                            'bg-red-500/20 text-red-500'
                          }`}>
                            {tx.status}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-osint-muted font-mono">${tx.amount}</span>
                          <span className="text-osint-muted font-mono">
                            {new Date(tx.createdAt).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-osint-muted text-center py-8">No transactions yet</p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="max-w-4xl mx-auto">
              <div className="glass-card p-6 animate-fade-in">
                <h3 className="text-lg font-semibold mb-4 tracking-tight">Account Settings</h3>
                <div className="space-y-4">
                  <div className="p-4 bg-osint-bg/50 border border-osint-border/50">
                    <p className="text-sm text-osint-muted mb-1 tracking-wide">Username</p>
                    <p className="font-medium">{user?.username}</p>
                  </div>
                  <div className="p-4 bg-osint-bg/50 border border-osint-border/50">
                    <p className="text-sm text-osint-muted mb-1 tracking-wide">Display Name</p>
                    <p className="font-medium">{user?.global_name || user?.username}</p>
                  </div>
                  <div className="p-4 bg-osint-bg/50 border border-osint-border/50">
                    <p className="text-sm text-osint-muted mb-1 tracking-wide">Discord ID</p>
                    <p className="font-medium font-mono">{user?.discordId}</p>
                  </div>
                  <div className="p-4 bg-osint-bg/50 border border-osint-border/50">
                    <p className="text-sm text-osint-muted mb-1 tracking-wide">Member Since</p>
                    <p className="font-medium">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Custom Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 px-6 py-4 shadow-lg z-[200] animate-slide-up ${
          toast.type === 'success' ? 'bg-white/20 border border-white/50 text-white' :
          toast.type === 'error' ? 'bg-red-500/20 border border-red-500/50 text-red-400' :
          'bg-osint-card border border-osint-border text-osint-secondary'
        }`}>
          <div className="flex items-center gap-3">
            <i className={`bx ${
              toast.type === 'success' ? 'bx-check-circle' :
              toast.type === 'error' ? 'bx-x-circle' : 'bx-info-circle'
            } text-xl`}></i>
            <span>{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard
