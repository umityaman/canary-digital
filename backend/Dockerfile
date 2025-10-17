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

# Expose port
EXPOSE 4000

# Start the app with ts-node (simpler for now)
CMD ["npx", "ts-node", "--transpile-only", "src/index.ts"]
