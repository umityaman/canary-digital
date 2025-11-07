FROM node:20-alpine

# Install dependencies for Prisma
RUN apk add --no-cache openssl libc6-compat

WORKDIR /usr/src/app

# Copy package files and npmrc
COPY package*.json .npmrc ./

# Install dependencies (no package-lock.json, use npm install)
RUN npm install --legacy-peer-deps --no-audit || npm install --force

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