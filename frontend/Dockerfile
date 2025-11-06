# ---------- Build Stage ----------
FROM node:18-alpine AS build

# Set working directory
WORKDIR /app

# Copy dependency files
COPY package*.json ./

# Install dependencies (clean + reproducible)
RUN npm ci --only=production && npm cache clean --force

# Copy application source code
COPY . .

# Build the application
RUN npm run build

# ---------- Production Stage ----------
FROM nginx:1.25-alpine

# Copy built assets from the build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Remove default nginx page
RUN rm -rf /usr/share/nginx/html/*

# Copy your production build
COPY --from=build /app/dist /usr/share/nginx/html

# Optional: copy a custom nginx config
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose application port
EXPOSE 80

# Start NGINX server
CMD ["nginx", "-g", "daemon off;"]
