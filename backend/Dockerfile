FROM node:18-alpine

WORKDIR /app

# Install OpenSSL (required by Prisma engine linux-musl binary)
RUN apk add --no-cache openssl openssl-dev libc6-compat

# Install dependencies (build context is repo root, backend lives in /backend)
COPY backend/package*.json ./
RUN npm ci

# Copy source and build
COPY backend/ ./
RUN npx prisma generate
RUN npm run build

# Expose default port (Railway injects $PORT at runtime)
EXPOSE 3000

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/src/main"]
