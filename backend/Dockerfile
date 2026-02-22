FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source and build
COPY . .
RUN npx prisma generate
RUN npm run build

# Expose default port (Railway injects $PORT at runtime)
EXPOSE 3000

CMD ["node", "dist/main"]
