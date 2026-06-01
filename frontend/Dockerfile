# Build Stage
FROM node:22-alpine AS builder

WORKDIR /app

# Enable npm cache caching
COPY package*.json ./

# Install packages
RUN npm install --legacy-peer-deps

COPY . .

# Build production assets
RUN npm run build

# Runtime Stage
FROM nginx:alpine

# Copy built assets
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration to support SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
