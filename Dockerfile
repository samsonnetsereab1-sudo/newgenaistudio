# Multi-stage build for NewGen Studio backend (Node.js + Express)
# Builds and runs ONLY the backend service.

FROM node:20-alpine AS base
WORKDIR /app

# Copy backend package files first to leverage Docker layer cache
COPY backend/package*.json ./backend/

# Install backend deps (prod only)
RUN cd backend \
  && npm ci --omit=dev

# Copy backend source
COPY backend ./backend

# Runtime image
FROM node:20-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app

# Copy installed deps and source from build stage
COPY --from=base /app/backend /app/backend

# Expose the internal port used by Fly http_service
EXPOSE 4000

# Ensure the server binds to 0.0.0.0 and respects PORT
# Explicit path to avoid any working-directory confusion
CMD ["node", "/app/backend/server.js"]
