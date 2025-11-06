# --- Stage 1: Build ---
FROM node:18-alpine AS builder

WORKDIR /app

# Install dependencies only
COPY package*.json ./
RUN npm ci --only=production

# Copy app source code
COPY . .

# --- Stage 2: Run ---
FROM node:18-alpine

WORKDIR /app

# Copy only the necessary built artifacts and node_modules
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app ./

# Remove unnecessary files (tests, docs, cache, etc.)
RUN rm -rf /app/tests /app/docs /root/.npm /tmp/*

EXPOSE 5000

CMD ["npm", "start"]
