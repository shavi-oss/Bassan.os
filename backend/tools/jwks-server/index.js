// JWKS Server — serves public JWKS only via /.well-known/jwks.json
// No private key leakage. Private key lives in Railway secrets only.
// No npm dependencies — uses Node built-ins only.
//
// Config priority (highest → lowest):
//   1. ADMIN_JWKS_B64   — base64-encoded JWKS JSON (PREFERRED — no JSON-quoting issues)
//   2. ADMIN_JWKS_PAYLOAD — raw JSON string (legacy fallback)
//
// Generate ADMIN_JWKS_B64 locally (never commit output):
//   node -e "process.stdout.write(Buffer.from(require('fs').readFileSync('jwks.json','utf8')).toString('base64'))"
// Set on Railway:
//   railway variables set "ADMIN_JWKS_B64=<base64-string>" --service jwks-server

const http = require('http');

const PORT = process.env.PORT || 3001;

// Private JWK fields that must never appear in a public JWKS response
const PRIVATE_FIELDS = ['d', 'p', 'q', 'dp', 'dq', 'qi', 'k'];

// ─── Load and validate JWKS from environment ─────────────────────────────────
let jwksPayload;
(function loadJwks() {
  // Step 1: resolve raw JSON string from env vars
  let raw;

  if (process.env.ADMIN_JWKS_B64) {
    // Preferred path: base64-decode avoids all shell/PowerShell quoting issues
    try {
      raw = Buffer.from(process.env.ADMIN_JWKS_B64, 'base64').toString('utf8');
    } catch (err) {
      console.error('[jwks-server] FATAL: Failed to base64-decode ADMIN_JWKS_B64:', err.message);
      console.error('[jwks-server] Expected: a base64-encoded string of the JWKS JSON object.');
      process.exit(1);
    }
  } else if (process.env.ADMIN_JWKS_PAYLOAD) {
    // Legacy fallback
    raw = process.env.ADMIN_JWKS_PAYLOAD;
  } else {
    console.error('[jwks-server] FATAL: Neither ADMIN_JWKS_B64 nor ADMIN_JWKS_PAYLOAD is set.');
    console.error('[jwks-server] Preferred: set ADMIN_JWKS_B64 to a base64-encoded JWKS JSON string.');
    console.error('[jwks-server] Fallback:  set ADMIN_JWKS_PAYLOAD to the raw JWKS JSON string.');
    console.error('[jwks-server] Expected format: {"keys":[{"kty":"RSA","n":"...","e":"AQAB","use":"sig","kid":"admin-key-2","alg":"RS256"}]}');
    process.exit(1);
  }

  // Step 2: parse JSON
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    console.error('[jwks-server] FATAL: JWKS payload is not valid JSON:', err.message);
    console.error('[jwks-server] If using ADMIN_JWKS_PAYLOAD, prefer ADMIN_JWKS_B64 to avoid quoting issues.');
    console.error('[jwks-server] Raw value starts with:', String(raw).slice(0, 40));
    process.exit(1);
  }

  // Step 3: validate structure
  if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.keys)) {
    console.error('[jwks-server] FATAL: JWKS payload must be an object with a "keys" array.');
    console.error('[jwks-server] Got:', JSON.stringify(parsed).slice(0, 80));
    process.exit(1);
  }

  if (parsed.keys.length === 0) {
    console.error('[jwks-server] FATAL: JWKS payload contains no keys.');
    process.exit(1);
  }

  // Step 4: validate each key — reject if private fields present, then strip defensively
  const safeKeys = parsed.keys.map((k, i) => {
    const found = PRIVATE_FIELDS.filter((f) => Object.prototype.hasOwnProperty.call(k, f));
    if (found.length > 0) {
      console.error(`[jwks-server] FATAL: Key[${i}] (kid=${k.kid}) contains private field(s): ${found.join(', ')}.`);
      console.error('[jwks-server] JWKS payload must contain ONLY public fields (kty, n, e, use, kid, alg).');
      process.exit(1);
    }
    // Defensive strip (belt + suspenders)
    const { d, p, q, dp: _dp, dq: _dq, qi: _qi, k: _k, ...publicOnly } = k;
    return publicOnly;
  });

  jwksPayload = JSON.stringify({ keys: safeKeys });
  const source = process.env.ADMIN_JWKS_B64 ? 'ADMIN_JWKS_B64' : 'ADMIN_JWKS_PAYLOAD';
  console.log(`[jwks-server] Loaded ${safeKeys.length} key(s) from ${source}: ${safeKeys.map((k) => k.kid).join(', ')}`);
})();

// ─── HTTP server ──────────────────────────────────────────────────────────────
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
