FROM node:18-alpine

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl

WORKDIR /usr/src/app
COPY package.json package-lock.json* ./
RUN npm install
COPY . .
RUN npx prisma generate

# Push schema to database (no migrations) and start server
CMD npx prisma db push --accept-data-loss && npm run dev
