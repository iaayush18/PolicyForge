# Stage 1: Build
FROM node:20-alpine AS builder

# 1. Install required dependencies for Prisma on Alpine
RUN apk update && apk add --no-cache openssl libc6-compat

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# 2. Run generate (Should now work flawlessly)
RUN npx prisma generate

# Stage 2: Production
FROM node:20-alpine

# Install openssl in the production stage as well, 
# as the Prisma engine needs it at runtime to connect to PostgreSQL
RUN apk update && apk add --no-cache openssl libc6-compat

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/server.js ./server.js
COPY --from=builder /app/middleware ./middleware
COPY --from=builder /app/services ./services
COPY --from=builder /app/utils ./utils
COPY --from=builder /app/controllers ./controllers
COPY --from=builder /app/routes ./routes
COPY --from=builder /app/prisma ./prisma

EXPOSE 5000

# 3. Use JSON array syntax to fix the Warning
CMD ["sh", "-c", "npx prisma migrate deploy && npx prisma db seed && node server.js"]