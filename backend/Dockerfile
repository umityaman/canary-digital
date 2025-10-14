FROM node:18-alpine

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl

WORKDIR /usr/src/app
COPY package.json package-lock.json* ./
RUN npm install
COPY . .
RUN npx prisma generate
CMD ["npm","run","dev"]
