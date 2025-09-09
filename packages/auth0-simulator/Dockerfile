FROM node:20-alpine

# Install OpenSSL for certificate generation
RUN apk add --no-cache openssl

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY src/ ./src/

# Copy test RSA key for development
COPY test-rsa-key.pem /tmp/test-rsa-key.pem

# Compile TypeScript
RUN npx tsc

# Expose port (will be overridden by docker-compose port mapping)
EXPOSE 4400

# Start Auth0 simulator
CMD ["node", "-e", "import('./dist/index.js').then(m => m.startAuth0Simulator())"]
