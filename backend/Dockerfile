FROM node:18-alpine

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl

WORKDIR /usr/src/app

# Copy package files
COPY package.json package-lock.json* ./

# Install ALL dependencies (ts-node needed at runtime)
RUN npm ci && npm cache clean --force

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
