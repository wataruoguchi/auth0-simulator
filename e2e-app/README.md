# E2E Tests with Auth0 Simulator

This directory contains end-to-end tests for the PoC E2E with Auth0 application using the `@wataruoguchi/auth0-simulator` package.

## Overview

This is the E2E testing application that uses the Auth0 Simulator package. It demonstrates how to integrate the simulator with Cypress for comprehensive end-to-end testing.

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

The e2e tests can also be run using Docker Compose from the root directory:

```bash
# Run all services including e2e tests
docker-compose up e2e

# Run tests against running services
docker-compose run e2e npm run test
```

## Test Commands

- `cy.login()` - Login with test user
- `cy.logout()` - Logout current user
- `cy.verifyApi()` - Test API endpoint

## Development

This E2E testing application is designed to work with the Auth0 Simulator package. The simulator package provides the authentication endpoints and user management functionality needed for comprehensive testing.
