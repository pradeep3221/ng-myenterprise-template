# --- Build stage ---
FROM node:20-alpine AS build
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy sources
COPY . .

# Build Angular (SSR)
RUN npx ng build

# --- Runtime stage ---
FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

# Copy built artifacts
COPY --from=build /app/dist/ng-myenterprise-template ./dist/ng-myenterprise-template

# Expose SSR port
EXPOSE 4000

# Run Express SSR server
CMD ["node", "dist/ng-myenterprise-template/server/server.mjs"]
