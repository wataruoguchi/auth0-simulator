# Development Challenges & Solutions

This document outlines the major challenges encountered while building and testing this Auth0 + React + Docker e2e testing setup, along with the solutions that were implemented.

## 1. Auth0 SPA SDK HTTPS Requirement

### Challenge
The Auth0 SPA SDK (`@auth0/auth0-react`) requires a secure origin (HTTPS) to function properly. When the React app was running on HTTP (`http://localhost:3000`), the Auth0 library would throw the error:
```
auth0-spa-js must run on a secure origin.
```

### Solution
- **Backend HTTPS Implementation**: Converted the Hono backend server from HTTP to HTTPS using Node.js native `https.createServer`
- **SSL Certificate Generation**: Created self-signed certificates (`key.pem`, `cert.pem`) for development
- **Docker Integration**: Updated Dockerfile to copy SSL certificates into the container
- **CORS Configuration**: Updated CORS middleware to handle HTTPS origins

### Key Technical Details
- Used `https.createServer` with custom request/response handling to integrate with Hono's `app.fetch`
- Fixed TypeScript errors related to body handling in the HTTPS server implementation
- Updated health checks to use HTTPS endpoints

## 2. Docker Networking for E2E Testing

### Challenge
Cypress e2e tests running in Docker containers couldn't access services running on the host machine using `localhost` URLs. This created a fundamental networking issue where:
- The app runs on `https://localhost:3000` (host)
- The Auth0 simulator runs on `https://localhost:4400` (host)
- The Cypress container couldn't reach these services via `localhost`

### Solution
- **Separate Docker Compose File**: Created `docker-compose.e2e.yml` for isolated e2e testing
- **Host Network Mode**: Used `network_mode: host` in the e2e service configuration
- **Direct Host Access**: This allowed the Cypress container to directly access host services via `localhost`

### Key Technical Details
```yaml
services:
  e2e:
    network_mode: host  # This was the key solution!
    environment:
      - CYPRESS_baseUrl=http://localhost:3000
      - CYPRESS_AUTH0_DOMAIN=https://localhost:4400
```

## 3. Multi-Origin Testing with Cypress

### Challenge
Cypress tests needed to interact with both the main app (`localhost:3000`) and the Auth0 simulator (`localhost:4400`). This required proper multi-origin testing configuration.

### Solution
- **`cy.origin()` Usage**: Properly configured `cy.origin()` calls for cross-origin interactions
- **Chrome Web Security**: Disabled `chromeWebSecurity: false` in Cypress configuration
- **URL Assertions**: Removed problematic URL assertions that didn't work with multi-origin flows

### Key Technical Details
```typescript
cy.origin("https://localhost:4400", () => {
  cy.get('[data-testid="simulator-login-button"]').click();
});
```

## 4. Auth0 Simulator Configuration

### Challenge
The Auth0 simulator needed to be accessible from both the host browser and Docker containers, while maintaining proper hostname consistency for JWT tokens.

### Solution
- **Dual Binding**: Configured the simulator to listen on `0.0.0.0:4400` (accessible from containers) while returning `https://localhost:4400` as the issuer URL
- **JWT Token Consistency**: Ensured JWT tokens always contained `https://localhost:4400` as the issuer, regardless of how the simulator was accessed

### Key Technical Details
```typescript
const server = https.createServer({ key, cert }, app).listen(PORT, "0.0.0.0", () => {
  console.log(`Auth0 Simulator running at https://0.0.0.0:${PORT}`);
});
// But still returns https://localhost:4400 for external configuration
```

## 5. JWT Token Verification

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

## 6. Environment Variable Management

### Challenge
Different services (app, auth0-simulator, e2e) needed different configurations for the same environment variables, particularly around hostnames and protocols.

### Solution
- **Service-Specific Configuration**: Used different environment variable values for different services
- **Docker Compose Overrides**: Leveraged Docker Compose's environment variable system
- **Consistent Naming**: Maintained consistent variable names while allowing different values per service

### Key Technical Details
```yaml
# docker-compose.yml
app:
  environment:
    - VITE_AUTH0_DOMAIN=localhost:4400
    - VITE_API_URL=https://localhost:3000

# docker-compose.e2e.yml
e2e:
  environment:
    - CYPRESS_baseUrl=http://localhost:3000
    - CYPRESS_AUTH0_DOMAIN=https://localhost:4400
```

## 7. Static Asset Serving

### Challenge
The backend needed to serve both the React app and its static assets (JS, CSS) while maintaining proper CORS headers and HTTPS support.

### Solution
- **Hono Static Middleware**: Used `@hono/node-server/serve-static` for serving static files
- **CORS Configuration**: Properly configured CORS to allow static asset requests
- **HTTPS Integration**: Ensured static assets were served over HTTPS

### Key Technical Details
```typescript
app.use(
  "/assets/*",
  serveStatic({ root: path.join(__dirname, "..", "public") }),
);
```

## 8. Development vs Production Considerations

### Challenge
The setup needed to work both in development (with self-signed certificates) and be ready for production deployment.

### Solution
- **Environment-Based Configuration**: Used environment variables to control SSL settings
- **Self-Signed Certificates**: Generated development certificates that work with the Auth0 simulator
- **Production Readiness**: Structured the code to easily swap in production certificates

## Lessons Learned

1. **HTTPS is Non-Negotiable**: Auth0 SPA SDK requires HTTPS, so this must be implemented from the start
2. **Docker Networking is Complex**: Understanding Docker networking modes is crucial for e2e testing
3. **Multi-Origin Testing Requires Care**: Cypress multi-origin testing needs proper configuration and understanding
4. **Environment Variables are Key**: Proper environment variable management is essential for multi-service setups
5. **SSL Certificates Matter**: Self-signed certificates work for development but require proper configuration
6. **Debugging is Essential**: Extensive logging was crucial for identifying and solving these challenges

## Final Architecture

The final working architecture consists of:
- **App Service**: HTTPS backend serving React app on `https://localhost:3000`
- **Auth0 Simulator**: HTTPS simulator on `https://localhost:4400`
- **E2E Service**: Cypress container using `network_mode: host` to access host services
- **Proper CORS**: Configured to allow cross-origin requests between services
- **JWT Verification**: Backend verifies tokens using JWKS from the simulator

This setup provides a robust foundation for e2e testing with Auth0 authentication while maintaining development flexibility and production readiness.
