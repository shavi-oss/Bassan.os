// jwks-server — minimal Express server for Admin JWKS (sandbox only)
// Serves: GET /.well-known/jwks.json and GET /jwks.json
// Do NOT use in production — sandbox PR-101 use only
const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Load static JWKS JSON
const jwksPath = path.join(__dirname, 'jwks.json');
const jwks = JSON.parse(fs.readFileSync(jwksPath, 'utf8'));

// CORS headers for inter-service access
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  next();
});

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', kid: jwks.keys[0]?.kid }));

// JWKS endpoints
app.get('/.well-known/jwks.json', (req, res) => res.json(jwks));
app.get('/jwks.json', (req, res) => res.json(jwks));

app.listen(PORT, () => console.log(`jwks-server running on port ${PORT}`));
