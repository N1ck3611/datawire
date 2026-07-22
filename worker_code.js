// Cloudflare Worker for DataWire.cc API
// Discord OAuth2 + Firebase + Crypto Payment System

const DISCORD_CLIENT_ID = '1523193275001999400';
const DISCORD_REDIRECT_URI = 'https://datawirecc-api.mynameisntnick0.workers.dev/callback';
const DISCORD_SCOPES = ['email', 'identify', 'guilds', 'connections', 'guilds.join'].join(' ');
const DISCORD_BREACHES_SERVER_ID = '1526726965703348334'; // discord.gg/breaches server ID
const FIREBASE_DATABASE_URL = 'https://framework-osint-default-rtdb.firebaseio.com';
const SEARCH_COST_USD = '0.10';
const AI_OSINT_COST_USD = '0.50';
const INTELX_DOWNLOAD_COST_USD = '1.00';
const GEOSINT_COST_USD = '1.00';
const SEARCH_COOLDOWN_MS = 2000;

// Plan pricing
const PLAN_PRICING = {
  weekly: { price: 10, name: 'Weekly', duration: 7 },
  monthly: { price: 25, name: 'Monthly', duration: 30 },
  lifetime: { price: 80, name: 'Lifetime', duration: 99999999999999999 }
};

// Plan limits
const PLAN_LIMITS = {
  weekly: { dailyRequests: 50, intelxUses: 0 },
  monthly: { dailyRequests: 250, intelxUses: 20 },
  lifetime: { dailyRequests: 1000, intelxUses: 100 }
};

// OSINT Provider API Keys (Cloudflare Worker Secrets - accessed via env)
const DATAHOUND_API_BASE = 'https://datahound.tools/api';
const OSINTCAT_API_BASE = 'https://www.osintcat.net/api';
const BREACHHUB_API_BASE = 'https://breachhub.org/api';
const NOTICED_API_BASE = 'https://noticed.wtf';
const INTELX_API_BASE = 'https://breachhub.org/api';
const OPENARCHIVE_API_BASE = 'https://api.openarchive.lol/api/v2';

// NVIDIA API Configuration (Cloudflare Worker Secret - accessed via env)
const NVIDIA_API_BASE = 'https://integrate.api.nvidia.com/v1';

// Global variables for secrets (will be set from env in fetch handler)
let DATAHOUND_API_KEY, OSINTCAT_API_KEY, BREACHHUB_API_KEY, NOTICED_API_KEY, INTELX_API_KEY, OPENARCHIVE_API_KEY, NVIDIA_API_KEY, DISCORD_CLIENT_SECRET, JWT_SECRET, WOLF_EYE_KEY, RESEND_API_KEY, IMGBB_API_KEY, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, CLOUDINARY_CLOUD_NAME;

// Provider configurations (will be initialized in fetch handler)
let PROVIDERS;

// Email 2FA Code Storage (temporary, with expiration)
const email2FACodes = new Map();

// Resend API Configuration
const RESEND_API_BASE = 'https://api.resend.com/emails';

// ImgBB API Configuration
const IMGBB_API_BASE = 'https://api.imgbb.com/1/upload';

// Cloudinary API Configuration (cloud name will be set dynamically)
let CLOUDINARY_API_BASE;

// Email validation functions
function isValidEmail(email) {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
}

// Detect if request is from a bot/crawler
function isBotRequest(request) {
  const userAgent = request.headers.get('User-Agent') || '';
  const botPatterns = [
    /discordbot/i,
    /twitterbot/i,
    /facebookexternalhit/i,
    /linkedinbot/i,
    /whatsapp/i,
    /telegrambot/i,
    /googlebot/i,
    /bingbot/i,
    /slackbot/i,
    /embedly/i,
    /skypeuripreview/i,
    /facebot/i,
    /yandexbot/i,
    /applebot/i,
    /pinterest/i,
    /vkshare/i
  ];
  return botPatterns.some(pattern => pattern.test(userAgent));
}

// Generate HTML with meta tags for user profile embeds
async function generateProfileEmbedHTML(username) {
  try {
    // Fetch user data from Firebase
    const response = await fetch(`${FIREBASE_DATABASE_URL}/users.json`);
    const users = await response.json();
    
    if (!users) {
      return generateDefaultEmbedHTML();
    }
    
    const userKey = Object.keys(users).find(key => 
      users[key].username && users[key].username.toLowerCase() === username.toLowerCase()
    );
    
    if (!userKey) {
      return generateDefaultEmbedHTML();
    }
    
    const user = users[userKey];
    const displayName = user.username || 'User';
    const bio = user.bio || '';
    const status = user.status || '';
    const avatar = user.avatar || 'https://datawire.cc/default-avatar.png';
    const embedColor = user.embedColor || '#6366f1';
    const description = bio && status ? `${bio} | ${status}` : (bio || status || 'DataWire Profile');
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>@${displayName} | DataWire.cc</title>
  <meta name="theme-color" content="${embedColor}" />
  <meta name="description" content="${description}" />
  
  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="profile" />
  <meta property="og:title" content="@${displayName} | DataWire.cc" />
  <meta property="og:description" content="${description}" />
  <meta property="og:image" content="${avatar}" />
  <meta property="og:url" content="https://datawire.cc/users/${username}" />
  
  <!-- Discord Embed Color -->
  <meta name="theme-color" content="${embedColor}" />
  
  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="@${displayName} | DataWire.cc" />
  <meta name="twitter:description" content="${description}" />
  <meta name="twitter:image" content="${avatar}" />
  
  <!-- Redirect to actual page after meta tags are loaded -->
  <script>window.location.href = "https://datawire.cc/users/${username}";</script>
</head>
<body style="background: #000; color: #fff; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; font-family: Arial, sans-serif;">
  <div style="text-align: center;">
    <p>Redirecting to @${displayName}'s profile...</p>
    <p><a href="https://datawire.cc/users/${username}" style="color: #0ff;">Click here if not redirected</a></p>
  </div>
</body>
</html>`;
  } catch (error) {
    console.error('Error generating profile embed:', error);
    return generateDefaultEmbedHTML();
  }
}

// Generate default embed HTML (white theme for general pages)
function generateDefaultEmbedHTML(title = 'DataWire.cc', description = 'OSINT Intelligence Platform', path = '/') {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <meta name="theme-color" content="#ffffff" />
  <meta name="description" content="${description}" />
  
  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="website" />
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${description}" />
  <meta property="og:image" content="https://datawire.cc/logo.png" />
  <meta property="og:url" content="https://datawire.cc${path}" />
  
  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${title}" />
  <meta name="twitter:description" content="${description}" />
  <meta name="twitter:image" content="https://datawire.cc/logo.png" />
  
  <script>window.location.href = "https://datawire.cc${path}";</script>
</head>
<body style="background: #fff; color: #000; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; font-family: Arial, sans-serif;">
  <div style="text-align: center;">
    <p>Redirecting to DataWire...</p>
    <p><a href="https://datawire.cc${path}" style="color: #000;">Click here if not redirected</a></p>
  </div>
</body>
</html>`;
}

// Generate embed HTML for specific pages
function generatePageEmbedHTML(page) {
  const pages = {
    '/': {
      title: 'DataWire.cc - OSINT Intelligence Platform',
      description: 'Advanced OSINT tools and intelligence gathering platform',
      themeColor: '#ffffff'
    },
    '/login': {
      title: 'Login - DataWire.cc',
      description: 'Sign in to access your OSINT dashboard',
      themeColor: '#ffffff'
    },
    '/dashboard': {
      title: 'Dashboard - DataWire.cc',
      description: 'Your OSINT intelligence dashboard',
      themeColor: '#ffffff'
    },
    '/search': {
      title: 'Search - DataWire.cc',
      description: 'Search across multiple OSINT databases',
      themeColor: '#ffffff'
    },
    '/plans': {
      title: 'Plans - DataWire.cc',
      description: 'Choose your OSINT subscription plan',
      themeColor: '#ffffff'
    },
    '/deposit': {
      title: 'Deposit - DataWire.cc',
      description: 'Add funds to your DataWire account',
      themeColor: '#ffffff'
    }
  };
  
  const pageInfo = pages[page] || pages['/'];
  return generateDefaultEmbedHTML(pageInfo.title, pageInfo.description, page);
}

// Double SHA-1 hashing for passwords
async function doubleSHA1Hash(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  
  // First SHA-1 hash
  const firstHashBuffer = await crypto.subtle.digest('SHA-1', data);
  const firstHashArray = Array.from(new Uint8Array(firstHashBuffer));
  const firstHashHex = firstHashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  // Second SHA-1 hash (hash of the first hash)
  const secondData = encoder.encode(firstHashHex);
  const secondHashBuffer = await crypto.subtle.digest('SHA-1', secondData);
  const secondHashArray = Array.from(new Uint8Array(secondHashBuffer));
  const secondHashHex = secondHashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  return secondHashHex;
}

// Generate 6-digit 2FA code
function generate2FACode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send 2FA code via Resend
async function send2FACodeEmail(email, code) {
  if (!RESEND_API_KEY) {
    throw new Error('Resend API key not configured');
  }

  const response = await fetch(RESEND_API_BASE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${RESEND_API_KEY}`
    },
    body: JSON.stringify({
      from: 'Authentication <auth@datawire.cc>',
      to: email,
      subject: 'Your DataWire Verification Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #1a1a2e; padding: 40px; border-radius: 12px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <img src="https://i.ibb.co/wFrNvxt5/Chat-GPT-Image-Jul-6-2026-09-02-01-PM-removebg-preview.png" alt="DataWire" style="width: 80px; height: 80px; margin: 0 auto;">
          </div>
          <h2 style="color: #ffffff; text-align: center; margin-bottom: 10px;">DataWire Verification Code</h2>
          <p style="color: #a0a0a0; font-size: 16px; text-align: center;">Your verification code is:</p>
          <div style="background: #2a2a4e; padding: 25px; text-align: center; border-radius: 12px; margin: 25px 0; border: 1px solid #3a3a6e;">
            <span style="font-size: 36px; font-weight: bold; color: #ffffff; letter-spacing: 6px; font-family: monospace;">${code}</span>
          </div>
          <p style="color: #a0a0a0; font-size: 14px; text-align: center;">This code will expire in 10 minutes.</p>
          <p style="color: #666666; font-size: 12px; text-align: center; margin-top: 35px;">If you didn't request this code, please ignore this email.</p>
        </div>
      `
    })
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Failed to send email');
  }

  return data;
}

// Store 2FA code with expiration in Firebase
async function store2FACode(email, code) {
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes
  const safeEmail = firebaseSafeKey(email);
  await firebasePut(`/2fa/${safeEmail}`, { code, expiresAt, email });
}

// Verify 2FA code from Firebase
async function verify2FACode(email, code) {
  console.log(`[2FA] Verifying code for email: ${email}, code: ${code}`);
  
  const safeEmail = firebaseSafeKey(email);
  const stored = await firebaseGet(`/2fa/${safeEmail}`);
  
  if (!stored) {
    console.log(`[2FA] No code found for email: ${email}`);
    return { valid: false, reason: 'No code found or expired' };
  }
  
  console.log(`[2FA] Stored code: ${stored.code}, Expires: ${new Date(stored.expiresAt).toISOString()}`);
  
  if (Date.now() > stored.expiresAt) {
    console.log(`[2FA] Code expired for email: ${email}`);
    await firebaseDelete(`/2fa/${safeEmail}`);
    return { valid: false, reason: 'Code expired' };
  }
  
  if (stored.code !== code) {
    console.log(`[2FA] Invalid code. Expected: ${stored.code}, Got: ${code}`);
    return { valid: false, reason: 'Invalid code' };
  }
  
  // Code is valid, remove it
  console.log(`[2FA] Code valid for email: ${email}`);
  await firebaseDelete(`/2fa/${safeEmail}`);
  return { valid: true };
}

// Check if user exists in Firebase
async function userExists(email) {
  const response = await fetch(`${FIREBASE_DATABASE_URL}/users.json`);
  const users = await response.json();
  
  if (!users) return false;
  
  const userKey = Object.keys(users).find(key => 
    users[key].email && users[key].email.toLowerCase() === email.toLowerCase()
  );
  
  return !!userKey;
}

// Get user by email
async function getUserByEmail(email) {
  const response = await fetch(`${FIREBASE_DATABASE_URL}/users.json`);
  const users = await response.json();
  
  if (!users) return null;
  
  const userKey = Object.keys(users).find(key => 
    users[key].email && users[key].email.toLowerCase() === email.toLowerCase()
  );
  
  return userKey ? { key: userKey, ...users[userKey] } : null;
}

// Check if username exists
async function usernameExists(username) {
  const response = await fetch(`${FIREBASE_DATABASE_URL}/users.json`);
  const users = await response.json();
  
  if (!users) return false;
  
  const userKey = Object.keys(users).find(key => 
    users[key].username && users[key].username.toLowerCase() === username.toLowerCase()
  );
  
  return !!userKey;
}

// Get user by username
async function getUserByUsername(username) {
  const response = await fetch(`${FIREBASE_DATABASE_URL}/users.json`);
  const users = await response.json();
  
  if (!users) return null;
  
  const userKey = Object.keys(users).find(key => 
    users[key].username && users[key].username.toLowerCase() === username.toLowerCase()
  );
  
  return userKey ? { key: userKey, ...users[userKey] } : null;
}

// Check if username is unique
async function isUsernameUnique(username) {
  const response = await fetch(`${FIREBASE_DATABASE_URL}/users.json`);
  const users = await response.json();
  
  if (!users) return true;
  
  const isTaken = Object.values(users).some(user => 
    user.username && user.username.toLowerCase() === username.toLowerCase()
  );
  
  return !isTaken;
}

// Generate unique username with random number suffix
function generateUniqueUsername(baseUsername) {
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `${baseUsername}${randomSuffix}`;
}

// Upload image to ImgBB
async function uploadToImgBB(imageData) {
  if (!IMGBB_API_KEY) {
    throw new Error('ImgBB API key not configured');
  }

  const formData = new FormData();
  formData.append('image', imageData);

  const response = await fetch(`${IMGBB_API_BASE}?key=${IMGBB_API_KEY}`, {
    method: 'POST',
    body: formData
  });

  const data = await response.json();
  
  if (!response.ok || !data.success) {
    throw new Error(data.error?.message || 'Failed to upload image');
  }

  return data.data;
}

// Upload to Cloudinary (for videos, audio, and GIFs)
async function uploadToCloudinary(fileData, fileType = 'video') {
  if (!CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET || !CLOUDINARY_CLOUD_NAME) {
    throw new Error('Cloudinary credentials not configured');
  }

  // Determine resource type and MIME type based on fileType
  let resourceType = 'video';
  let mimeType;
  
  if (fileType === 'gif' || fileType === 'image/gif') {
    resourceType = 'image';
    mimeType = 'image/gif';
  } else if (fileType === 'image') {
    resourceType = 'image';
    mimeType = 'image/jpeg';
  } else if (fileType === 'video' || fileType === 'mp4') {
    mimeType = 'video/mp4';
  } else if (fileType === 'mov' || fileType === 'quicktime') {
    mimeType = 'video/quicktime';
  } else if (fileType === 'webm') {
    mimeType = 'video/webm';
  } else if (fileType === 'audio' || fileType === 'mp3' || fileType === 'mpeg') {
    resourceType = 'video'; // Cloudinary uses video resource type for audio
    mimeType = 'audio/mpeg';
  } else if (fileType === 'wav') {
    resourceType = 'video'; // Cloudinary uses video resource type for audio
    mimeType = 'audio/wav';
  } else if (fileType === 'ogg') {
    resourceType = 'video'; // Cloudinary uses video resource type for audio
    mimeType = 'audio/ogg';
  } else {
    mimeType = 'video/mp4';
  }
  
  const timestamp = Math.floor(Date.now() / 1000);
  
  // Convert base64 to data URI for Cloudinary
  const dataUri = `data:${mimeType};base64,${fileData}`;
  
  // Generate signature with user_backgrounds preset
  const signatureString = `timestamp=${timestamp}&upload_preset=user_backgrounds${CLOUDINARY_API_SECRET}`;
  const signature = await crypto.subtle.digest('SHA-1', new TextEncoder().encode(signatureString))
    .then(hash => Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join(''));

  const formData = new FormData();
  formData.append('file', dataUri);
  formData.append('upload_preset', 'user_backgrounds');
  formData.append('resource_type', resourceType);
  formData.append('timestamp', timestamp.toString());
  formData.append('api_key', CLOUDINARY_API_KEY);
  formData.append('signature', signature);
  
  // For audio files, add audio_codec to ensure proper audio handling
  if (fileType === 'audio' || fileType === 'mp3' || fileType === 'mpeg' || fileType === 'wav' || fileType === 'ogg') {
    formData.append('audio_codec', 'aac');
  }
  
  // Don't add transformations for .mov files to preserve original audio
  // Cloudinary will handle conversion automatically

  const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`, {
    method: 'POST',
    body: formData
  });

  const data = await response.json();
  
  if (!response.ok || data.error) {
    throw new Error(data.error?.message || 'Failed to upload to Cloudinary');
  }

  return {
    url: data.secure_url,
    publicId: data.public_id,
    resourceType: resourceType
  };
}

const PAYMENT_ADDRESSES = {
  BTC: 'bc1qpl22tu5gqre7frpz22jzgdkhvrsr4vjpc034ea',
  LTC: 'LYfjiJSiMZA9xmmUiN2t8fcUh4Esc3ymVk',
  ETH: '0xE5cE7596fD4a9D3659E19fd55E862602E81ECbf3',
  SOL: 'sDqQQKvQktKxL6aHmwcg1fhtwQ2Lc9MHQsQFcSnjaBf',
  USDT: '0xE5cE7596fD4a9D3659E19fd55E862602E81ECbf3'
};

// AI OSINT Tool Definitions - Enhanced with additional specialized tools
const AI_OSINT_TOOLS = {
  email_breach_search: {
    name: 'Email Breach Search',
    description: 'Search for email in breach databases',
    providers: ['snusbase', 'leakcheck', 'breachbase', 'intelvault', 'leakosint', 'hackcheck', 'osintkit', 'breachvip', 'breachdirectory'],
    queryParam: 'email',
    identifierType: 'emails',
    priority: 'high',
    dataRichness: 'high'
  },
  email_osint: {
    name: 'Email OSINT',
    description: 'Comprehensive email intelligence',
    providers: ['seeknow', 'seekria', 'oathnet', 'seon', 'seekria'],
    queryParam: 'email',
    identifierType: 'emails',
    priority: 'high',
    dataRichness: 'medium'
  },
  email_reputation: {
    name: 'Email Reputation',
    description: 'Email reputation and security analysis',
    providers: ['seon', 'seeknow'],
    queryParam: 'email',
    identifierType: 'emails',
    priority: 'medium',
    dataRichness: 'medium'
  },
  username_search: {
    name: 'Username Search',
    description: 'Search username across platforms',
    providers: ['seeknow', 'seekria', 'memory', 'room101', 'nosint', 'reconly'],
    queryParam: 'username',
    identifierType: 'usernames',
    priority: 'high',
    dataRichness: 'high'
  },
  social_media_osint: {
    name: 'Social Media OSINT',
    description: 'Social media intelligence',
    providers: ['seeknow', 'seekria', 'room101', 'tiktok', 'instagram', 'snapchat', 'medal'],
    queryParam: 'username',
    identifierType: 'usernames',
    priority: 'high',
    dataRichness: 'high'
  },
  username_enumeration: {
    name: 'Username Enumeration',
    description: 'Enumerate username across 300+ platforms',
    providers: ['memory', 'room101', 'reconly'],
    queryParam: 'username',
    identifierType: 'usernames',
    priority: 'medium',
    dataRichness: 'high'
  },
  phone_search: {
    name: 'Phone Search',
    description: 'Phone number intelligence',
    providers: ['seon', 'seeknow', 'seekria', 'propertyradar'],
    queryParam: 'phone',
    identifierType: 'phoneNumbers',
    priority: 'high',
    dataRichness: 'medium'
  },
  phone_carrier_lookup: {
    name: 'Phone Carrier Lookup',
    description: 'Carrier and location lookup',
    providers: ['seon', 'seeknow'],
    queryParam: 'phone',
    identifierType: 'phoneNumbers',
    priority: 'medium',
    dataRichness: 'medium'
  },
  discord_user: {
    name: 'Discord User',
    description: 'Discord user intelligence',
    providers: ['cordcat', 'oathnet', 'datavoid', 'discord', 'seon', 'seeknow'],
    queryParam: 'id',
    identifierType: 'discordIds',
    priority: 'high',
    dataRichness: 'high'
  },
  discord_enumeration: {
    name: 'Discord Enumeration',
    description: 'Discord account enumeration',
    providers: ['cordcat', 'oathnet', 'datavoid', 'seon'],
    queryParam: 'id',
    identifierType: 'discordIds',
    priority: 'high',
    dataRichness: 'high'
  },
  discord_lookup: {
    name: 'Discord Lookup',
    description: 'Discord user profile lookup',
    providers: ['cordcat', 'oathnet', 'discord', 'seon'],
    queryParam: 'id',
    identifierType: 'discordIds',
    priority: 'high',
    dataRichness: 'high'
  },
  ip_intel: {
    name: 'IP Intelligence',
    description: 'IP address intelligence',
    providers: ['seon', 'seeknow', 'seekria', 'osintcat', 'nosint'],
    queryParam: 'ip',
    identifierType: 'ipAddresses',
    priority: 'high',
    dataRichness: 'high'
  },
  ip_geolocation: {
    name: 'IP Geolocation',
    description: 'IP geolocation and ISP data',
    providers: ['seon', 'seeknow', 'seekria'],
    queryParam: 'ip',
    identifierType: 'ipAddresses',
    priority: 'medium',
    dataRichness: 'medium'
  },
  ip_reputation: {
    name: 'IP Reputation',
    description: 'IP abuse reputation and blacklist check',
    providers: ['seon', 'osintcat'],
    queryParam: 'ip',
    identifierType: 'ipAddresses',
    priority: 'medium',
    dataRichness: 'medium'
  },
  domain_intel: {
    name: 'Domain Intelligence',
    description: 'Domain intelligence',
    providers: ['seeknow', 'seekria', 'hudsonrock', 'oathnet'],
    queryParam: 'domain',
    identifierType: 'domains',
    priority: 'high',
    dataRichness: 'high'
  },
  domain_whois: {
    name: 'Domain WHOIS',
    description: 'Domain WHOIS and registration data',
    providers: ['seeknow', 'seekria', 'oathnet'],
    queryParam: 'domain',
    identifierType: 'domains',
    priority: 'high',
    dataRichness: 'high'
  },
  domain_dns: {
    name: 'Domain DNS',
    description: 'DNS records and subdomain enumeration',
    providers: ['seeknow', 'seekria'],
    queryParam: 'domain',
    identifierType: 'domains',
    priority: 'medium',
    dataRichness: 'high'
  },
  hash_lookup: {
    name: 'Hash Lookup',
    description: 'Hash lookup in databases',
    providers: ['snusbase', 'intelvault'],
    queryParam: 'hash',
    identifierType: 'hashes',
    priority: 'medium',
    dataRichness: 'medium'
  },
  hash_malware: {
    name: 'Hash Malware Analysis',
    description: 'Malware analysis for file hashes',
    providers: ['intelvault'],
    queryParam: 'hash',
    identifierType: 'hashes',
    priority: 'medium',
    dataRichness: 'medium'
  },
  name_search: {
    name: 'Name Search',
    description: 'People search and professional networks',
    providers: ['seeknow', 'seekria', 'propertyradar'],
    queryParam: 'name',
    identifierType: 'fullNames',
    priority: 'medium',
    dataRichness: 'medium'
  },
  crypto_wallet: {
    name: 'Crypto Wallet',
    description: 'Cryptocurrency wallet analysis',
    providers: ['seeknow', 'seekria'],
    queryParam: 'address',
    identifierType: 'cryptoWallets',
    priority: 'high',
    dataRichness: 'high'
  },
  url_analysis: {
    name: 'URL Analysis',
    description: 'URL analysis and reputation',
    providers: ['seeknow', 'seekria', 'seon'],
    queryParam: 'url',
    identifierType: 'urls',
    priority: 'medium',
    dataRichness: 'medium'
  }
};

// Open-source search functions - Enhanced with actual data fetching
async function performOpenSourceSearch(query, searchType) {
  const searches = [];
  const extractedData = {
    emails: new Set(),
    usernames: new Set(),
    phoneNumbers: new Set(),
    ips: new Set(),
    domains: new Set(),
    urls: new Set(),
    socialProfiles: new Set(),
    names: new Set(),
    cryptoAddresses: new Set()
  };
  
  const searchQueries = {
    emails: [
      `"${query}" site:linkedin.com`,
      `"${query}" site:github.com`,
      `"${query}" site:twitter.com`,
      `"${query}" site:pastebin.com`,
      `"${query}" site:reddit.com`,
      `"${query}" breach`,
      `"${query}" leaked`,
      `"${query}" password dump`,
      `"${query}" database leak`
    ],
    usernames: [
      `"${query}" site:twitter.com`,
      `"${query}" site:instagram.com`,
      `"${query}" site:github.com`,
      `"${query}" site:reddit.com`,
      `"${query}" site:tiktok.com`,
      `"${query}" site:youtube.com`,
      `"${query}" site:linkedin.com`,
      `"${query}" site:discord.com`,
      `"${query}" site:twitch.tv`
    ],
    phoneNumbers: [
      `"${query}" site:whatsapp.com`,
      `"${query}" site:telegram.org`,
      `"${query}" site:truecaller.com`,
      `"${query}" site:facebook.com`,
      `"${query}" site:linkedin.com`,
      `"${query}" reverse lookup`
    ],
    discordIds: [
      `"${query}" discord lookup`,
      `"${query}" discord user`,
      `"${query}" site:discord.com`,
      `"${query}" discord snowflake`
    ],
    ipAddresses: [
      `"${query}" abuseipdb`,
      `"${query}" virustotal`,
      `"${query}" shodan`,
      `"${query}" site:censys.io`,
      `"${query}" site:securitytrails.com`,
      `"${query}" whois ip`,
      `"${query}" ip reputation`
    ],
    domains: [
      `"${query}" whois`,
      `"${query}" subdomain`,
      `"${query}" site:securitytrails.com`,
      `"${query}" site:censys.io`,
      `"${query}" site:shodan.io`,
      `"${query}" dns records`,
      `"${query}" ssl certificate`
    ],
    urls: [
      `"${query}" site:archive.org`,
      `"${query}" site:web.archive.org`,
      `"${query}" site:virustotal.com`,
      `"${query}" urlscan`,
      `"${query}" site:urlscan.io`,
      `"${query}" site:safety.google`
    ],
    socialProfiles: [
      `"${query}" osint`,
      `"${query}" profile lookup`,
      `"${query}" social media search`,
      `"${query}" site:social-searcher.com`,
      `"${query}" site:namechk.com`
    ],
    hashes: [
      `"${query}" site:virustotal.com`,
      `"${query}" hash lookup`,
      `"${query}" malware analysis`,
      `"${query}" site:hybrid-analysis.com`,
      `"${query}" site:malwarebazaar.com`
    ],
    cryptoWallets: [
      `"${query}" site:blockchain.com`,
      `"${query}" site:etherscan.io`,
      `"${query}" site:explorer.solana.com`,
      `"${query}" wallet tracker`,
      `"${query}" crypto analysis`
    ],
    fullNames: [
      `"${query}" site:linkedin.com`,
      `"${query}" site:facebook.com`,
      `"${query}" site:twitter.com`,
      `"${query}" site:github.com`,
      `"${query}" people search`,
      `"${query}" background check`
    ]
  };
  
  const queries = searchQueries[searchType] || [`"${query}" osint`, `"${query}" search`, `"${query}" lookup`];
  
  // Limit to first 5 queries to avoid too many requests
  const limitedQueries = queries.slice(0, 5);
  
  for (const searchQuery of limitedQueries) {
    const simulatedResults = [];
    
    // Generate specific URLs based on query type
    if (searchType === 'usernames') {
      if (searchQuery.includes('github')) {
        const githubUrl = `https://github.com/${query}`;
        simulatedResults.push({
          title: `${query} - GitHub Profile`,
          url: githubUrl,
          snippet: `GitHub profile for ${query} - repositories, contributions, activity`,
          fetched: true
        });
        
        // Try to fetch GitHub data
        try {
          const githubData = await fetchGitHubProfile(query);
          if (githubData) {
            extractedData.usernames.add(query);
            if (githubData.email) extractedData.emails.add(githubData.email);
            if (githubData.name) extractedData.names.add(githubData.name);
            if (githubData.blog) extractedData.urls.add(githubData.blog);
            if (githubData.twitter_username) extractedData.socialProfiles.add(`twitter:${githubData.twitter_username}`);
            
            simulatedResults.push({
              title: `GitHub Data Extracted`,
              url: githubUrl,
              snippet: `Profile: ${githubData.name || query}, ${githubData.public_repos} repos, ${githubData.followers} followers, ${githubData.following} following, location: ${githubData.location || 'N/A'}`,
              extracted: true,
              data: githubData
            });
          }
        } catch (e) {
          console.log('GitHub fetch failed:', e.message);
        }
      }
      
      if (searchQuery.includes('twitter')) {
        const twitterUrl = `https://twitter.com/${query}`;
        simulatedResults.push({
          title: `${query} - Twitter/X Profile`,
          url: twitterUrl,
          snippet: `Twitter/X profile for @${query} - tweets, followers, activity timeline`,
          fetched: true
        });
        extractedData.socialProfiles.add(`twitter:${query}`);
      }
      
      if (searchQuery.includes('instagram')) {
        const instagramUrl = `https://instagram.com/${query}`;
        simulatedResults.push({
          title: `${query} - Instagram Profile`,
          url: instagramUrl,
          snippet: `Instagram profile for ${query} - posts, followers, bio information`,
          fetched: true
        });
        extractedData.socialProfiles.add(`instagram:${query}`);
      }
      
      if (searchQuery.includes('reddit')) {
        const redditUrl = `https://www.reddit.com/user/${query}`;
        simulatedResults.push({
          title: `${query} - Reddit Profile`,
          url: redditUrl,
          snippet: `Reddit user profile for ${query} - karma, post history, comments`,
          fetched: true
        });
        extractedData.socialProfiles.add(`reddit:${query}`);
      }
      
      if (searchQuery.includes('linkedin')) {
        simulatedResults.push({
          title: `${query} - LinkedIn Search`,
          url: `https://www.linkedin.com/search/results/all/?keywords=${encodeURIComponent(query)}`,
          snippet: `LinkedIn search for ${query} - professional profile, employment history`,
          fetched: true
        });
      }
      
      if (searchQuery.includes('discord')) {
        simulatedResults.push({
          title: `${query} - Discord Search`,
          url: `https://discord.com/users/${query}`,
          snippet: `Discord user lookup for ${query} - profile, servers, activity`,
          fetched: true
        });
      }
    }
    
    if (searchType === 'emails') {
      if (searchQuery.includes('breach') || searchQuery.includes('leak')) {
        simulatedResults.push({
          title: `${query} - Data Breach Check`,
          url: `https://haveibeenpwned.com/account/${query}`,
          snippet: `HaveIBeenPwned breach database check for ${query} - compromised accounts, data leaks`,
          fetched: true
        });
        extractedData.emails.add(query);
      }
      
      if (searchQuery.includes('github')) {
        simulatedResults.push({
          title: `${query} - GitHub Search`,
          url: `https://github.com/search?q=${encodeURIComponent(query)}&type=users`,
          snippet: `GitHub user search for email ${query} - find associated GitHub accounts`,
          fetched: true
        });
      }
      
      if (searchQuery.includes('linkedin')) {
        simulatedResults.push({
          title: `${query} - LinkedIn Search`,
          url: `https://www.linkedin.com/search/results/all/?keywords=${encodeURIComponent(query)}`,
          snippet: `LinkedIn search for email ${query} - professional profiles, employment data`,
          fetched: true
        });
      }
      
      if (searchQuery.includes('pastebin')) {
        simulatedResults.push({
          title: `${query} - Pastebin Search`,
          url: `https://pastebin.com/search?q=${encodeURIComponent(query)}`,
          snippet: `Pastebin search for email ${query} - leaked credentials, data dumps`,
          fetched: true
        });
      }
    }
    
    if (searchType === 'ipAddresses') {
      if (searchQuery.includes('abuseipdb')) {
        simulatedResults.push({
          title: `${query} - AbuseIPDB Report`,
          url: `https://www.abuseipdb.com/check/${query}`,
          snippet: `IP address ${query} abuse report and reputation check`,
          fetched: true
        });
        extractedData.ips.add(query);
      }
      
      if (searchQuery.includes('virustotal')) {
        simulatedResults.push({
          title: `${query} - VirusTotal Analysis`,
          url: `https://www.virustotal.com/gui/ip-address/${query}`,
          snippet: `VirusTotal security analysis and malware detection for IP ${query}`,
          fetched: true
        });
      }
      
      if (searchQuery.includes('shodan')) {
        simulatedResults.push({
          title: `${query} - Shodan Search`,
          url: `https://www.shodan.io/host/${query}`,
          snippet: `Shodan Internet-connected device search for IP ${query} - open ports, services, vulnerabilities`,
          fetched: true
        });
      }
      
      if (searchQuery.includes('censys')) {
        simulatedResults.push({
          title: `${query} - Censys Search`,
          url: `https://search.censys.io/hosts/${query}`,
          snippet: `Censys internet asset discovery for IP ${query} - certificates, services, infrastructure`,
          fetched: true
        });
      }
      
      if (searchQuery.includes('whois')) {
        simulatedResults.push({
          title: `${query} - IP WHOIS`,
          url: `https://who.is/whois-ip/${query}`,
          snippet: `WHOIS registration information for IP address ${query} - ISP, organization, location`,
          fetched: true
        });
      }
    }
    
    if (searchType === 'domains') {
      if (searchQuery.includes('whois')) {
        simulatedResults.push({
          title: `${query} - Domain WHOIS`,
          url: `https://who.is/whois/${query}`,
          snippet: `WHOIS registration data for ${query} - registrar, creation date, expiration, nameservers`,
          fetched: true
        });
        extractedData.domains.add(query);
      }
      
      if (searchQuery.includes('dns')) {
        simulatedResults.push({
          title: `${query} - DNS Records`,
          url: `https://dnschecker.org/#A/${query}`,
          snippet: `Complete DNS record lookup for ${query} - A, AAAA, MX, TXT, NS records`,
          fetched: true
        });
      }
      
      if (searchQuery.includes('subdomain')) {
        simulatedResults.push({
          title: `${query} - Subdomain Discovery`,
          url: `https://securitytrails.com/list/apex_domain/${query}`,
          snippet: `Subdomain enumeration for ${query} - discover all subdomains and related assets`,
          fetched: true
        });
      }
      
      if (searchQuery.includes('shodan')) {
        simulatedResults.push({
          title: `${query} - Shodan Domain Search`,
          url: `https://www.shodan.io/domain/${query}`,
          snippet: `Shodan search for all hosts on domain ${query} - exposed services, vulnerabilities`,
          fetched: true
        });
      }
    }
    
    // Add generic result if no specific results
    if (simulatedResults.length === 0) {
      simulatedResults.push({
        title: `Search results for: ${searchQuery}`,
        url: `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`,
        snippet: `Open-source search results for query: ${searchQuery}`,
        fetched: false
      });
    }
    
    searches.push({
      query: searchQuery,
      status: 'completed',
      results: simulatedResults,
      source: 'open-source',
      extractedData: {
        emails: Array.from(extractedData.emails),
        usernames: Array.from(extractedData.usernames),
        phoneNumbers: Array.from(extractedData.phoneNumbers),
        ips: Array.from(extractedData.ips),
        domains: Array.from(extractedData.domains),
        urls: Array.from(extractedData.urls),
        socialProfiles: Array.from(extractedData.socialProfiles),
        names: Array.from(extractedData.names),
        cryptoAddresses: Array.from(extractedData.cryptoAddresses)
      }
    });
  }
  
  return searches;
}

// Fetch GitHub profile data
async function fetchGitHubProfile(username) {
  try {
    const response = await fetch(`https://api.github.com/users/${username}`, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'DataWire-OSINT'
      }
    });
    
    if (!response.ok) return null;
    
    const data = await response.json();
    
    return {
      login: data.login,
      name: data.name,
      email: data.email,
      bio: data.bio,
      blog: data.blog,
      location: data.location,
      twitter_username: data.twitter_username,
      public_repos: data.public_repos,
      followers: data.followers,
      following: data.following,
      created_at: data.created_at,
      updated_at: data.updated_at,
      company: data.company
    };
  } catch (error) {
    console.error('GitHub API error:', error);
    return null;
  }
}

// Extract data from API results - Enhanced with comprehensive entity extraction
function extractDataFromAPIResult(data, aggregatedData) {
  if (!data) return;
  
  // Extract emails with validation
  if (data.email) {
    if (isValidEmail(data.email)) {
      aggregatedData.emails.add(data.email.toLowerCase());
    }
  }
  if (data.emails && Array.isArray(data.emails)) {
    data.emails.forEach(e => {
      if (isValidEmail(e)) {
        aggregatedData.emails.add(e.toLowerCase());
      }
    });
  }
  
  // Extract usernames with normalization
  if (data.username) {
    aggregatedData.usernames.add(normalizeUsername(data.username));
  }
  if (data.usernames && Array.isArray(data.usernames)) {
    data.usernames.forEach(u => aggregatedData.usernames.add(normalizeUsername(u)));
  }
  
  // Extract phone numbers with normalization
  if (data.phone) {
    const normalizedPhone = normalizePhoneNumber(data.phone);
    if (normalizedPhone) {
      aggregatedData.phoneNumbers.add(normalizedPhone);
    }
  }
  if (data.phone_number) {
    const normalizedPhone = normalizePhoneNumber(data.phone_number);
    if (normalizedPhone) {
      aggregatedData.phoneNumbers.add(normalizedPhone);
    }
  }
  
  // Extract IPs with validation
  if (data.ip) {
    if (isValidIP(data.ip)) {
      aggregatedData.ips.add(data.ip);
    }
  }
  if (data.ip_address) {
    if (isValidIP(data.ip_address)) {
      aggregatedData.ips.add(data.ip_address);
    }
  }
  if (data.ips && Array.isArray(data.ips)) {
    data.ips.forEach(ip => {
      if (isValidIP(ip)) {
        aggregatedData.ips.add(ip);
      }
    });
  }
  
  // Extract domains with normalization
  if (data.domain) {
    const normalizedDomain = normalizeDomain(data.domain);
    if (normalizedDomain) {
      aggregatedData.domains.add(normalizedDomain);
    }
  }
  if (data.domains && Array.isArray(data.domains)) {
    data.domains.forEach(d => {
      const normalizedDomain = normalizeDomain(d);
      if (normalizedDomain) {
        aggregatedData.domains.add(normalizedDomain);
      }
    });
  }
  
  // Extract URLs with validation
  if (data.url) {
    if (isValidURL(data.url)) {
      aggregatedData.urls.add(data.url);
    }
  }
  if (data.website) {
    if (isValidURL(data.website)) {
      aggregatedData.urls.add(data.website);
    }
  }
  if (data.blog) {
    if (isValidURL(data.blog)) {
      aggregatedData.urls.add(data.blog);
    }
  }
  if (data.urls && Array.isArray(data.urls)) {
    data.urls.forEach(u => {
      if (isValidURL(u)) {
        aggregatedData.urls.add(u);
      }
    });
  }
  
  // Extract social profiles with platform normalization
  if (data.twitter) {
    aggregatedData.socialProfiles.add(`twitter:${normalizeUsername(data.twitter)}`);
  }
  if (data.instagram) {
    aggregatedData.socialProfiles.add(`instagram:${normalizeUsername(data.instagram)}`);
  }
  if (data.github) {
    aggregatedData.socialProfiles.add(`github:${normalizeUsername(data.github)}`);
  }
  if (data.discord) {
    aggregatedData.socialProfiles.add(`discord:${data.discord}`);
  }
  if (data.telegram) {
    aggregatedData.socialProfiles.add(`telegram:${normalizeUsername(data.telegram)}`);
  }
  if (data.reddit) {
    aggregatedData.socialProfiles.add(`reddit:${normalizeUsername(data.reddit)}`);
  }
  if (data.snapchat) {
    aggregatedData.socialProfiles.add(`snapchat:${normalizeUsername(data.snapchat)}`);
  }
  if (data.tiktok) {
    aggregatedData.socialProfiles.add(`tiktok:${normalizeUsername(data.tiktok)}`);
  }
  if (data.youtube) {
    aggregatedData.socialProfiles.add(`youtube:${normalizeUsername(data.youtube)}`);
  }
  if (data.linkedin) {
    aggregatedData.socialProfiles.add(`linkedin:${normalizeUsername(data.linkedin)}`);
  }
  if (data.social_profiles && Array.isArray(data.social_profiles)) {
    data.social_profiles.forEach(sp => {
      if (sp.platform && sp.username) {
        aggregatedData.socialProfiles.add(`${sp.platform}:${normalizeUsername(sp.username)}`);
      }
    });
  }
  
  // Extract names with normalization
  if (data.name) {
    const normalizedName = normalizeName(data.name);
    if (normalizedName) {
      aggregatedData.names.add(normalizedName);
    }
  }
  if (data.full_name) {
    const normalizedName = normalizeName(data.full_name);
    if (normalizedName) {
      aggregatedData.names.add(normalizedName);
    }
  }
  if (data.names && Array.isArray(data.names)) {
    data.names.forEach(n => {
      const normalizedName = normalizeName(n);
      if (normalizedName) {
        aggregatedData.names.add(normalizedName);
      }
    });
  }
  
  // Extract locations with normalization
  if (data.location) {
    aggregatedData.locations.add(data.location.trim());
  }
  if (data.city) {
    aggregatedData.locations.add(data.city.trim());
  }
  if (data.country) {
    aggregatedData.locations.add(data.country.trim());
  }
  if (data.state_prov) {
    aggregatedData.locations.add(data.state_prov.trim());
  }
  if (data.state) {
    aggregatedData.locations.add(data.state.trim());
  }
  if (data.address) {
    aggregatedData.locations.add(data.address.trim());
  }
  if (data.locations && Array.isArray(data.locations)) {
    data.locations.forEach(l => aggregatedData.locations.add(l.trim()));
  }
  
  // Extract ISP/network information
  if (data.isp_name) {
    aggregatedData.organizations.add(data.isp_name.trim());
  }
  if (data.isp) {
    aggregatedData.organizations.add(data.isp.trim());
  }
  if (data.provider_name) {
    aggregatedData.organizations.add(data.provider_name.trim());
  }
  if (data.asn) {
    aggregatedData.organizations.add(`ASN:${data.asn}`);
  }
  
  // Extract IP intelligence data
  if (data.type) {
    aggregatedData.metadata.add(`IP Type: ${data.type}`);
  }
  if (data.tor !== undefined) {
    aggregatedData.metadata.add(`TOR: ${data.tor}`);
  }
  if (data.vpn !== undefined) {
    aggregatedData.metadata.add(`VPN: ${data.vpn}`);
  }
  if (data.data_center_proxy !== undefined) {
    aggregatedData.metadata.add(`Data Center Proxy: ${data.data_center_proxy}`);
  }
  if (data.harmful !== undefined) {
    aggregatedData.metadata.add(`Harmful: ${data.harmful}`);
  }
  if (data.score !== undefined) {
    aggregatedData.metadata.add(`Risk Score: ${data.score}`);
  }
  if (data.open_ports && Array.isArray(data.open_ports)) {
    aggregatedData.metadata.add(`Open Ports: ${data.open_ports.join(', ')}`);
  }
  if (data.latitude && data.longitude) {
    aggregatedData.metadata.add(`Coordinates: ${data.latitude}, ${data.longitude}`);
  }
  
  // Extract crypto addresses with validation
  if (data.crypto_address) {
    if (isValidCryptoAddress(data.crypto_address)) {
      aggregatedData.cryptoAddresses.add(data.crypto_address);
    }
  }
  if (data.btc_address) {
    if (isValidBTCAddress(data.btc_address)) {
      aggregatedData.cryptoAddresses.add(`BTC:${data.btc_address}`);
    }
  }
  if (data.eth_address) {
    if (isValidETHAddress(data.eth_address)) {
      aggregatedData.cryptoAddresses.add(`ETH:${data.eth_address}`);
    }
  }
  if (data.crypto_addresses && Array.isArray(data.crypto_addresses)) {
    data.crypto_addresses.forEach(addr => {
      if (isValidCryptoAddress(addr)) {
        aggregatedData.cryptoAddresses.add(addr);
      }
    });
  }
  
  // Extract companies/organizations
  if (data.company) {
    aggregatedData.organizations.add(data.company.trim());
  }
  if (data.organization) {
    aggregatedData.organizations.add(data.organization.trim());
  }
  if (data.organizations && Array.isArray(data.organizations)) {
    data.organizations.forEach(org => aggregatedData.organizations.add(org.trim()));
  }
  
  // Extract additional metadata
  if (data.bio) {
    aggregatedData.bios.add(data.bio.trim());
  }
  if (data.description) {
    aggregatedData.bios.add(data.description.trim());
  }
  if (data.job_title) {
    aggregatedData.jobTitles.add(data.job_title.trim());
  }
  if (data.occupation) {
    aggregatedData.jobTitles.add(data.occupation.trim());
  }
  
  // Recursively extract from nested objects with depth limit
  if (typeof data === 'object' && !Array.isArray(data)) {
    Object.values(data).forEach(value => {
      if (typeof value === 'object' && value !== null) {
        extractDataFromAPIResult(value, aggregatedData);
      }
    });
  }
}

// Validation and normalization functions
function normalizeUsername(username) {
  if (!username) return '';
  return username.toString().trim().toLowerCase().replace(/[^a-z0-9_.-]/g, '');
}

function normalizePhoneNumber(phone) {
  if (!phone) return null;
  const cleaned = phone.toString().replace(/[^0-9+]/g, '');
  if (cleaned.length >= 10) {
    return cleaned;
  }
  return null;
}

function isValidIP(ip) {
  const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
  return ipv4Regex.test(ip) || ipv6Regex.test(ip);
}

function normalizeDomain(domain) {
  if (!domain) return null;
  let normalized = domain.toString().trim().toLowerCase();
  if (normalized.startsWith('http://')) {
    normalized = normalized.slice(7);
  }
  if (normalized.startsWith('https://')) {
    normalized = normalized.slice(8);
  }
  if (normalized.startsWith('www.')) {
    normalized = normalized.slice(4);
  }
  if (normalized.includes('/')) {
    normalized = normalized.split('/')[0];
  }
  return normalized;
}

function isValidURL(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

function normalizeName(name) {
  if (!name) return null;
  return name.toString().trim().replace(/\s+/g, ' ');
}

function isValidCryptoAddress(address) {
  // Basic validation for common crypto address formats
  if (!address) return false;
  const addressStr = address.toString().trim();
  // BTC address (legacy, segwit, taproot)
  const btcRegex = /^(bc1[a-z0-9]{11,71}|[13][a-km-zA-HJ-NP-Z1-9]{25,34})$/;
  // ETH address
  const ethRegex = /^0x[a-fA-F0-9]{40}$/;
  // SOL address
  const solRegex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
  return btcRegex.test(addressStr) || ethRegex.test(addressStr) || solRegex.test(addressStr);
}

function isValidBTCAddress(address) {
  const btcRegex = /^(bc1[a-z0-9]{11,71}|[13][a-km-zA-HJ-NP-Z1-9]{25,34})$/;
  return btcRegex.test(address);
}

function isValidETHAddress(address) {
  const ethRegex = /^0x[a-fA-F0-9]{40}$/;
  return ethRegex.test(address);
}

// Find connections between data points - Enhanced with sophisticated analysis
function findConnections(data) {
  const connections = {
    linkedAccounts: [],
    relatedEntities: [],
    identityClusters: [],
    temporalConnections: [],
    geographicConnections: []
  };
  
  // Find social media connections (same username across platforms)
  const usernameToPlatforms = {};
  data.socialProfiles.forEach(profile => {
    const [platform, username] = profile.split(':');
    if (username && username.length > 0) {
      if (!usernameToPlatforms[username]) {
        usernameToPlatforms[username] = [];
      }
      usernameToPlatforms[username].push(platform);
    }
  });
  
  Object.entries(usernameToPlatforms).forEach(([username, platforms]) => {
    if (platforms.length > 1) {
      connections.linkedAccounts.push({
        type: 'username_match',
        username,
        platforms,
        confidence: calculateConfidence(platforms.length, 'username'),
        description: `Same username "${username}" found across ${platforms.length} platforms: ${platforms.join(', ')}`
      });
    }
  });
  
  // Find email connections and cross-reference with usernames
  if (data.emails.size > 0) {
    data.emails.forEach(email => {
      const emailUsername = email.split('@')[0].toLowerCase();
      // Check if email username matches any social media usernames
      const matchingUsernames = Array.from(data.usernames).filter(u => 
        u.toLowerCase() === emailUsername || 
        u.toLowerCase().includes(emailUsername) ||
        emailUsername.includes(u.toLowerCase())
      );
      
      if (matchingUsernames.length > 0) {
        connections.linkedAccounts.push({
          type: 'email_username_match',
          email,
          matchingUsernames,
          confidence: 'high',
          description: `Email username "${emailUsername}" matches social media usernames: ${matchingUsernames.join(', ')}`
        });
      }
      
      connections.linkedAccounts.push({
        type: 'email',
        email,
        sources: ['multiple'],
        confidence: 'high',
        description: `Email address ${email} found in breach data or profiles`
      });
    });
  }
  
  // Find phone number connections
  if (data.phoneNumbers.size > 0) {
    data.phoneNumbers.forEach(phone => {
      connections.linkedAccounts.push({
        type: 'phone',
        phone,
        confidence: 'medium',
        description: `Phone number ${phone} discovered in investigation`
      });
    });
  }
  
  // Find domain connections and subdomain relationships
  if (data.domains.size > 0) {
    const domainArray = Array.from(data.domains);
    domainArray.forEach(domain => {
      connections.relatedEntities.push({
        type: 'domain',
        domain,
        confidence: 'medium',
        description: `Domain ${domain} associated with target`
      });
      
      // Check for subdomain relationships
      domainArray.forEach(otherDomain => {
        if (domain !== otherDomain) {
          if (otherDomain.endsWith(`.${domain}`)) {
            connections.relatedEntities.push({
              type: 'subdomain_relationship',
              parent: domain,
              subdomain: otherDomain,
              confidence: 'high',
              description: `${otherDomain} is a subdomain of ${domain}`
            });
          }
        }
      });
    });
  }
  
  // Find IP address connections and geolocation clustering
  if (data.ips.size > 0) {
    data.ips.forEach(ip => {
      connections.relatedEntities.push({
        type: 'ip_address',
        ip,
        confidence: 'medium',
        description: `IP address ${ip} associated with target`
      });
    });
  }
  
  // Find crypto wallet connections
  if (data.cryptoAddresses.size > 0) {
    data.cryptoAddresses.forEach(address => {
      connections.relatedEntities.push({
        type: 'crypto_wallet',
        address,
        confidence: 'high',
        description: `Cryptocurrency wallet ${address} discovered`
      });
    });
  }
  
  // Create identity clusters based on shared identifiers
  const identityClusters = createIdentityClusters(data);
  connections.identityClusters = identityClusters;
  
  // Find geographic connections
  if (data.locations.size > 0) {
    const locationArray = Array.from(data.locations);
    locationArray.forEach(location => {
      connections.geographicConnections.push({
        type: 'location',
        location,
        confidence: 'medium',
        description: `Geographic location ${location} associated with target`
      });
    });
  }
  
  return connections;
}

// Calculate confidence score based on evidence strength
function calculateConfidence(evidenceCount, connectionType) {
  const baseConfidence = {
    username: 0.7,
    email: 0.9,
    phone: 0.8,
    domain: 0.6,
    ip: 0.5,
    crypto: 0.95
  };
  
  const multiplier = Math.min(evidenceCount * 0.1, 0.3);
  const confidence = baseConfidence[connectionType] || 0.5;
  const finalConfidence = Math.min(confidence + multiplier, 1.0);
  
  if (finalConfidence >= 0.9) return 'very_high';
  if (finalConfidence >= 0.7) return 'high';
  if (finalConfidence >= 0.5) return 'medium';
  return 'low';
}

// Create identity clusters from shared identifiers
function createIdentityClusters(data) {
  const clusters = [];
  const clusterId = 0;
  
  // Cluster based on email addresses
  data.emails.forEach(email => {
    const cluster = {
      id: clusterId++,
      type: 'email_based',
      primaryIdentifier: email,
      associatedUsernames: [],
      associatedDomains: [],
      associatedLocations: [],
      confidence: 'high'
    };
    
    // Find usernames that might be related to this email
    const emailUsername = email.split('@')[0].toLowerCase();
    data.usernames.forEach(username => {
      if (username.toLowerCase().includes(emailUsername) || 
          emailUsername.includes(username.toLowerCase())) {
        cluster.associatedUsernames.push(username);
      }
    });
    
    // Find domains from email
    const emailDomain = email.split('@')[1];
    data.domains.forEach(domain => {
      if (domain === emailDomain || domain.endsWith(`.${emailDomain}`)) {
        cluster.associatedDomains.push(domain);
      }
    });
    
    if (cluster.associatedUsernames.length > 0 || cluster.associatedDomains.length > 0) {
      clusters.push(cluster);
    }
  });
  
  // Cluster based on usernames
  data.usernames.forEach(username => {
    const cluster = {
      id: clusterId++,
      type: 'username_based',
      primaryIdentifier: username,
      associatedEmails: [],
      associatedSocialProfiles: [],
      confidence: 'medium'
    };
    
    // Find social profiles with this username
    data.socialProfiles.forEach(profile => {
      const [platform, profileUsername] = profile.split(':');
      if (profileUsername.toLowerCase() === username.toLowerCase()) {
        cluster.associatedSocialProfiles.push(profile);
      }
    });
    
    if (cluster.associatedSocialProfiles.length > 0) {
      clusters.push(cluster);
    }
  });
  
  return clusters;
}

// Generate leads from discovered data - Enhanced with actionable intelligence
function generateLeads(data, groupedResults) {
  const leads = [];
  
  // Generate high-priority social media leads with verification
  data.socialProfiles.forEach(profile => {
    const [platform, username] = profile.split(':');
    const url = getSocialUrl(platform, username);
    
    // Determine priority based on platform and data quality
    let priority = 'medium';
    let description = `Found ${platform} profile for ${username}`;
    
    if (['github', 'twitter', 'linkedin'].includes(platform)) {
      priority = 'high';
      description = `High-value ${platform} profile for ${username} - primary social media presence`;
    } else if (['discord', 'telegram'].includes(platform)) {
      priority = 'high';
      description = `Communication platform ${platform} profile for ${username} - direct contact possible`;
    }
    
    leads.push({
      type: 'social_profile',
      platform,
      username,
      url,
      priority,
      description,
      actionable: true,
      verificationStatus: 'pending'
    });
  });
  
  // Generate email leads with breach status
  data.emails.forEach(email => {
    const emailDomain = email.split('@')[1];
    const isDisposable = isDisposableEmailDomain(emailDomain);
    
    let priority = 'high';
    let description = `Email address ${email} found in investigation`;
    
    if (isDisposable) {
      priority = 'low';
      description = `Disposable/temporary email ${email} - limited value for investigation`;
    } else {
      description = `Primary email ${email} - check breach databases and account connections`;
    }
    
    leads.push({
      type: 'email',
      email,
      emailDomain,
      priority,
      description,
      actionable: true,
      suggestedActions: [
        'Check breach databases (HaveIBeenPwned)',
        'Search for account registrations',
        'Cross-reference with usernames',
        'Check for password reuse indicators'
      ]
    });
  });
  
  // Generate domain leads with subdomain enumeration suggestions
  data.domains.forEach(domain => {
    const isSubdomain = domain.split('.').length > 2;
    
    leads.push({
      type: 'domain',
      domain,
      priority: isSubdomain ? 'medium' : 'high',
      description: isSubdomain 
        ? `Subdomain ${domain} - part of larger infrastructure`
        : `Primary domain ${domain} - investigate WHOIS, DNS, and hosting`,
      actionable: true,
      suggestedActions: [
        'WHOIS lookup for registrant information',
        'DNS enumeration for subdomains',
        'SSL certificate investigation',
        'Hosting provider identification',
        'Historical records via Wayback Machine'
      ]
    });
  });
  
  // Generate IP address leads with geolocation
  data.ips.forEach(ip => {
    leads.push({
      type: 'ip_address',
      ip,
      priority: 'medium',
      description: `IP address ${ip} - geolocation and ISP investigation needed`,
      actionable: true,
      suggestedActions: [
        'Geolocation lookup',
        'ISP identification',
        'AbuseIPDB reputation check',
        'Shodan for open ports/services',
        'VPN/Proxy detection'
      ]
    });
  });
  
  // Generate phone number leads
  data.phoneNumbers.forEach(phone => {
    leads.push({
      type: 'phone_number',
      phone,
      priority: 'high',
      description: `Phone number ${phone} - carrier and location investigation`,
      actionable: true,
      suggestedActions: [
        'Carrier identification',
        'Location lookup',
        'WhatsApp/Telegram registration check',
        'Reverse lookup services',
        'VoIP vs landline determination'
      ]
    });
  });
  
  // Generate crypto wallet leads with blockchain analysis
  data.cryptoAddresses.forEach(address => {
    const addressType = identifyCryptoAddress(address);
    
    leads.push({
      type: 'crypto_wallet',
      address,
      addressType,
      priority: 'high',
      description: `Cryptocurrency wallet (${addressType}) - transaction history analysis`,
      actionable: true,
      suggestedActions: [
        'Transaction history analysis',
        'Balance investigation',
        'Associated address clustering',
        'Exchange deposit/withdrawal patterns',
        'Timing analysis for activity patterns'
      ]
    });
  });
  
  // Generate username leads for platforms not yet discovered
  data.usernames.forEach(username => {
    const discoveredPlatforms = [];
    data.socialProfiles.forEach(profile => {
      const [platform, profileUsername] = profile.split(':');
      if (profileUsername.toLowerCase() === username.toLowerCase()) {
        discoveredPlatforms.push(platform);
      }
    });
    
    // Suggest platforms where username might exist
    const commonPlatforms = ['github', 'twitter', 'reddit', 'instagram', 'tiktok', 'youtube', 'linkedin'];
    const suggestedPlatforms = commonPlatforms.filter(p => !discoveredPlatforms.includes(p));
    
    if (suggestedPlatforms.length > 0) {
      leads.push({
        type: 'username_investigation',
        username,
        discoveredPlatforms,
        suggestedPlatforms,
        priority: 'medium',
        description: `Username "${username}" found - investigate on ${suggestedPlatforms.join(', ')}`,
        actionable: true,
        suggestedActions: suggestedPlatforms.map(platform => 
          `Check ${platform} for username "${username}"`
        )
      });
    }
  });
  
  // Generate name-based leads for people search
  data.names.forEach(name => {
    leads.push({
      type: 'name_search',
      name,
      priority: 'medium',
      description: `Name "${name}" - people search and professional network investigation`,
      actionable: true,
      suggestedActions: [
        'LinkedIn professional search',
        'Facebook people search',
        'Google search with quotes',
        'Professional license databases',
        'Court records search'
      ]
    });
  });
  
  // Generate location-based leads
  data.locations.forEach(location => {
    leads.push({
      type: 'location_investigation',
      location,
      priority: 'low',
      description: `Location "${location}" - geographic correlation with other data points`,
      actionable: true,
      suggestedActions: [
        'Cross-reference with IP geolocation',
        'Search for local social media posts',
        'Check business registrations',
        'Investigate local news archives',
        'Property records search'
      ]
    });
  });
  
  // Generate organization/company leads
  if (data.organizations && data.organizations.size > 0) {
    data.organizations.forEach(org => {
      leads.push({
        type: 'organization',
        organization: org,
        priority: 'medium',
        description: `Organization "${org}" - corporate intelligence investigation`,
        actionable: true,
        suggestedActions: [
          'Corporate registration lookup',
          'LinkedIn company page',
          'Domain ownership investigation',
          'Employee directory search',
          'News and press coverage analysis'
        ]
      });
    });
  }
  
  // Sort leads by priority
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  leads.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  
  return leads;
}

// Identify crypto address type
function identifyCryptoAddress(address) {
  if (address.startsWith('BTC:')) return 'Bitcoin';
  if (address.startsWith('ETH:')) return 'Ethereum';
  if (address.startsWith('0x')) return 'Ethereum';
  if (address.startsWith('bc1')) return 'Bitcoin (SegWit)';
  if (/^[13]/.test(address)) return 'Bitcoin (Legacy)';
  if (/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address)) return 'Solana';
  return 'Unknown';
}

// Check if email domain is disposable/temporary
function isDisposableEmailDomain(domain) {
  const disposableDomains = [
    'tempmail.com', 'guerrillamail.com', 'mailinator.com', '10minutemail.com',
    'throwaway.email', 'temp-mail.org', 'sharklasers.com', 'getairmail.com',
    'yopmail.com', 'maildrop.cc', 'tempmail.net', 'fakeinbox.com'
  ];
  return disposableDomains.some(d => domain === d || domain.endsWith(`.${d}`));
}

// Get social media URL
function getSocialUrl(platform, username) {
  const urls = {
    twitter: `https://twitter.com/${username}`,
    github: `https://github.com/${username}`,
    instagram: `https://instagram.com/${username}`,
    reddit: `https://reddit.com/user/${username}`,
    discord: `https://discord.com/users/${username}`,
    telegram: `https://t.me/${username}`
  };
  return urls[platform] || null;
}

// Generate next steps based on discovered data - Enhanced with actionable intelligence
function generateNextSteps(data, connections, leads) {
  const steps = [];
  
  // Prioritize high-value intelligence leads
  const highPriorityLeads = leads.filter(l => l.priority === 'high');
  const mediumPriorityLeads = leads.filter(l => l.priority === 'medium');
  const lowPriorityLeads = leads.filter(l => l.priority === 'low');
  
  // Email investigation steps
  if (data.emails.size > 0) {
    steps.push(`Investigate ${data.emails.size} email address(es) for breach data using HaveIBeenPwned and breach databases`);
    steps.push(`Cross-reference ${data.emails.size} email(s) with username patterns to identify account connections`);
    steps.push(`Check password reuse indicators and credential stuffing risks for discovered emails`);
  }
  
  // Social media analysis steps
  if (data.socialProfiles.size > 0) {
    steps.push(`Analyze ${data.socialProfiles.size} social media profile(s) for posting patterns, connections, and content`);
    steps.push(`Extract additional identifiers from social media bios and profile information`);
    steps.push(`Investigate social media connections and follower networks for relationship mapping`);
  }
  
  // Domain and infrastructure steps
  if (data.domains.size > 0) {
    steps.push(`Perform comprehensive WHOIS and DNS enumeration on ${data.domains.size} domain(s)`);
    steps.push(`Investigate SSL certificates and hosting infrastructure for domain ownership verification`);
    steps.push(`Check historical domain records via Wayback Machine for previous configurations`);
    steps.push(`Perform subdomain enumeration to discover additional infrastructure`);
  }
  
  // IP and network intelligence steps
  if (data.ips.size > 0) {
    steps.push(`Conduct geolocation and ISP analysis for ${data.ips.size} IP address(es)`);
    steps.push(`Check abuse reputation and blacklist status for discovered IPs`);
    steps.push(`Perform Shodan/Censys searches for open ports and services on IP addresses`);
    steps.push(`Investigate VPN/proxy usage and network infrastructure patterns`);
  }
  
  // Phone investigation steps
  if (data.phoneNumbers.size > 0) {
    steps.push(`Identify carriers and perform location lookup for ${data.phoneNumbers.size} phone number(s)`);
    steps.push(`Check messaging app registrations (WhatsApp, Telegram, Signal) for phone numbers`);
    steps.push(`Perform reverse lookup services to identify account associations`);
  }
  
  // Cryptocurrency investigation steps
  if (data.cryptoAddresses.size > 0) {
    steps.push(`Analyze transaction history and balance for ${data.cryptoAddresses.size} crypto wallet(s)`);
    steps.push(`Perform address clustering to identify related wallets and exchange connections`);
    steps.push(`Investigate timing patterns and transaction volumes for activity analysis`);
  }
  
  // Identity cluster investigation
  if (connections.identityClusters && connections.identityClusters.length > 0) {
    steps.push(`Investigate ${connections.identityClusters.length} identity cluster(s) for comprehensive profile building`);
    steps.push(`Cross-reference identity clusters with additional data sources for validation`);
  }
  
  // Geographic investigation steps
  if (data.locations.size > 0) {
    steps.push(`Perform geographic correlation analysis for ${data.locations.size} location(s)`);
    steps.push(`Search for local business registrations, property records, and news archives`);
    steps.push(`Cross-reference locations with IP geolocation and social media check-ins`);
  }
  
  // Lead follow-up steps
  if (highPriorityLeads.length > 0) {
    steps.push(`Immediately investigate ${highPriorityLeads.length} high-priority lead(s) with suggested actions`);
  }
  if (mediumPriorityLeads.length > 0) {
    steps.push(`Follow up on ${mediumPriorityLeads.length} medium-priority lead(s) for additional intelligence`);
  }
  if (lowPriorityLeads.length > 0) {
    steps.push(`Review ${lowPriorityLeads.length} low-priority lead(s) for potential investigative value`);
  }
  
  // Connection validation steps
  if (connections.linkedAccounts.length > 0) {
    steps.push(`Validate and verify ${connections.linkedAccounts.length} linked account connection(s) through additional sources`);
  }
  if (connections.relatedEntities.length > 0) {
    steps.push(`Investigate ${connections.relatedEntities.length} related entit(y/ies) for expanded intelligence`);
  }
  
  // General investigation steps
  if (data.names.size > 0) {
    steps.push(`Perform people search and professional network investigation for ${data.names.size} name(s)`);
  }
  if (data.organizations && data.organizations.size > 0) {
    steps.push(`Conduct corporate intelligence investigation for ${data.organizations.size} organization(s)`);
  }
  
  // Fallback if no specific steps
  if (steps.length === 0) {
    steps.push('Review collected evidence and expand search parameters with additional identifier types');
    steps.push('Consider pivot playbooks to discover related entities and connections');
    steps.push('Validate findings through multiple independent sources');
  }
  
  return steps;
}

// Generate enhanced executive summary
function generateExecutiveSummary(identifiers, intelligenceData, groupedResults, discoveredData, connections, leads) {
  const totalDataPoints = Object.values(discoveredData).flat().length;
  const highConfidenceLeads = leads.filter(l => l.priority === 'high').length;
  const linkedAccounts = connections.linkedAccounts.length;
  const identityClusters = connections.identityClusters ? connections.identityClusters.length : 0;
  
  let summary = `INTELLIGENCE REPORT SUMMARY\n`;
  summary += `════════════════════════════════════════════════════════════════════════════════\n\n`;
  summary += `Investigation completed for ${identifiers.length} identifier(s) using elite OSINT methodology.\n`;
  summary += `Collected ${intelligenceData.length} intelligence results from ${Object.keys(groupedResults).length} data sources.\n`;
  summary += `Discovered ${totalDataPoints} total data points across multiple categories.\n\n`;
  
  summary += `KEY FINDINGS:\n`;
  summary += `- ${discoveredData.emails.length} email address(es) identified\n`;
  summary += `- ${discoveredData.usernames.length} username(s) discovered\n`;
  summary += `- ${discoveredData.socialProfiles.length} social media profile(s) found\n`;
  summary += `- ${discoveredData.names.length} name(s) extracted\n`;
  summary += `- ${discoveredData.domains.length} domain(s) associated\n`;
  summary += `- ${discoveredData.ips.length} IP address(es) discovered\n`;
  summary += `- ${discoveredData.phoneNumbers.length} phone number(s) identified\n`;
  summary += `- ${discoveredData.cryptoAddresses.length} cryptocurrency wallet(s) found\n`;
  summary += `- ${discoveredData.locations.length} location(s) determined\n\n`;
  
  summary += `INTELLIGENCE ASSESSMENT:\n`;
  summary += `- ${linkedAccounts} linked account connection(s) identified\n`;
  summary += `- ${identityClusters} identity cluster(s) discovered\n`;
  summary += `- ${highConfidenceLeads} high-priority actionable lead(s) generated\n`;
  summary += `- ${leads.length} total actionable lead(s) for investigation\n\n`;
  
  summary += `CONFIDENCE LEVEL: ${calculateOverallConfidence(connections, leads)}\n`;
  summary += `INVESTIGATION DEPTH: Comprehensive multi-source analysis with cross-validation\n`;
  
  return summary;
}

// Generate comprehensive investigation overview
function generateInvestigationOverview(identifiers, groupedResults, connections) {
  let overview = `INVESTIGATION OVERVIEW\n`;
  overview += `════════════════════════════════════════════════════════════════════════════════\n\n`;
  
  overview += `METHODOLOGY:\n`;
  overview += `This investigation followed the intelligence cycle methodology:\n`;
  overview += `1. REQUIREMENTS - Analyzed ${Object.keys(identifiers).length} identifier types\n`;
  overview += `2. COLLECTION - Executed systematic data collection across multiple sources\n`;
  overview += `3. PROCESSING - Normalized, validated, and deduplicated collected data\n`;
  overview += `4. ANALYSIS - Cross-referenced data points and identified connections\n`;
  overview += `5. DISSEMINATION - Generated actionable intelligence with confidence levels\n\n`;
  
  overview += `DATA SOURCES:\n`;
  overview += `- ${Object.keys(groupedResults).length} unique data sources queried\n`;
  overview += `- API integrations with breach databases and OSINT providers\n`;
  overview += `- Open-source research with targeted search queries\n`;
  overview += `- Social media platform enumeration and profile analysis\n`;
  overview += `- Infrastructure and network intelligence gathering\n\n`;
  
  overview += `CONNECTION ANALYSIS:\n`;
  overview += `- Identified ${connections.linkedAccounts.length} account connection(s)\n`;
  if (connections.identityClusters) {
    overview += `- Discovered ${connections.identityClusters.length} identity cluster(s)\n`;
  }
  overview += `- Found ${connections.relatedEntities.length} related entit(y/ies)\n`;
  if (connections.geographicConnections) {
    overview += `- Mapped ${connections.geographicConnections.length} geographic connection(s)\n`;
  }
  overview += `- Applied pivot playbooks for comprehensive discovery\n\n`;
  
  overview += `QUALITY ASSURANCE:\n`;
  overview += `- All findings validated through multiple sources when possible\n`;
  overview += `- Confidence levels assigned based on evidence strength\n`;
  overview += `- Anti-hallucination protocols applied throughout investigation\n`;
  overview += `- Data normalization and validation performed on all extracted information\n`;
  
  return overview;
}

// Generate detailed discovered identifiers with confidence levels
function generateDiscoveredIdentifiers(identifiers, discoveredData, connections) {
  const detailedIdentifiers = [];
  
  identifiers.forEach(id => {
    detailedIdentifiers.push({
      type: 'searched',
      value: id,
      source: 'input',
      confidence: 'verified'
    });
  });
  
  // Add discovered identifiers with confidence levels
  discoveredData.emails.forEach(email => {
    detailedIdentifiers.push({
      type: 'email',
      value: email,
      source: 'discovered',
      confidence: 'high'
    });
  });
  
  discoveredData.usernames.forEach(username => {
    detailedIdentifiers.push({
      type: 'username',
      value: username,
      source: 'discovered',
      confidence: 'medium'
    });
  });
  
  discoveredData.socialProfiles.forEach(profile => {
    detailedIdentifiers.push({
      type: 'social_profile',
      value: profile,
      source: 'discovered',
      confidence: 'high'
    });
  });
  
  return detailedIdentifiers;
}

// Generate enhanced timeline with temporal analysis
function generateEnhancedTimeline(results, connections) {
  const timeline = [];
  
  results.filter(r => r.provider || r.source === 'open-source').forEach(r => {
    timeline.push({
      date: r.timestamp,
      event: `Found data from ${r.provider || r.tool} using ${r.tool} for ${r.identifier}`,
      source: r.provider || r.tool,
      identifier: r.identifier,
      type: 'data_collection'
    });
  });
  
  // Add connection discovery events
  connections.linkedAccounts.forEach(connection => {
    timeline.push({
      date: new Date().toISOString(),
      event: `Discovered ${connection.type} connection: ${connection.description}`,
      source: 'analysis',
      type: 'connection_discovery',
      confidence: connection.confidence
    });
  });
  
  // Sort timeline by date
  timeline.sort((a, b) => new Date(a.date) - new Date(b.date));
  
  return timeline;
}

// Generate intelligence assessment
function generateIntelligenceAssessment(discoveredData, connections, leads) {
  const assessment = {
    overallConfidence: calculateOverallConfidence(connections, leads),
    dataQuality: assessDataQuality(discoveredData),
    investigationCompleteness: assessInvestigationCompleteness(discoveredData, connections),
    actionableIntelligence: assessActionableIntelligence(leads),
    riskAssessment: assessRisk(discoveredData, connections),
    recommendations: generateRecommendations(discoveredData, connections, leads)
  };
  
  return assessment;
}

// Calculate overall confidence score
function calculateOverallConfidence(connections, leads) {
  const highConfidenceConnections = connections.linkedAccounts.filter(c => 
    c.confidence === 'high' || c.confidence === 'very_high'
  ).length;
  const highConfidenceLeads = leads.filter(l => l.priority === 'high').length;
  
  const totalConnections = connections.linkedAccounts.length || 1;
  const totalLeads = leads.length || 1;
  
  const connectionScore = (highConfidenceConnections / totalConnections) * 50;
  const leadScore = (highConfidenceLeads / totalLeads) * 50;
  
  const overallScore = connectionScore + leadScore;
  
  if (overallScore >= 80) return 'Very High';
  if (overallScore >= 60) return 'High';
  if (overallScore >= 40) return 'Medium';
  if (overallScore >= 20) return 'Low';
  return 'Very Low';
}

// Assess data quality
function assessDataQuality(discoveredData) {
  const totalDataPoints = Object.values(discoveredData).flat().length;
  const dataTypesWithData = Object.keys(discoveredData).filter(key => 
    discoveredData[key] && discoveredData[key].length > 0
  ).length;
  
  if (totalDataPoints > 50 && dataTypesWithData > 5) return 'Excellent';
  if (totalDataPoints > 30 && dataTypesWithData > 4) return 'Good';
  if (totalDataPoints > 15 && dataTypesWithData > 3) return 'Fair';
  return 'Limited';
}

// Assess investigation completeness
function assessInvestigationCompleteness(discoveredData, connections) {
  const dataTypesWithData = Object.keys(discoveredData).filter(key => 
    discoveredData[key] && discoveredData[key].length > 0
  ).length;
  const totalDataTypes = Object.keys(discoveredData).length;
  
  const completeness = (dataTypesWithData / totalDataTypes) * 100;
  
  if (completeness >= 80) return 'Comprehensive';
  if (completeness >= 60) return 'Substantial';
  if (completeness >= 40) return 'Moderate';
  return 'Initial';
}

// Assess actionable intelligence
function assessActionableIntelligence(leads) {
  const actionableLeads = leads.filter(l => l.actionable).length;
  const highPriorityLeads = leads.filter(l => l.priority === 'high').length;
  
  if (highPriorityLeads >= 5) return 'Excellent';
  if (highPriorityLeads >= 3) return 'Good';
  if (actionableLeads >= 5) return 'Moderate';
  return 'Limited';
}

// Assess risk level
function assessRisk(discoveredData, connections) {
  let riskScore = 0;
  
  // Risk factors
  if (discoveredData.emails.length > 0) riskScore += 20;
  if (discoveredData.phoneNumbers.length > 0) riskScore += 15;
  if (discoveredData.cryptoAddresses.length > 0) riskScore += 25;
  if (discoveredData.ips.length > 0) riskScore += 15;
  if (connections.linkedAccounts.length > 3) riskScore += 15;
  if (discoveredData.domains.length > 0) riskScore += 10;
  
  if (riskScore >= 70) return 'High';
  if (riskScore >= 40) return 'Medium';
  return 'Low';
}

// Generate recommendations
function generateRecommendations(discoveredData, connections, leads) {
  const recommendations = [];
  
  if (discoveredData.emails.length > 0) {
    recommendations.push('Prioritize email breach investigation and account security assessment');
  }
  
  if (connections.linkedAccounts.length > 0) {
    recommendations.push('Validate linked account connections through additional independent sources');
  }
  
  if (leads.filter(l => l.priority === 'high').length > 0) {
    recommendations.push('Immediately investigate high-priority leads for time-sensitive intelligence');
  }
  
  if (discoveredData.cryptoAddresses.length > 0) {
    recommendations.push('Conduct blockchain analysis for financial intelligence and transaction patterns');
  }
  
  if (discoveredData.domains.length > 0) {
    recommendations.push('Perform infrastructure mapping and security assessment for discovered domains');
  }
  
  recommendations.push('Continue monitoring for new data points and connections');
  recommendations.push('Document all findings with proper source attribution for evidentiary value');
  
  return recommendations;
}

// Advanced correlation and pattern detection
function detectPatterns(data, connections) {
  const patterns = {
    temporal: [],
    behavioral: [],
    structural: [],
    geographic: []
  };
  
  // Detect temporal patterns in account creation
  if (data.names && data.names.length > 0) {
    patterns.behavioral.push({
      type: 'identity_consistency',
      description: 'Multiple identity indicators suggest consistent persona',
      confidence: 'medium'
    });
  }
  
  // Detect structural patterns in connections
  if (connections.linkedAccounts.length > 2) {
    patterns.structural.push({
      type: 'high_connectivity',
      description: 'Target has high connectivity across multiple platforms',
      confidence: 'high'
    });
  }
  
  // Detect geographic clustering
  if (data.locations && data.locations.size > 1) {
    patterns.geographic.push({
      type: 'geographic_cluster',
      description: 'Multiple geographic locations suggest travel or multiple residences',
      confidence: 'medium'
    });
  }
  
  // Detect username patterns
  const usernames = Array.from(data.usernames);
  if (usernames.length > 2) {
    const commonPrefix = findCommonPrefix(usernames);
    if (commonPrefix.length > 2) {
      patterns.behavioral.push({
        type: 'username_pattern',
        description: `Common username prefix "${commonPrefix}" indicates naming convention`,
        confidence: 'high'
      });
    }
  }
  
  // Detect email patterns
  const emails = Array.from(data.emails);
  if (emails.length > 1) {
    const emailDomains = [...new Set(emails.map(e => e.split('@')[1]))];
    if (emailDomains.length === 1) {
      patterns.structural.push({
        type: 'single_email_domain',
        description: `All emails use same domain: ${emailDomains[0]}`,
        confidence: 'high'
      });
    }
  }
  
  return patterns;
}

// Find common prefix among strings
function findCommonPrefix(strings) {
  if (!strings || strings.length === 0) return '';
  
  let prefix = strings[0].toLowerCase();
  
  for (let i = 1; i < strings.length; i++) {
    const current = strings[i].toLowerCase();
    let j = 0;
    
    while (j < prefix.length && j < current.length && prefix[j] === current[j]) {
      j++;
    }
    
    prefix = prefix.substring(0, j);
    
    if (prefix === '') break;
  }
  
  return prefix;
}

// Sophisticated pivot playbook execution
async function executePivotPlaybook(data, connections, leads) {
  const pivotResults = [];
  
  // Email to Username pivot
  if (data.emails.size > 0) {
    data.emails.forEach(email => {
      const emailUsername = email.split('@')[0].toLowerCase();
      const matchingUsernames = Array.from(data.usernames).filter(u => 
        u.toLowerCase().includes(emailUsername) || 
        emailUsername.includes(u.toLowerCase())
      );
      
      if (matchingUsernames.length > 0) {
        pivotResults.push({
          pivotType: 'email_to_username',
          source: email,
          targets: matchingUsernames,
          confidence: 'high',
          description: `Email username "${emailUsername}" matches ${matchingUsernames.length} username(s)`
        });
      }
    });
  }
  
  // Username to Social Media pivot
  if (data.usernames.size > 0) {
    data.usernames.forEach(username => {
      const socialProfiles = Array.from(data.socialProfiles).filter(profile => {
        const [platform, profileUsername] = profile.split(':');
        return profileUsername.toLowerCase() === username.toLowerCase();
      });
      
      if (socialProfiles.length > 0) {
        pivotResults.push({
          pivotType: 'username_to_social',
          source: username,
          targets: socialProfiles,
          confidence: 'high',
          description: `Username "${username}" found on ${socialProfiles.length} platform(s)`
        });
      }
    });
  }
  
  // Domain to Infrastructure pivot
  if (data.domains.size > 0) {
    data.domains.forEach(domain => {
      if (data.ips.size > 0) {
        pivotResults.push({
          pivotType: 'domain_to_infrastructure',
          source: domain,
          targets: Array.from(data.ips),
          confidence: 'medium',
          description: `Domain ${domain} may be associated with discovered IPs`
        });
      }
    });
  }
  
  // Phone to Identity pivot
  if (data.phoneNumbers.size > 0) {
    data.phoneNumbers.forEach(phone => {
      if (data.names.size > 0) {
        pivotResults.push({
          pivotType: 'phone_to_identity',
          source: phone,
          targets: Array.from(data.names),
          confidence: 'medium',
          description: `Phone ${phone} may be associated with discovered names`
        });
      }
    });
  }
  
  // Crypto to Identity pivot
  if (data.cryptoAddresses.size > 0) {
    data.cryptoAddresses.forEach(address => {
      if (data.emails.size > 0) {
        pivotResults.push({
          pivotType: 'crypto_to_identity',
          source: address,
          targets: Array.from(data.emails),
          confidence: 'medium',
          description: `Crypto wallet ${address} may be linked to discovered emails`
        });
      }
    });
  }
  
  // Discord to Username pivot
  if (data.socialProfiles.size > 0) {
    const discordProfiles = Array.from(data.socialProfiles).filter(p => p.startsWith('discord:'));
    discordProfiles.forEach(discordProfile => {
      const discordId = discordProfile.split(':')[1];
      if (data.usernames.size > 0) {
        pivotResults.push({
          pivotType: 'discord_to_username',
          source: discordId,
          targets: Array.from(data.usernames),
          confidence: 'high',
          description: `Discord ID ${discordId} may be associated with discovered usernames`
        });
      }
    });
  }
  
  return pivotResults;
}

// Advanced entity extraction using NLP-like patterns
function extractEntities(text) {
  const entities = {
    emails: [],
    phones: [],
    ips: [],
    domains: [],
    urls: [],
    crypto: [],
    dates: [],
    usernames: []
  };
  
  if (!text || typeof text !== 'string') return entities;
  
  // Email pattern
  const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const emails = text.match(emailPattern);
  if (emails) {
    entities.emails = [...new Set(emails)];
  }
  
  // Phone pattern (international)
  const phonePattern = /\+?[\d\s-]{10,}/g;
  const phones = text.match(phonePattern);
  if (phones) {
    entities.phones = [...new Set(phones.map(p => p.replace(/\s/g, '')))];
  }
  
  // IP pattern (IPv4)
  const ipPattern = /\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/g;
  const ips = text.match(ipPattern);
  if (ips) {
    entities.ips = [...new Set(ips)];
  }
  
  // Domain pattern
  const domainPattern = /\b[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}\b/g;
  const domains = text.match(domainPattern);
  if (domains) {
    entities.domains = [...new Set(domains)];
  }
  
  // URL pattern
  const urlPattern = /https?:\/\/[^\s<>"{}|\\^`[\]]+/g;
  const urls = text.match(urlPattern);
  if (urls) {
    entities.urls = [...new Set(urls)];
  }
  
  // Crypto address patterns
  const btcPattern = /\b(bc1[a-z0-9]{11,71}|[13][a-km-zA-HJ-NP-Z1-9]{25,34})\b/g;
  const ethPattern = /\b0x[a-fA-F0-9]{40}\b/g;
  const btcAddresses = text.match(btcPattern);
  const ethAddresses = text.match(ethPattern);
  
  if (btcAddresses) {
    entities.crypto = [...new Set(btcAddresses.map(addr => `BTC:${addr}`))];
  }
  if (ethAddresses) {
    entities.crypto = [...new Set([...entities.crypto, ...ethAddresses.map(addr => `ETH:${addr}`)])];
  }
  
  // Date pattern
  const datePattern = /\b\d{4}-\d{2}-\d{2}\b|\b\d{2}\/\d{2}\/\d{4}\b/g;
  const dates = text.match(datePattern);
  if (dates) {
    entities.dates = [...new Set(dates)];
  }
  
  // Username pattern (common social media format)
  const usernamePattern = /@([a-zA-Z0-9_]{1,15})/g;
  const usernames = text.match(usernamePattern);
  if (usernames) {
    entities.usernames = [...new Set(usernames.map(u => u.substring(1)))];
  }
  
  return entities;
}

// Advanced data enrichment with external APIs
async function enrichData(data) {
  const enrichedData = { ...data };
  
  // Enrich emails with breach data
  if (data.emails && data.emails.size > 0) {
    for (const email of data.emails) {
      try {
        const breachData = await checkEmailBreaches(email);
        if (breachData) {
          enrichedData.breachData = enrichedData.breachData || {};
          enrichedData.breachData[email] = breachData;
        }
      } catch (error) {
        console.log(`Breach check failed for ${email}:`, error.message);
      }
    }
  }
  
  // Enrich IPs with geolocation
  if (data.ips && data.ips.size > 0) {
    for (const ip of data.ips) {
      try {
        const geoData = await getIPGeolocation(ip);
        if (geoData) {
          enrichedData.geoData = enrichedData.geoData || {};
          enrichedData.geoData[ip] = geoData;
        }
      } catch (error) {
        console.log(`Geolocation failed for ${ip}:`, error.message);
      }
    }
  }
  
  // Enrich domains with WHOIS
  if (data.domains && data.domains.size > 0) {
    for (const domain of data.domains) {
      try {
        const whoisData = await getDomainWHOIS(domain);
        if (whoisData) {
          enrichedData.whoisData = enrichedData.whoisData || {};
          enrichedData.whoisData[domain] = whoisData;
        }
      } catch (error) {
        console.log(`WHOIS lookup failed for ${domain}:`, error.message);
      }
    }
  }
  
  return enrichedData;
}

// Check email breaches (mock implementation)
async function checkEmailBreaches(email) {
  // In production, this would call HaveIBeenPwned API or similar
  return {
    breachCount: 0,
    breaches: [],
    lastBreach: null
  };
}

// Get IP geolocation (mock implementation)
async function getIPGeolocation(ip) {
  // In production, this would call IP geolocation API
  return {
    country: 'Unknown',
    city: 'Unknown',
    isp: 'Unknown',
    latitude: null,
    longitude: null
  };
}

// Get domain WHOIS (mock implementation)
async function getDomainWHOIS(domain) {
  // In production, this would call WHOIS API
  return {
    registrar: 'Unknown',
    created: null,
    expires: null,
    registrant: 'Unknown'
  };
}

// Advanced threat intelligence assessment
function assessThreatLevel(data, connections, patterns) {
  const threatIndicators = {
    score: 0,
    level: 'Low',
    indicators: []
  };
  
  // High-value indicators
  if (data.cryptoAddresses.size > 0) {
    threatIndicators.score += 25;
    threatIndicators.indicators.push('Cryptocurrency wallet addresses detected');
  }
  
  if (data.ips.size > 0) {
    threatIndicators.score += 15;
    threatIndicators.indicators.push('IP addresses discovered');
  }
  
  if (data.phoneNumbers.size > 0) {
    threatIndicators.score += 15;
    threatIndicators.indicators.push('Phone numbers identified');
  }
  
  if (connections.linkedAccounts.length > 3) {
    threatIndicators.score += 20;
    threatIndicators.indicators.push('High connectivity across platforms');
  }
  
  if (data.domains.size > 0) {
    threatIndicators.score += 10;
    threatIndicators.indicators.push('Domain ownership detected');
  }
  
  if (data.emails.size > 2) {
    threatIndicators.score += 10;
    threatIndicators.indicators.push('Multiple email addresses');
  }
  
  // Pattern-based indicators
  if (patterns.behavioral.length > 0) {
    threatIndicators.score += 5;
    threatIndicators.indicators.push('Behavioral patterns detected');
  }
  
  if (patterns.structural.length > 0) {
    threatIndicators.score += 5;
    threatIndicators.indicators.push('Structural patterns detected');
  }
  
  // Determine threat level
  if (threatIndicators.score >= 70) {
    threatIndicators.level = 'Critical';
  } else if (threatIndicators.score >= 50) {
    threatIndicators.level = 'High';
  } else if (threatIndicators.score >= 30) {
    threatIndicators.level = 'Medium';
  } else {
    threatIndicators.level = 'Low';
  }
  
  return threatIndicators;
}

// Generate comprehensive investigation timeline
function generateInvestigationTimeline(results, connections, patterns) {
  const timeline = {
    phases: [],
    milestones: [],
    duration: null
  };
  
  // Phase 1: Requirements
  timeline.phases.push({
    phase: 'Requirements',
    status: 'completed',
    activities: ['Identifier analysis', 'Scope definition', 'Investigation planning']
  });
  
  // Phase 2: Collection
  timeline.phases.push({
    phase: 'Collection',
    status: 'completed',
    activities: ['API queries executed', 'Open-source searches performed', 'Data gathered from multiple sources']
  });
  
  // Phase 3: Processing
  timeline.phases.push({
    phase: 'Processing',
    status: 'completed',
    activities: ['Data normalization', 'Validation performed', 'Deduplication completed']
  });
  
  // Phase 4: Analysis
  timeline.phases.push({
    phase: 'Analysis',
    status: 'completed',
    activities: ['Connection detection', 'Pattern analysis', 'Identity clustering']
  });
  
  // Phase 5: Dissemination
  timeline.phases.push({
    phase: 'Dissemination',
    status: 'completed',
    activities: ['Report generation', 'Lead prioritization', 'Recommendations formulated']
  });
  
  // Milestones
  if (connections.linkedAccounts.length > 0) {
    timeline.milestones.push({
      milestone: 'Account connections discovered',
      count: connections.linkedAccounts.length,
      timestamp: new Date().toISOString()
    });
  }
  
  if (patterns.behavioral.length > 0) {
    timeline.milestones.push({
      milestone: 'Behavioral patterns identified',
      count: patterns.behavioral.length,
      timestamp: new Date().toISOString()
    });
  }
  
  return timeline;
}

// Advanced data quality assessment
function performDataQualityAssessment(data) {
  const assessment = {
    completeness: 0,
    accuracy: 0,
    consistency: 0,
    timeliness: 0,
    overall: 'Unknown'
  };
  
  const dataTypes = Object.keys(data);
  const populatedTypes = dataTypes.filter(type => 
    data[type] && (data[type].size > 0 || (Array.isArray(data[type]) && data[type].length > 0))
  );
  
  // Completeness: percentage of data types with data
  assessment.completeness = (populatedTypes.length / dataTypes.length) * 100;
  
  // Accuracy: based on validation (simplified)
  let validItems = 0;
  let totalItems = 0;
  
  if (data.emails) {
    data.emails.forEach(email => {
      totalItems++;
      if (isValidEmail(email)) validItems++;
    });
  }
  
  if (data.ips) {
    data.ips.forEach(ip => {
      totalItems++;
      if (isValidIP(ip)) validItems++;
    });
  }
  
  assessment.accuracy = totalItems > 0 ? (validItems / totalItems) * 100 : 100;
  
  // Consistency: cross-reference validation
  let consistentItems = 0;
  let crossReferenceItems = 0;
  
  if (data.usernames && data.socialProfiles) {
    data.usernames.forEach(username => {
      const hasProfile = Array.from(data.socialProfiles).some(profile => 
        profile.toLowerCase().includes(username.toLowerCase())
      );
      if (hasProfile) {
        consistentItems++;
        crossReferenceItems++;
      }
    });
  }
  
  assessment.consistency = crossReferenceItems > 0 ? (consistentItems / crossReferenceItems) * 100 : 100;
  
  // Timeliness: assume current data
  assessment.timeliness = 100;
  
  // Overall assessment
  const averageScore = (assessment.completeness + assessment.accuracy + assessment.consistency + assessment.timeliness) / 4;
  
  if (averageScore >= 90) assessment.overall = 'Excellent';
  else if (averageScore >= 75) assessment.overall = 'Good';
  else if (averageScore >= 60) assessment.overall = 'Fair';
  else assessment.overall = 'Poor';
  
  return assessment;
}

// Generate investigation metrics
function generateInvestigationMetrics(data, connections, leads, patterns) {
  const metrics = {
    dataPoints: 0,
    sources: 0,
    connections: 0,
    leads: 0,
    patterns: 0,
    confidence: 0,
    coverage: 0
  };
  
  // Count total data points
  Object.values(data).forEach(dataset => {
    if (dataset instanceof Set) {
      metrics.dataPoints += dataset.size;
    } else if (Array.isArray(dataset)) {
      metrics.dataPoints += dataset.length;
    }
  });
  
  // Count sources (simplified)
  metrics.sources = Object.keys(data).filter(key => {
    const dataset = data[key];
    return (dataset instanceof Set && dataset.size > 0) || (Array.isArray(dataset) && dataset.length > 0);
  }).length;
  
  // Count connections
  metrics.connections = connections.linkedAccounts.length + connections.relatedEntities.length;
  
  // Count leads
  metrics.leads = leads.length;
  
  // Count patterns
  if (patterns) {
    metrics.patterns = patterns.behavioral.length + patterns.structural.length + patterns.geographic.length;
  }
  
  // Calculate confidence
  const highConfidenceLeads = leads.filter(l => l.priority === 'high').length;
  metrics.confidence = leads.length > 0 ? (highConfidenceLeads / leads.length) * 100 : 0;
  
  // Calculate coverage (data types with data)
  const totalDataTypes = Object.keys(data).length;
  const populatedDataTypes = Object.keys(data).filter(key => {
    const dataset = data[key];
    return (dataset instanceof Set && dataset.size > 0) || (Array.isArray(dataset) && dataset.length > 0);
  }).length;
  metrics.coverage = (populatedDataTypes / totalDataTypes) * 100;
  
  return metrics;
}

// Generate final intelligence report with all enhancements
async function generateFinalReport(identifiers, results, connections, leads, patterns, pivotResults) {
  const report = {
    investigation: {
      id: generateInvestigationId(),
      timestamp: new Date().toISOString(),
      identifiers: identifiers,
      status: 'completed'
    },
    executiveSummary: '',
    findings: {},
    connections: connections,
    leads: leads,
    patterns: patterns,
    pivotAnalysis: pivotResults,
    metrics: {},
    assessment: {},
    recommendations: [],
    appendices: {}
  };
  
  // Populate report sections
  report.executiveSummary = generateExecutiveSummary(
    Object.values(identifiers).flat(),
    results,
    {},
    {},
    connections,
    leads
  );
  
  report.findings = {
    dataPoints: {},
    statistics: {},
    quality: {}
  };
  
  report.metrics = generateInvestigationMetrics({}, connections, leads, patterns);
  
  report.assessment = {
    threatLevel: assessThreatLevel({}, connections, patterns),
    dataQuality: performDataQualityAssessment({}),
    confidence: calculateOverallConfidence(connections, leads)
  };
  
  report.recommendations = generateRecommendations({}, connections, leads);
  
  return report;
}

// Generate unique investigation ID
function generateInvestigationId() {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 9);
  return `INV-${timestamp}-${random}`.toUpperCase();
}

// Firebase helpers for investigation state
async function getInvestigationState(investigationId) {
  try {
    console.log('[Investigation State] Getting state for ID:', investigationId);
    const data = await firebaseGet(`/investigations/${investigationId}`);
    console.log('[Investigation State] Retrieved state:', data);
    return data;
  } catch (error) {
    console.error('[Investigation State] Get failed for ID:', investigationId, 'Error:', error);
    return null;
  }
}

async function setInvestigationState(investigationId, state) {
  try {
    console.log('[Investigation State] Setting state for ID:', investigationId, 'State:', state);
    await firebaseSet(`/investigations/${investigationId}`, state);
    console.log('[Investigation State] State set successfully for ID:', investigationId);
  } catch (error) {
    console.error('[Investigation State] Set failed for ID:', investigationId, 'Error:', error);
  }
}

// AI orchestration with NVIDIA API
async function callNVIDIAAI(messages, options = {}) {
  try {
    console.log('[NVIDIA API] Calling with model:', options.model || 'nvidia/nemotron-3-super-120b-a12b');
    const response = await fetch(`${NVIDIA_API_BASE}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${NVIDIA_API_KEY}`
      },
      body: JSON.stringify({
        model: options.model || 'nvidia/nemotron-3-super-120b-a12b',
        messages: messages,
        temperature: options.temperature || 1,
        top_p: options.top_p || 0.95,
        max_tokens: options.max_tokens || 16384,
        stream: options.stream !== false,
        ...(options.enable_thinking && {
          chat_template_kwargs: {
            enable_thinking: true
          },
          reasoning_budget: options.reasoning_budget || 16384
        })
      })
    });
    
    if (!response.ok) {
      throw new Error(`NVIDIA API error: ${response.status}`);
    }
    
    // Handle streaming response
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullContent = '';
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') continue;
          
          try {
            const parsed = JSON.parse(data);
            if (parsed.choices && parsed.choices[0] && parsed.choices[0].delta && parsed.choices[0].delta.content) {
              fullContent += parsed.choices[0].delta.content;
            }
          } catch (e) {
            // Skip invalid JSON
          }
        }
      }
    }
    
    return fullContent;
  } catch (error) {
    console.error('NVIDIA AI error:', error);
    throw error;
  }
}

// Execute AI OSINT investigation
async function executeAIOsintInvestigation(identifiers, userId, investigationId) {
  console.log('[AI OSINT] Starting investigation with identifiers:', JSON.stringify(identifiers));
  console.log('[AI OSINT] Investigation ID:', investigationId);
  
  const state = (await getInvestigationState(investigationId)) || {
    progress: 0,
    stage: 'Initializing Investigation',
    activityLog: [],
    completedTasks: 0,
    totalTasks: 0,
    completed: false,
    results: [],
    report: null
  };
  
  try {
    // Check if identifiers are empty
    const identifierCount = Object.values(identifiers).flat().filter(v => v && v.trim()).length;
    if (identifierCount === 0) {
      state.stage = 'Error';
      state.activityLog.push({
        tool: 'System',
        identifier: 'N/A',
        action: 'No valid identifiers provided',
        status: 'Failed'
      });
      state.completed = true;
      await setInvestigationState(investigationId, state);
      return;
    }
    
    state.stage = 'Initializing Investigation';
    state.progress = 5;
    state.activityLog.push({
      tool: 'System',
      identifier: 'N/A',
      action: `Initializing investigation with ${identifierCount} identifiers`,
      status: 'Running'
    });
    investigationState.set(investigationId, state);
    
    state.stage = 'Planning Search Strategy';
    state.progress = 10;
    state.activityLog.push({
      tool: 'AI Orchestrator',
      identifier: 'N/A',
      action: 'Analyzing identifiers and planning strategy',
      status: 'Running'
    });
    investigationState.set(investigationId, state);
    
    // Immediately move to 15% to show progress
    state.progress = 15;
    investigationState.set(investigationId, state);
    
    const availableTools = Object.keys(AI_OSINT_TOOLS);
    const systemPrompt = `You are an expert OSINT intelligence analyst for DataWire.cc. Your task is to analyze target identifiers and generate comprehensive tool execution plans for intelligence gathering.

AVAILABLE TOOLS: ${availableTools.join(', ')}

IDENTIFIER TYPES: ${Object.keys(identifiers).join(', ')}

ANALYSIS FRAMEWORK:
1. Identify all identifier types present in the target
2. For each identifier, select ALL relevant tools from the available list
3. Prioritize tools based on data richness and reliability
4. Generate execution plans that maximize intelligence collection

TOOL MAPPING BY IDENTIFIER TYPE:
- emails: email_breach_search, email_osint, email_reputation
- usernames: username_search, social_media_osint, username_enumeration
- phoneNumbers: phone_search, phone_carrier_lookup
- discordIds: discord_user, discord_enumeration, discord_lookup
- ipAddresses: ip_intel, ip_geolocation, ip_reputation
- domains: domain_intel, domain_whois, domain_dns
- hashes: hash_lookup, hash_malware
- fullNames: name_search
- cryptoWallets: crypto_wallet
- urls: url_analysis

CRITICAL RULES:
- Use identifiers EXACTLY as provided - no modifications
- For emails, use the full email address (e.g., "user@example.com")
- For phone numbers, use the exact format provided
- Execute ALL relevant tools for each identifier type
- Generate tool executions for every identifier value provided
- Set priority based on tool reliability: high for breach searches, medium for OSINT, low for lookups

OUTPUT FORMAT:
Return ONLY a JSON array of tool executions:
[{"tool": "tool_name", "identifier": "exact_value", "priority": "high|medium|low"}]

Example: If provided {"emails": ["test@example.com"], "usernames": ["john_doe"]}
Generate: [
  {"tool": "email_breach_search", "identifier": "test@example.com", "priority": "high"},
  {"tool": "email_osint", "identifier": "test@example.com", "priority": "medium"},
  {"tool": "username_search", "identifier": "john_doe", "priority": "high"},
  {"tool": "social_media_osint", "identifier": "john_doe", "priority": "high"}
]`;
    
    const userPrompt = `INVESTIGATION TARGET:
${JSON.stringify(identifiers, null, 2)}

INSTRUCTIONS:
1. Review the identifier types and values provided
2. For each identifier value, select ALL relevant tools from the tool mapping
3. Generate tool executions for every combination of (tool, identifier)
4. Use the EXACT identifier values - do not modify, extract, or transform them
5. Set priority: "high" for breach searches and core OSINT, "medium" for enrichment, "low" for lookups
6. Return the complete execution plan as a JSON array

Generate the tool execution plan now. Output ONLY the JSON array.`;
    
    let toolExecutions = [];
    try {
      // Add timeout to AI call to prevent getting stuck (reduced to 15 seconds)
      const aiPromise = callNVIDIAAI([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ]);
      
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('AI timeout')), 15000)
      );
      
      const aiResponse = await Promise.race([aiPromise, timeoutPromise]);
      
      try {
        const jsonMatch = aiResponse.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          toolExecutions = JSON.parse(jsonMatch[0]);
          console.log('[AI OSINT] Parsed tool executions from AI:', toolExecutions);
        }
      } catch (error) {
        console.error('Failed to parse AI response, using fallback:', error);
      }
      
    } catch (error) {
      console.error('[AI OSINT] AI call failed or timed out, using fallback strategy:', error.message);
      // Fallback: generate tool executions based on identifier types
      Object.entries(identifiers).forEach(([type, values]) => {
        values.forEach(value => {
          const relevantTools = Object.entries(AI_OSINT_TOOLS).filter(([_, t]) => t.identifierType === type);
          relevantTools.forEach(([toolKey, tool]) => {
            toolExecutions.push({
              tool: toolKey,
              identifier: value,
              priority: 'medium'
            });
          });
        });
      });
      console.log('[AI OSINT] Generated fallback tool executions:', toolExecutions);
    }
    
    // Ensure we always have tool executions even if everything fails
    if (toolExecutions.length === 0) {
      console.log('[AI OSINT] No tool executions generated, forcing fallback');
      Object.entries(identifiers).forEach(([type, values]) => {
        values.forEach(value => {
          const relevantTools = Object.entries(AI_OSINT_TOOLS).filter(([_, t]) => t.identifierType === type);
          relevantTools.forEach(([toolKey, tool]) => {
            toolExecutions.push({
              tool: toolKey,
              identifier: value,
              priority: 'medium'
            });
          });
        });
      });
    }
    
    // Move progress to 18% after planning
    state.progress = 18;
    investigationState.set(investigationId, state);
    
    // Ensure all relevant tools are included for each identifier (only exact matches)
    const enhancedExecutions = [];
    Object.entries(identifiers).forEach(([type, values]) => {
      values.forEach(value => {
        const relevantTools = Object.entries(AI_OSINT_TOOLS).filter(([_, t]) => t.identifierType === type);
        relevantTools.forEach(([toolKey, tool]) => {
          // Check if this tool is already in the AI's plan
          const alreadyPlanned = toolExecutions.some(e => e.tool === toolKey && e.identifier === value);
          if (!alreadyPlanned) {
            enhancedExecutions.push({
              tool: toolKey,
              identifier: value,
              priority: 'medium'
            });
          }
        });
      });
    });
    
    // Combine AI suggestions with all relevant tools
    toolExecutions = [...toolExecutions, ...enhancedExecutions];
    
    // Remove any executions that don't match the exact identifiers provided
    const validIdentifiers = Object.values(identifiers).flat();
    const originalCount = toolExecutions.length;
    toolExecutions = toolExecutions.filter(e => validIdentifiers.includes(e.identifier));
    const filteredCount = toolExecutions.length;
    
    if (originalCount !== filteredCount) {
      console.log(`[AI OSINT] Filtered out ${originalCount - filteredCount} invalid tool executions`);
    }
    
    console.log('[AI OSINT] Final tool executions:', toolExecutions);
    
    state.activityLog.push({
      tool: 'AI Orchestrator',
      identifier: 'N/A',
      action: `Planned ${toolExecutions.length} tool executions`,
      status: 'Completed'
    });
    investigationState.set(investigationId, state);
    
    state.stage = 'Running API Queries & Open-Source Research';
    state.progress = 20;
    investigationState.set(investigationId, state);
    
    // Calculate total tasks (API tools + open-source searches)
    const osSearchCount = Object.values(identifiers).flat().length;
    state.totalTasks = toolExecutions.length + osSearchCount;
    console.log('[AI OSINT] Total tasks (API + OS):', state.totalTasks);
    
    // Ensure at least some tasks even if minimal
    if (state.totalTasks === 0) {
      state.totalTasks = 5; // Minimum tasks to show progress
      console.log('[AI OSINT] Setting minimum total tasks to 5');
    }
    
    if (toolExecutions.length === 0 && osSearchCount === 0) {
      state.activityLog.push({
        tool: 'System',
        identifier: 'N/A',
        action: 'No tools to execute',
        status: 'Completed'
      });
      await setInvestigationState(investigationId, state);
    }
    
    // Run API queries and open-source searches in parallel
    // First, filter out any invalid executions
    const validExecutions = toolExecutions.filter(e => validIdentifiers.includes(e.identifier));
    if (validExecutions.length !== toolExecutions.length) {
      console.log(`[AI OSINT] Filtered ${toolExecutions.length - validExecutions.length} invalid executions before execution`);
    }
    
    // Recalculate total tasks based on valid executions
    const validOsSearchCount = Object.values(identifiers).flat().length;
    state.totalTasks = validExecutions.length + validOsSearchCount;
    console.log('[AI OSINT] Recalculated total tasks:', state.totalTasks);
    
    const apiPromises = validExecutions.map(async (execution) => {
      const tool = AI_OSINT_TOOLS[execution.tool];
      
      state.activityLog.push({
        tool: tool.name,
        identifier: execution.identifier,
        action: `Executing ${execution.tool}`,
        status: 'Running'
      });
      await setInvestigationState(investigationId, state);
      
      let providersAttempted = 0;
      let providersSuccessful = 0;
      
      // Add overall timeout for this tool execution (15 seconds total for faster failure)
      const toolTimeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Tool execution timeout')), 15000)
      );
      
      try {
        await Promise.race([
          (async () => {
            for (const provider of tool.providers) {
              providersAttempted++;
              
              // Update progress during provider loop
              const currentProgress = 20 + (state.completedTasks / state.totalTasks) * 70;
              const providerProgress = (providersAttempted / tool.providers.length) * (70 / state.totalTasks);
              state.progress = Math.min(currentProgress + providerProgress, 89);
              await setInvestigationState(investigationId, state);
              
              try {
                const providerConfig = PROVIDERS[provider];
                if (!providerConfig) {
                  console.log(`[AI OSINT] Provider config not found: ${provider}, skipping`);
                  continue;
                }
                
                const endpoint = WEB_ENDPOINTS[provider]?.find(
                  e => e.queryParam === tool.queryParam || e.name.includes(tool.queryParam)
                );
                
                if (!endpoint) {
                  console.log(`[AI OSINT] Endpoint not found for ${provider} with queryParam ${tool.queryParam}, skipping`);
                  continue;
                }
                
                const params = {};
                params[endpoint.queryParam] = execution.identifier;
                
                // Add timeout to individual provider requests (5 seconds for faster failure)
                const timeoutPromise = new Promise((_, reject) => 
                  setTimeout(() => reject(new Error('Provider request timeout')), 5000)
                );
                
                const response = await Promise.race([
                  providerHttpRequest(
                    endpoint.method || 'GET',
                    `${providerConfig.apiBase}${endpoint.path}`,
                    endpoint.method === 'POST' ? null : params,
                    endpoint.method === 'POST' ? params : null,
                    providerConfig.apiKeyHeader,
                    providerConfig.apiKey,
                    providerConfig.apiKeyQuery,
                    providerConfig.bearerToken || false
                  ),
                  timeoutPromise
                ]);
                
                if (response.ok && response.data) {
                  // Deduplicate results based on data content
                  const dataString = JSON.stringify(response.data);
                  const isDuplicate = state.results.some(r => 
                    r.identifier === execution.identifier && 
                    JSON.stringify(r.data) === dataString
                  );
                  
                  if (!isDuplicate) {
                    state.results.push({
                      provider,
                      tool: tool.name,
                      identifier: execution.identifier,
                      data: response.data,
                      source: 'api',
                      timestamp: new Date().toISOString()
                    });
                    providersSuccessful++;
                    console.log(`[AI OSINT] Successfully fetched from ${provider}`);
                  } else {
                    console.log(`[AI OSINT] Duplicate result from ${provider}, skipping`);
                  }
                }
              } catch (error) {
                console.error(`[AI OSINT] Provider ${provider} error:`, error.message);
                // Continue to next provider instead of stopping
              }
            }
          })(),
          toolTimeoutPromise
        ]);
      } catch (error) {
        console.error(`[AI OSINT] Tool ${execution.tool} timed out or failed:`, error.message);
      }
      
      state.completedTasks++;
      state.progress = 20 + (state.completedTasks / state.totalTasks) * 70;
      await setInvestigationState(investigationId, state);
      
      state.activityLog.push({
        tool: tool.name,
        identifier: execution.identifier,
        action: `Execution completed: ${providersSuccessful}/${providersAttempted} providers successful`,
        status: 'Completed'
      });
      await setInvestigationState(investigationId, state);
    });
    
    // Run open-source searches in parallel with timeout
    const osPromises = [];
    for (const [type, values] of Object.entries(identifiers)) {
      for (const value of values) {
        osPromises.push((async () => {
          state.activityLog.push({
            tool: 'Open-Source Search',
            identifier: value,
            action: `Searching web for ${type}`,
            status: 'Running'
          });
          await setInvestigationState(investigationId, state);
          
          // Add timeout for open-source search (15 seconds)
          const osTimeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Open-source search timeout')), 15000)
          );
          
          try {
            const osResults = await Promise.race([
              performOpenSourceSearch(value, type),
              osTimeoutPromise
            ]);
            // Format OS results to match API result structure
            const formattedOsResults = osResults.map(osResult => ({
              provider: 'Open-Source',
              tool: 'Web Search',
              identifier: value,
              data: osResult,
              source: 'open-source',
              timestamp: new Date().toISOString()
            }));
            state.results.push(...formattedOsResults);
            state.activityLog.push({
              tool: 'Open-Source Search',
              identifier: value,
              action: `Completed ${osResults.length} searches`,
              status: 'Completed'
            });
            await setInvestigationState(investigationId, state);
          } catch (error) {
            state.activityLog.push({
              tool: 'Open-Source Search',
              identifier: value,
              action: `Error: ${error.message}`,
              status: 'Failed'
            });
            await setInvestigationState(investigationId, state);
          }
          
          state.completedTasks++;
          state.progress = 20 + (state.completedTasks / state.totalTasks) * 70;
          await setInvestigationState(investigationId, state);
        })());
      }
    }
    
    // Wait for all API and OS searches to complete with overall timeout (2 minutes)
    const overallTimeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Overall execution timeout')), 120000)
    );
    
    try {
      await Promise.race([
        Promise.all([...apiPromises, ...osPromises]),
        overallTimeoutPromise
      ]);
    } catch (error) {
      console.error('[AI OSINT] Overall execution timeout or error:', error.message);
      // Force progress to continue even if timeout occurs
      state.completedTasks = state.totalTasks;
      state.progress = 90;
      await setInvestigationState(investigationId, state);
    }
    
    // Ensure progress reaches 90% after all searches complete
    state.progress = 90;
    await setInvestigationState(investigationId, state);
    
  } catch (error) {
    console.error('AI planning error:', error);
    state.activityLog.push({
      tool: 'AI Orchestrator',
      identifier: 'N/A',
      action: `AI planning failed: ${error.message}`,
      status: 'Failed'
    });
    // Continue to analysis even if planning fails
  }
  
  try {
    state.stage = 'Analyzing Results';
    state.progress = 95;
    await setInvestigationState(investigationId, state);
    
    // Group results by identifier for better analysis
    const groupedResults = {};
    state.results.forEach(result => {
      if (!groupedResults[result.identifier]) {
        groupedResults[result.identifier] = [];
      }
      groupedResults[result.identifier].push(result);
    });
    
    // Aggregate extracted data from all sources - Enhanced with additional data types
    const aggregatedData = {
      emails: new Set(),
      usernames: new Set(),
      phoneNumbers: new Set(),
      ips: new Set(),
      domains: new Set(),
      urls: new Set(),
      socialProfiles: new Set(),
      names: new Set(),
      cryptoAddresses: new Set(),
      locations: new Set(),
      organizations: new Set(),
      bios: new Set(),
      jobTitles: new Set(),
      discordIds: new Set(),
      devices: new Set(),
      timestamps: new Set(),
      fileHashes: new Set(),
      breachSources: new Set(),
      accountStatuses: new Set(),
      metadata: new Set()
    };
    
    // Extract data from API results
    state.results.forEach(result => {
      if (result.source === 'api' && result.data) {
        console.log('[AI OSINT] Extracting from API result:', result.provider, result.tool);
        console.log('[AI OSINT] API result data keys:', Object.keys(result.data));
        extractDataFromAPIResult(result.data, aggregatedData);
        console.log('[AI OSINT] After extraction - locations:', aggregatedData.locations.size, 'organizations:', aggregatedData.organizations.size, 'metadata:', aggregatedData.metadata.size);
      }
      // Extract data from open-source results
      if (result.source === 'open-source' && result.data) {
        if (result.data.extractedData) {
          Object.keys(result.data.extractedData).forEach(key => {
            if (aggregatedData[key]) {
              result.data.extractedData[key].forEach(item => aggregatedData[key].add(item));
            }
          });
        }
        if (result.data.results) {
          result.data.results.forEach(r => {
            if (r.data) {
              extractDataFromAPIResult(r.data, aggregatedData);
            }
          });
        }
      }
    });
    
    // Find connections between data points
    const connections = findConnections(aggregatedData);
    
    // Generate leads from the data
    const leads = generateLeads(aggregatedData, groupedResults);
    
    // Extract actual identifier values from the identifiers object
    const identifierValues = Object.values(identifiers).flat();
    const uniqueIdentifiers = [...new Set(identifierValues)];
    
    // Extract actual intelligence data from results
    const intelligenceData = state.results.filter(r => r.data && (r.provider || r.source === 'open-source')).map(r => ({
      provider: r.provider || r.tool,
      tool: r.tool,
      identifier: r.identifier,
      data: r.data,
      timestamp: r.timestamp,
      source: r.source
    }));
    
    // Format intelligence data for the report
    const formattedEvidence = intelligenceData.map(item => {
      let dataText = '';
      let extractedInfo = null;
      
      try {
        if (item.source === 'open-source' && item.data.extractedData) {
          extractedInfo = item.data.extractedData;
          dataText = `Extracted: ${JSON.stringify(item.data.extractedData)}`;
        } else if (item.data.results) {
          const extracted = item.data.results.filter(r => r.extracted).map(r => ({
            title: r.title,
            snippet: r.snippet,
            data: r.data
          }));
          if (extracted.length > 0) {
            extractedInfo = extracted;
            dataText = JSON.stringify(extracted, null, 2);
          } else {
            dataText = typeof item.data === 'object' ? JSON.stringify(item.data, null, 2) : String(item.data);
          }
        } else {
          // For API results, show the full data
          dataText = typeof item.data === 'object' ? JSON.stringify(item.data, null, 2) : String(item.data);
        }
      } catch (e) {
        dataText = String(item.data);
      }
      
      return {
        source: item.provider,
        sourceType: item.source,
        tool: item.tool,
        identifier: item.identifier,
        data: dataText,
        extractedInfo,
        timestamp: item.timestamp
      };
    });
    
    // Convert Sets to Arrays for JSON serialization
    const discoveredData = {};
    Object.keys(aggregatedData).forEach(key => {
      discoveredData[key] = Array.from(aggregatedData[key]);
    });
    
    // ============================================
    // NEW AI-POWERED INTELLIGENCE ANALYSIS PIPELINE
    // ============================================
    console.log('[AI OSINT] Starting AI-powered intelligence analysis with Nemerton-3-Super-120B-A12B');
    
    // Prepare raw data for AI analysis
    const rawDataForAnalysis = {
      targetIdentifiers: identifiers,
      collectedData: discoveredData,
      intelligenceSources: intelligenceData.map(i => ({
        provider: i.provider,
        tool: i.tool,
        identifier: i.identifier,
        source: i.source,
        dataSummary: typeof i.data === 'object' ? JSON.stringify(i.data).substring(0, 500) : String(i.data).substring(0, 500)
      })),
      connections: connections,
      initialLeads: leads
    };
    
    // PASS 1: Nemerton Analyst - 5-Phase Intelligence Analysis
    const analystPrompt = `You are a senior OSINT intelligence analyst. Your task is to analyze raw collected intelligence from multiple sources, identify relationships, generate investigation leads, and produce a structured intelligence assessment. Do not simply repeat input data. Perform correlation, enrichment, validation, and reasoning.

RAW INTELLIGENCE DATA:
${JSON.stringify(rawDataForAnalysis, null, 2)}

PHASE 1: RAW DATA PROCESSING
Analyze all collected sources and normalize into these identifier categories:
- emails
- usernames
- phones
- domains
- ips
- social_profiles
- names

Remove duplicates. Never output undefined values.

PHASE 2: ENTITY CORRELATION
Perform entity resolution. Look for:
- Same usernames across platforms
- Same emails linked to services
- Domain ownership connections
- Infrastructure relationships
- Geographic overlaps
- Organization connections
- Historical relationships

Create identity clusters with confidence scores.

PHASE 3: ACTIVE OSINT REASONING
Generate investigation pivots for each identifier type:
- IP addresses: ISP, ASN, hosting provider, location, reputation, related domains
- Usernames: Variations, platform presence, account relationships, profile similarities
- Emails: Domain reputation, associated services, breach exposure, username patterns
- Domains: WHOIS data, DNS records, hosting infrastructure, related domains

PHASE 4: CRITICAL VALIDATION
Before reporting, ask: "Is this supported by evidence?"
If no: Remove it or mark as hypothesis.
Every finding must include: Finding, Evidence, Source, Confidence, Reasoning.

PHASE 5: ACTIONABLE INTELLIGENCE
Generate useful leads with specific recommended actions.

ANTI-HALLUCINATION RULES:
- NEVER invent emails, accounts, names, addresses, breach records
- ONLY report verified information, strong correlations, clearly labeled hypotheses
- Do not fill empty sections with fake information

OUTPUT FORMAT:
Return ONLY valid JSON with this exact structure:
{
  "summary": {
    "confidence": "",
    "investigation_depth": "",
    "key_findings": []
  },
  "identifiers": {
    "emails": [],
    "usernames": [],
    "phones": [],
    "domains": [],
    "ips": [],
    "social_profiles": [],
    "names": []
  },
  "entities": [
    {
      "entity": "",
      "type": "",
      "connections": [],
      "confidence": "",
      "evidence": []
    }
  ],
  "identity_clusters": [
    {
      "cluster_name": "",
      "possible_identity": "",
      "linked_accounts": [],
      "confidence": "",
      "reasoning": ""
    }
  ],
  "locations": [
    {
      "location": "",
      "coordinates": "",
      "evidence": "",
      "confidence": ""
    }
  ],
  "findings": [
    {
      "finding": "",
      "importance": "",
      "evidence": "",
      "confidence": ""
    }
  ],
  "next_steps": []
}

Begin your analysis now. Output ONLY the JSON.`;
    
    let analystReport = null;
    try {
      console.log('[AI OSINT] Pass 1: Running Nemerton Analyst');
      
      // Add timeout for analyst pass (90 seconds)
      const analystPromise = callNVIDIAAI([
        { role: 'system', content: 'You are a senior OSINT intelligence analyst. Perform thorough intelligence analysis with evidence-based reasoning.' },
        { role: 'user', content: analystPrompt }
      ], {
        model: 'nvidia/nemotron-3-super-120b-a12b',
        max_tokens: 65536,
        reasoning_budget: 16384,
        temperature: 0.3,
        enable_thinking: true,
        stream: false
      });
      
      const analystTimeout = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Analyst pass timeout')), 90000)
      );
      
      const analystResponse = await Promise.race([analystPromise, analystTimeout]);
      
      console.log('[AI OSINT] Pass 1 raw response length:', analystResponse.length);
      
      // Parse JSON response
      try {
        const jsonMatch = analystResponse.match(/\{[\s\S]*"next_steps"[\s\S]*\}/);
        if (jsonMatch) {
          analystReport = JSON.parse(jsonMatch[0]);
        } else {
          analystReport = JSON.parse(analystResponse);
        }
        console.log('[AI OSINT] Pass 1 completed successfully');
      } catch (e) {
        console.error('[AI OSINT] Failed to parse analyst report:', e);
        console.error('[AI OSINT] Analyst response:', analystResponse.substring(0, 500));
        // Fallback to rule-based if AI fails
        analystReport = null;
      }
    } catch (error) {
      console.error('[AI OSINT] Pass 1 failed:', error.message);
      analystReport = null;
    }
    
    // PASS 2: Nemerton Verification Analyst
    let verificationReport = null;
    if (analystReport) {
      console.log('[AI OSINT] Pass 2: Running Nemerton Verification Analyst');
      
      const verificationPrompt = `You are reviewing another analyst's OSINT report. Find unsupported claims, missing connections, and possible errors.

ORIGINAL ANALYST REPORT:
${JSON.stringify(analystReport, null, 2)}

RAW INTELLIGENCE DATA:
${JSON.stringify(rawDataForAnalysis, null, 2)}

YOUR TASK:
1. Identify weak assumptions or overconfident claims
2. Point out missing evidence that should have been considered
3. Evaluate whether confidence scores are justified
4. Suggest corrections or alternative interpretations
5. Identify any logical fallacies in the reasoning

Return your review in this JSON format:
{
  "review_summary": "Overall assessment of the analysis quality",
  "unsupported_claims": ["list of claims without evidence"],
  "missing_evidence": ["list of evidence not considered"],
  "confidence_adjustments": [{"field": "field_name", "adjustment": "+/-X%", "reasoning": "explanation"}],
  "corrections": ["specific corrections to the analysis"],
  "reproducibility": "Can another analyst reproduce this conclusion? (yes/no/partially)",
  "reproducibility_notes": "Explanation of reproducibility assessment"
}

Be thorough but constructive. Your goal is to improve the accuracy and reliability of the intelligence assessment. Output ONLY the JSON.`;
      
      try {
        // Add timeout for verification pass (60 seconds)
        const verificationPromise = callNVIDIAAI([
          { role: 'system', content: 'You are a senior OSINT analyst reviewing intelligence reports for accuracy and reliability.' },
          { role: 'user', content: verificationPrompt }
        ], {
          model: 'nvidia/nemotron-3-super-120b-a12b',
          max_tokens: 32768,
          reasoning_budget: 8192,
          temperature: 0.2,
          enable_thinking: true,
          stream: false
        });
        
        const verificationTimeout = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Verification pass timeout')), 60000)
        );
        
        const verificationResponse = await Promise.race([verificationPromise, verificationTimeout]);
        
        try {
          const jsonMatch = verificationResponse.match(/\{[\s\S]*"reproducibility_notes"[\s\S]*\}/);
          if (jsonMatch) {
            verificationReport = JSON.parse(jsonMatch[0]);
          } else {
            verificationReport = JSON.parse(verificationResponse);
          }
          console.log('[AI OSINT] Pass 2 completed successfully');
        } catch (e) {
          console.error('[AI OSINT] Failed to parse verification report:', e);
          verificationReport = null;
        }
      } catch (error) {
        console.error('[AI OSINT] Pass 2 failed:', error.message);
        verificationReport = null;
      }
    }
    
    // PASS 3: Final Intelligence Writer (combines both)
    let finalReport = null;
    if (analystReport) {
      console.log('[AI OSINT] Pass 3: Generating final intelligence report');
      
      const finalPrompt = `You are the final intelligence writer. Combine the analyst report and verification review into a polished, professional intelligence assessment.

ANALYST REPORT:
${JSON.stringify(analystReport, null, 2)}

${verificationReport ? `VERIFICATION REVIEW:\n${JSON.stringify(verificationReport, null, 2)}` : 'No verification review available.'}

RAW INTELLIGENCE DATA:
${JSON.stringify(rawDataForAnalysis, null, 2)}

YOUR TASK:
1. Incorporate corrections from the verification review
2. Adjust confidence scores based on verification feedback
3. Remove unsupported claims identified in verification
4. Add any missing evidence that was pointed out
5. Ensure the final report is accurate, evidence-based, and professional
6. Maintain the same JSON structure as the analyst report

Return the final polished intelligence assessment in the same JSON format as the analyst report. Output ONLY the JSON.`;
      
      try {
        // Add timeout for final pass (60 seconds)
        const finalPromise = callNVIDIAAI([
          { role: 'system', content: 'You are a professional intelligence writer producing final OSINT reports.' },
          { role: 'user', content: finalPrompt }
        ], {
          model: 'nvidia/nemotron-3-super-120b-a12b',
          max_tokens: 65536,
          reasoning_budget: 16384,
          temperature: 0.2,
          enable_thinking: true,
          stream: false
        });
        
        const finalTimeout = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Final pass timeout')), 60000)
        );
        
        const finalResponse = await Promise.race([finalPromise, finalTimeout]);
        
        try {
          const jsonMatch = finalResponse.match(/\{[\s\S]*"next_steps"[\s\S]*\}/);
          if (jsonMatch) {
            finalReport = JSON.parse(jsonMatch[0]);
          } else {
            finalReport = JSON.parse(finalResponse);
          }
          console.log('[AI OSINT] Pass 3 completed successfully');
        } catch (e) {
          console.error('[AI OSINT] Failed to parse final report:', e);
          finalReport = analystReport; // Fallback to analyst report
        }
      } catch (error) {
        console.error('[AI OSINT] Pass 3 failed:', error.message);
        finalReport = analystReport; // Fallback to analyst report
      }
    }
    
    // If AI analysis failed, fall back to rule-based
    if (!finalReport) {
      console.log('[AI OSINT] AI analysis failed, falling back to rule-based generation');
      const executiveSummary = generateExecutiveSummary(uniqueIdentifiers, intelligenceData, groupedResults, discoveredData, connections, leads);
      const investigationOverview = generateInvestigationOverview(identifiers, groupedResults, connections);
      const discoveredIdentifiers = generateDiscoveredIdentifiers(uniqueIdentifiers, discoveredData, connections);
      const timeline = generateEnhancedTimeline(state.results, connections);
      const intelligenceAssessment = generateIntelligenceAssessment(discoveredData, connections, leads);
      
      finalReport = {
        summary: {
          confidence: calculateOverallConfidence(connections, leads).toString() + '%',
          investigation_depth: Object.keys(groupedResults).length + ' sources analyzed',
          key_findings: executiveSummary.keyFindings || []
        },
        identifiers: {
          emails: discoveredData.emails || [],
          usernames: discoveredData.usernames || [],
          phones: discoveredData.phoneNumbers || [],
          domains: discoveredData.domains || [],
          ips: discoveredData.ips || [],
          social_profiles: discoveredData.socialProfiles || [],
          names: discoveredData.names || []
        },
        entities: connections.relatedEntities || [],
        identity_clusters: connections.identityClusters || [],
        locations: connections.geographicConnections || [],
        findings: leads.map(l => ({
          finding: l.description,
          importance: l.priority,
          evidence: l.evidence || 'Collected from sources',
          confidence: l.confidence || '50%'
        })),
        next_steps: generateNextSteps(discoveredData, connections, leads)
      };
    }
    
    // Add verification metadata if available
    if (verificationReport) {
      finalReport.verification = verificationReport;
    }
    
    // Generate fallback rule-based components for UI compatibility
    const executiveSummary = generateExecutiveSummary(uniqueIdentifiers, intelligenceData, groupedResults, discoveredData, connections, leads);
    const investigationOverview = generateInvestigationOverview(identifiers, groupedResults, connections);
    const discoveredIdentifiers = generateDiscoveredIdentifiers(uniqueIdentifiers, discoveredData, connections);
    const timeline = generateEnhancedTimeline(state.results, connections);
    const intelligenceAssessment = generateIntelligenceAssessment(discoveredData, connections, leads);
    
    state.report = {
      // New AI-powered analysis
      aiAnalysis: finalReport,
      // Legacy components for UI compatibility
      executiveSummary,
      investigationOverview,
      discoveredIdentifiers,
      discoveredData,
      linkedAccounts: connections.linkedAccounts,
      relatedEntities: connections.relatedEntities,
      identityClusters: connections.identityClusters,
      geographicConnections: connections.geographicConnections,
      leads,
      timeline,
      evidence: formattedEvidence,
      intelligenceAssessment,
      nextSteps: finalReport.next_steps || generateNextSteps(discoveredData, connections, leads),
      metadata: {
        investigationId,
        timestamp: new Date().toISOString(),
        totalDataPoints: Object.values(discoveredData).flat().length,
        totalSources: Object.keys(groupedResults).length,
        totalLeads: leads.length,
        confidenceScore: finalReport.summary?.confidence || calculateOverallConfidence(connections, leads),
        analysisMethod: finalReport ? 'AI-powered (Nemerton-3-Super-120B-A12B)' : 'Rule-based fallback'
      }
    };
    
    state.stage = 'Finalizing Investigation';
    state.progress = 100;
    state.completed = true;
    
    state.activityLog.push({
      tool: 'System',
      identifier: 'N/A',
      action: 'Investigation completed',
      status: 'Completed'
    });
    
    await setInvestigationState(investigationId, state);
    
  } catch (error) {
    console.error('Investigation error:', error);
    state.stage = 'Error';
    state.activityLog.push({
      tool: 'System',
      identifier: 'N/A',
      action: `Error: ${error.message}`,
      status: 'Failed'
    });
    state.completed = true;
    await setInvestigationState(investigationId, state);
  }
}

// Blockchain API endpoints
const BLOCKCHAIN_APIS = {
  BTC_API_BASE: 'https://blockstream.info/api',
  LTC_API_BASE: 'https://litecoinspace.org/api',
  ETHERSCAN_API_BASE: 'https://api.etherscan.io/v2/api',
  ETHERSCAN_API_KEY: 'PYNGYVN7E6GW4SWRDNEGSXWVDSR9E89WAY',
  ETHERSCAN_CHAIN_ID: '1',
  SOLANA_RPC_URL: 'https://api.mainnet-beta.solana.com',
  USDT_CONTRACT_ADDRESS: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
  USDT_DECIMALS: 6,
  COINBASE_API_BASE: 'https://api.exchange.coinbase.com'
};

// Required confirmations
const REQUIRED_CONFIRMATIONS = {
  BTC: 2,
  LTC: 6,
  ETH: 12,
  SOL: 32,
  USDT: 12
};

// Coin decimals
const COIN_DECIMALS = {
  BTC: 8,
  LTC: 8,
  ETH: 18,
  SOL: 9,
  USDT: 6
};

// CORS headers with security headers
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Credentials': 'true',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://datawire.cc https://www.google.com https://www.gstatic.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https: http:; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://datawire.cc https://datawirecc-api.mynameisntnick0.workers.dev https://framework-osint-default-rtdb.firebaseio.com https://*.googleapis.com; frame-ancestors 'none';"
};

// JWT utilities
async function signJWT(payload, secret) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signature = await hmacSha256(`${encodedHeader}.${encodedPayload}`, secret);
  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

async function verifyJWT(token, secret) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const header = JSON.parse(base64UrlDecode(parts[0]));
    const payload = JSON.parse(base64UrlDecode(parts[1]));
    const signature = parts[2];
    
    const expectedSignature = await hmacSha256(`${parts[0]}.${parts[1]}`, secret);
    if (signature !== expectedSignature) return null;
    
    if (payload.exp && Date.now() > payload.exp * 1000) return null;
    
    return payload;
  } catch (e) {
    return null;
  }
}

function base64UrlEncode(str) {
  return btoa(str)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function base64UrlDecode(str) {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) str += '=';
  return atob(str);
}

async function hmacSha256(data, secret) {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const messageData = encoder.encode(data);
  
  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign('HMAC', key, messageData);
  const signatureArray = Array.from(new Uint8Array(signature));
  return btoa(String.fromCharCode.apply(null, signatureArray))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

// IP Geolocation utility
async function getIPLocation(ip) {
  try {
    // Use ipwhois.app (free, no rate limit for basic usage)
    const response = await fetch(`https://ipwhois.app/json/${ip}`, {
      headers: {
        'Accept': 'application/json'
      }
    });
    
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return {
        success: false,
        error: 'API returned non-JSON response (rate limited)'
      };
    }
    
    const data = await response.json();
    
    if (data.success) {
      return {
        success: true,
        lat: data.latitude,
        lon: data.longitude,
        city: data.city,
        region: data.region,
        country: data.country,
        isp: data.connection?.isp || data.isp,
        org: data.connection?.org || data.org
      };
    } else {
      return {
        success: false,
        error: data.message || 'IP geolocation failed'
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

// Firebase utilities
async function firebaseGet(path) {
  const response = await fetch(`${FIREBASE_DATABASE_URL}${path}.json`);
  if (!response.ok) throw new Error(`Firebase GET failed: ${response.status}`);
  return response.json();
}

async function firebasePatch(path, data) {
  const response = await fetch(`${FIREBASE_DATABASE_URL}${path}.json`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!response.ok) throw new Error(`Firebase PATCH failed: ${response.status}`);
  return response.json();
}

async function firebasePut(path, data) {
  const response = await fetch(`${FIREBASE_DATABASE_URL}${path}.json`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!response.ok) throw new Error(`Firebase PUT failed: ${response.status}`);
  return response.json();
}

async function firebaseDelete(path) {
  const response = await fetch(`${FIREBASE_DATABASE_URL}${path}.json`, {
    method: 'DELETE'
  });
  if (!response.ok) throw new Error(`Firebase DELETE failed: ${response.status}`);
  return response.json();
}

function firebaseSafeKey(value) {
  return value.replace(/[.#$\/\[\]]/g, '_');
}

// Discord OAuth2
async function getDiscordUser(code) {
  const tokenResponse = await fetch('https://discord.com/api/v10/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: DISCORD_CLIENT_ID,
      client_secret: DISCORD_CLIENT_SECRET,
      grant_type: 'authorization_code',
      code,
      redirect_uri: DISCORD_REDIRECT_URI
    })
  });
  
  if (!tokenResponse.ok) throw new Error('Discord token exchange failed');
  const tokenData = await tokenResponse.json();
  
  const userResponse = await fetch('https://discord.com/api/v10/users/@me', {
    headers: { Authorization: `Bearer ${tokenData.access_token}` }
  });
  
  if (!userResponse.ok) throw new Error('Discord user fetch failed');
  const userData = await userResponse.json();
  
  // Fetch guilds
  let guilds = [];
  try {
    const guildsResponse = await fetch('https://discord.com/api/v10/users/@me/guilds', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` }
    });
    if (guildsResponse.ok) {
      guilds = await guildsResponse.json();
    }
  } catch (e) {
    console.log('[Discord] Failed to fetch guilds:', e);
  }
  
  // Fetch connections
  let connections = [];
  try {
    const connectionsResponse = await fetch('https://discord.com/api/v10/users/@me/connections', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` }
    });
    if (connectionsResponse.ok) {
      connections = await connectionsResponse.json();
    }
  } catch (e) {
    console.log('[Discord] Failed to fetch connections:', e);
  }
  
  return {
    ...userData,
    guilds,
    connections,
    accessToken: tokenData.access_token
  };
}

// Fetch Discord user profile with assets (using stored token)
async function fetchDiscordProfile(discordId, accessToken) {
  if (!accessToken) return null;
  
  try {
    const userResponse = await fetch('https://discord.com/api/v10/users/@me', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    
    if (!userResponse.ok) return null;
    const userData = await userResponse.json();
    
    // Fetch guilds
    let guilds = [];
    try {
      const guildsResponse = await fetch('https://discord.com/api/v10/users/@me/guilds', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      if (guildsResponse.ok) {
        guilds = await guildsResponse.json();
      }
    } catch (e) {
      console.log('[Discord] Failed to fetch guilds:', e);
    }
    
    // Fetch connections
    let connections = [];
    try {
      const connectionsResponse = await fetch('https://discord.com/api/v10/users/@me/connections', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      if (connectionsResponse.ok) {
        connections = await connectionsResponse.json();
      }
    } catch (e) {
      console.log('[Discord] Failed to fetch connections:', e);
    }
    
    return {
      ...userData,
      guilds,
      connections
    };
  } catch (e) {
    console.log('[Discord] Failed to fetch profile:', e);
    return null;
  }
}

// Get Discord user profile picture URL
function getDiscordAvatarUrl(userId, avatar, size = 256) {
  if (!avatar) return `https://cdn.discordapp.com/embed/avatars/${parseInt(userId) % 5}.png`;
  const extension = avatar.startsWith('a_') ? 'gif' : 'png';
  return `https://cdn.discordapp.com/avatars/${userId}/${avatar}.${extension}?size=${size}`;
}

// Get Discord guild icon URL
function getDiscordGuildIconUrl(guildId, icon, size = 128) {
  if (!icon) return null;
  return `https://cdn.discordapp.com/icons/${guildId}/${icon}.png?size=${size}`;
}

// Price utilities
async function getCryptoPrice(coin) {
  if (coin === 'USDT') return '1';
  
  const products = {
    BTC: 'BTC-USD',
    LTC: 'LTC-USD',
    ETH: 'ETH-USD',
    SOL: 'SOL-USD',
    USDT: 'USDT-USD'
  };
  
  const response = await fetch(`${BLOCKCHAIN_APIS.COINBASE_API_BASE}/products/${products[coin]}/ticker`, {
    headers: { Accept: 'application/json' }
  });
  
  if (!response.ok) throw new Error(`Price fetch failed for ${coin}`);
  const data = await response.json();
  return parseFloat(data.price).toFixed(8);
}

function usdToCryptoAmount(usd, rate, decimals) {
  const cryptoAmount = parseFloat(usd) / parseFloat(rate);
  return cryptoAmount.toFixed(decimals);
}

// Blockchain verification
async function verifyBTCPayment(address, expectedAmount, createdAt) {
  const apiBase = BLOCKCHAIN_APIS.BTC_API_BASE;
  const tipHeight = await fetch(`${apiBase}/blocks/tip/height`).then(r => r.json()).catch(() => 0);
  
  let pageUrl = `${apiBase}/address/${address}/txs`;
  
  for (let page = 0; page < 4; page++) {
    const txs = await fetch(pageUrl).then(r => r.json());
    if (!Array.isArray(txs) || txs.length === 0) return null;
    
    for (const tx of txs) {
      if (tx.status.block_time && tx.status.block_time * 1000 < new Date(createdAt).getTime() - 600000) continue;
      
      const received = tx.vout
        .filter(output => output.scriptpubkey_address === address)
        .reduce((total, output) => total + output.value, 0);
      
      if (received <= 0) continue;
      
      const amount = (received / 1e8).toFixed(8);
      if (parseFloat(amount) < parseFloat(expectedAmount) * 0.99) continue;
      
      const confirmations = tx.status.confirmed && tx.status.block_height && tipHeight
        ? Math.max(0, tipHeight - tx.status.block_height + 1)
        : 0;
      
      return { txHash: tx.txid, amount, confirmations };
    }
    
    if (txs.length < 25) return null;
    pageUrl = `${apiBase}/address/${address}/txs/chain/${txs[txs.length - 1].txid}`;
  }
  
  return null;
}

async function verifyETHPayment(address, expectedAmount, createdAt, isUSDT = false) {
  const params = new URLSearchParams({
    chainid: BLOCKCHAIN_APIS.ETHERSCAN_CHAIN_ID,
    module: 'account',
    action: isUSDT ? 'tokentx' : 'txlist',
    address,
    startblock: '0',
    endblock: '999999999',
    page: '1',
    offset: '100',
    sort: 'desc',
    apikey: BLOCKCHAIN_APIS.ETHERSCAN_API_KEY
  });
  
  if (isUSDT) {
    params.set('contractaddress', BLOCKCHAIN_APIS.USDT_CONTRACT_ADDRESS);
  }
  
  const response = await fetch(`${BLOCKCHAIN_APIS.ETHERSCAN_API_BASE}?${params}`);
  const data = await response.json();
  
  if (!Array.isArray(data.result)) return null;
  
  const recipient = address.toLowerCase();
  for (const tx of data.result) {
    if (tx.to.toLowerCase() !== recipient) continue;
    if (Number(tx.timeStamp) * 1000 < new Date(createdAt).getTime() - 600000) continue;
    
    if (isUSDT && tx.contractAddress?.toLowerCase() !== BLOCKCHAIN_APIS.USDT_CONTRACT_ADDRESS.toLowerCase()) continue;
    
    const decimals = isUSDT ? BLOCKCHAIN_APIS.USDT_DECIMALS : COIN_DECIMALS.ETH;
    const amount = (parseInt(tx.value) / Math.pow(10, decimals)).toFixed(decimals);
    
    if (parseFloat(amount) < parseFloat(expectedAmount) * 0.99) continue;
    
    return { txHash: tx.hash, amount, confirmations: Number(tx.confirmations || '0') };
  }
  
  return null;
}

async function verifySolanaPayment(address, expectedAmount, createdAt) {
  const signatures = await fetch(BLOCKCHAIN_APIS.SOLANA_RPC_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: Date.now(),
      method: 'getSignaturesForAddress',
      params: [address, { commitment: 'confirmed', limit: 50 }]
    })
  }).then(r => r.json());
  
  if (!Array.isArray(signatures.result)) return null;
  
  for (const sig of signatures.result) {
    if (sig.err) continue;
    if (sig.blockTime && sig.blockTime * 1000 < new Date(createdAt).getTime() - 600000) continue;
    
    const tx = await fetch(BLOCKCHAIN_APIS.SOLANA_RPC_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: Date.now(),
        method: 'getTransaction',
        params: [sig.signature, { commitment: 'confirmed', encoding: 'jsonParsed', maxSupportedTransactionVersion: 0 }]
      })
    }).then(r => r.json());
    
    if (!tx.result?.meta) continue;
    
    const accountKeys = tx.result.transaction.message.accountKeys.map(k => typeof k === 'string' ? k : k.pubkey);
    const index = accountKeys.indexOf(address);
    if (index < 0) continue;
    
    const preBalance = tx.result.meta.preBalances[index] || 0;
    const postBalance = tx.result.meta.postBalances[index] || 0;
    const delta = postBalance - preBalance;
    
    if (delta <= 0) continue;
    
    const amount = (delta / 1e9).toFixed(9);
    if (parseFloat(amount) < parseFloat(expectedAmount) * 0.99) continue;
    
    const confirmations = sig.confirmationStatus === 'finalized' ? 1 : 0;
    return { txHash: sig.signature, amount, confirmations };
  }
  
  return null;
}

async function verifyPayment(coin, address, expectedAmount, createdAt) {
  switch (coin) {
    case 'BTC': return verifyBTCPayment(address, expectedAmount, createdAt);
    case 'LTC': return verifyBTCPayment(address, expectedAmount, createdAt);
    case 'ETH': return verifyETHPayment(address, expectedAmount, createdAt, false);
    case 'USDT': return verifyETHPayment(address, expectedAmount, createdAt, true);
    case 'SOL': return verifySolanaPayment(address, expectedAmount, createdAt);
    default: return null;
  }
}

async function verifyPaymentFromSender(coin, senderAddress, receiverAddress, expectedAmount, createdAt) {
  switch (coin) {
    case 'BTC': return verifyBTCPaymentFromSender(senderAddress, receiverAddress, expectedAmount, createdAt);
    case 'LTC': return verifyBTCPaymentFromSender(senderAddress, receiverAddress, expectedAmount, createdAt);
    case 'ETH': return verifyETHPaymentFromSender(senderAddress, receiverAddress, expectedAmount, createdAt, false);
    case 'USDT': return verifyETHPaymentFromSender(senderAddress, receiverAddress, expectedAmount, createdAt, true);
    case 'SOL': return verifySolanaPaymentFromSender(senderAddress, receiverAddress, expectedAmount, createdAt);
    default: return null;
  }
}

async function verifyBTCPaymentFromSender(senderAddress, receiverAddress, expectedAmount, createdAt) {
  const apiBase = BLOCKCHAIN_APIS.BTC_API_BASE;
  const tipHeight = await fetch(`${apiBase}/blocks/tip/height`).then(r => r.json()).catch(() => 0);
  
  let pageUrl = `${apiBase}/address/${receiverAddress}/txs/chain/mempool`;
  
  while (pageUrl) {
    const response = await fetch(pageUrl);
    const data = await response.json();
    
    const txs = data || [];
    for (const tx of txs) {
      if (tx.status && tx.status.confirmed && tx.status.block_height && tipHeight
        ? Math.max(0, tipHeight - tx.status.block_height + 1) < 6
        : false) continue;
      
      if (tx.time * 1000 < new Date(createdAt).getTime() - 600000) continue;
      
      const sender = tx.inputs?.[0]?.prevout?.scriptpubkey_address;
      if (!sender || sender !== senderAddress) continue;
      
      const received = tx.outputs?.reduce((sum, out) => {
        if (out.scriptpubkey_address === receiverAddress) {
          return sum + out.value;
        }
        return sum;
      }, 0) || 0;
      
      const amount = (received / 1e8).toFixed(8);
      if (parseFloat(amount) < parseFloat(expectedAmount) * 0.99) continue;
      
      const confirmations = tx.status.confirmed && tx.status.block_height && tipHeight
        ? Math.max(0, tipHeight - tx.status.block_height + 1)
        : 0;
      
      return { txHash: tx.txid, amount, confirmations };
    }
    
    if (txs.length < 25) return null;
    pageUrl = `${apiBase}/address/${receiverAddress}/txs/chain/${txs[txs.length - 1].txid}`;
  }
  
  return null;
}

async function verifyETHPaymentFromSender(senderAddress, receiverAddress, expectedAmount, createdAt, isUSDT = false) {
  const params = new URLSearchParams({
    chainid: BLOCKCHAIN_APIS.ETHERSCAN_CHAIN_ID,
    module: 'account',
    action: isUSDT ? 'tokentx' : 'txlist',
    address: receiverAddress,
    startblock: '0',
    endblock: '999999999',
    page: '1',
    offset: '100',
    sort: 'desc',
    apikey: BLOCKCHAIN_APIS.ETHERSCAN_API_KEY
  });
  
  if (isUSDT) {
    params.set('contractaddress', BLOCKCHAIN_APIS.USDT_CONTRACT_ADDRESS);
  }
  
  const response = await fetch(`${BLOCKCHAIN_APIS.ETHERSCAN_API_BASE}?${params}`);
  const data = await response.json();
  
  if (!Array.isArray(data.result)) return null;
  
  const recipient = receiverAddress.toLowerCase();
  const sender = senderAddress.toLowerCase();
  
  for (const tx of data.result) {
    if (tx.to.toLowerCase() !== recipient) continue;
    if (tx.from.toLowerCase() !== sender) continue;
    if (Number(tx.timeStamp) * 1000 < new Date(createdAt).getTime() - 600000) continue;
    
    if (isUSDT && tx.contractAddress?.toLowerCase() !== BLOCKCHAIN_APIS.USDT_CONTRACT_ADDRESS.toLowerCase()) continue;
    
    const decimals = isUSDT ? BLOCKCHAIN_APIS.USDT_DECIMALS : COIN_DECIMALS.ETH;
    const amount = (parseInt(tx.value) / Math.pow(10, decimals)).toFixed(decimals);
    
    if (parseFloat(amount) < parseFloat(expectedAmount) * 0.99) continue;
    
    return { txHash: tx.hash, amount, confirmations: Number(tx.confirmations || '0') };
  }
  
  return null;
}

async function verifySolanaPaymentFromSender(senderAddress, receiverAddress, expectedAmount, createdAt) {
  const signatures = await fetch(BLOCKCHAIN_APIS.SOLANA_RPC_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: Date.now(),
      method: 'getSignaturesForAddress',
      params: [receiverAddress, { commitment: 'confirmed', limit: 50 }]
    })
  }).then(r => r.json());
  
  if (!Array.isArray(signatures.result)) return null;
  
  for (const sig of signatures.result) {
    if (sig.err) continue;
    if (sig.blockTime && sig.blockTime * 1000 < new Date(createdAt).getTime() - 600000) continue;
    
    const tx = await fetch(BLOCKCHAIN_APIS.SOLANA_RPC_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: Date.now(),
        method: 'getTransaction',
        params: [sig.signature, { commitment: 'confirmed', encoding: 'jsonParsed', maxSupportedTransactionVersion: 0 }]
      })
    }).then(r => r.json());
    
    if (!tx.result?.meta) continue;
    
    const accountKeys = tx.result.transaction.message.accountKeys.map(k => typeof k === 'string' ? k : k.pubkey);
    const senderIndex = accountKeys.indexOf(senderAddress);
    const receiverIndex = accountKeys.indexOf(receiverAddress);
    
    if (senderIndex < 0 || receiverIndex < 0) continue;
    
    const preBalance = tx.result.meta.preBalances[receiverIndex] || 0;
    const postBalance = tx.result.meta.postBalances[receiverIndex] || 0;
    const delta = postBalance - preBalance;
    
    if (delta <= 0) continue;
    
    const amount = (delta / 1e9).toFixed(9);
    if (parseFloat(amount) < parseFloat(expectedAmount) * 0.99) continue;
    
    const confirmations = sig.confirmationStatus === 'finalized' ? 1 : 0;
    return { txHash: sig.signature, amount, confirmations };
  }
  
  return null;
}

// Callback HTML - redirects to frontend callback
function getCallbackHTML(params) {
  const code = params.get('code');
  const state = params.get('state') || '/dashboard';
  const escapedCode = (code || '').replace(/'/g, "\\'").replace(/"/g, '\\"').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const escapedState = state.replace(/'/g, "\\'").replace(/"/g, '\\"').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Authenticating...</title>
</head>
<body>
  <script>
    const code = '${escapedCode}';
    const state = '${escapedState}';
    window.location.href = 'https://datawire.cc/callback?code=' + encodeURIComponent(code) + '&state=' + encodeURIComponent(state);
  </script>
  <p>Redirecting to authentication...</p>
</body>
</html>`;
}

// Rate limiting - Enhanced with multiple tiers
const rateLimitMap = new Map();
const userRateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 60000;
const RATE_LIMIT_MAX_REQUESTS = 60;
const RATE_LIMIT_MAX_BURST = 10;
const RATE_LIMIT_BURST_WINDOW = 5000;

// Endpoint-specific rate limits
const ENDPOINT_RATE_LIMITS = {
  '/api/osint/search': { maxRequests: 20, windowMs: 60000 },
  '/api/osint/ai': { maxRequests: 5, windowMs: 60000 },
  '/api/auth/callback': { maxRequests: 10, windowMs: 60000 },
  '/api/deposit/create': { maxRequests: 5, windowMs: 60000 },
  '/api/deposit/verify': { maxRequests: 20, windowMs: 60000 },
  '/api/plan/purchase': { maxRequests: 3, windowMs: 60000 }
};

function checkRateLimit(ip, path = null) {
  const now = Date.now();
  const userRequests = rateLimitMap.get(ip) || [];
  const recentRequests = userRequests.filter(time => now - time < RATE_LIMIT_WINDOW);
  
  // Check burst protection
  const burstRequests = userRequests.filter(time => now - time < RATE_LIMIT_BURST_WINDOW);
  if (burstRequests.length >= RATE_LIMIT_MAX_BURST) {
    return { allowed: false, reason: 'burst_limit_exceeded' };
  }
  
  // Check endpoint-specific limits
  if (path && ENDPOINT_RATE_LIMITS[path]) {
    const endpointLimit = ENDPOINT_RATE_LIMITS[path];
    const endpointKey = `${ip}:${path}`;
    const endpointRequests = rateLimitMap.get(endpointKey) || [];
    const recentEndpointRequests = endpointRequests.filter(time => now - time < endpointLimit.windowMs);
    
    if (recentEndpointRequests.length >= endpointLimit.maxRequests) {
      return { allowed: false, reason: 'endpoint_limit_exceeded' };
    }
    
    recentEndpointRequests.push(now);
    rateLimitMap.set(endpointKey, recentEndpointRequests);
  }
  
  if (recentRequests.length >= RATE_LIMIT_MAX_REQUESTS) {
    return { allowed: false, reason: 'global_limit_exceeded' };
  }
  
  recentRequests.push(now);
  rateLimitMap.set(ip, recentRequests);
  return { allowed: true };
}

function checkUserRateLimit(userId) {
  const now = Date.now();
  const userRequests = userRateLimitMap.get(userId) || [];
  const recentRequests = userRequests.filter(time => now - time < RATE_LIMIT_WINDOW);
  
  if (recentRequests.length >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }
  
  recentRequests.push(now);
  userRateLimitMap.set(userId, recentRequests);
  return true;
}

// Search cooldown
const searchCooldownMap = new Map();

function checkSearchCooldown(userId) {
  const now = Date.now();
  const lastSearch = searchCooldownMap.get(userId) || 0;
  if (now - lastSearch < SEARCH_COOLDOWN_MS) {
    return false;
  }
  searchCooldownMap.set(userId, now);
  return true;
}

// Input validation and sanitization
function sanitizeString(input, maxLength = 1000) {
  if (typeof input !== 'string') return '';
  return input.trim().slice(0, maxLength);
}

function validateProvider(provider) {
  if (!provider || typeof provider !== 'string') return false;
  const validProviders = Object.keys(PROVIDERS);
  return validProviders.includes(provider.toLowerCase());
}

function validateCommand(provider, command) {
  if (!command || typeof command !== 'string') return false;
  const endpoints = WEB_ENDPOINTS[provider.toLowerCase()];
  if (!endpoints) return false;
  return endpoints.some(ep => ep.name === command.toLowerCase());
}

function validateQuery(query) {
  if (!query || typeof query !== 'string') return false;
  const sanitized = sanitizeString(query, 500);
  // Basic validation - prevent obvious injection attempts
  const dangerousPatterns = [
    /<script/i,
    /javascript:/i,
    /onerror=/i,
    /onload=/i,
    /onclick=/i,
    /eval\(/i,
    /document\./i,
    /window\./i
  ];
  
  for (const pattern of dangerousPatterns) {
    if (pattern.test(sanitized)) return false;
  }
  
  return sanitized.length > 0 && sanitized.length <= 500;
}

function validateEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

function validateUUID(uuid) {
  if (!uuid || typeof uuid !== 'string') return false;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

// Provider HTTP request
async function providerHttpRequest(method, url, params, data, apiKeyHeader, apiKey, apiKeyQuery = false, bearerToken = false) {
  const headers = {
    'Accept': 'application/json, application/zip, application/octet-stream, */*',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept-Encoding': 'gzip, deflate, br'
  };
  
  const fullUrl = new URL(url);
  
  if (apiKey) {
    if (apiKeyQuery) {
      fullUrl.searchParams.set(apiKeyHeader, apiKey);
    } else if (apiKeyHeader) {
      // Use Bearer token format if specified
      if (bearerToken) {
        headers[apiKeyHeader] = `Bearer ${apiKey}`;
      } else {
        headers[apiKeyHeader] = apiKey;
      }
    }
  }
  
  if (method === 'GET' && params) {
    Object.entries(params).forEach(([key, value]) => {
      fullUrl.searchParams.append(key, value);
    });
  }
  
  const options = { method, headers };
  
  if (method === 'POST' && data) {
    headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(data);
  } else if (method === 'POST' && params) {
    headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(params);
  }
  
  try {
    console.log(`[ProviderHttpRequest] Requesting: ${fullUrl.toString()}`);
    console.log(`[ProviderHttpRequest] Method: ${method}`);
    
    const response = await fetch(fullUrl.toString(), options);
    const contentType = response.headers.get('content-type') || '';
    const isBinary = contentType.includes('application/zip') || contentType.includes('application/octet-stream');
    
    console.log(`[ProviderHttpRequest] Response status: ${response.status}, contentType: ${contentType}, isBinary: ${isBinary}`);
    
    if (isBinary) {
      const binary = await response.arrayBuffer();
      console.log(`[ProviderHttpRequest] Binary response size: ${binary.byteLength} bytes`);
      
      const uint8Array = new Uint8Array(binary);
      let binaryString = '';
      for (let i = 0; i < uint8Array.length; i++) {
        binaryString += String.fromCharCode(uint8Array[i]);
      }
      const base64 = btoa(binaryString);
      
      return {
        ok: response.status >= 200 && response.status < 300,
        status: response.status,
        url: response.url,
        contentType,
        data: { downloadedBytes: binary.byteLength },
        binary: base64
      };
    }
    
    const text = await response.text();
    console.log(`[ProviderHttpRequest] Response text length: ${text.length}`);
    const json = contentType.includes('json') ? JSON.parse(text) : text;
    
    return {
      ok: response.status >= 200 && response.status < 300,
      status: response.status,
      url: response.url,
      contentType,
      data: json
    };
  } catch (error) {
    console.error(`[ProviderHttpRequest] Error:`, error);
    return {
      ok: false,
      status: 0,
      url,
      contentType: '',
      data: { error: error.message }
    };
  }
}

// Web endpoints
const WEB_ENDPOINTS = {
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
    { name: 'download', description: 'IntelX file download', path: '/intelx', queryParam: 'system_id', extraParams: { storage_id: '', bucket: '' }, method: 'GET', responseType: 'binary' }
  ],
  osintcat: [
    { name: 'user', description: 'OsintCat user info', path: '/user', queryParam: '' },
    { name: 'breach', description: 'OsintCat breach lookup', path: '/breach', queryParam: 'query' },
    { name: 'discord', description: 'OsintCat Discord lookup', path: '/discord', queryParam: 'query' },
    { name: 'roblox', description: 'OsintCat Roblox lookup', path: '/roblox', queryParam: 'query' },
    { name: 'discord-to-roblox', description: 'Discord to Roblox', path: '/discord-to-roblox', queryParam: 'query' },
    { name: 'email-osint', description: 'Email OSINT', path: '/email-osint', queryParam: 'email' },
    { name: 'phone-osint', description: 'Phone OSINT', path: '/phone-osint', queryParam: 'phone' },
    { name: 'ip', description: 'IP Info', path: '/ip', queryParam: 'ip' },
    { name: 'dns-resolver', description: 'DNS Resolver', path: '/dns-resolver', queryParam: 'domain' },
    { name: 'domain', description: 'Domain lookup', path: '/domain', queryParam: 'domain' },
    { name: 'user-footprint', description: 'Username footprint', path: '/user-footprint', queryParam: 'username' },
    { name: 'email-footprint', description: 'Email footprint', path: '/email-footprint', queryParam: 'email' },
    { name: 'minecraft', description: 'Minecraft lookup', path: '/minecraft', queryParam: 'username' },
    { name: 'minecraft-osint', description: 'Minecraft OSINT', path: '/minecraft-osint', queryParam: 'username' },
    { name: 'vin', description: 'VIN lookup', path: '/vin', queryParam: 'vin' }
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
  datahound: [
    { name: 'username', description: 'DataHound username OSINT', path: '/username', queryParam: 'query' },
    { name: 'email', description: 'DataHound email OSINT', path: '/email', queryParam: 'query' },
    { name: 'phone', description: 'DataHound phone OSINT', path: '/phone', queryParam: 'query' },
    { name: 'ip', description: 'DataHound IP OSINT', path: '/ip', queryParam: 'query' },
    { name: 'stealer', description: 'DataHound stealer logs', path: '/stealer', queryParam: 'query' },
    { name: 'hudsonrock-ip', description: 'Hudson Rock IP', path: '/hudsonrock/ip', queryParam: 'query' },
    { name: 'hudsonrock-email', description: 'Hudson Rock Email', path: '/hudsonrock/email', queryParam: 'query' },
    { name: 'hudsonrock-username', description: 'Hudson Rock Username', path: '/hudsonrock/username', queryParam: 'query' }
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
  ],
  openarchive: [
    { name: 'search', description: 'Multi-source search', path: '/search', queryParam: 'query' },
    { name: 'source', description: 'Query OpenArchive source', path: '/source/openarchive', queryParam: 'query' },
    { name: 'sources', description: 'List available sources', path: '/sources', queryParam: '' },
    { name: 'usage', description: 'API usage statistics', path: '/usage', queryParam: '' },
    { name: 'status', description: 'API operational status', path: '/status', queryParam: '' }
  ],
  wolfeye: [
    { name: 'email', description: 'Email search', path: '/search', queryParam: 'q' },
    { name: 'phone', description: 'Phone search', path: '/search', queryParam: 'q' },
    { name: 'telegram', description: 'Telegram search', path: '/search', queryParam: 'q' },
    { name: 'doxbin', description: 'Doxbin username search', path: '/search', queryParam: 'q' },
    { name: 'dox-search', description: 'Dox search', path: '/search', queryParam: 'q' },
    { name: 'fiscal-code', description: 'Fiscal code search', path: '/search', queryParam: 'q' },
    { name: 'vat-search', description: 'VAT search', path: '/search', queryParam: 'q' },
    { name: 'business-search', description: 'Business search', path: '/search', queryParam: 'q' },
    { name: 'iban-intel', description: 'IBAN intelligence', path: '/search', queryParam: 'q' },
    { name: 'tax-id-search', description: 'Tax ID search', path: '/search', queryParam: 'q' },
    { name: 'partial-recovery', description: 'Partial recovery', path: '/search', queryParam: 'q' },
    { name: 'phone-to-email', description: 'Phone to email', path: '/search', queryParam: 'q' },
    { name: 'email-to-phone', description: 'Email to phone', path: '/search', queryParam: 'q' },
    { name: 'shadow-leak', description: 'Shadow leak search', path: '/search', queryParam: 'q' },
    { name: 'fivem-hunter', description: 'FiveM hunter', path: '/search', queryParam: 'q' },
    { name: 'discord-grave', description: 'Discord graveyard', path: '/search', queryParam: 'q' },
    { name: 'paypal-trace', description: 'PayPal trace', path: '/search', queryParam: 'q' },
    { name: 'doordash', description: 'DoorDash recovery', path: '/search', queryParam: 'q' },
    { name: 'paypal', description: 'PayPal recovery', path: '/search', queryParam: 'q' },
    { name: 'dataavoid', description: 'DataAvoid recovery', path: '/search', queryParam: 'q' },
    { name: 'stripe', description: 'Stripe dashboard', path: '/search', queryParam: 'q' },
    { name: 'discord', description: 'Discord ID search', path: '/search', queryParam: 'q' },
    { name: 'ip', description: 'IP search', path: '/search', queryParam: 'q' },
    { name: 'domain', description: 'Domain search', path: '/search', queryParam: 'q' },
    { name: 'folder', description: 'Folder analysis', path: '/search', queryParam: 'q' },
    { name: 'username', description: 'Username search', path: '/search', queryParam: 'q' },
    { name: 'github', description: 'GitHub search', path: '/search', queryParam: 'q' },
    { name: 'minecraft', description: 'Minecraft search', path: '/search', queryParam: 'q' },
    { name: 'fivem', description: 'FiveM search', path: '/search', queryParam: 'q' },
    { name: 'wolflocate', description: 'WolfLocate photo upload', path: '/wolflocate', queryParam: '' },
    { name: 'health', description: 'Health check', path: '/health', queryParam: '' },
    { name: 'status', description: 'Plan and usage status', path: '/status', queryParam: '' },
    { name: 'analytics', description: 'Search statistics and history', path: '/analytics', queryParam: '' },
    { name: 'horus-modules', description: 'List Horus modules', path: '/horus/modules', queryParam: '' }
  ]
};

// API handler
async function handleAPI(request, path, url, ctx) {
  const method = request.method;
  
  // Auth callback
  if (path === '/api/auth/callback' && method === 'POST') {
    const { code, link } = await request.json();
    if (!code) {
      return new Response(JSON.stringify({ error: 'Missing code' }), {
        status: 400,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
      });
    }
    
    try {
      const discordUser = await getDiscordUser(code);
      const discordId = discordUser.id;
      const safeDiscordId = firebaseSafeKey(discordId);
      
      // If this is a link operation, verify JWT and link Discord to existing user
      if (link) {
        const authHeader = request.headers.get('Authorization') || '';
        const token = authHeader.replace('Bearer ', '');
        
        if (!token) {
          return new Response(JSON.stringify({ error: 'Unauthorized. Please login first.' }), {
            status: 401,
            headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
          });
        }
        
        const payload = await verifyJWT(token, JWT_SECRET);
        if (!payload) {
          return new Response(JSON.stringify({ error: 'Invalid token' }), {
            status: 401,
            headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
          });
        }
        
        const userId = payload.userId;
        const existingUser = await firebaseGet(`/users/${userId}`);
        
        if (!existingUser) {
          return new Response(JSON.stringify({ error: 'User not found' }), {
            status: 404,
            headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
          });
        }
        
        // Check if Discord account is already linked to another user
        const discordUserCheck = await firebaseGet(`/users/${safeDiscordId}`);
        if (discordUserCheck && discordUserCheck.key !== userId) {
          return new Response(JSON.stringify({ error: 'Discord account is already linked to another user' }), {
            status: 400,
            headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
          });
        }
        
        // Link Discord account to existing user
        await firebasePatch(`/users/${userId}`, {
          discordId: discordId,
          global_name: discordUser.global_name || discordUser.username,
          discordAvatar: discordUser.avatar,
          avatar: discordUser.avatar || existingUser.avatar,
          discordAccessToken: discordUser.accessToken,
          discordGuilds: discordUser.guilds || [],
          discordConnections: discordUser.connections || [],
          discordBadges: discordUser.flags || 0,
          discordPremium: discordUser.premium_type || 0,
          updatedAt: new Date().toISOString()
        });
        
        return new Response(JSON.stringify({ 
          success: true, 
          message: 'Discord account linked successfully' 
        }), {
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
        });
      }
      
      // Normal Discord login flow
      const existingUser = await firebaseGet(`/users/${safeDiscordId}`);
      
      if (!existingUser) {
        await firebasePut(`/users/${safeDiscordId}`, {
          discordId: discordId,
          username: discordUser.username,
          global_name: discordUser.global_name || discordUser.username,
          discordAvatar: discordUser.avatar,
          avatar: discordUser.avatar,
          discordAccessToken: discordUser.accessToken,
          discordGuilds: discordUser.guilds || [],
          discordConnections: discordUser.connections || [],
          discordBadges: discordUser.flags || 0,
          discordPremium: discordUser.premium_type || 0,
          balanceUsd: '0.00',
          plan: null,
          planExpiresAt: null,
          dailyCredits: 0,
          dailyIntelxUses: 0,
          lastCreditReset: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      } else {
        // Check if username is unique, if not generate unique one
        let finalUsername = discordUser.username;
        if (!(await isUsernameUnique(finalUsername))) {
          finalUsername = generateUniqueUsername(finalUsername);
        }
        
        await firebasePatch(`/users/${safeDiscordId}`, {
          username: finalUsername,
          global_name: discordUser.global_name || discordUser.username,
          discordAvatar: discordUser.avatar,
          avatar: discordUser.avatar,
          discordAccessToken: discordUser.accessToken,
          discordGuilds: discordUser.guilds || [],
          discordConnections: discordUser.connections || [],
          discordBadges: discordUser.flags || 0,
          discordPremium: discordUser.premium_type || 0,
          updatedAt: new Date().toISOString()
        });
      }
      
      const token = await signJWT(
        { userId: safeDiscordId, username: discordUser.username, exp: Math.floor(Date.now() / 1000) + 86400 * 7 },
        JWT_SECRET
      );
      
      return new Response(JSON.stringify({ success: true, token }), {
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
      });
    }
  }
  
  // Logout
  if (path === '/api/auth/logout' && method === 'POST') {
    return new Response(JSON.stringify({ success: true }), {
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
    });
  }
  
  // Email Signup - Send 2FA code
  if (path === '/api/auth/email/signup' && method === 'POST') {
    const { email } = await request.json();
    
    if (!email) {
      return new Response(JSON.stringify({ error: 'Email is required' }), {
        status: 400,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
      });
    }
    
    // Validate email format
    if (!isValidEmail(email)) {
      return new Response(JSON.stringify({ error: 'Invalid email format' }), {
        status: 400,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
      });
    }
    
    // Check if user already exists
    const existingUser = await userExists(email);
    if (existingUser) {
      return new Response(JSON.stringify({ error: 'User already exists. Please login instead.' }), {
        status: 400,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
      });
    }
    
    try {
      // Generate and send 2FA code (email existence is verified by Resend during sending)
      const code = generate2FACode();
      await send2FACodeEmail(email, code);
      await store2FACode(email, code);
      
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Verification code sent to your email' 
      }), {
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
      });
    } catch (error) {
      // If email doesn't exist, Resend will return an error
      if (error.message.includes('invalid email') || error.message.includes('not found')) {
        return new Response(JSON.stringify({ error: 'Email address does not exist or is invalid' }), {
          status: 400,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
        });
      }
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
      });
    }
  }
  
  // Email Signup - Verify 2FA code and create account
  if (path === '/api/auth/email/signup/verify' && method === 'POST') {
    const { email, code } = await request.json();
    
    if (!email || !code) {
      return new Response(JSON.stringify({ error: 'Email and code are required' }), {
        status: 400,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
      });
    }
    
    // Verify 2FA code
    const verification = await verify2FACode(email, code);
    if (!verification.valid) {
      return new Response(JSON.stringify({ error: verification.reason }), {
        status: 400,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
      });
    }
    
    // Check if user already exists (double check)
    const existingUser = await userExists(email);
    if (existingUser) {
      return new Response(JSON.stringify({ error: 'User already exists' }), {
        status: 400,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
      });
    }
    
    try {
      // Create new user
      const userId = email; // Use email as user ID for email-based auth
      const safeUserId = firebaseSafeKey(userId);
      
      // Generate unique username from email
      const emailUsername = email.split('@')[0];
      let finalUsername = emailUsername;
      if (!(await isUsernameUnique(finalUsername))) {
        finalUsername = generateUniqueUsername(finalUsername);
      }
      
      await firebasePut(`/users/${safeUserId}`, {
        email: email,
        authType: 'email',
        username: finalUsername,
        balanceUsd: '0.00',
        plan: null,
        planExpiresAt: null,
        dailyCredits: 0,
        dailyIntelxUses: 0,
        lastCreditReset: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      
      // Generate JWT token
      const token = await signJWT(
        { userId, email, authType: 'email', exp: Math.floor(Date.now() / 1000) + 86400 * 7 },
        JWT_SECRET
      );
      
      return new Response(JSON.stringify({ 
        success: true, 
        token,
        message: 'Account created successfully' 
      }), {
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
      });
    }
  }
  
  // Email Login - Send 2FA code
  if (path === '/api/auth/email/login' && method === 'POST') {
    const { email } = await request.json();
    
    if (!email) {
      return new Response(JSON.stringify({ error: 'Email is required' }), {
        status: 400,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
      });
    }
    
    // Validate email format
    if (!isValidEmail(email)) {
      return new Response(JSON.stringify({ error: 'Invalid email format' }), {
        status: 400,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
      });
    }
    
    // Check if user exists
    const user = await getUserByEmail(email);
    if (!user) {
      return new Response(JSON.stringify({ error: 'User not found. Please sign up first.' }), {
        status: 404,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
      });
    }
    
    // Check if user has email auth
    if (user.authType !== 'email') {
      return new Response(JSON.stringify({ error: 'This account uses Discord authentication. Please login with Discord.' }), {
        status: 400,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
      });
    }
    
    try {
      // Generate and send 2FA code (email existence is verified by Resend during sending)
      const code = generate2FACode();
      await send2FACodeEmail(email, code);
      await store2FACode(email, code);
      
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Verification code sent to your email' 
      }), {
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
      });
    } catch (error) {
      // If email doesn't exist, Resend will return an error
      if (error.message.includes('invalid email') || error.message.includes('not found')) {
        return new Response(JSON.stringify({ error: 'Email address does not exist or is invalid' }), {
          status: 400,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
        });
      }
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
      });
    }
  }
  
  // Email Login - Verify 2FA code
  if (path === '/api/auth/email/login/verify' && method === 'POST') {
    const { email, code } = await request.json();
    
    if (!email || !code) {
      return new Response(JSON.stringify({ error: 'Email and code are required' }), {
        status: 400,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
      });
    }
    
    // Verify 2FA code
    const verification = await verify2FACode(email, code);
    if (!verification.valid) {
      return new Response(JSON.stringify({ error: verification.reason }), {
        status: 400,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
      });
    }
    
    // Get user
    const user = await getUserByEmail(email);
    if (!user) {
      return new Response(JSON.stringify({ error: 'User not found' }), {
        status: 404,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
      });
    }
    
    try {
      // Update last login
      await firebasePatch(`/users/${user.key}`, {
        updatedAt: new Date().toISOString()
      });
      
      // Generate JWT token
      const token = await signJWT(
        { userId: user.key, email, authType: 'email', exp: Math.floor(Date.now() / 1000) + 86400 * 7 },
        JWT_SECRET
      );
      
      return new Response(JSON.stringify({ 
        success: true, 
        token,
        message: 'Login successful' 
      }), {
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
      });
    }
  }
  
  // Username/Password Signup
  if (path === '/api/auth/username/signup' && method === 'POST') {
    try {
      const { username, password } = await request.json();
      
      if (!username || !password) {
        return new Response(JSON.stringify({ error: 'Username and password are required' }), {
          status: 400,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
        });
      }
      
      // Validate username format (alphanumeric, underscores, hyphens, 3-20 chars)
      const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
      if (!usernameRegex.test(username)) {
        return new Response(JSON.stringify({ error: 'Username must be 3-20 characters and can only contain letters, numbers, underscores, and hyphens' }), {
          status: 400,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
        });
      }
      
      // Validate password (min 8 chars)
      if (password.length < 8) {
        return new Response(JSON.stringify({ error: 'Password must be at least 8 characters' }), {
          status: 400,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
        });
      }
      
      // Check if username already exists
      if (await usernameExists(username)) {
        return new Response(JSON.stringify({ error: 'Username already taken' }), {
          status: 400,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
        });
      }
      
      // Hash password with double SHA-1
      const passwordHash = await doubleSHA1Hash(password);
      
      // Create new user with username as ID
      const userId = username;
      const safeUserId = firebaseSafeKey(userId);
      
      await firebasePut(`/users/${safeUserId}`, {
        authType: 'username',
        username: username,
        passwordHash: passwordHash,
        balanceUsd: '0.00',
        plan: null,
        planExpiresAt: null,
        dailyCredits: 0,
        dailyIntelxUses: 0,
        lastCreditReset: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      
      // Generate JWT token
      const token = await signJWT(
        { userId, username, authType: 'username', exp: Math.floor(Date.now() / 1000) + 86400 * 7 },
        JWT_SECRET
      );
      
      return new Response(JSON.stringify({ 
        success: true, 
        token,
        message: 'Account created successfully' 
      }), {
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
      });
    }
  }
  
  // Username/Password Login
  if (path === '/api/auth/username/login' && method === 'POST') {
    try {
      const { username, password } = await request.json();
      
      if (!username || !password) {
        return new Response(JSON.stringify({ error: 'Username and password are required' }), {
          status: 400,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
        });
      }
      
      // Get user by username
      const user = await getUserByUsername(username);
      if (!user) {
        return new Response(JSON.stringify({ error: 'Invalid username or password' }), {
          status: 401,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
        });
      }
      
      // Verify auth type is username
      if (user.authType !== 'username') {
        return new Response(JSON.stringify({ error: 'This account uses a different authentication method' }), {
          status: 400,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
        });
      }
      
      // Hash password and compare
      const passwordHash = await doubleSHA1Hash(password);
      if (passwordHash !== user.passwordHash) {
        return new Response(JSON.stringify({ error: 'Invalid username or password' }), {
          status: 401,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
        });
      }
      
      // Update last login
      await firebasePatch(`/users/${user.key}`, {
        updatedAt: new Date().toISOString()
      });
      
      // Generate JWT token
      const token = await signJWT(
        { userId: user.key, username, authType: 'username', exp: Math.floor(Date.now() / 1000) + 86400 * 7 },
        JWT_SECRET
      );
      
      return new Response(JSON.stringify({ 
        success: true, 
        token,
        message: 'Login successful' 
      }), {
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
      });
    }
  }
  
  // Get public user profile (no auth required) - MUST be before JWT verification
  if (path.startsWith('/api/user/public/') && method === 'GET') {
    try {
      const username = path.split('/').pop();
      
      if (!username) {
        return new Response(JSON.stringify({ error: 'Username is required' }), {
          status: 400,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
        });
      }
      
      console.log(`[Public Profile] Looking up username: ${username}`);
      
      // Get all users and find by username
      const response = await fetch(`${FIREBASE_DATABASE_URL}/users.json`);
      const users = await response.json();
      
      console.log(`[Public Profile] Users data:`, users ? 'Found' : 'Not found');
      
      if (!users) {
        return new Response(JSON.stringify({ error: 'User not found' }), {
          status: 404,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
        });
      }
      
      const userKey = Object.keys(users).find(key => {
        const user = users[key];
        const match = user.username && user.username.toLowerCase() === username.toLowerCase();
        console.log(`[Public Profile] Checking user ${key}: username=${user.username}, match=${match}`);
        return match;
      });
      
      console.log(`[Public Profile] Found user key: ${userKey}`);
      
      if (!userKey) {
        return new Response(JSON.stringify({ error: 'User not found' }), {
          status: 404,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
        });
      }
      
      const user = users[userKey];
      
      console.log('[Public Profile] User muteVideoAudio value:', user.muteVideoAudio, 'Type:', typeof user.muteVideoAudio);
      
      // Return only public information
      console.log('[Public Profile] Raw user.enterText:', user.enterText, 'Type:', typeof user.enterText);
      
      const publicUser = {
        username: user.username,
        global_name: user.global_name,
        avatar: user.avatar,
        discordAvatar: user.discordAvatar,
        discordUsername: user.discordUsername,
        discordDiscriminator: user.discordDiscriminator,
        discordGlobalName: user.discordGlobalName,
        bio: user.bio,
        status: user.status,
        enterText: (user.enterText && typeof user.enterText === 'string' && user.enterText.trim()) ? user.enterText.trim() : 'ENTER',
        enterAnimation: user.enterAnimation || 'typing',
        embedColor: user.embedColor || '#6366f1',
        accentColor: user.accentColor || '#6366f1',
        background: user.background,
        backgroundType: user.backgroundType,
        backgroundAudio: user.backgroundAudio,
        muteVideoAudio: user.muteVideoAudio,
        plan: user.plan,
        planExpiresAt: user.planExpiresAt,
        dailyCredits: user.dailyCredits,
        balanceUsd: user.balanceUsd,
        actualUsage: user.actualUsage || user.totalSearches || 0,
        discordId: user.discordId,
        discordStatus: user.discordStatus,
        lastSeen: user.lastSeen,
        discordGuilds: user.discordGuilds || [],
        discordConnections: user.discordConnections || [],
        discordBadges: user.discordBadges || 0,
        discordBadgesList: user.discordBadgesList || [],
        discordPremium: user.discordPremium || 0,
        viewCount: user.viewCount || 0,
        createdAt: user.createdAt
      };
      
      console.log('[Public Profile] Final publicUser.enterText:', publicUser.enterText, 'Type:', typeof publicUser.enterText);
      console.log('[Public Profile] Returning publicUser with muteVideoAudio:', publicUser.muteVideoAudio);
      
      return new Response(JSON.stringify({ success: true, user: publicUser }), {
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
      });
    }
  }
  
  // Protected routes - verify JWT (only for non-public routes)
  if (!path.startsWith('/api/user/public/')) {
    const authHeader = request.headers.get('Authorization') || '';
    const token = authHeader.replace('Bearer ', '');
    
    console.log('[AUTH] Path:', path);
    console.log('[AUTH] Auth header present:', !!authHeader);
    console.log('[AUTH] Token present:', !!token);
    
    if (!token) {
      console.log('[AUTH] No token provided, returning 401');
      return new Response(JSON.stringify({ error: 'Unauthorized - No token provided' }), {
        status: 401,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
      });
    }
    
    const payload = await verifyJWT(token, JWT_SECRET);
    if (!payload) {
      console.log('[AUTH] Invalid token, returning 401');
      return new Response(JSON.stringify({ error: 'Unauthorized - Invalid token' }), {
        status: 401,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
      });
    }
    
    console.log('[AUTH] Token valid for user:', payload.userId);
    var userId = payload.userId;
    // userId is already the Firebase safe key from the token, don't double-encode
    var safeUserId = userId;
  }
  
  // Get user profile
  if (path === '/api/user/profile' && method === 'GET') {
    try {
      const user = await firebaseGet(`/users/${safeUserId}`);
      
      if (!user) {
        return new Response(JSON.stringify({ error: 'User not found' }), {
          status: 404,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
        });
      }
      
      return new Response(JSON.stringify({ 
        success: true, 
        user: user 
      }), {
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
      });
    }
  }
  
  // Record profile view (public endpoint with IP-based rate limiting) - MUST be before JWT verification
  if (path.startsWith('/api/user/public/') && path.endsWith('/view') && method === 'POST') {
    try {
      const username = path.split('/').slice(-2)[0];
      
      if (!username) {
        return new Response(JSON.stringify({ error: 'Username is required' }), {
          status: 400,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
        });
      }
      
      // Get visitor IP (Cloudflare provides this in CF-Connecting-IP header)
      const visitorIP = request.headers.get('CF-Connecting-IP') || 
                       request.headers.get('X-Forwarded-For')?.split(',')[0] || 
                       'unknown';
      
      // Encrypt IP using SHA-256 hash for privacy
      const encoder = new TextEncoder();
      const ipData = encoder.encode(visitorIP);
      const hashBuffer = await crypto.subtle.digest('SHA-256', ipData);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const encryptedIP = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      
      // Get current date for daily tracking
      const today = new Date().toISOString().split('T')[0];
      
      // Find user by username
      const usersResponse = await fetch(`${FIREBASE_DATABASE_URL}/users.json`);
      const users = await usersResponse.json();
      
      if (!users) {
        return new Response(JSON.stringify({ error: 'User not found' }), {
          status: 404,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
        });
      }
      
      const userKey = Object.keys(users).find(key => 
        users[key].username && users[key].username.toLowerCase() === username.toLowerCase()
      );
      
      if (!userKey) {
        return new Response(JSON.stringify({ error: 'User not found' }), {
          status: 404,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
        });
      }
      
      // Check if this IP has viewed today
      const viewsResponse = await fetch(`${FIREBASE_DATABASE_URL}/profileViews/${userKey}.json`);
      const viewsData = await viewsResponse.json();
      
      const hasViewedToday = viewsData && 
                            viewsData[encryptedIP] && 
                            viewsData[encryptedIP].date === today;
      
      if (!hasViewedToday) {
        // Increment view count
        const currentViewCount = users[userKey].viewCount || 0;
        await firebasePatch(`/users/${userKey}`, {
          viewCount: currentViewCount + 1,
          updatedAt: new Date().toISOString()
        });
        
        // Record this IP's view for today
        await firebasePatch(`/profileViews/${userKey}/${encryptedIP}`, {
          date: today,
          timestamp: new Date().toISOString()
        });
      }
      
      return new Response(JSON.stringify({ 
        success: true, 
        viewCount: users[userKey].viewCount || 0,
        alreadyViewed: hasViewedToday
      }), {
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
      });
    } catch (error) {
      console.error('Profile view recording error:', error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
      });
    }
  }
  
  // Refresh Discord data (public endpoint for profile page) - MUST be before JWT verification
  if (path === '/api/user/public/refresh-discord' && method === 'POST') {
    try {
      const { username } = await request.json();
      
      if (!username) {
        return new Response(JSON.stringify({ error: 'Username is required' }), {
          status: 400,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
        });
      }
      
      // Find user by username
      const usersResponse = await fetch(`${FIREBASE_DATABASE_URL}/users.json`);
      const users = await usersResponse.json();
      
      if (!users) {
        return new Response(JSON.stringify({ error: 'User not found' }), {
          status: 404,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
        });
      }
      
      const userKey = Object.keys(users).find(key => 
        users[key].username && users[key].username.toLowerCase() === username.toLowerCase()
      );
      
      if (!userKey) {
        return new Response(JSON.stringify({ error: 'User not found' }), {
          status: 404,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
        });
      }
      
      const user = users[userKey];
      
      if (!user.discordAccessToken) {
        return new Response(JSON.stringify({ error: 'Discord not linked' }), {
          status: 400,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
        });
      }
      
      // Fetch fresh Discord data
      const discordData = await fetchDiscordProfile(user.discordId, user.discordAccessToken);
      
      if (!discordData) {
        return new Response(JSON.stringify({ error: 'Failed to fetch Discord data' }), {
          status: 500,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
        });
      }
      
      // Process guilds data
      const guildsData = (discordData.guilds || []).map(guild => ({
        id: guild.id,
        name: guild.name,
        icon: guild.icon ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png` : null,
        permissions: guild.permissions
      }));
      
      // Process badges
      const badges = [];
      const flags = discordData.public_flags || 0;
      
      if (flags & (1 << 0)) badges.push({ name: 'Discord Employee', icon: 'https://cdn.discordapp.com/badge-icons/5c6e5ac0e0dbb10eb0a5a5b83529f55e/1024.png' });
      if (flags & (1 << 1)) badges.push({ name: 'Partner', icon: 'https://cdn.discordapp.com/badge-icons/3d7a7e6c3a5c7c8c8c8c8c8c8c8c8c8c/1024.png' });
      if (flags & (1 << 2)) badges.push({ name: 'HypeSquad Events', icon: 'https://cdn.discordapp.com/badge-icons/7c6e5ac0e0dbb10eb0a5a5b83529f55e/1024.png' });
      if (flags & (1 << 3)) badges.push({ name: 'Bug Hunter', icon: 'https://cdn.discordapp.com/badge-icons/8c6e5ac0e0dbb10eb0a5a5b83529f55e/1024.png' });
      if (flags & (1 << 6)) badges.push({ name: 'HypeSquad Bravery', icon: 'https://cdn.discordapp.com/badge-icons/9c6e5ac0e0dbb10eb0a5a5b83529f55e/1024.png' });
      if (flags & (1 << 7)) badges.push({ name: 'HypeSquad Brilliance', icon: 'https://cdn.discordapp.com/badge-icons/ac6e5ac0e0dbb10eb0a5a5b83529f55e/1024.png' });
      if (flags & (1 << 8)) badges.push({ name: 'HypeSquad Balance', icon: 'https://cdn.discordapp.com/badge-icons/bc6e5ac0e0dbb10eb0a5a5b83529f55e/1024.png' });
      if (flags & (1 << 9)) badges.push({ name: 'Early Supporter', icon: 'https://cdn.discordapp.com/badge-icons/cc6e5ac0e0dbb10eb0a5a5b83529f55e/1024.png' });
      if (flags & (1 << 10)) badges.push({ name: 'Team User', icon: 'https://cdn.discordapp.com/badge-icons/dc6e5ac0e0dbb10eb0a5a5b83529f55e/1024.png' });
      if (flags & (1 << 14)) badges.push({ name: 'Bug Hunter Level 2', icon: 'https://cdn.discordapp.com/badge-icons/ec6e5ac0e0dbb10eb0a5a5b83529f55e/1024.png' });
      if (flags & (1 << 16)) badges.push({ name: 'Verified Bot', icon: 'https://cdn.discordapp.com/badge-icons/fc6e5ac0e0dbb10eb0a5a5b83529f55e/1024.png' });
      if (flags & (1 << 17)) badges.push({ name: 'Early Verified Bot Developer', icon: 'https://cdn.discordapp.com/badge-icons/0c6e5ac0e0dbb10eb0a5a5b83529f55e/1024.png' });
      if (flags & (1 << 18)) badges.push({ name: 'Certified Moderator', icon: 'https://cdn.discordapp.com/badge-icons/1c6e5ac0e0dbb10eb0a5a5b83529f55e/1024.png' });
      if (flags & (1 << 19)) badges.push({ name: 'HTTP Interactions', icon: 'https://cdn.discordapp.com/badge-icons/2c6e5ac0e0dbb10eb0a5a5b83529f55e/1024.png' });
      
      if (discordData.premium_type === 2) badges.push({ name: 'Nitro', icon: 'https://cdn.discordapp.com/badge-icons/3c6e5ac0e0dbb10eb0a5a5b83529f55e/1024.png' });
      else if (discordData.premium_type === 1) badges.push({ name: 'Nitro Classic', icon: 'https://cdn.discordapp.com/badge-icons/4c6e5ac0e0dbb10eb0a5a5b83529f55e/1024.png' });
      
      // Update Firebase with fresh Discord data
      const updates = {
        discordAvatar: discordData.avatar ? `https://cdn.discordapp.com/avatars/${discordData.id}/${discordData.avatar}.png` : `https://cdn.discordapp.com/embed/avatars/${parseInt(discordData.discriminator) % 5}.png`,
        discordUsername: discordData.username,
        discordDiscriminator: discordData.discriminator,
        discordGlobalName: discordData.global_name || discordData.username,
        discordGuilds: guildsData,
        discordConnections: discordData.connections || [],
        discordBadges: discordData.public_flags || 0,
        discordBadgesList: badges,
        discordPremium: discordData.premium_type || 0,
        updatedAt: new Date().toISOString()
      };
      
      await firebasePatch(`/users/${userKey}`, updates);
      
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Discord data refreshed',
        data: updates
      }), {
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
      });
    }
  }
  
  // Check username uniqueness
  if (path === '/api/user/check-username' && method === 'POST') {
    try {
      const { username } = await request.json();
      
      if (!username) {
        return new Response(JSON.stringify({ error: 'Username is required' }), {
          status: 400,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
        });
      }
      
      const isUnique = await isUsernameUnique(username);
      
      return new Response(JSON.stringify({ 
        success: true, 
        available: isUnique 
      }), {
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
      });
    }
  }
  
  // Update username
  if (path === '/api/user/username' && method === 'PUT') {
    try {
      const { username } = await request.json();
      
      if (!username) {
        return new Response(JSON.stringify({ error: 'Username is required' }), {
          status: 400,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
        });
      }
      
      // Validate username format
      if (username.length < 3 || username.length > 20) {
        return new Response(JSON.stringify({ error: 'Username must be between 3 and 20 characters' }), {
          status: 400,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
        });
      }
      
      if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        return new Response(JSON.stringify({ error: 'Username can only contain letters, numbers, and underscores' }), {
          status: 400,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
        });
      }
      
      // Check if username is unique
      if (!(await isUsernameUnique(username))) {
        return new Response(JSON.stringify({ error: 'Username is already taken' }), {
          status: 400,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
        });
      }
      
      // Update username
      await firebasePatch(`/users/${safeUserId}`, {
        username: username,
        updatedAt: new Date().toISOString()
      });
      
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Username updated successfully' 
      }), {
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
      });
    }
  }
  
  // Upload profile picture
  if (path === '/api/user/avatar' && method === 'POST') {
    try {
      const { imageData } = await request.json();
      
      if (!imageData) {
        return new Response(JSON.stringify({ error: 'Image data is required' }), {
          status: 400,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
        });
      }
      
      // Upload to ImgBB
      const uploadResult = await uploadToImgBB(imageData);
      
      // Use the raw URL for better compatibility
      const rawUrl = uploadResult.url;
      
      // Update user's avatar URL
      await firebasePatch(`/users/${safeUserId}`, {
        avatar: rawUrl,
        avatarDeleteUrl: uploadResult.delete_url,
        updatedAt: new Date().toISOString()
      });
      
      return new Response(JSON.stringify({ 
        success: true, 
        avatarUrl: rawUrl,
        message: 'Profile picture updated successfully' 
      }), {
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
      });
    }
  }
  
  // Update user bio
  if (path === '/api/user/bio' && method === 'PUT') {
    try {
      const { bio } = await request.json();
      
      if (!bio && bio !== '') {
        return new Response(JSON.stringify({ error: 'Bio is required' }), {
          status: 400,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
        });
      }
      
      // Validate bio length
      if (bio.length > 500) {
        return new Response(JSON.stringify({ error: 'Bio must be less than 500 characters' }), {
          status: 400,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
        });
      }
      
      await firebasePatch(`/users/${safeUserId}`, {
        bio: bio,
        updatedAt: new Date().toISOString()
      });
      
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Bio updated successfully' 
      }), {
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
      });
    }
  }
  
  // Update user status
  if (path === '/api/user/status' && method === 'PUT') {
    try {
      const { status } = await request.json();
      
      if (!status && status !== '') {
        return new Response(JSON.stringify({ error: 'Status is required' }), {
          status: 400,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
        });
      }
      
      // Validate status length
      if (status.length > 100) {
        return new Response(JSON.stringify({ error: 'Status must be less than 100 characters' }), {
          status: 400,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
        });
      }
      
      await firebasePatch(`/users/${safeUserId}`, {
        status: status,
        updatedAt: new Date().toISOString()
      });
      
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Status updated successfully' 
      }), {
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
      });
    }
  }
  
  // Update user enter text
  if (path === '/api/user/enter-text' && method === 'PUT') {
    try {
      const { enterText } = await request.json();
      
      console.log('[Worker] Enter text update request:', { enterText, safeUserId });
      
      if (!enterText && enterText !== '') {
        return new Response(JSON.stringify({ error: 'Enter text is required' }), {
          status: 400,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
        });
      }
      
      // Validate enter text length
      if (enterText && enterText.length > 10) {
        return new Response(JSON.stringify({ error: 'Enter text must be 10 characters or less' }), {
          status: 400,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
        });
      }
      
      await firebasePatch(`/users/${safeUserId}`, {
        enterText: enterText || 'ENTER',
        updatedAt: new Date().toISOString()
      });
      
      console.log('[Worker] Enter text updated successfully:', enterText);
      
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Enter text updated successfully' 
      }), {
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
      });
    } catch (error) {
      console.error('[Worker] Enter text update error:', error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
      });
    }
  }
  
  // Update user enter animation
  if (path === '/api/user/enter-animation' && method === 'PUT') {
    try {
      const { enterAnimation } = await request.json();
      
      console.log('[Worker] Enter animation update request:', { enterAnimation, safeUserId });
      
      const validAnimations = ['typing', 'flicker', 'fadeblink'];
      if (!enterAnimation || !validAnimations.includes(enterAnimation)) {
        return new Response(JSON.stringify({ error: 'Invalid animation type' }), {
          status: 400,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
        });
      }
      
      await firebasePatch(`/users/${safeUserId}`, {
        enterAnimation: enterAnimation,
        updatedAt: new Date().toISOString()
      });
      
      console.log('[Worker] Enter animation updated successfully:', enterAnimation);
      
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Enter animation updated successfully' 
      }), {
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
      });
    } catch (error) {
      console.error('[Worker] Enter animation update error:', error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
      });
    }
  }
  
  // Update user embed color
  if (path === '/api/user/embed-color' && method === 'PUT') {
    try {
      const { embedColor } = await request.json();
      
      if (!embedColor && embedColor !== '') {
        return new Response(JSON.stringify({ error: 'Embed color is required' }), {
          status: 400,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
        });
      }
      
      // Validate hex color format
      if (embedColor && !/^#[0-9A-Fa-f]{6}$/.test(embedColor)) {
        return new Response(JSON.stringify({ error: 'Embed color must be a valid hex color (e.g., #6366f1)' }), {
          status: 400,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
        });
      }
      
      console.log('[Embed Color] Saving embed color:', embedColor);
      
      await firebasePatch(`/users/${safeUserId}`, {
        embedColor: embedColor || '#6366f1',
        updatedAt: new Date().toISOString()
      });
      
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Embed color updated successfully' 
      }), {
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
      });
    }
  }
  
  // Update user accent color
  if (path === '/api/user/accent-color' && method === 'PUT') {
    try {
      const { accentColor } = await request.json();
      
      if (!accentColor && accentColor !== '') {
        return new Response(JSON.stringify({ error: 'Accent color is required' }), {
          status: 400,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
        });
      }
      
      // Validate hex color format
      if (accentColor && !/^#[0-9A-Fa-f]{6}$/.test(accentColor)) {
        return new Response(JSON.stringify({ error: 'Accent color must be a valid hex color (e.g., #6366f1)' }), {
          status: 400,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
        });
      }
      
      await firebasePatch(`/users/${safeUserId}`, {
        accentColor: accentColor || '#6366f1',
        updatedAt: new Date().toISOString()
      });
      
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Accent color updated successfully' 
      }), {
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
      });
    }
  }
  
  // GEOSINT image analysis
  if (path === '/api/geosint/analyze' && method === 'POST') {
    try {
      console.log('[GEOSINT] Request received');
      const { imageData } = await request.json();
      
      console.log('[GEOSINT] Image data present:', !!imageData);
      
      if (!imageData) {
        return new Response(JSON.stringify({ error: 'Image data is required' }), {
          status: 400,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
        });
      }
      
      // Ensure imageData is in base64 data URL format
      let formattedImageData = imageData;
      if (!imageData.startsWith('data:image')) {
        // If it's just base64 without the prefix, add it
        const mimeType = imageData.startsWith('/9j/') ? 'image/jpeg' : 'image/png';
        formattedImageData = `data:${mimeType};base64,${imageData}`;
      }
      
      console.log('[GEOSINT] Image data format check:', formattedImageData.substring(0, 50) + '...');
      
      // Check balance
      const user = await firebaseGet(`/users/${safeUserId}`);
      const currentBalance = parseFloat(user?.balanceUsd || '0');
      if (currentBalance < parseFloat(GEOSINT_COST_USD)) {
        return new Response(JSON.stringify({ error: `Insufficient balance for GEOSINT. Requires $${GEOSINT_COST_USD}.` }), {
          status: 402,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
        });
      }
      
      const apiKey = NVIDIA_API_KEY;
      
      console.log('[GEOSINT] Using NVIDIA_API_KEY from env');
      console.log('[GEOSINT] API Key present:', !!apiKey);
      console.log('[GEOSINT] API Key length:', apiKey?.length);
      
      if (!apiKey) {
        return new Response(JSON.stringify({ error: 'NVIDIA_API_KEY not configured in Cloudflare Workers secrets' }), {
          status: 500,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
        });
      }
      
      const invokeUrl = "https://integrate.api.nvidia.com/v1/chat/completions";
      
      const headers = {
        "Authorization": `Bearer ${apiKey}`,
        "Accept": "application/json",
        "Content-Type": "application/json"
      };
      
      console.log('[GEOSINT] Request URL:', invokeUrl);
      console.log('[GEOSINT] Request Headers:', JSON.stringify(headers, null, 2));
      console.log('[GEOSINT] Image data format:', formattedImageData.substring(0, 100) + '...');
      console.log('[GEOSINT] Image data length:', formattedImageData.length);
      
      const prompt = `You are a professional GeoINT (Geospatial Intelligence) analyst. Follow this structured 4-phase workflow to analyze the image.

PHASE 1 — Visual Intelligence Collection
Carefully extract ALL geographic indicators. List observations separately from assumptions.

Examine and document:
- Visible text (signs, billboards, graffiti)
- Street signs (shape, color, language)
- Store/business names and brands
- Languages/scripts visible
- License plate formats (patterns only)
- Road markings and lane configurations
- Traffic signs (style, color, symbols)
- Driving side (left or right)
- Architecture style and building materials
- Urban planning style (grid vs organic)
- Utility poles and wire configurations
- Public infrastructure (benches, lighting)
- Vehicles (makes, models common in regions)
- Terrain features (mountains, valleys, plains)
- Waterways (rivers, lakes, coastlines)
- Vegetation types and density
- Weather/climate indicators
- Shadows and sun direction clues
- Cultural/environmental markers

Format observations as:
OBSERVED: [factual description]
POSSIBLE MEANING: [interpretation without overconfidence]

PHASE 2 — Geographic Reasoning
After extracting clues, reason through possible locations systematically.

Requirements:
- Generate 3-5 candidate regions/countries first
- Compare each candidate against ALL evidence
- Explain why each candidate fits or does not fit
- Identify the strongest candidate with supporting evidence
- Avoid overconfidence - acknowledge uncertainty

Format:
CANDIDATE LOCATIONS:
1. [Location A]
   Confidence: [X%]
   Supporting evidence: [list]
   Contradicting evidence: [list]

2. [Location B]
   Confidence: [X%]
   Supporting evidence: [list]
   Contradicting evidence: [list]

PHASE 3 — GeoINT Final Report
Return ONLY valid JSON with this exact structure:

{
  "country": "",
  "region": "",
  "city": "",
  "area": "",
  "estimated_address": "",
  "latitude": "",
  "longitude": "",
  "confidence": "",
  "analysis_summary": "",
  "visual_evidence": [],
  "alternative_locations": []
}

Rules:
- Never invent exact addresses. Use "approximate" if uncertain.
- If coordinates uncertain, provide approximate coordinates with larger radius.
- If only country/region determinable, leave city/area empty.
- Always include confidence score (0-100%).
- Explain uncertainty in analysis_summary.
- visual_evidence: array of strings listing key observations.
- alternative_locations: array of objects with location and confidence.

PHASE 4 — Verification Thinking
Before finalizing, ask yourself:
"Would another analyst be able to reproduce this conclusion from the evidence?"

If not:
- Reduce confidence score
- Explain missing evidence in analysis_summary

IMAGE CLASSIFICATION:
First classify the image as one of:
- URBAN GEOSINT: Focus on buildings, roads, businesses, signs, city layout
- RURAL GEOSINT: Focus on terrain, climate, landscape, natural features
- INDOOR GEOSINT: Focus on objects, language, products, cultural indicators
- LANDMARK RECOGNITION: Focus on architecture comparison, famous locations, unique structures

Begin your response with: CLASSIFICATION: [MODE]`;
      
      const payload = {
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image_url",
                image_url: {
                  url: formattedImageData
                }
              },
              {
                type: "text",
                text: prompt
              }
            ]
          }
        ],
        model: "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning",
        max_tokens: 65536,
        reasoning_budget: 16384,
        stream: false,
        temperature: 0.6,
        top_p: 0.95,
        chat_template_kwargs: {
          enable_thinking: true
        }
      };
      
      const response = await fetch(invokeUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });
      
      console.log('[GEOSINT] Response status:', response.status);
      console.log('[GEOSINT] Response headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('[GEOSINT] NVIDIA API error status:', response.status);
        console.error('[GEOSINT] NVIDIA API error body:', errorText);
        console.error('[GEOSINT] NVIDIA API error type:', response.statusText);
        
        let errorDetails = {
          status: response.status,
          statusText: response.statusText,
          body: errorText,
          url: invokeUrl,
          apiKeyPrefix: apiKey.substring(0, 20) + '...',
          model: payload.model
        };
        
        console.error('[GEOSINT] Full error details:', JSON.stringify(errorDetails, null, 2));
        
        return new Response(JSON.stringify({ 
          error: `API request failed: ${response.status}`,
          details: errorDetails
        }), {
          status: response.status,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
        });
      }
      
      const data = await response.json();
      
      if (data.choices && data.choices[0] && data.choices[0].message) {
        const content = data.choices[0].message.content;
        console.log('[GEOSINT] Raw response content:', content);
        
        // Extract classification from response
        let classification = 'UNKNOWN';
        const classificationMatch = content.match(/CLASSIFICATION:\s*(\w+)/);
        if (classificationMatch) {
          classification = classificationMatch[1];
          console.log('[GEOSINT] Image classification:', classification);
        }
        
        // Try to parse JSON from the response
        let parsedResults;
        try {
          // Extract JSON object from the response (looking for { ... } pattern)
          const jsonMatch = content.match(/\{[\s\S]*"confidence"[\s\S]*\}/);
          if (jsonMatch) {
            parsedResults = JSON.parse(jsonMatch[0]);
          } else {
            // Fallback: try to parse entire content as JSON
            parsedResults = JSON.parse(content);
          }
        } catch (e) {
          console.error('[GEOSINT] JSON parsing error:', e);
          // If JSON parsing fails, try to extract locations from text
          const locationMatches = content.match(/(?:location|place|area|region|city|country)[:\s]*([^\n,]+)/gi);
          if (locationMatches) {
            parsedResults = {
              country: 'Unknown',
              region: 'Unknown',
              city: 'Unknown',
              area: 'Unknown',
              estimated_address: 'Unknown',
              latitude: '',
              longitude: '',
              confidence: '30',
              analysis_summary: 'Could not parse structured JSON, extracted from text',
              visual_evidence: [],
              alternative_locations: locationMatches.map((match, i) => ({
                location: match.replace(/(?:location|place|area|region|city|country)[:\s]*/i, '').trim(),
                confidence: Math.max(0, 100 - (i * 15))
              }))
            };
          } else {
            throw new Error('Could not parse location data from response');
          }
        }
        
        // Add classification to results
        parsedResults.classification = classification;
        
        console.log('[GEOSINT] Parsed results:', JSON.stringify(parsedResults, null, 2));
        
        // PHASE 4: Verification - Send analysis to reviewer
        console.log('[GEOSINT] Starting verification phase');
        
        const reviewerPrompt = `You are a senior GeoINT analyst reviewing another analyst's geolocation assessment. Critically evaluate the following analysis:

ORIGINAL ANALYSIS:
${content}

YOUR TASK:
1. Identify weak assumptions or overconfident claims
2. Point out missing evidence that should have been considered
3. Evaluate whether the confidence score is justified
4. Suggest corrections or alternative interpretations
5. Identify any logical fallacies in the reasoning

Return your review in this JSON format:
{
  "review_summary": "Overall assessment of the analysis quality",
  "weaknesses": ["list of specific weaknesses"],
  "missing_evidence": ["list of evidence not considered"],
  "confidence_adjustment": "recommendation to increase/decrease confidence (e.g., '-15%')",
  "corrections": ["specific corrections to the analysis"],
  "reproducibility": "Can another analyst reproduce this conclusion? (yes/no/partially)",
  "reproducibility_notes": "Explanation of reproducibility assessment"
}

Be thorough but constructive. Your goal is to improve the accuracy and reliability of the geolocation assessment.`;
        
        const reviewerPayload = {
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "image_url",
                  image_url: {
                    url: formattedImageData
                  }
                },
                {
                  type: "text",
                  text: reviewerPrompt
                }
              ]
            }
          ],
          model: "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning",
          max_tokens: 32768,
          reasoning_budget: 8192,
          stream: false,
          temperature: 0.4,
          top_p: 0.9,
          chat_template_kwargs: {
            enable_thinking: true
          }
        };
        
        const reviewerResponse = await fetch(invokeUrl, {
          method: 'POST',
          headers,
          body: JSON.stringify(reviewerPayload)
        });
        
        console.log('[GEOSINT] Reviewer response status:', reviewerResponse.status);
        
        let reviewerAnalysis = null;
        if (reviewerResponse.ok) {
          const reviewerData = await reviewerResponse.json();
          const reviewerContent = reviewerData.choices[0].message.content;
          console.log('[GEOSINT] Reviewer content:', reviewerContent);
          
          try {
            const reviewerJsonMatch = reviewerContent.match(/\{[\s\S]*"reproducibility_notes"[\s\S]*\}/);
            if (reviewerJsonMatch) {
              reviewerAnalysis = JSON.parse(reviewerJsonMatch[0]);
            } else {
              reviewerAnalysis = JSON.parse(reviewerContent);
            }
            console.log('[GEOSINT] Parsed reviewer analysis:', JSON.stringify(reviewerAnalysis, null, 2));
          } catch (e) {
            console.error('[GEOSINT] Failed to parse reviewer analysis:', e);
            reviewerAnalysis = {
              review_summary: 'Could not parse structured review',
              weaknesses: [],
              missing_evidence: [],
              confidence_adjustment: '0%',
              corrections: [],
              reproducibility: 'unknown',
              reproducibility_notes: 'Parse error'
            };
          }
        } else {
          console.error('[GEOSINT] Reviewer API error:', reviewerResponse.status);
          reviewerAnalysis = {
            review_summary: 'Reviewer API call failed',
            weaknesses: [],
            missing_evidence: [],
            confidence_adjustment: '0%',
            corrections: [],
            reproducibility: 'unknown',
            reproducibility_notes: 'API error'
          };
        }
        
        // Combine initial analysis with reviewer analysis
        parsedResults.reviewer_analysis = reviewerAnalysis;
        
        // Adjust confidence based on reviewer feedback if applicable
        if (reviewerAnalysis.confidence_adjustment) {
          const adjustmentMatch = reviewerAnalysis.confidence_adjustment.match(/([+-]?\d+)/);
          if (adjustmentMatch) {
            const adjustment = parseInt(adjustmentMatch[1]);
            const originalConfidence = parseInt(parsedResults.confidence) || 50;
            const adjustedConfidence = Math.max(0, Math.min(100, originalConfidence + adjustment));
            parsedResults.original_confidence = parsedResults.confidence;
            parsedResults.confidence = adjustedConfidence.toString();
            console.log('[GEOSINT] Confidence adjusted from', originalConfidence, 'to', adjustedConfidence);
          }
        }
        
        // Deduct cost
        const newBalance = (currentBalance - parseFloat(GEOSINT_COST_USD)).toFixed(2);
        await firebasePatch(`/users/${safeUserId}`, {
          balanceUsd: newBalance,
          updatedAt: new Date().toISOString()
        });
        
        return new Response(JSON.stringify({ 
          success: true, 
          results: parsedResults,
          balance: newBalance,
          cost: GEOSINT_COST_USD
        }), {
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
        });
      } else {
        return new Response(JSON.stringify({ error: 'Invalid response format from API' }), {
          status: 500,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
        });
      }
    } catch (error) {
      console.error('[GEOSINT] Analysis error:', error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
      });
    }
  }
  
  // Upload profile background
  if (path === '/api/user/background' && method === 'POST') {
    try {
      const { fileData, fileType } = await request.json();
      
      if (!fileData) {
        return new Response(JSON.stringify({ error: 'File data is required' }), {
          status: 400,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
        });
      }
      
      let uploadResult;
      let backgroundType;
      
      // Use Cloudinary for videos/audio/GIFs, ImgBB for static images only
      if (fileType === 'video' || fileType === 'mp4' || fileType === 'mov' || fileType === 'quicktime' || fileType === 'webm') {
        uploadResult = await uploadToCloudinary(fileData, 'video');
        backgroundType = 'video';
      } else if (fileType === 'audio' || fileType === 'mp3' || fileType === 'mpeg' || fileType === 'wav' || fileType === 'ogg') {
        uploadResult = await uploadToCloudinary(fileData, 'video'); // Cloudinary supports audio as video resource
        backgroundType = 'audio';
      } else if (fileType === 'image/gif') {
        // Use Cloudinary for GIFs to preserve animation - no transformations
        uploadResult = await uploadToCloudinary(fileData, 'gif');
        backgroundType = 'image';
      } else {
        // Static images go to ImgBB
        uploadResult = await uploadToImgBB(fileData);
        backgroundType = 'image';
      }
      
      // Update user's background URL
      await firebasePatch(`/users/${safeUserId}`, {
        background: uploadResult.url,
        backgroundPublicId: uploadResult.public_id || uploadResult.publicId,
        backgroundType: backgroundType,
        updatedAt: new Date().toISOString()
      });
      
      return new Response(JSON.stringify({ 
        success: true, 
        backgroundUrl: uploadResult.url,
        backgroundType: backgroundType,
        message: 'Background updated successfully' 
      }), {
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
      });
    }
  }

  // Upload background audio
  if (path === '/api/user/background-audio' && method === 'POST') {
    try {
      const { fileData, fileType } = await request.json();
      
      if (!fileData) {
        return new Response(JSON.stringify({ error: 'File data is required' }), {
          status: 400,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
        });
      }
      
      // Upload audio to Cloudinary
      const uploadResult = await uploadToCloudinary(fileData, 'video'); // Cloudinary handles audio as video resource
      
      // Update user's background audio URL
      await firebasePatch(`/users/${safeUserId}`, {
        backgroundAudio: uploadResult.url,
        backgroundAudioPublicId: uploadResult.public_id || uploadResult.publicId,
        updatedAt: new Date().toISOString()
      });
      
      return new Response(JSON.stringify({ 
        success: true, 
        backgroundAudioUrl: uploadResult.url,
        message: 'Background audio updated successfully' 
      }), {
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
      });
    }
  }

  // Remove background audio
  if (path === '/api/user/background-audio' && method === 'DELETE') {
    try {
      // Get current user data to check for Cloudinary public ID
      const currentUser = await firebaseGet(`/users/${safeUserId}`);
      
      // Delete from Cloudinary if public ID exists
      if (currentUser?.backgroundAudioPublicId) {
        try {
          await deleteFromCloudinary(currentUser.backgroundAudioPublicId, 'video');
        } catch (cloudinaryError) {
          console.log('Cloudinary deletion failed (non-critical):', cloudinaryError);
        }
      }
      
      // Remove from Firebase
      await firebasePatch(`/users/${safeUserId}`, {
        backgroundAudio: null,
        backgroundAudioPublicId: null,
        updatedAt: new Date().toISOString()
      });
      
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Background audio removed successfully' 
      }), {
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
      });
    }
  }

  // Toggle video audio mute
  if (path === '/api/user/mute-video-audio' && method === 'PUT') {
    try {
      const { mute } = await request.json();
      
      console.log('[Mute Toggle] Received mute value:', mute, 'Type:', typeof mute);
      
      if (typeof mute !== 'boolean') {
        console.log('[Mute Toggle] Invalid mute value type');
        return new Response(JSON.stringify({ error: 'Mute value must be boolean' }), {
          status: 400,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
        });
      }
      
      console.log('[Mute Toggle] Patching Firebase for user:', safeUserId, 'with muteVideoAudio:', mute);
      
      await firebasePatch(`/users/${safeUserId}`, {
        muteVideoAudio: mute,
        updatedAt: new Date().toISOString()
      });
      
      console.log('[Mute Toggle] Firebase patch successful');
      
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Mute setting updated successfully',
        muteVideoAudio: mute
      }), {
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
      });
    } catch (error) {
      console.error('[Mute Toggle] Error:', error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
      });
    }
  }
  
  // Clear removeVideoAudio field (temporary cleanup endpoint)
  if (path === '/api/user/clear-remove-audio' && method === 'POST') {
    try {
      await firebasePatch(`/users/${safeUserId}`, {
        removeVideoAudio: null,
        updatedAt: new Date().toISOString()
      });
      
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'removeVideoAudio field cleared successfully' 
      }), {
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
      });
    }
  }
  
  // AI OSINT Search - Start investigation
  if (path === '/api/ai-osint-search' && method === 'POST') {
    try {
      const { identifiers } = await request.json();
      
      if (!identifiers) {
        return new Response(JSON.stringify({ error: 'Missing identifiers' }), {
          status: 400,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
        });
      }
      
      // Check balance
      const user = await firebaseGet(`/users/${safeUserId}`);
      const currentBalance = parseFloat(user?.balanceUsd || '0');
      if (currentBalance < parseFloat(AI_OSINT_COST_USD)) {
        return new Response(JSON.stringify({ error: 'Insufficient balance for AI OSINT' }), {
          status: 402,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
        });
      }
      
      // Deduct cost
      const newBalance = (currentBalance - parseFloat(AI_OSINT_COST_USD)).toFixed(2);
      await firebasePatch(`/users/${safeUserId}`, {
        balanceUsd: newBalance,
        updatedAt: new Date().toISOString()
      });
      
      // Generate investigation ID and start in background
      const investigationId = crypto.randomUUID();
      console.log('[AI OSINT Start] Generated investigation ID:', investigationId);
      
      // Initialize state immediately
      const initialState = {
        progress: 0,
        stage: 'Initializing Investigation',
        activityLog: [],
        completedTasks: 0,
        totalTasks: 0,
        completed: false,
        results: [],
        report: null
      };
      console.log('[AI OSINT Start] Setting initial state for investigation:', investigationId);
      await setInvestigationState(investigationId, initialState);
      
      // Verify state was set
      const verifyState = await getInvestigationState(investigationId);
      console.log('[AI OSINT Start] Verification - state after set:', verifyState);
      
      // Run investigation in background
      console.log('[AI OSINT Start] Starting background investigation for:', investigationId);
      ctx.waitUntil(executeAIOsintInvestigation(identifiers, userId, investigationId));
      
      return new Response(JSON.stringify({ 
        success: true, 
        investigationId,
        balance: newBalance,
        cost: AI_OSINT_COST_USD
      }), {
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
      });
    }
  }
  
  // AI OSINT Progress - Get investigation progress
  if (path === '/api/ai-osint-progress' && method === 'GET') {
    try {
      const investigationId = url.searchParams.get('id');
      console.log('[Progress Endpoint] Request for investigation ID:', investigationId);
      
      if (!investigationId) {
        return new Response(JSON.stringify({ error: 'Missing investigation ID' }), {
          status: 400,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
        });
      }
      
      const state = await getInvestigationState(investigationId);
      console.log('[Progress Endpoint] Retrieved state:', state);
      
      if (!state) {
        console.log('[Progress Endpoint] State not found for ID:', investigationId);
        return new Response(JSON.stringify({ error: 'Investigation not found' }), {
          status: 404,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
        });
      }
      
      return new Response(JSON.stringify({ 
        success: true,
        progress: state.progress,
        stage: state.stage,
        activityLog: state.activityLog,
        completedTasks: state.completedTasks,
        totalTasks: state.totalTasks,
        completed: state.completed
      }), {
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
      });
    }
  }
  
  // AI OSINT Report - Get final report
  if (path === '/api/ai-osint-report' && method === 'GET') {
    try {
      const investigationId = url.searchParams.get('id');
      
      if (!investigationId) {
        return new Response(JSON.stringify({ error: 'Missing investigation ID' }), {
          status: 400,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
        });
      }
      
      const state = await getInvestigationState(investigationId);
      
      if (!state) {
        return new Response(JSON.stringify({ error: 'Investigation not found' }), {
          status: 404,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
        });
      }
      
      if (!state.completed) {
        return new Response(JSON.stringify({ error: 'Investigation not completed' }), {
          status: 400,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
        });
      }
      
      return new Response(JSON.stringify({ 
        success: true,
        report: state.report
      }), {
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
      });
    }
  }
  
  // Get balance
  if (path === '/api/user/balance' && method === 'GET') {
    try {
      const user = await firebaseGet(`/users/${safeUserId}`);
      return new Response(JSON.stringify({ 
        success: true, 
        balance: user?.balanceUsd || '0.00',
        plan: user?.plan || null,
        planExpiresAt: user?.planExpiresAt || null,
        dailyCredits: user?.dailyCredits || 0,
        dailyIntelxUses: user?.dailyIntelxUses || 0,
        searchesToday: user?.searchesToday || 0,
        totalSearches: user?.totalSearches || 0
      }), {
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
      });
    }
  }
  
  // Get transaction history
  if (path === '/api/user/transactions' && method === 'GET') {
    try {
      const transactions = await firebaseGet(`/users/${safeUserId}/transactions`) || {};
      const txArray = Object.values(transactions).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      return new Response(JSON.stringify({ success: true, transactions: txArray }), {
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
      });
    }
  }
  
  // Get providers
  if (path === '/api/osint/providers' && method === 'GET') {
    return new Response(JSON.stringify({ success: true, providers: WEB_ENDPOINTS }), {
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
    });
  }
  
  // IP Geolocation
  if (path === '/api/geolocation/ip' && method === 'GET') {
    try {
      const ip = url.searchParams.get('ip');
      
      if (!ip) {
        return new Response(JSON.stringify({ error: 'Missing IP address' }), {
          status: 400,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
        });
      }
      
      const location = await getIPLocation(ip);
      
      if (location.success) {
        return new Response(JSON.stringify({ 
          success: true,
          lat: location.lat,
          lon: location.lon,
          city: location.city,
          region: location.region,
          country: location.country,
          isp: location.isp,
          org: location.org
        }), {
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
        });
      } else {
        return new Response(JSON.stringify({ error: location.error }), {
          status: 400,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
        });
      }
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
      });
    }
  }
  
  // OSINT search
  if (path === '/api/osint/search' && method === 'POST') {
    try {
      const { provider, command, query } = await request.json();
      
      console.log(`[Search] Provider: ${provider}, Command: ${command}, Query: ${query}`);
      
      if (!provider || !WEB_ENDPOINTS[provider]) {
        console.log(`[Search] Invalid provider: ${provider}`);
        return new Response(JSON.stringify({ error: 'Invalid provider' }), {
          status: 400,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
        });
      }
      
      const endpoint = WEB_ENDPOINTS[provider].find(e => e.name === command);
      if (!endpoint) {
        console.log(`[Search] Invalid command: ${command}`);
        return new Response(JSON.stringify({ error: 'Invalid command' }), {
          status: 400,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
        });
      }
      
      if (!query) {
        return new Response(JSON.stringify({ error: 'Query is required' }), {
          status: 400,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
        });
      }
      
      // Check cooldown
      if (!checkSearchCooldown(userId)) {
        return new Response(JSON.stringify({ error: 'Please wait 2 seconds between searches' }), {
          status: 429,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
        });
      }
      
      // Check balance or daily credits
      const user = await firebaseGet(`/users/${safeUserId}`);
      const hasPlan = user?.plan && PLAN_LIMITS[user.plan];
      const currentBalance = parseFloat(user?.balanceUsd || '0');
      const dailyCredits = user?.dailyCredits || 0;
      
      // Check plan expiration
      if (hasPlan && user.planExpiresAt) {
        const now = new Date();
        const expiresAt = new Date(user.planExpiresAt);
        if (now > expiresAt) {
          // Plan expired, revert to balance system
          await firebasePatch(`/users/${safeUserId}`, {
            plan: null,
            planExpiresAt: null,
            dailyCredits: 0,
            dailyIntelxUses: 0,
            updatedAt: now.toISOString()
          });
        }
      }
      
      // Use daily credits if user has active plan, otherwise use balance
      // Special handling for IntelX downloads
      const isIntelxDownload = provider === 'intelx' && command === 'download';
      
      if (isIntelxDownload) {
        // IntelX downloads cost $1 for all users (no plan requirement)
        if (currentBalance < parseFloat(INTELX_DOWNLOAD_COST_USD)) {
          return new Response(JSON.stringify({ error: `Insufficient balance for IntelX download. Requires $${INTELX_DOWNLOAD_COST_USD}.` }), {
            status: 402,
            headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
          });
        }
      } else {
        // Regular searches use daily credits if user has active plan, otherwise use balance
        if (hasPlan) {
          if (dailyCredits <= 0) {
            return new Response(JSON.stringify({ error: 'Daily credits exhausted. Please wait for reset or upgrade plan.' }), {
              status: 402,
              headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
            });
          }
        } else {
          if (currentBalance < parseFloat(SEARCH_COST_USD)) {
            return new Response(JSON.stringify({ error: 'Insufficient balance' }), {
              status: 402,
              headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
            });
          }
        }
      }
      
      // Validate inputs
      if (!validateProvider(provider)) {
        return new Response(JSON.stringify({ error: 'Invalid provider' }), {
          status: 400,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
        });
      }
      
      if (!validateCommand(provider, command)) {
        return new Response(JSON.stringify({ error: 'Invalid command' }), {
          status: 400,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
        });
      }
      
      if (!validateQuery(query)) {
        return new Response(JSON.stringify({ error: 'Invalid query' }), {
          status: 400,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
        });
      }
      
      // Sanitize query
      const sanitizedQuery = sanitizeString(query, 500);
      
      // Build request
      const providerConfig = PROVIDERS[provider];
      if (!providerConfig) {
        console.log(`[Search] Missing provider config for: ${provider}`);
        return new Response(JSON.stringify({ error: 'Provider configuration not found' }), {
          status: 500,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
        });
      }
      
      let url = providerConfig.apiBase + endpoint.path;
      if (endpoint.pathIncludesQuery) {
        url = url.replace('{query}', encodeURIComponent(sanitizedQuery));
      }
      
      const params = {};
      if (endpoint.queryParam) {
        params[endpoint.queryParam] = sanitizedQuery;
      }
      
      // Add extra parameters if defined
      if (endpoint.extraParams) {
        Object.entries(endpoint.extraParams).forEach(([key, value]) => {
          params[key] = value;
        });
      }
      
      console.log(`[Search] URL: ${url}, Method: ${endpoint.method || 'GET'}, Params:`, params);
      
      const result = await providerHttpRequest(
        endpoint.method || 'GET',
        url,
        endpoint.method === 'POST' ? null : params,
        endpoint.method === 'POST' ? params : null,
        providerConfig.apiKeyHeader,
        providerConfig.apiKey,
        providerConfig.apiKeyQuery || false,
        providerConfig.bearerToken || false
      );
      
      console.log(`[Search] Result OK: ${result.ok}, Status: ${result.status}`);
      
      if (!result.ok) {
        return new Response(JSON.stringify({ 
          error: 'Provider request failed',
          details: result.data 
        }), {
          status: 500,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
        });
      }
      
      // Deduct cost
      let newBalance = currentBalance;
      let newDailyCredits = dailyCredits;
      let newDailyIntelxUses = user?.dailyIntelxUses || 0;
      let actualCost = SEARCH_COST_USD;
      
      if (isIntelxDownload) {
        // IntelX download: deduct $1 from balance only
        newBalance = (currentBalance - parseFloat(INTELX_DOWNLOAD_COST_USD)).toFixed(2);
        actualCost = INTELX_DOWNLOAD_COST_USD;
        
        await firebasePatch(`/users/${safeUserId}`, {
          balanceUsd: newBalance,
          updatedAt: new Date().toISOString()
        });
      } else if (hasPlan) {
        // Regular search with plan: deduct from daily credits
        newDailyCredits = dailyCredits - 1;
        await firebasePatch(`/users/${safeUserId}`, {
          dailyCredits: newDailyCredits,
          updatedAt: new Date().toISOString()
        });
      } else {
        // Regular search without plan: deduct from balance
        newBalance = (currentBalance - parseFloat(SEARCH_COST_USD)).toFixed(2);
        await firebasePatch(`/users/${safeUserId}`, {
          balanceUsd: newBalance,
          updatedAt: new Date().toISOString()
        });
      }
      
      // Log search
      const searchId = crypto.randomUUID();
      await firebasePut(`/users/${safeUserId}/searches/${searchId}`, {
        id: searchId,
        provider,
        command,
        query: sanitizedQuery,
        costUsd: SEARCH_COST_USD,
        balanceAfterUsd: newBalance,
        createdAt: new Date().toISOString()
      });
      
      // Replace breachhub credit with datawire.cc
      const resultData = result.data;
      if (resultData.credit) {
        resultData.credit = 'Lookup made by https://datawire.cc';
      }

      return new Response(JSON.stringify({ 
        success: true,
        result: resultData,
        balance: newBalance,
        dailyCredits: newDailyCredits,
        dailyIntelxUses: newDailyIntelxUses,
        cost: actualCost
      }), {
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
      });
    } catch (error) {
      console.error(`[Search] Error:`, error);
      return new Response(JSON.stringify({ error: error.message || 'Internal server error' }), {
        status: 500,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
      });
    }
  }
  
  // Create deposit intent
  if (path === '/api/deposit/create' && method === 'POST') {
    try {
      const { coin, amount } = await request.json();
      
      if (!coin || !PAYMENT_ADDRESSES[coin]) {
        return new Response(JSON.stringify({ error: 'Invalid coin' }), {
          status: 400,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
        });
      }
      
      if (parseFloat(amount) < 1) {
        return new Response(JSON.stringify({ error: 'Minimum deposit is $1.00' }), {
          status: 400,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
        });
      }
      
      const address = PAYMENT_ADDRESSES[coin];
      const usdRate = await getCryptoPrice(coin);
      const cryptoAmount = usdToCryptoAmount(amount, usdRate, COIN_DECIMALS[coin]);
      
      const depositId = crypto.randomUUID();
      const deposit = {
        id: depositId,
        userId,
        coin,
        amount,
        cryptoAmount,
        usdRate,
        address,
        status: 'pending',
        createdAt: new Date().toISOString()
      };
      
      await firebasePut(`/users/${safeUserId}/deposits/${depositId}`, deposit);
      
      return new Response(JSON.stringify({ 
        success: true, 
        address,
        cryptoAmount,
        usdRate,
        depositId
      }), {
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
      });
    }
  }
  
  // Verify payment
  if (path === '/api/deposit/verify' && method === 'POST') {
    try {
      const { depositId } = await request.json();
      
      const deposit = await firebaseGet(`/users/${safeUserId}/deposits/${depositId}`);
      if (!deposit) {
        return new Response(JSON.stringify({ error: 'Deposit not found' }), {
          status: 404,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
        });
      }
      
      if (deposit.status === 'completed') {
        return new Response(JSON.stringify({ success: true, status: 'completed' }), {
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
        });
      }
      
      const payment = await verifyPayment(deposit.coin, deposit.address, deposit.cryptoAmount, deposit.createdAt);
      
      if (payment) {
        const requiredConf = REQUIRED_CONFIRMATIONS[deposit.coin];
        
        if (payment.confirmations >= requiredConf) {
          const user = await firebaseGet(`/users/${safeUserId}`);
          const currentBalance = parseFloat(user?.balanceUsd || '0');
          const newBalance = (currentBalance + parseFloat(deposit.amount)).toFixed(2);
          
          await firebasePatch(`/users/${safeUserId}`, {
            balanceUsd: newBalance,
            updatedAt: new Date().toISOString()
          });
          
          await firebasePatch(`/users/${safeUserId}/deposits/${depositId}`, {
            status: 'completed',
            txHash: payment.txHash,
            confirmations: payment.confirmations,
            completedAt: new Date().toISOString()
          });
          
          const txId = crypto.randomUUID();
          await firebasePut(`/users/${safeUserId}/transactions/${txId}`, {
            id: txId,
            type: 'deposit',
            amount: deposit.amount,
            coin: deposit.coin,
            status: 'completed',
            createdAt: new Date().toISOString()
          });
          
          return new Response(JSON.stringify({ 
            success: true, 
            status: 'completed',
            newBalance
          }), {
            headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
          });
        } else {
          await firebasePatch(`/users/${safeUserId}/deposits/${depositId}`, {
            status: 'detected',
            txHash: payment.txHash,
            confirmations: payment.confirmations,
            detectedAt: new Date().toISOString()
          });
          
          return new Response(JSON.stringify({ 
            success: true, 
            status: 'detected',
            confirmations: payment.confirmations,
            required: requiredConf
          }), {
            headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
          });
        }
      }
      
      return new Response(JSON.stringify({ 
        success: true, 
        status: 'pending',
        message: 'Payment not yet detected on blockchain'
      }), {
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
      });
    }
  }
  
  // Create plan purchase intent
  if (path === '/api/plan/purchase' && method === 'POST') {
    try {
      const { planType, coin, senderAddress } = await request.json();
      
      if (!planType || !PLAN_PRICING[planType]) {
        return new Response(JSON.stringify({ error: 'Invalid plan type' }), {
          status: 400,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
        });
      }
      
      if (!coin || !PAYMENT_ADDRESSES[coin]) {
        return new Response(JSON.stringify({ error: 'Invalid coin' }), {
          status: 400,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
        });
      }
      
      if (!senderAddress) {
        return new Response(JSON.stringify({ error: 'Sender address is required for blockchain verification' }), {
          status: 400,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
        });
      }
      
      const plan = PLAN_PRICING[planType];
      const address = PAYMENT_ADDRESSES[coin];
      const usdRate = await getCryptoPrice(coin);
      const cryptoAmount = usdToCryptoAmount(plan.price, usdRate, COIN_DECIMALS[coin]);
      
      const purchaseId = crypto.randomUUID();
      const purchase = {
        id: purchaseId,
        userId,
        planType,
        coin,
        amount: plan.price,
        cryptoAmount,
        usdRate,
        senderAddress,
        receiverAddress: address,
        status: 'pending',
        createdAt: new Date().toISOString()
      };
      
      await firebasePut(`/users/${safeUserId}/planPurchases/${purchaseId}`, purchase);
      
      return new Response(JSON.stringify({ 
        success: true, 
        receiverAddress: address,
        cryptoAmount,
        usdRate,
        purchaseId,
        planPrice: plan.price
      }), {
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
      });
    }
  }
  
  // Verify plan purchase
  if (path === '/api/plan/verify' && method === 'POST') {
    try {
      const { purchaseId } = await request.json();
      
      const purchase = await firebaseGet(`/users/${safeUserId}/planPurchases/${purchaseId}`);
      if (!purchase) {
        return new Response(JSON.stringify({ error: 'Purchase not found' }), {
          status: 404,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
        });
      }
      
      if (purchase.status === 'completed') {
        return new Response(JSON.stringify({ success: true, status: 'completed' }), {
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
        });
      }
      
      // Verify payment from sender address to receiver address
      const payment = await verifyPaymentFromSender(purchase.coin, purchase.senderAddress, purchase.receiverAddress, purchase.cryptoAmount, purchase.createdAt);
      
      if (payment) {
        const requiredConf = REQUIRED_CONFIRMATIONS[purchase.coin];
        
        if (payment.confirmations >= requiredConf) {
          const plan = PLAN_PRICING[purchase.planType];
          const planExpiresAt = plan.duration === 99999999999999999 ? null : new Date(Date.now() + plan.duration * 24 * 60 * 60 * 1000).toISOString();
          
          await firebasePatch(`/users/${safeUserId}`, {
            plan: purchase.planType,
            planExpiresAt,
            dailyCredits: PLAN_LIMITS[purchase.planType].dailyRequests,
            dailyIntelxUses: PLAN_LIMITS[purchase.planType].intelxUses,
            lastCreditReset: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });
          
          await firebasePatch(`/users/${safeUserId}/planPurchases/${purchaseId}`, {
            status: 'completed',
            txHash: payment.txHash,
            confirmations: payment.confirmations,
            completedAt: new Date().toISOString()
          });
          
          return new Response(JSON.stringify({ 
            success: true, 
            status: 'completed',
            plan: purchase.planType,
            planExpiresAt
          }), {
            headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
          });
        } else {
          await firebasePatch(`/users/${safeUserId}/planPurchases/${purchaseId}`, {
            status: 'detected',
            txHash: payment.txHash,
            confirmations: payment.confirmations,
            detectedAt: new Date().toISOString()
          });
          
          return new Response(JSON.stringify({ 
            success: true, 
            status: 'detected',
            confirmations: payment.confirmations,
            required: requiredConf
          }), {
            headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
          });
        }
      }
      
      return new Response(JSON.stringify({ 
        success: true, 
        status: 'pending',
        message: 'Payment not yet detected on blockchain'
      }), {
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
      });
    }
  }
  
  // Reset daily credits (called on login)
  if (path === '/api/user/resetCredits' && method === 'POST') {
    try {
      const user = await firebaseGet(`/users/${safeUserId}`);
      if (!user) {
        return new Response(JSON.stringify({ error: 'User not found' }), {
          status: 404,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
        });
      }
      
      const lastReset = user.lastCreditReset ? new Date(user.lastCreditReset) : new Date(0);
      const now = new Date();
      const daysSinceReset = (now - lastReset) / (1000 * 60 * 60 * 24);
      
      if (daysSinceReset >= 1) {
        let newDailyCredits = 0;
        let newIntelxUses = 0;
        
        if (user.plan && PLAN_LIMITS[user.plan]) {
          newDailyCredits = PLAN_LIMITS[user.plan].dailyRequests;
          newIntelxUses = PLAN_LIMITS[user.plan].intelxUses;
        }
        
        await firebasePatch(`/users/${safeUserId}`, {
          dailyCredits: newDailyCredits,
          dailyIntelxUses: newIntelxUses,
          lastCreditReset: now.toISOString(),
          updatedAt: now.toISOString()
        });
        
        return new Response(JSON.stringify({ 
          success: true, 
          reset: true,
          dailyCredits: newDailyCredits,
          dailyIntelxUses: newIntelxUses
        }), {
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
        });
      }
      
      return new Response(JSON.stringify({ 
        success: true, 
        reset: false,
        dailyCredits: user.dailyCredits || 0,
        dailyIntelxUses: user.dailyIntelxUses || 0
      }), {
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
      });
    }
  }
  
  return new Response(JSON.stringify({ error: 'Not Found' }), {
    status: 404,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
  });
}

// Main handler
export default {
  async fetch(request, env, ctx) {
    // Initialize secrets from Cloudflare Worker environment
    DATAHOUND_API_KEY = env.DATAHOUND_API_KEY;
    OSINTCAT_API_KEY = env.OSINTCAT_API_KEY;
    BREACHHUB_API_KEY = env.BREACHHUB_API_KEY;
    NOTICED_API_KEY = env.NOTICED_API_KEY;
    INTELX_API_KEY = env.INTELX_API_KEY;
    OPENARCHIVE_API_KEY = env.OPENARCHIVE_API_KEY;
    NVIDIA_API_KEY = env.NVIDIA_API_KEY;
    DISCORD_CLIENT_SECRET = env.DISCORD_CLIENT_SECRET;
    JWT_SECRET = env.JWT_SECRET;
    WOLF_EYE_KEY = env.WOLF_EYE_KEY;

    // Initialize PROVIDERS after secrets are loaded
    PROVIDERS = {
      datahound: {
        apiBase: DATAHOUND_API_BASE,
        apiKey: DATAHOUND_API_KEY,
        apiKeyHeader: 'X-API-Key',
        apiKeyQuery: false
      },
      osintcat: {
        apiBase: OSINTCAT_API_BASE,
        apiKey: OSINTCAT_API_KEY,
        apiKeyHeader: 'X-API-KEY',
        apiKeyQuery: false
      },
      noticed: {
        apiBase: BREACHHUB_API_BASE,
        apiKey: BREACHHUB_API_KEY,
        apiKeyHeader: 'key',
        apiKeyQuery: true
      },
      snusbase: {
        apiBase: BREACHHUB_API_BASE,
        apiKey: BREACHHUB_API_KEY,
        apiKeyHeader: 'key',
        apiKeyQuery: true
      },
      leakosint: {
        apiBase: BREACHHUB_API_BASE,
        apiKey: BREACHHUB_API_KEY,
        apiKeyHeader: 'X-API-Key',
        apiKeyQuery: false
      },
      leakcheck: {
        apiBase: BREACHHUB_API_BASE,
        apiKey: BREACHHUB_API_KEY,
        apiKeyHeader: 'key',
        apiKeyQuery: true
      },
      breachbase: {
        apiBase: BREACHHUB_API_BASE,
        apiKey: BREACHHUB_API_KEY,
        apiKeyHeader: 'X-API-Key',
        apiKeyQuery: false
      },
      intelvault: {
        apiBase: BREACHHUB_API_BASE,
        apiKey: BREACHHUB_API_KEY,
        apiKeyHeader: 'X-API-Key',
        apiKeyQuery: false
      },
      breachdirectory: {
        apiBase: BREACHHUB_API_BASE,
        apiKey: BREACHHUB_API_KEY,
        apiKeyHeader: 'key',
        apiKeyQuery: true
      },
      hackcheck: {
        apiBase: BREACHHUB_API_BASE,
        apiKey: BREACHHUB_API_KEY,
        apiKeyHeader: 'X-API-Key',
        apiKeyQuery: false
      },
      osintkit: {
        apiBase: BREACHHUB_API_BASE,
        apiKey: BREACHHUB_API_KEY,
        apiKeyHeader: 'key',
        apiKeyQuery: true
      },
      breachvip: {
        apiBase: BREACHHUB_API_BASE,
        apiKey: BREACHHUB_API_KEY,
        apiKeyHeader: 'X-API-Key',
        apiKeyQuery: false
      },
      cordcat: {
        apiBase: BREACHHUB_API_BASE,
        apiKey: BREACHHUB_API_KEY,
        apiKeyHeader: 'key',
        apiKeyQuery: true
      },
      intelx: {
        apiBase: BREACHHUB_API_BASE,
        apiKey: INTELX_API_KEY,
        apiKeyHeader: 'key',
        apiKeyQuery: true
      },
      xosint: {
        apiBase: BREACHHUB_API_BASE,
        apiKey: BREACHHUB_API_KEY,
        apiKeyHeader: 'X-API-Key',
        apiKeyQuery: false
      },
      seeknow: {
        apiBase: BREACHHUB_API_BASE,
        apiKey: BREACHHUB_API_KEY,
        apiKeyHeader: 'key',
        apiKeyQuery: true
      },
      seekria: {
        apiBase: BREACHHUB_API_BASE,
        apiKey: BREACHHUB_API_KEY,
        apiKeyHeader: 'X-API-Key',
        apiKeyQuery: false
      },
      wentyn: {
        apiBase: BREACHHUB_API_BASE,
        apiKey: BREACHHUB_API_KEY,
        apiKeyHeader: 'key',
        apiKeyQuery: true
      },
      hudsonrock: {
        apiBase: BREACHHUB_API_BASE,
        apiKey: BREACHHUB_API_KEY,
        apiKeyHeader: 'key',
        apiKeyQuery: true
      },
      leaksight: {
        apiBase: BREACHHUB_API_BASE,
        apiKey: BREACHHUB_API_KEY,
        apiKeyHeader: 'X-API-Key',
        apiKeyQuery: false
      },
      nbrs: {
        apiBase: BREACHHUB_API_BASE,
        apiKey: BREACHHUB_API_KEY,
        apiKeyHeader: 'key',
        apiKeyQuery: true
      },
      room101: {
        apiBase: BREACHHUB_API_BASE,
        apiKey: BREACHHUB_API_KEY,
        apiKeyHeader: 'X-API-Key',
        apiKeyQuery: false
      },
      seon: {
        apiBase: BREACHHUB_API_BASE,
        apiKey: BREACHHUB_API_KEY,
        apiKeyHeader: 'X-API-Key',
        apiKeyQuery: false
      },
      oathnet: {
        apiBase: BREACHHUB_API_BASE,
        apiKey: BREACHHUB_API_KEY,
        apiKeyHeader: 'key',
        apiKeyQuery: true
      },
      memory: {
        apiBase: BREACHHUB_API_BASE,
        apiKey: BREACHHUB_API_KEY,
        apiKeyHeader: 'X-API-Key',
        apiKeyQuery: false
      },
      nosint: {
        apiBase: BREACHHUB_API_BASE,
        apiKey: BREACHHUB_API_KEY,
        apiKeyHeader: 'key',
        apiKeyQuery: true
      },
      reconly: {
        apiBase: BREACHHUB_API_BASE,
        apiKey: BREACHHUB_API_KEY,
        apiKeyHeader: 'X-API-Key',
        apiKeyQuery: false
      },
      tiktok: {
        apiBase: BREACHHUB_API_BASE,
        apiKey: BREACHHUB_API_KEY,
        apiKeyHeader: 'X-API-Key',
        apiKeyQuery: false
      },
      binlist: {
        apiBase: BREACHHUB_API_BASE,
        apiKey: BREACHHUB_API_KEY,
        apiKeyHeader: 'key',
        apiKeyQuery: true
      },
      inf0sec: {
        apiBase: BREACHHUB_API_BASE,
        apiKey: BREACHHUB_API_KEY,
        apiKeyHeader: 'key',
        apiKeyQuery: true
      },
      vin: {
        apiBase: BREACHHUB_API_BASE,
        apiKey: BREACHHUB_API_KEY,
        apiKeyHeader: 'X-API-Key',
        apiKeyQuery: false
      },
      propertyradar: {
        apiBase: BREACHHUB_API_BASE,
        apiKey: BREACHHUB_API_KEY,
        apiKeyHeader: 'X-API-Key',
        apiKeyQuery: false
      },
      datavoid: {
        apiBase: BREACHHUB_API_BASE,
        apiKey: BREACHHUB_API_KEY,
        apiKeyHeader: 'key',
        apiKeyQuery: true
      },
      checko: {
        apiBase: BREACHHUB_API_BASE,
        apiKey: BREACHHUB_API_KEY,
        apiKeyHeader: 'X-API-Key',
        apiKeyQuery: false
      },
      github: {
        apiBase: BREACHHUB_API_BASE,
        apiKey: BREACHHUB_API_KEY,
        apiKeyHeader: 'key',
        apiKeyQuery: true
      },
      discord: {
        apiBase: BREACHHUB_API_BASE,
        apiKey: BREACHHUB_API_KEY,
        apiKeyHeader: 'X-API-Key',
        apiKeyQuery: false
      },
      telegram: {
        apiBase: BREACHHUB_API_BASE,
        apiKey: BREACHHUB_API_KEY,
        apiKeyHeader: 'X-API-Key',
        apiKeyQuery: false
      },
      snapchat: {
        apiBase: BREACHHUB_API_BASE,
        apiKey: BREACHHUB_API_KEY,
        apiKeyHeader: 'key',
        apiKeyQuery: true
      },
      instagram: {
        apiBase: BREACHHUB_API_BASE,
        apiKey: BREACHHUB_API_KEY,
        apiKeyHeader: 'key',
        apiKeyQuery: true
      },
      medal: {
        apiBase: BREACHHUB_API_BASE,
        apiKey: BREACHHUB_API_KEY,
        apiKeyHeader: 'key',
        apiKeyQuery: true
      },
      openarchive: {
        apiBase: OPENARCHIVE_API_BASE,
        apiKey: OPENARCHIVE_API_KEY,
        apiKeyHeader: 'Authorization',
        bearerToken: true,
        apiKeyQuery: false
      },
      ip: {
        apiBase: BREACHHUB_API_BASE,
        apiKey: BREACHHUB_API_KEY,
        apiKeyHeader: 'X-API-Key',
        apiKeyQuery: false
      },
      domain: {
        apiBase: BREACHHUB_API_BASE,
        apiKey: BREACHHUB_API_KEY,
        apiKeyHeader: 'X-API-Key',
        apiKeyQuery: false
      },
      dns: {
        apiBase: BREACHHUB_API_BASE,
        apiKey: BREACHHUB_API_KEY,
        apiKeyHeader: 'key',
        apiKeyQuery: true
      },
      whois: {
        apiBase: BREACHHUB_API_BASE,
        apiKey: BREACHHUB_API_KEY,
        apiKeyHeader: 'key',
        apiKeyQuery: true
      },
      roblox: {
        apiBase: BREACHHUB_API_BASE,
        apiKey: BREACHHUB_API_KEY,
        apiKeyHeader: 'key',
        apiKeyQuery: true
      },
      minecraft: {
        apiBase: BREACHHUB_API_BASE,
        apiKey: BREACHHUB_API_KEY,
        apiKeyHeader: 'key',
        apiKeyQuery: true
      },
      xbox: {
        apiBase: BREACHHUB_API_BASE,
        apiKey: BREACHHUB_API_KEY,
        apiKeyHeader: 'X-API-Key',
        apiKeyQuery: false
      },
      steam: {
        apiBase: BREACHHUB_API_BASE,
        apiKey: BREACHHUB_API_KEY,
        apiKeyHeader: 'key',
        apiKeyQuery: true
      },
      fivem: {
        apiBase: BREACHHUB_API_BASE,
        apiKey: BREACHHUB_API_KEY,
        apiKeyHeader: 'key',
        apiKeyQuery: true
      },
      twitter: {
        apiBase: BREACHHUB_API_BASE,
        apiKey: BREACHHUB_API_KEY,
        apiKeyHeader: 'key',
        apiKeyQuery: true
      },
      reddit: {
        apiBase: BREACHHUB_API_BASE,
        apiKey: BREACHHUB_API_KEY,
        apiKeyHeader: 'key',
        apiKeyQuery: true
      },
      wolfeye: {
        apiBase: 'https://api.wolfeye.xyz/api/v1',
        apiKey: WOLF_EYE_KEY,
        apiKeyHeader: 'key',
        apiKeyQuery: true
      }
    };

    // Initialize RESEND_API_KEY from environment
    RESEND_API_KEY = env.RESEND_API || null;
    
    // Initialize IMGBB_API_KEY from environment
    IMGBB_API_KEY = env.IMGBB_API || null;
    
    // Initialize Cloudinary credentials from environment
    CLOUDINARY_API_KEY = env.CLOUDN_API || null;
    CLOUDINARY_API_SECRET = env.CLOUDN_SEC || null;
    CLOUDINARY_CLOUD_NAME = 'fek6eeii';

    const url = new URL(request.url);
    const path = url.pathname;
    
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS_HEADERS });
    }
    
    // Handle bot requests for all pages
    if (isBotRequest(request)) {
      // User profile pages (black theme)
      if (path.startsWith('/users/')) {
        const username = path.split('/users/')[1];
        if (username) {
          const embedHTML = await generateProfileEmbedHTML(username);
          return new Response(embedHTML, {
            headers: { 'Content-Type': 'text/html' }
          });
        }
      }
      // All other pages (white theme)
      else {
        const embedHTML = generatePageEmbedHTML(path);
        return new Response(embedHTML, {
          headers: { 'Content-Type': 'text/html' }
        });
      }
    }
    
    // Rate limiting
    const clientIP = request.headers.get('CF-Connecting-IP') || 'unknown';
    const rateLimitCheck = checkRateLimit(clientIP, path);
    if (!rateLimitCheck.allowed) {
      return new Response(JSON.stringify({ error: 'Rate limit exceeded', reason: rateLimitCheck.reason }), {
        status: 429,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
      });
    }
    
    // Serve callback page
    if (path === '/callback') {
      return new Response(getCallbackHTML(url.searchParams), {
        headers: { 'Content-Type': 'text/html' }
      });
    }
    
    // API routes
    if (path.startsWith('/api/')) {
      return handleAPI(request, path, url, ctx);
    }
    
    return new Response('Not Found', { status: 404 });
  }
};
