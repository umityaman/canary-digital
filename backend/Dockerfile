FROM node:18-alpine

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl

WORKDIR /usr/src/app

# Copy package files
COPY package.json package-lock.json* ./

# Install ALL dependencies
RUN npm ci

# Copy source code
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Cloud Run automatically sets PORT env var
# Backend uses: const PORT = process.env.PORT || 4000

# Skip migrations on startup (run manually first time)
# Start with ts-node (skip type checking)
CMD ["npx", "ts-node", "--transpile-only", "--skip-project", "src/index.ts"]
