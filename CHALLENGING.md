# Development Challenges & Solutions

This document outlines the major challenges encountered while building and testing this Auth0 + React + Docker e2e testing setup, along with the solutions that were implemented.

## 1. Auth0 SPA SDK HTTPS Requirement

### Challenge

The Auth0 SPA SDK (`@auth0/auth0-react`) requires a secure origin (HTTPS) to function properly. When the React app was running on HTTP (`http://app:3000`), the Auth0 library would throw the error:

```txt
auth0-spa-js must run on a secure origin.
```

Our options were either using `https` or `localhost`.

### Solution

Let the e2e container use `http://localhost:3000` to access the React app by adding `network_mode: host` in the `docker-compose.yml`.

### Key Technical Details

```yaml
services:
  e2e:
    network_mode: host  # This was the key solution!
    environment:
      - CYPRESS_baseUrl=http://localhost:3000
      - AUTH0_DOMAIN=https://localhost:4400
```

## 2. Multi-Origin Testing with Cypress

### Challenge

Cypress tests needed to interact with both the main app (`localhost:3000`) and the Auth0 simulator (`localhost:4400`). This required proper multi-origin testing configuration.

### Solution

- **`cy.origin()` Usage**: Properly configured `cy.origin()` calls for cross-origin interactions

### Key Technical Details

```typescript
cy.origin("https://localhost:4400", () => {
  cy.get('[data-testid="simulator-login-button"]').click();
});
```

## 3. Auth0 Simulator Configuration

### Challenge

The Auth0 simulator needed to be accessible from both the host browser and Docker containers, while maintaining proper hostname consistency for JWT tokens.

### Solution

- **Dual Binding**: Configured the simulator to listen on `0.0.0.0:4400` (accessible from containers) while returning `https://localhost:4400` as the issuer URL
- **JWT Token Consistency**: Ensured JWT tokens always contained `https://localhost:4400` as the issuer, regardless of how the simulator was accessed

## 4. JWT Token Verification

### Challenge

The backend needed to verify JWT tokens from the Auth0 simulator using JWKS (JSON Web Key Set) endpoints, but encountered SSL certificate issues with self-signed certificates.

### Solution

- **SSL Bypass for JWKS**: Temporarily disabled SSL certificate verification when fetching JWKS from the simulator
- **Hono JWT Integration**: Used Hono's `verifyWithJwks` function for token verification
- **Error Handling**: Implemented proper error handling for JWT verification failures

### Key Technical Details

```typescript
// Temporarily disable SSL certificate verification for self-signed certificates
const originalRejectUnauthorized = process.env.NODE_TLS_REJECT_UNAUTHORIZED;
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const payload = await verifyWithJwks(token, {
  jwks_uri: `${process.env.VITE_AUTH0_DOMAIN}/.well-known/jwks.json`,
});
```

## Final Architecture

The final working architecture consists of:

- **App Service**: HTTP backend serving React app on `http://localhost:3000`
- **Auth0 Simulator**: HTTPS simulator on `https://localhost:4400`
- **E2E Service**: Cypress container using `network_mode: host` to access host services
- **Proper CORS**: Configured to allow cross-origin requests between services
- **JWT Verification**: Backend verifies tokens using JWKS from the simulator
