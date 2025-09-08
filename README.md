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

# Run with custom ports
APP_PORT=8080 AUTH0_PORT=8440 docker-compose up --build e2e

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

## Port Configuration

This project supports flexible port configuration, allowing you to choose any available ports from outside the Docker network without modifying the `docker-compose.yml` file.

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `APP_PORT` | `3000` | External port for the main application |
| `AUTH0_PORT` | `4400` | External port for the Auth0 simulator |

### Usage Examples

#### Using Default Ports
```bash
docker-compose up --build e2e
```
- App: http://localhost:3000
- Auth0 Simulator: https://localhost:4400

#### Using Custom Ports
```bash
# Set environment variables
export APP_PORT=8080
export AUTH0_PORT=8440

# Or use inline
APP_PORT=8080 AUTH0_PORT=8440 docker-compose up --build e2e
```
- App: http://localhost:8080
- Auth0 Simulator: https://localhost:8440

#### Using a .env File
Create a `.env` file in the project root:
```bash
APP_PORT=8080
AUTH0_PORT=8440
```

Then run:
```bash
docker-compose up --build e2e
```

### Running E2E Tests with Custom Ports
```bash
APP_PORT=8080 AUTH0_PORT=8440 docker-compose up --build e2e
```

### Important Notes

1. **Internal Ports**: The internal container ports (3000 for app, 4400 for auth0-simulator) remain fixed and should not be changed.

2. **Port Conflicts**: Make sure the external ports you choose are not already in use on your system.

3. **E2E Tests**: The E2E tests use `network_mode: host`, so they will automatically use the external ports you specify.

4. **Health Checks**: The health check for the app container uses the internal port (3000) and doesn't need to be changed.

### Troubleshooting

If you encounter port conflicts:
```bash
# Check what's using a port
lsof -i :3000
lsof -i :4400

# Kill processes using those ports
kill -9 <PID>
```

## Environment Variables

The frontend and the backend apps require the environment variables configured in `.env`. `docker-compose.yml` takes some variables as well. Please maintain all the `.env` files beside `.env.example`.
