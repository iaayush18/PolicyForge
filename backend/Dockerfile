# =========================
# Stage 1: Builder
# =========================
FROM node:20-alpine AS builder

WORKDIR /app

# Prisma needs openssl
RUN apk add --no-cache openssl

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy Prisma schema FIRST
COPY prisma ./prisma

# Generate Prisma client
RUN npx prisma generate

# Copy application code
COPY . .

# =========================
# Stage 2: Production
# =========================
FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache openssl

ENV NODE_ENV=production

# Copy node_modules with generated Prisma client
COPY --from=builder /app/node_modules ./node_modules

# Copy app source
COPY --from=builder /app ./

EXPOSE 5000

CMD ["sh", "-c", "npx prisma migrate deploy && node server.js"]