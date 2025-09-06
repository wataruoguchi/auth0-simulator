# E2E Tests

This directory contains end-to-end tests for the PoC E2E with Auth0 application using Cypress and Auth0 Simulator.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start the Auth0 simulator locally (for development):
```bash
npm run simulator
```

3. Run Cypress tests:
```bash
# Open Cypress Test Runner
npm run cypress:open

# Run tests headlessly
npm run test

# Run tests with browser visible
npm run test:headed
```

## Docker Setup

The e2e tests can also be run using Docker Compose:

```bash
# Run all services including e2e tests
docker-compose up e2e

# Run only the Auth0 simulator
docker-compose up auth0-simulator

# Run tests against running services
docker-compose run e2e npm run test
```

## Test Structure

- `cypress/e2e/` - Test files
- `cypress/support/` - Custom commands and configuration
- `cypress/fixtures/` - Test data
- `src/` - Auth0 simulator setup

## Auth0 Simulator

The Auth0 simulator runs on `localhost:4400` and provides:
- Mock Auth0 authentication endpoints
- Test users for login
- JWT token generation
- OAuth2/OpenID Connect flow simulation

## Test Commands

- `cy.login()` - Login with test user
- `cy.logout()` - Logout current user
- `cy.verifyApi()` - Test API endpoint

## Environment Variables

- `CYPRESS_baseUrl` - Base URL for the application (default: http://localhost:3000)
- `CYPRESS_AUTH0_DOMAIN` - Auth0 simulator domain (default: localhost:4400)
