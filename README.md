# E2E with Auth0 Simulator

## Package available

Please read [./packages/auth0-simulator/README.md](./packages/auth0-simulator/README.md) for the package infromation.

## Setup

Start the application:

```sh
docker-compose up -d
```

## Commands

### NPM Scripts

```sh
# Format code
npm run format

# Lint code
npm run lint

# Rebuild and start application
npm run dc-rebuild

# Run E2E tests
npm run dc-test

# Run E2E tests with custom ports
npm run dc-test:custom-ports

# Run unit tests across all packages
npm run test:unit

# Run all tests (unit + E2E)
npm run test
```

### Docker Compose Commands

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
```

## E2E Testing

This project includes comprehensive E2E tests using Cypress and the Auth0 Simulator package:

- **Location**: `e2e-app/` directory
- **Framework**: Cypress with TypeScript
- **Auth0 Simulation**: Auth0 Simulator package for testing authentication flows
- **Docker Integration**: Tests run in Docker containers

### Running E2E Tests

```bash
# Run tests locally (requires app to be running)
cd e2e-app
npm install
npm run cypress:open  # Interactive mode
npm run test          # Headless mode

# Run tests with Docker
docker-compose up e2e
```

### Test Structure

- `cypress/e2e/` - Test files
- `cypress/support/` - Custom commands and configuration
- `cypress.config.cjs` - Cypress configuration

## Architecture Overview

This project demonstrates a complete E2E testing setup with Auth0 authentication simulation. Here's how the components work together:

### System Architecture

```mermaid
graph TB
    subgraph "Docker Environment"
        subgraph "App Container"
            APP[Full-Stack App<br/>Port 3000]
            APP --> |Serves| FE[React Frontend]
            APP --> |API| BE[Hono Backend]
        end
        
        subgraph "Auth0 Simulator Container"
            AUTH[Auth0 Simulator<br/>Port 4400]
        end
        
        subgraph "E2E Test Container"
            CYPRESS[Cypress Tests<br/>network_mode: host]
        end
    end
    
    subgraph "External Access"
        USER[Developer/CI]
    end
    
    USER --> |npm run dc-test| CYPRESS
    CYPRESS --> |HTTP| APP
    FE --> |HTTPS OAuth| AUTH
    BE --> |JWT verification| AUTH
    AUTH --> |User data| BE
```

### Authentication Flow

```mermaid
sequenceDiagram
    participant C as Cypress Test
    participant F as Frontend
    participant B as Backend
    participant A as Auth0 Simulator
    
    Note over C: E2E Test Execution
    C->>F: Navigate to app
    F->>A: Redirect to login
    A->>C: Show login form
    C->>A: Submit credentials
    A->>A: Generate JWT token
    A->>F: Return with auth code
    F->>A: Exchange code for token
    A->>F: Return access token
    F->>B: API call with Bearer token
    B->>A: Verify JWT signature
    A->>B: Return user info
    B->>F: Return protected data
    F->>C: Display authenticated content
    C->>C: Assert authentication success
```

### Package Structure

```mermaid
graph LR
    subgraph "Root Project"
        ROOT[package.json<br/>Workspace configuration]
    end
    
    subgraph "packages/"
        subgraph "auth0-simulator/"
            AUTH_PKG[Auth0 Simulator Package<br/>@wataruoguchi/auth0-simulator]
        end
        
        subgraph "example/"
            subgraph "frontend/"
                FE_PKG[React Frontend]
            end
            
            subgraph "backend/"
                BE_PKG[Hono Backend]
            end
            
            subgraph "e2e-app/"
                E2E_PKG[Cypress E2E Tests]
            end
        end
    end
    
    ROOT --> AUTH_PKG
    ROOT --> FE_PKG
    ROOT --> BE_PKG
    ROOT --> E2E_PKG
    
    E2E_PKG --> |Uses| AUTH_PKG
    BE_PKG --> |Uses| AUTH_PKG
```

### Key Features

- **🔐 Auth0 Simulation**: Complete OAuth2/OpenID Connect flow simulation
- **🧪 E2E Testing**: Cypress tests with real authentication flows
- **🐳 Docker Integration**: All services containerized for consistency
- **📦 Monorepo Structure**: Organized packages with workspace management
- **🔧 Flexible Ports**: Configurable external ports without code changes
- **✅ Comprehensive Testing**: Unit tests for simulator + E2E tests for integration

## Port Configuration

This project supports flexible port configuration, allowing you to choose any available ports from outside the Docker network without modifying the `docker-compose.yml` file.

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `APP_PORT` | `3000` | External port for the main application |
| `AUTH0_PORT` | `4400` | External port for the Auth0 simulator |

### Usage Examples

You can try running E2E tests with the following ways:

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
