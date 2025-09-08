# Multi-stage Dockerfile for full-stack app
FROM node:20-alpine AS frontend-builder

# Set working directory for frontend
WORKDIR /app/frontend

# Copy frontend package files
COPY frontend/package*.json ./

# Install frontend dependencies
RUN npm install

# Copy frontend source code
COPY frontend/ ./

# Set environment variables for frontend build
ARG VITE_AUTH0_DOMAIN=https://localhost:4400
ARG VITE_AUTH0_CLIENT_ID=test-client-id
ARG VITE_AUTH0_AUDIENCE=test-audience
ARG VITE_API_URL=http://localhost:3000

ENV VITE_AUTH0_DOMAIN=$VITE_AUTH0_DOMAIN
ENV VITE_AUTH0_CLIENT_ID=$VITE_AUTH0_CLIENT_ID
ENV VITE_AUTH0_AUDIENCE=$VITE_AUTH0_AUDIENCE
ENV VITE_API_URL=$VITE_API_URL

# Build frontend
RUN npm run build

# Copy frontend dist to a temporary location
RUN mkdir -p /app/dist && cp -r dist/* /app/dist/

# Backend builder stage
FROM node:20-alpine AS backend-builder

# Set working directory for backend
WORKDIR /app/backend

# Copy backend package files
COPY backend/package*.json ./

# Install backend dependencies
RUN npm install

# Copy backend source code
COPY backend/ ./

# Build backend (TypeScript compilation)
RUN npm run build

# Final production stage
FROM node:20-alpine AS production

# Set working directory
WORKDIR /app

# Install only production dependencies for backend
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm install --only=production && npm cache clean --force

# Copy built backend from builder stage
COPY --from=backend-builder /app/backend/dist ./dist
COPY --from=backend-builder /app/backend/src ./src

# Copy frontend assets to backend public directory
COPY --from=frontend-builder /app/dist /app/backend/public

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Change ownership of the app directory
RUN chown -R nextjs:nodejs /app
USER nextjs

# Expose port 3000
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Start the application
CMD ["node", "dist/index.js"]
