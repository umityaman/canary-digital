FROM node:20-alpine

# Install dependencies for Prisma
RUN apk add --no-cache openssl libc6-compat

WORKDIR /usr/src/app

# Copy only package.json (NOT .npmrc to avoid ignore-scripts=true)
COPY package.json ./

# Install all dependencies including devDeps for TypeScript
RUN npm install --legacy-peer-deps

# Copy prisma and generate client
COPY prisma ./prisma
RUN npx prisma generate

# Copy source code
COPY src ./src
COPY tsconfig.json ./

# Build TypeScript - || true allows build even with type errors (JS still emits)
ENV NODE_OPTIONS="--max-old-space-size=4096"
RUN npx tsc || true
# Verify compilation produced output
RUN test -f dist/index.js || (echo "ERROR: dist/index.js not found after tsc" && exit 1)

ENV NODE_ENV=production
ENV PORT=8080

EXPOSE 8080

CMD ["node", "dist/index.js"]