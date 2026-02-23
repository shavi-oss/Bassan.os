// JWKS Server — serves public JWKS only via /.well-known/jwks.json
// No private key leakage. Private key lives in Railway secret only.
// No npm dependencies — uses Node built-ins only.
// JWKS payload is loaded from ADMIN_JWKS_PAYLOAD environment variable (JSON string).

const http = require('http');

const PORT = process.env.PORT || 3001;

// Load JWKS from environment variable — fail fast if missing or malformed
let jwksPayload;
(function loadJwks() {
  const raw = process.env.ADMIN_JWKS_PAYLOAD;
  if (!raw) {
    console.error('[jwks-server] FATAL: ADMIN_JWKS_PAYLOAD env var is not set.');
    console.error('[jwks-server] Set it to the JSON string of the public JWKS, e.g.:');
    console.error('[jwks-server]   {"keys":[{"kty":"RSA","n":"...","e":"AQAB","use":"sig","kid":"admin-key-1","alg":"RS256"}]}');
    process.exit(1);
  }

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    console.error('[jwks-server] FATAL: ADMIN_JWKS_PAYLOAD is not valid JSON:', err.message);
    process.exit(1);
  }

  // Safety: strip any private key fields that should never be present
  const safeKeys = (parsed.keys || []).map((k) => {
    const { d, p, q, dp, dq, qi, k: symmetricK, ...publicOnly } = k;
    return publicOnly;
  });

  if (safeKeys.length === 0) {
    console.error('[jwks-server] FATAL: ADMIN_JWKS_PAYLOAD contains no keys.');
    process.exit(1);
  }

  jwksPayload = JSON.stringify({ keys: safeKeys });
  console.log(`[jwks-server] Loaded ${safeKeys.length} key(s): ${safeKeys.map((k) => k.kid).join(', ')}`);
})();

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
