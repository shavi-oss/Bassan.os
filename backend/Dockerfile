FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source and build
COPY . .
RUN npx prisma generate
RUN npm run build
RUN echo "=== /app contents ===" && ls -la /app/ && echo "=== /app/dist contents ===" && ls -la /app/dist/ | head -20

# Expose default port (Railway injects $PORT at runtime)
EXPOSE 3000

CMD ["node", "dist/main"]
