// Cloudflare Worker for DataWire.cc API
// Discord OAuth2 + Firebase + Crypto Payment System

const DISCORD_CLIENT_ID = '1523193275001999400';
const DISCORD_CLIENT_SECRET = '3k-1W6wjNryj7L9vT_KoWUHBLB6syxeb';
const DISCORD_REDIRECT_URI = 'https://datawirecc-api.mynameisntnick0.workers.dev/callback';
const DISCORD_SCOPES = ['email', 'identify'].join(' ');
const JWT_SECRET = 'gH8mdOI6xT6/H33yCgV8ZTxVuQ/PYZI3pAgqZb5ZlVhP+zetQs8W4MK9QBNxbMxFpsvl+CRumuwB29oXvA7rGQ==';
const FIREBASE_DATABASE_URL = 'https://framework-osint-default-rtdb.firebaseio.com';
const SEARCH_COST_USD = '0.10';
const SEARCH_COOLDOWN_MS = 2000;

// OSINT Provider API Keys
const DATAHOUND_API_BASE = 'https://datahound.tools/api';
const DATAHOUND_API_KEY = '5b28424ae4567a056f1dfa96';
const OSINTCAT_API_BASE = 'https://www.osintcat.net/api';
const OSINTCAT_API_KEY = '3ba35670-387e-46ac-bbf6-ee96d4d982a8';
const BREACHHUB_API_BASE = 'https://breachhub.org/api';
const BREACHHUB_API_KEY = 'jMVHloKPVFQg18aKbaRHawiz0euD';
const NOTICED_API_BASE = 'https://noticed.wtf';
const NOTICED_API_KEY = 'y538uxz6ca5pblycdkiwms54m8s9pzta';
const INTELX_API_BASE = 'https://breachhub.org/api';
const INTELX_API_KEY = 'oGJX0laLTvcxzeJkfqrhKwZRIHxh';

// NVIDIA API Configuration
const NVIDIA_API_KEY = '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';
const NVIDIA_API_BASE = 'https://integrate.api.nvidia.com/v1';

// AI OSINT Investigation State
const investigationState = new Map();

const PAYMENT_ADDRESSES = {
  BTC: 'bc1qpl22tu5gqre7frpz22jzgdkhvrsr4vjpc034ea',
  LTC: 'LYfjiJSiMZA9xmmUiN2t8fcUh4Esc3ymVk',
  ETH: '0xE5cE7596fD4a9D3659E19fd55E862602E81ECbf3',
  SOL: 'sDqQQKvQktKxL6aHmwcg1fhtwQ2Lc9MHQsQFcSnjaBf',
  USDT: '0xE5cE7596fD4a9D3659E19fd55E862602E81ECbf3'
};

// AI OSINT Tool Definitions
const AI_OSINT_TOOLS = {
  email_breach_search: {
    name: 'Email Breach Search',
    description: 'Search for email in breach databases',
    providers: ['snusbase', 'leakcheck', 'breachbase', 'intelvault'],
    queryParam: 'email',
    identifierType: 'emails'
  },
  email_osint: {
    name: 'Email OSINT',
    description: 'Comprehensive email intelligence',
    providers: ['seeknow', 'seekria', 'oathnet'],
    queryParam: 'email',
    identifierType: 'emails'
  },
  username_search: {
    name: 'Username Search',
    description: 'Search username across platforms',
    providers: ['seeknow', 'seekria', 'memory'],
    queryParam: 'username',
    identifierType: 'usernames'
  },
  social_media_osint: {
    name: 'Social Media OSINT',
    description: 'Social media intelligence',
    providers: ['seeknow', 'seekria', 'room101'],
    queryParam: 'username',
    identifierType: 'usernames'
  },
  phone_search: {
    name: 'Phone Search',
    description: 'Phone number intelligence',
    providers: ['seon', 'seeknow', 'seekria'],
    queryParam: 'phone',
    identifierType: 'phoneNumbers'
  },
  discord_user: {
    name: 'Discord User',
    description: 'Discord user intelligence',
    providers: ['cordcat', 'oathnet', 'datavoid'],
    queryParam: 'id',
    identifierType: 'discordIds'
  },
  ip_intel: {
    name: 'IP Intelligence',
    description: 'IP address intelligence',
    providers: ['seon', 'seeknow', 'seekria', 'osintcat'],
    queryParam: 'ip',
    identifierType: 'ipAddresses'
  },
  domain_intel: {
    name: 'Domain Intelligence',
    description: 'Domain intelligence',
    providers: ['seeknow', 'seekria', 'hudsonrock'],
    queryParam: 'domain',
    identifierType: 'domains'
  },
  hash_lookup: {
    name: 'Hash Lookup',
    description: 'Hash lookup in databases',
    providers: ['snusbase'],
    queryParam: 'hash',
    identifierType: 'hashes'
  }
};

// Open-source search functions
async function performOpenSourceSearch(query, searchType) {
  const searches = [];
  
  const searchQueries = {
    emails: [`"${query}" site:linkedin.com`, `"${query}" site:github.com`, `"${query}" site:twitter.com`],
    usernames: [`"${query}" site:twitter.com`, `"${query}" site:instagram.com`, `"${query}" site:github.com`],
    phoneNumbers: [`"${query}" site:whatsapp.com`, `"${query}" site:telegram.org`],
    discordIds: [`"${query}" discord lookup`],
    ipAddresses: [`"${query}" abuseipdb`, `"${query}" virustotal`],
    domains: [`"${query}" whois`, `"${query}" subdomain`]
  };
  
  const queries = searchQueries[searchType] || [`"${query}"`];
  
  for (const searchQuery of queries) {
    searches.push({
      query: searchQuery,
      status: 'completed',
      results: [],
      source: 'open-source'
    });
  }
  
  return searches;
}

// AI orchestration with NVIDIA API
async function callNVIDIAAI(messages) {
  try {
    const response = await fetch(`${NVIDIA_API_BASE}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${NVIDIA_API_KEY}`
      },
      body: JSON.stringify({
        model: 'meta/llama-3.1-70b-instruct',
        messages: messages,
        temperature: 0.7,
        top_p: 0.95,
        max_tokens: 16384,
        chat_template_kwargs: { thinking: false },
        stream: false
      })
    });
    
    if (!response.ok) {
      throw new Error(`NVIDIA API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('NVIDIA AI error:', error);
    throw error;
  }
}

// Execute AI OSINT investigation
async function executeAIOsintInvestigation(identifiers, userId) {
  console.log('[AI OSINT] Starting investigation with identifiers:', JSON.stringify(identifiers));
  
  const investigationId = crypto.randomUUID();
  const state = {
    progress: 0,
    stage: 'Initializing Investigation',
    activityLog: [],
    completedTasks: 0,
    totalTasks: 0,
    completed: false,
    results: [],
    report: null
  };
  
  investigationState.set(investigationId, state);
  
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
      return investigationId;
    }
    
    state.stage = 'Initializing Investigation';
    state.progress = 5;
    state.activityLog.push({
      tool: 'System',
      identifier: 'N/A',
      action: `Initializing investigation with ${identifierCount} identifiers`,
      status: 'Running'
    });
    
    state.stage = 'Planning Search Strategy';
    state.progress = 10;
    state.activityLog.push({
      tool: 'AI Orchestrator',
      identifier: 'N/A',
      action: 'Analyzing identifiers and planning strategy',
      status: 'Running'
    });
    
    const availableTools = Object.keys(AI_OSINT_TOOLS);
    const systemPrompt = `You are an AI OSINT orchestrator for Datawire.cc. Available tools: ${availableTools.join(', ')}. Available identifier types: ${Object.keys(identifiers).join(', ')}. Return JSON array of tool executions: [{"tool": "tool_name", "identifier": "value", "priority": "high|medium|low"}]. Only return JSON.`;
    
    const userPrompt = `Investigate these identifiers: ${JSON.stringify(identifiers)}`;
    
    try {
      const aiResponse = await callNVIDIAAI([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ]);
      
      try {
        const jsonMatch = aiResponse.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          toolExecutions = JSON.parse(jsonMatch[0]);
          console.log('[AI OSINT] Parsed tool executions from AI:', toolExecutions);
        }
      } catch (error) {
        console.error('Failed to parse AI response, using fallback:', error);
      }
      
      // Fallback: If no tools from AI or parsing failed, manually map identifiers to tools
      if (toolExecutions.length === 0) {
        console.log('[AI OSINT] No tools from AI, using fallback mapping');
        Object.entries(identifiers).forEach(([type, values]) => {
          values.forEach(value => {
            const relevantTool = Object.values(AI_OSINT_TOOLS).find(t => t.identifierType === type);
            if (relevantTool) {
              toolExecutions.push({
                tool: Object.keys(AI_OSINT_TOOLS).find(k => AI_OSINT_TOOLS[k] === relevantTool),
                identifier: value,
                priority: 'medium'
              });
            } else {
              // For unsupported identifier types, try to find a close match
              if (type === 'fullNames') {
                toolExecutions.push({
                  tool: 'username_search',
                  identifier: value,
                  priority: 'low'
                });
              } else if (type === 'urls') {
                toolExecutions.push({
                  tool: 'domain_intel',
                  identifier: value,
                  priority: 'low'
                });
              } else if (type === 'socialProfiles') {
                toolExecutions.push({
                  tool: 'social_media_osint',
                  identifier: value,
                  priority: 'low'
                });
              } else if (type === 'cryptoWallets') {
                toolExecutions.push({
                  tool: 'username_search',
                  identifier: value,
                  priority: 'low'
                });
              }
            }
          });
        });
        console.log('[AI OSINT] Fallback tool executions:', toolExecutions);
      }
      
      // If still no tools, add a default tool to ensure investigation runs
      if (toolExecutions.length === 0) {
        console.log('[AI OSINT] Still no tools, adding default username_search');
        Object.entries(identifiers).forEach(([type, values]) => {
          values.forEach(value => {
            toolExecutions.push({
              tool: 'username_search',
              identifier: value,
              priority: 'low'
            });
          });
        });
      }
      
      state.totalTasks = toolExecutions.length;
      console.log('[AI OSINT] Total tasks set to:', state.totalTasks);
      state.activityLog.push({
        tool: 'AI Orchestrator',
        identifier: 'N/A',
        action: `Planned ${toolExecutions.length} tool executions`,
        status: 'Completed'
      });
      
      state.stage = 'Running API Queries';
      state.progress = 20;
      
      if (toolExecutions.length === 0) {
        state.activityLog.push({
          tool: 'System',
          identifier: 'N/A',
          action: 'No tools to execute, skipping to open-source search',
          status: 'Completed'
        });
      }
      
      for (let i = 0; i < toolExecutions.length; i++) {
        const execution = toolExecutions[i];
        const tool = AI_OSINT_TOOLS[execution.tool];
        
        state.activityLog.push({
          tool: tool.name,
          identifier: execution.identifier,
          action: `Executing ${execution.tool}`,
          status: 'Running'
        });
        
        try {
          for (const provider of tool.providers) {
            const providerConfig = PROVIDERS[provider];
            if (!providerConfig) {
              console.log(`[AI OSINT] Provider config not found: ${provider}`);
              continue;
            }
            
            const endpoint = WEB_ENDPOINTS[provider]?.find(
              e => e.queryParam === tool.queryParam || e.name.includes(tool.queryParam)
            );
            
            if (!endpoint) {
              console.log(`[AI OSINT] Endpoint not found for ${provider} with queryParam ${tool.queryParam}`);
              continue;
            }
            
            const params = {};
            params[endpoint.queryParam] = execution.identifier;
            
            const response = await providerHttpRequest(
              endpoint.method || 'GET',
              `${providerConfig.apiBase}${endpoint.path}`,
              endpoint.method === 'POST' ? null : params,
              endpoint.method === 'POST' ? params : null,
              providerConfig.apiKeyHeader,
              providerConfig.apiKey,
              providerConfig.apiKeyQuery
            );
            
            if (response.ok && response.data) {
              state.results.push({
                provider,
                tool: tool.name,
                identifier: execution.identifier,
                data: response.data,
                source: 'api'
              });
            }
          }
          
          state.completedTasks++;
          state.progress = 20 + (state.completedTasks / state.totalTasks) * 60;
          
          state.activityLog.push({
            tool: tool.name,
            identifier: execution.identifier,
            action: 'Execution completed',
            status: 'Completed'
          });
        } catch (error) {
          console.error(`[AI OSINT] Tool execution error:`, error);
          state.completedTasks++;
          state.progress = 20 + (state.completedTasks / state.totalTasks) * 60;
          state.activityLog.push({
            tool: tool.name,
            identifier: execution.identifier,
            action: `Error: ${error.message}`,
            status: 'Failed'
          });
        }
      }
    } catch (error) {
      state.activityLog.push({
        tool: 'AI Orchestrator',
        identifier: 'N/A',
        action: `AI planning failed: ${error.message}`,
        status: 'Failed'
      });
    }
    
    state.stage = 'Performing Open-Source Web Research';
    state.progress = 85;
    
    for (const [type, values] of Object.entries(identifiers)) {
      for (const value of values) {
        state.activityLog.push({
          tool: 'Open-Source Search',
          identifier: value,
          action: `Searching web for ${type}`,
          status: 'Running'
        });
        
        try {
          const osResults = await performOpenSourceSearch(value, type);
          state.results.push(...osResults);
          state.activityLog.push({
            tool: 'Open-Source Search',
            identifier: value,
            action: `Completed ${osResults.length} searches`,
            status: 'Completed'
          });
        } catch (error) {
          state.activityLog.push({
            tool: 'Open-Source Search',
            identifier: value,
            action: `Error: ${error.message}`,
            status: 'Failed'
          });
        }
      }
    }
    
    state.stage = 'Analyzing Results';
    state.progress = 90;
    
    try {
      const analysisPrompt = `Analyze these OSINT results and generate a JSON report with: executiveSummary, investigationOverview, discoveredIdentifiers, linkedAccounts, relatedEntities, timeline, evidence, nextSteps. Results: ${JSON.stringify(state.results)}. Identifiers: ${JSON.stringify(identifiers)}. Only return JSON.`;
      
      const analysisResponse = await callNVIDIAAI([
        { role: 'system', content: 'You are an expert OSINT analyst. Generate detailed JSON reports.' },
        { role: 'user', content: analysisPrompt }
      ]);
      
      try {
        const jsonMatch = analysisResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          state.report = JSON.parse(jsonMatch[0]);
        }
      } catch (error) {
        console.error('Failed to parse analysis response:', error);
      }
    } catch (error) {
      console.error('Analysis failed:', error);
    }
    
    state.stage = 'Finalizing Investigation';
    state.progress = 100;
    state.completed = true;
    
    state.activityLog.push({
      tool: 'System',
      identifier: 'N/A',
      action: 'Investigation completed',
      status: 'Completed'
    });
    
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
  }
  
  return investigationId;
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

// CORS headers
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Credentials': 'true'
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
  return userResponse.json();
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

// Callback HTML - redirects to frontend callback
function getCallbackHTML(params) {
  const code = params.get('code');
  const state = params.get('state') || '/dashboard';
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Authenticating...</title>
</head>
<body>
  <script>
    // Redirect to frontend callback with the code
    const code = '${code || ''}';
    const state = '${state}';
    window.location.href = 'https://datawire.cc/callback?code=' + encodeURIComponent(code) + '&state=' + encodeURIComponent(state);
  </script>
  <p>Redirecting to authentication...</p>
</body>
</html>`;
}

// Rate limiting
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 60000;
const RATE_LIMIT_MAX_REQUESTS = 60;

function checkRateLimit(ip) {
  const now = Date.now();
  const userRequests = rateLimitMap.get(ip) || [];
  const recentRequests = userRequests.filter(time => now - time < RATE_LIMIT_WINDOW);
  
  if (recentRequests.length >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }
  
  recentRequests.push(now);
  rateLimitMap.set(ip, recentRequests);
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

// Provider HTTP request
async function providerHttpRequest(method, url, params, data, apiKeyHeader, apiKey, apiKeyQuery = false) {
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
      headers[apiKeyHeader] = apiKey;
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
      
      // Convert ArrayBuffer to base64 for JSON transport
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

// Provider configurations
const PROVIDERS = {
  datahound: {
    apiBase: BREACHHUB_API_BASE,
    apiKey: BREACHHUB_API_KEY,
    apiKeyHeader: 'key',
    apiKeyQuery: true
  },
  osintcat: {
    apiBase: OSINTCAT_API_BASE,
    apiKey: OSINTCAT_API_KEY,
    apiKeyHeader: 'key',
    apiKeyQuery: true
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
    apiKeyHeader: 'key',
    apiKeyQuery: true
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
    apiKeyHeader: 'key',
    apiKeyQuery: true
  },
  intelvault: {
    apiBase: BREACHHUB_API_BASE,
    apiKey: BREACHHUB_API_KEY,
    apiKeyHeader: 'key',
    apiKeyQuery: true
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
    apiKeyHeader: 'key',
    apiKeyQuery: true
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
    apiKeyHeader: 'key',
    apiKeyQuery: true
  },
  cordcat: {
    apiBase: BREACHHUB_API_BASE,
    apiKey: BREACHHUB_API_KEY,
    apiKeyHeader: 'key',
    apiKeyQuery: true
  },
  intelx: {
    apiBase: INTELX_API_BASE,
    apiKey: INTELX_API_KEY,
    apiKeyHeader: 'key',
    apiKeyQuery: true
  },
  xosint: {
    apiBase: BREACHHUB_API_BASE,
    apiKey: BREACHHUB_API_KEY,
    apiKeyHeader: 'key',
    apiKeyQuery: true
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
    apiKeyHeader: 'key',
    apiKeyQuery: true
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
    apiKeyHeader: 'key',
    apiKeyQuery: true
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
    apiKeyHeader: 'key',
    apiKeyQuery: true
  },
  seon: {
    apiBase: BREACHHUB_API_BASE,
    apiKey: BREACHHUB_API_KEY,
    apiKeyHeader: 'key',
    apiKeyQuery: true
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
    apiKeyHeader: 'key',
    apiKeyQuery: true
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
    apiKeyHeader: 'key',
    apiKeyQuery: true
  },
  tiktok: {
    apiBase: BREACHHUB_API_BASE,
    apiKey: BREACHHUB_API_KEY,
    apiKeyHeader: 'key',
    apiKeyQuery: true
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
    apiKeyHeader: 'key',
    apiKeyQuery: true
  },
  propertyradar: {
    apiBase: BREACHHUB_API_BASE,
    apiKey: BREACHHUB_API_KEY,
    apiKeyHeader: 'key',
    apiKeyQuery: true
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
    apiKeyHeader: 'key',
    apiKeyQuery: true
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
    apiKeyHeader: 'key',
    apiKeyQuery: true
  },
  telegram: {
    apiBase: BREACHHUB_API_BASE,
    apiKey: BREACHHUB_API_KEY,
    apiKeyHeader: 'key',
    apiKeyQuery: true
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
  }
};

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
};

// API handler
async function handleAPI(request, path, url) {
  const method = request.method;
  
  // Auth callback
  if (path === '/api/auth/callback' && method === 'POST') {
    const { code } = await request.json();
    if (!code) {
      return new Response(JSON.stringify({ error: 'Missing code' }), {
        status: 400,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
      });
    }
    
    try {
      const discordUser = await getDiscordUser(code);
      const userId = discordUser.id;
      
      const safeUserId = firebaseSafeKey(userId);
      const existingUser = await firebaseGet(`/users/${safeUserId}`);
      
      if (!existingUser) {
        await firebasePut(`/users/${safeUserId}`, {
          discordId: userId,
          username: discordUser.username,
          global_name: discordUser.global_name || discordUser.username,
          avatar: discordUser.avatar,
          balanceUsd: '0.00',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      } else {
        await firebasePatch(`/users/${safeUserId}`, {
          username: discordUser.username,
          global_name: discordUser.global_name || discordUser.username,
          avatar: discordUser.avatar,
          updatedAt: new Date().toISOString()
        });
      }
      
      const token = await signJWT(
        { userId, username: discordUser.username, exp: Math.floor(Date.now() / 1000) + 86400 * 7 },
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
  
  // Protected routes - verify JWT
  const authHeader = request.headers.get('Authorization') || '';
  const token = authHeader.replace('Bearer ', '');
  
  if (!token) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
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
  const safeUserId = firebaseSafeKey(userId);
  
  // Get user profile
  if (path === '/api/user/profile' && method === 'GET') {
    try {
      const user = await firebaseGet(`/users/${safeUserId}`);
      return new Response(JSON.stringify({ success: true, user }), {
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
      
      const investigationId = await executeAIOsintInvestigation(identifiers, userId);
      
      return new Response(JSON.stringify({ 
        success: true, 
        investigationId 
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
      
      if (!investigationId) {
        return new Response(JSON.stringify({ error: 'Missing investigation ID' }), {
          status: 400,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
        });
      }
      
      const state = investigationState.get(investigationId);
      
      if (!state) {
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
      
      const state = investigationState.get(investigationId);
      
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
      return new Response(JSON.stringify({ success: true, balance: user?.balanceUsd || '0.00' }), {
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
      
      // Check balance
      const user = await firebaseGet(`/users/${safeUserId}`);
      const currentBalance = parseFloat(user?.balanceUsd || '0');
      if (currentBalance < parseFloat(SEARCH_COST_USD)) {
        return new Response(JSON.stringify({ error: 'Insufficient balance' }), {
          status: 402,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
        });
      }
      
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
        url = url.replace('{query}', encodeURIComponent(query));
      }
      
      const params = {};
      if (endpoint.queryParam) {
        params[endpoint.queryParam] = query;
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
        providerConfig.apiKeyQuery || false
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
      const newBalance = (currentBalance - parseFloat(SEARCH_COST_USD)).toFixed(2);
      await firebasePatch(`/users/${safeUserId}`, {
        balanceUsd: newBalance,
        updatedAt: new Date().toISOString()
      });
      
      // Log search
      const searchId = crypto.randomUUID();
      await firebasePut(`/users/${safeUserId}/searches/${searchId}`, {
        id: searchId,
        provider,
        command,
        query,
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
        cost: SEARCH_COST_USD
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
  
  return new Response(JSON.stringify({ error: 'Not Found' }), {
    status: 404,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
  });
}

// Main handler
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS_HEADERS });
    }
    
    // Rate limiting
    const clientIP = request.headers.get('CF-Connecting-IP') || 'unknown';
    if (!checkRateLimit(clientIP)) {
      return new Response(JSON.stringify({ error: 'Rate limit exceeded' }), {
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
      return handleAPI(request, path, url);
    }
    
    return new Response('Not Found', { status: 404 });
  }
};
