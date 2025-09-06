# PoC E2E with Auth0

## Setup

1. Copy the environment file and configure your Auth0 settings:

```sh
cp .env.example .env
# Edit .env with your actual Auth0 domain and other settings
```

2. Start the application:

```sh
docker-compose up -d
```

## Commands

```sh
# Start the application
docker-compose up -d

# Stop the application
docker-compose down

# View logs
docker-compose logs

# Rebuild and start
docker-compose up --build -d

# Run E2E tests
docker-compose up e2e

# All in one
# alias dc="docker-compose"
dc rm --stop -f && dc build --no-cache && dc up
```

## E2E Testing

This project includes comprehensive E2E tests using Cypress and a mock Auth0 simulator:

- **Location**: `e2e/` directory
- **Framework**: Cypress with TypeScript
- **Auth0 Simulation**: Mock Auth0 server for testing authentication flows
- **Docker Integration**: Tests run in Docker containers

### Running E2E Tests

```bash
# Run tests locally (requires app to be running)
cd e2e
npm install
npm run cypress:open  # Interactive mode
npm run test          # Headless mode

# Run tests with Docker
docker-compose up e2e
```

### Test Structure

- `cypress/e2e/` - Test files
- `cypress/support/` - Custom commands and configuration
- `src/` - Mock Auth0 simulator setup

## Environment Variables

The frontend and the backend apps require the environment variables configured in `.env`. `docker-compose.yml` takes some variables as well. Please maintain all the `.env` files beside `.env.example`.
