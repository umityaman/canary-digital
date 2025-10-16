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

# Run migrations and start with ts-node (development mode for now)
CMD npx prisma migrate deploy && npx ts-node src/index.ts
