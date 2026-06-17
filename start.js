const fs = require('fs');
const path = require('path');

// Read config: env var MUSIC_U > config.json music_u
let musicU = process.env.MUSIC_U || '';
let serverPort = parseInt(process.env.PORT, 10) || 3000;
if (!musicU) {
  try {
    const cfg = JSON.parse(fs.readFileSync(path.join(__dirname, 'config.json'), 'utf-8'));
    musicU = cfg.music_u || '';
    if (cfg.port) serverPort = cfg.port;
  } catch (e) {
    // no config.json, use defaults
  }
}

if (musicU) {
  console.log('[Config] MUSIC_U loaded from ' + (process.env.MUSIC_U ? 'env' : 'config.json'));
} else {
  console.warn('[Config] WARNING: No MUSIC_U found. VIP songs will be 30s previews.');
}

// Copy music-player.html to API's public folder
try {
  fs.copyFileSync(
    path.join(__dirname, 'public', 'music-player.html'),
    path.join(__dirname, 'node_modules', 'NeteaseCloudMusicApi', 'public', 'music-player.html')
  );
  console.log('[Static] music-player.html copied');
} catch(e) {
  // in Docker, the file might already be there
}

// === Step 1: Patch request.js BEFORE it's loaded ===
const requestPath = path.join(__dirname, 'node_modules', 'NeteaseCloudMusicApi', 'util', 'request.js');
let code = fs.readFileSync(requestPath, 'utf-8');

const injectedCode = `// INJECTED\nif ('${musicU}') { processedCookie.MUSIC_U = '${musicU}'; }\nif (!processedCookie.MUSIC_U) {\n    processedCookie.MUSIC_A = processedCookie.MUSIC_A || anonymous_token`;

if (code.includes('// INJECTED')) {
  const startIdx = code.indexOf('// INJECTED');
  const endMarker = 'processedCookie.MUSIC_A = processedCookie.MUSIC_A || anonymous_token';
  const endIdx = code.indexOf(endMarker, startIdx);
  if (endIdx !== -1) {
    const afterEnd = code.indexOf('\n', endIdx);
    code = code.substring(0, startIdx) + injectedCode + code.substring(afterEnd);
  }
} else {
  code = code.replace(
    "if (!processedCookie.MUSIC_U) {\n    processedCookie.MUSIC_A = processedCookie.MUSIC_A || anonymous_token",
    injectedCode
  );
}
fs.writeFileSync(requestPath, code);
console.log('[Patch] request.js updated');

// Clear require cache so fresh patched version is used
try { delete require.cache[require.resolve('./node_modules/NeteaseCloudMusicApi/util/request')]; } catch(e) {}

// === Step 2: Generate anonymous token, then start server ===
(async () => {
  try {
    const generateConfig = require('./node_modules/NeteaseCloudMusicApi/generateConfig');
    await generateConfig();
  } catch (e) {
    // non-critical, continue
  }
  const api = require('./node_modules/NeteaseCloudMusicApi');
  api.serveNcmApi({
    port: serverPort,
  });
})();
