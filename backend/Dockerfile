FROM node:20-alpine AS builder

# Install build dependencies
RUN apk add --no-cache openssl libc6-compat python3 make g++

WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm ci --include=dev || npm install

# Copy prisma schema first
COPY prisma ./prisma

# Generate Prisma Client
RUN npx prisma generate

# Copy source code
COPY src ./src

# Build TypeScript with increased memory
ENV NODE_OPTIONS="--max-old-space-size=2048"
RUN npm run build || npx tsc --incremental false

# Production stage
FROM node:20-alpine

RUN apk add --no-cache openssl libc6-compat

WORKDIR /usr/src/app

# Copy package files and install production dependencies only
COPY package*.json ./
RUN npm ci --omit=dev || npm install --omit=dev

# Copy prisma schema and generate client
COPY prisma ./prisma
RUN npx prisma generate

# Copy built files from builder
COPY --from=builder /usr/src/app/dist ./dist

# Set production environment
ENV NODE_ENV=production

EXPOSE 4000

# Start with compiled JS instead of ts-node
CMD ["node", "dist/index.js"]