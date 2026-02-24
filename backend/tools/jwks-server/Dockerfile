FROM node:18-alpine
WORKDIR /app

# Copy only what's needed — no private keys
COPY package.json ./
COPY index.js ./
COPY jwks.json ./

# Bind to Railway-provided PORT
EXPOSE 3001
CMD ["node", "index.js"]
