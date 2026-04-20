# Build stage
FROM node:22-alpine AS build

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy source files
COPY . .

# Build-time ARGs for Vite
ARG VITE_API_URL=/api
ARG VITE_API_PROXY_TARGET=https://api.jobrythm.aricummings.com

# Make them available as environment variables during build
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_API_PROXY_TARGET=$VITE_API_PROXY_TARGET

# Build the application
RUN npm run build

# Production stage
FROM nginx:stable-alpine

# Set working directory
WORKDIR /usr/share/nginx/html

# Copy built files from build stage
COPY --from=build /app/dist .

# Create data directory for persistence
RUN mkdir -p /var/lib/jobrythm/data && chown nginx:nginx /var/lib/jobrythm/data

# Copy custom Nginx configuration template
COPY nginx.conf.template /etc/nginx/templates/default.conf.template

# Expose port 80
EXPOSE 80

# The default entrypoint for nginx image will use envsubst on files in /etc/nginx/templates/
# and output them to /etc/nginx/conf.d/
CMD ["nginx", "-g", "daemon off;"]
