// JWKS Server — serves public JWKS only via /.well-known/jwks.json
// No private key leakage. Private key lives in Railway secrets only.
// No npm dependencies — uses Node built-ins only.
//
// ═══════════════════════════════════════════════════════════════════
// REQUIRED: ADMIN_JWKS_B64 — base64-encoded JWKS JSON (B64-only config)
// ═══════════════════════════════════════════════════════════════════
//
// Why base64?
//   Passing raw JSON via Railway CLI / PowerShell corrupts the value.
//   JSON like {"keys":[...]} becomes {keys:[...]} — not valid JSON.
//   Base64 is plain alphanumeric — zero shell quoting issues.
//
// Generate + set (PowerShell, run from dir containing jwks.json):
//   $b64 = [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes((Get-Content -Raw .\jwks.json)))
//   railway variables set "ADMIN_JWKS_B64=$b64" --service jwks-server
//
// Generate + set (bash):
//   railway variables set "ADMIN_JWKS_B64=$(base64 -w0 jwks.json)" --service jwks-server

const http = require('http');

const PORT = process.env.PORT || 3001;

// Private JWK fields that must never appear in a public JWKS response
const PRIVATE_FIELDS = ['d', 'p', 'q', 'dp', 'dq', 'qi', 'k'];

// ─── Load and validate JWKS from environment ─────────────────────────────────
let jwksPayload;
(function loadJwks() {
  // Hard-fail if someone still has ADMIN_JWKS_PAYLOAD set — guide them to B64
  if (process.env.ADMIN_JWKS_PAYLOAD) {
    console.error('[jwks-server] FATAL: ADMIN_JWKS_PAYLOAD is no longer supported.');
    console.error('[jwks-server] Reason: raw JSON via Railway CLI is corrupted by shell quoting.');
    console.error('[jwks-server] Action: delete ADMIN_JWKS_PAYLOAD and set ADMIN_JWKS_B64 instead.');
    console.error('[jwks-server] PowerShell:');
    console.error('[jwks-server]   $b64 = [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes((Get-Content -Raw .\\jwks.json)))');
    console.error('[jwks-server]   railway variables set "ADMIN_JWKS_B64=$b64" --service jwks-server');
    console.error('[jwks-server]   railway variables delete ADMIN_JWKS_PAYLOAD --service jwks-server');
    process.exit(1);
  }

  if (!process.env.ADMIN_JWKS_B64) {
    console.error('[jwks-server] FATAL: ADMIN_JWKS_B64 environment variable is not set.');
    console.error('[jwks-server] Set it to a base64-encoded JWKS JSON string.');
    console.error('[jwks-server] PowerShell:');
    console.error('[jwks-server]   $b64 = [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes((Get-Content -Raw .\\jwks.json)))');
    console.error('[jwks-server]   railway variables set "ADMIN_JWKS_B64=$b64" --service jwks-server');
    process.exit(1);
  }

  // Decode base64 → UTF-8 string
  let raw;
  try {
    raw = Buffer.from(process.env.ADMIN_JWKS_B64, 'base64').toString('utf8');
  } catch (err) {
    console.error('[jwks-server] FATAL: Failed to base64-decode ADMIN_JWKS_B64:', err.message);
    process.exit(1);
  }

  // Parse JSON
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    console.error('[jwks-server] FATAL: Decoded ADMIN_JWKS_B64 is not valid JSON:', err.message);
    console.error('[jwks-server] Decoded value starts with:', String(raw).slice(0, 60));
    console.error('[jwks-server] Re-generate: ensure jwks.json has quoted keys, then re-encode.');
    process.exit(1);
  }

  // Validate structure
  if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.keys)) {
    console.error('[jwks-server] FATAL: JWKS payload must be an object with a "keys" array.');
    process.exit(1);
  }

  if (parsed.keys.length === 0) {
    console.error('[jwks-server] FATAL: JWKS "keys" array is empty.');
    process.exit(1);
  }

  // Validate + strip private fields (fail-closed on detect, then strip defensively)
  const safeKeys = parsed.keys.map((k, i) => {
    const found = PRIVATE_FIELDS.filter((f) => Object.prototype.hasOwnProperty.call(k, f));
    if (found.length > 0) {
      console.error(`[jwks-server] FATAL: Key[${i}] (kid=${k.kid}) contains private field(s): ${found.join(', ')}.`);
      console.error('[jwks-server] JWKS payload must contain ONLY public fields: kty, n, e, use, kid, alg.');
      process.exit(1);
    }
    const { d, p, q, dp: _dp, dq: _dq, qi: _qi, k: _k, ...publicOnly } = k;
    return publicOnly;
  });

  jwksPayload = JSON.stringify({ keys: safeKeys });
  console.log(`[jwks-server] Loaded ${safeKeys.length} key(s) from ADMIN_JWKS_B64: ${safeKeys.map((k) => k.kid).join(', ')}`);
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
