FROM node:20-alpine

# Install dependencies for Prisma
RUN apk add --no-cache openssl libc6-compat

WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install ALL dependencies including dev dependencies (needed for ts-node)
RUN npm ci || npm install

# Copy prisma schema and generate client
COPY prisma ./prisma
RUN npx prisma generate

# Copy source code
COPY src ./src
COPY tsconfig.json ./

# Set production environment
ENV NODE_ENV=production
ENV NODE_OPTIONS="--max-old-space-size=512"

EXPOSE 4000

# Use ts-node via npm start script
CMD ["npm", "start"]