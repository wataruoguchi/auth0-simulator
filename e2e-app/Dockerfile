FROM cypress/included:13.15.0

# Set working directory
WORKDIR /e2e

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy Cypress configuration
COPY cypress.config.cjs ./
COPY tsconfig.json ./

# Copy test files
COPY cypress/ ./cypress/

# Environment variables will be set by docker-compose

# Run Cypress tests
CMD ["npx", "cypress", "run"]
