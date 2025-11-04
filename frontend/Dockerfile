# Multi-stage build for Cloud Run
FROM node:20-alpine AS builder

# Install build tools for native dependencies
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies for build)
# Note: Using npm install instead of npm ci because package-lock.json is not committed
RUN npm install

# Copy source code
COPY . .

# Force rebuild by adding timestamp
RUN echo "Build time: $(date)" > /tmp/buildtime.txt

# Build argument for API URL
ARG VITE_API_URL=https://canary-backend-672344972017.europe-west1.run.app
ENV VITE_API_URL=${VITE_API_URL}

# Build the app
RUN npm run build

# Production stage with nginx
FROM nginx:alpine

# Copy built files from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
