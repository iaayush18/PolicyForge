# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app
#Install OpenSSL (Required for Prisma on Alpine)
RUN apk add --update --no-cache openssl
COPY package*.json ./
# 2. Force installation of ALL dependencies, including devDependencies (like the Prisma CLI)
RUN npm install
COPY . .
# 3. Generate the client
RUN npx prisma generate

# Stage 2: Production
FROM node:20-alpine
WORKDIR /app
# Copy the node_modules that already contains the generated Prisma client
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

# Remove the redundant 'generate' command. 
# Only run migrations and start the server.
CMD sh -c "npx prisma migrate deploy && node server.js"