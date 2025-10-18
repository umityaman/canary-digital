FROM node:18-alpine

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl

WORKDIR /usr/src/app

# Copy package files
COPY package.json package-lock.json* ./

# Install ALL dependencies (including dev for build)
RUN npm ci

# Copy source code and tsconfig
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build TypeScript to JavaScript
RUN npm run build

# Cloud Run automatically sets PORT env var
# Backend uses: const PORT = process.env.PORT || 4000

# Run database migrations and start the app
CMD ["sh", "-c", "npx prisma db push --accept-data-loss && node dist/index.js"]
