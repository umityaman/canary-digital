FROM node:20-alpine

# Install minimal dependencies for Prisma and build tools
RUN apk add --no-cache openssl libc6-compat python3 make g++

WORKDIR /usr/src/app

# Copy package files (including lock file for consistent installs)
COPY package*.json ./

# Install ALL dependencies (ts-node needed at runtime)
RUN npm ci --production=false && npm cache clean --force

# Copy prisma schema
COPY prisma ./prisma

# Generate Prisma Client
RUN npx prisma generate

# Copy source code (uses .dockerignore to exclude unnecessary files)
COPY . .

# Set production environment
ENV NODE_ENV=production

# Cloud Run sets PORT automatically
EXPOSE 4000

# Start application with ts-node
CMD ["npx", "ts-node", "--transpile-only", "src/index.ts"]