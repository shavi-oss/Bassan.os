// JWKS Server — serves public JWKS only via /.well-known/jwks.json
// No private key leakage. Private key lives in Railway secret only.
// No npm dependencies — uses Node built-ins only.

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3001;
const JWKS_PATH = path.join(__dirname, 'jwks.json');

// Load JWKS at startup — fail fast if missing
let jwksPayload;
try {
  const raw = JSON.parse(fs.readFileSync(JWKS_PATH, 'utf8'));
  // Safety: strip any private key fields that should never be present
  const safeKeys = (raw.keys || []).map((k) => {
    const { d, p, q, dp, dq, qi, k: symmetricK, ...publicOnly } = k;
    return publicOnly;
  });
  jwksPayload = JSON.stringify({ keys: safeKeys });
  console.log(`[jwks-server] Loaded ${safeKeys.length} key(s): ${safeKeys.map(k => k.kid).join(', ')}`);
} catch (err) {
  console.error('[jwks-server] FATAL: Cannot load jwks.json:', err.message);
  process.exit(1);
}

const server = http.createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/.well-known/jwks.json') {
    res.writeHead(200, {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=300',
    });
    res.end(jwksPayload);
  } else if (req.method === 'GET' && req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok' }));
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[jwks-server] Listening on port ${PORT}`);
  console.log(`[jwks-server] JWKS endpoint: http://0.0.0.0:${PORT}/.well-known/jwks.json`);
});
