// Cloudflare Pages Middleware for Bot Detection and Embed Serving
export async function onRequest(context) {
  const { request, next } = context;
  const url = new URL(request.url);
  const path = url.pathname;

  // Detect if request is from a bot/crawler
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

  const isBot = botPatterns.some(pattern => pattern.test(userAgent));

  // Handle bot requests for user profile pages
  if (isBot && path.startsWith('/users/')) {
    let username = path.split('/users/')[1];
    
    // Remove @ prefix if present
    if (username && username.startsWith('@')) {
      username = username.substring(1);
    }
    
    // Remove any query parameters
    if (username) {
      username = username.split('?')[0];
    }
    
    if (username) {
      try {
        // Fetch user data from Firebase
        const firebaseUrl = 'https://framework-osint-default-rtdb.firebaseio.com/users.json';
        const response = await fetch(firebaseUrl);
        
        if (!response.ok) {
          console.error('Firebase fetch failed:', response.status);
          return new Response(generateDefaultEmbedHTML(), {
            headers: { 'Content-Type': 'text/html' }
          });
        }
        
        const users = await response.json();

        if (!users || typeof users !== 'object') {
          console.error('Invalid users data from Firebase');
          return new Response(generateDefaultEmbedHTML(), {
            headers: { 'Content-Type': 'text/html' }
          });
        }

        // Try to find user by username (case-insensitive)
        const userKey = Object.keys(users).find(key => {
          const user = users[key];
          return user && user.username && user.username.toLowerCase() === username.toLowerCase();
        });

        if (!userKey) {
          console.log('User not found:', username);
          return new Response(generateDefaultEmbedHTML(), {
            headers: { 'Content-Type': 'text/html' }
          });
        }

        const user = users[userKey];
        const displayName = user.username || 'User';
        const bio = user.bio || '';
        const status = user.status || '';
        const avatar = user.avatar || 'https://datawire.cc/default-avatar.png';
        const description = bio && status ? `${bio} | ${status}` : (bio || status || 'DataWire Profile');

        const embedHTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>@${displayName} | DataWire.cc</title>
  <meta name="theme-color" content="#000000" />
  <meta name="description" content="${description}" />
  
  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="profile" />
  <meta property="og:title" content="@${displayName} | DataWire.cc" />
  <meta property="og:description" content="${description}" />
  <meta property="og:image" content="${avatar}" />
  <meta property="og:url" content="https://datawire.cc/users/${username}" />
  
  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="@${displayName} | DataWire.cc" />
  <meta name="twitter:description" content="${description}" />
  <meta name="twitter:image" content="${avatar}" />
</head>
<body style="background: #000; color: #fff; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; font-family: Arial, sans-serif;">
  <div style="text-align: center;">
    <p>@${displayName}</p>
    <p>${description}</p>
  </div>
</body>
</html>`;

        return new Response(embedHTML, {
          headers: { 'Content-Type': 'text/html' }
        });
      } catch (error) {
        console.error('Error generating profile embed:', error);
        return new Response(generateDefaultEmbedHTML(), {
          headers: { 'Content-Type': 'text/html' }
        });
      }
    }
  }

  // Let all other requests pass through to the React app
  return next();
}

function generateDefaultEmbedHTML() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>DataWire.cc</title>
  <meta name="theme-color" content="#ffffff" />
  <meta name="description" content="OSINT Intelligence Platform" />
  
  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="website" />
  <meta property="og:title" content="DataWire.cc" />
  <meta property="og:description" content="OSINT Intelligence Platform" />
  <meta property="og:image" content="https://i.ibb.co/wFrNvxt5/Chat-GPT-Image-Jul-6-2026-09-02-01-PM-removebg-preview.png" />
  <meta property="og:url" content="https://datawire.cc/" />
  
  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="DataWire.cc" />
  <meta name="twitter:description" content="OSINT Intelligence Platform" />
  <meta name="twitter:image" content="https://i.ibb.co/wFrNvxt5/Chat-GPT-Image-Jul-6-2026-09-02-01-PM-removebg-preview.png" />
</head>
<body style="background: #fff; color: #000; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; font-family: Arial, sans-serif;">
  <div style="text-align: center;">
    <p>DataWire.cc</p>
  </div>
</body>
</html>`;
}
