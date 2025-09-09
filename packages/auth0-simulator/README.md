# Auth0 Simulator

Auth0 simulator for E2E testing.

## 🚀 Quick Start

### Installation

```bash
npm install @wataruoguchi/auth0-simulator
```

### Basic Usage

```typescript
import { startAuth0Simulator } from '@wataruoguchi/auth0-simulator';

// Start the simulator
const server = await startAuth0Simulator({
  port: 4400,
  externalPort: 4400,
  domain: 'https://localhost:4400'
});

console.log('Auth0 Simulator running on https://localhost:4400');
```

### With Custom Configuration

```typescript
import { startAuth0Simulator, createAuthConfig } from '@wataruoguchi/auth0-simulator';

const authConfig = createAuthConfig(4400, {
  clientId: 'my-custom-client',
  audience: 'my-api',
  issuer: 'https://my-auth0-simulator.com'
});

const server = await startAuth0Simulator({
  port: 4400,
  externalPort: 4400,
  domain: 'https://localhost:4400',
  authConfig
});
```

## 🧪 E2E Testing with Cypress

### Setup

```typescript
// cypress/support/commands.ts
import { startAuth0Simulator } from '@wataruoguchi/auth0-simulator';

let auth0Simulator: any;

before(() => {
  // Start Auth0 simulator before tests
  auth0Simulator = await startAuth0Simulator({
    port: 4400,
    externalPort: 4400
  });
});

after(() => {
  // Clean up after tests
  if (auth0Simulator) {
    auth0Simulator.close();
  }
});
```

### Test Example

```typescript
// cypress/e2e/auth.cy.ts
describe('Authentication Flow', () => {
  it('should login with Auth0 simulator', () => {
    cy.visit('/');
    
    // Click login button
    cy.get('[data-testid="login-button"]').click();
    
    // Auth0 simulator will redirect to login form
    cy.origin('https://localhost:4400', () => {
      cy.get('input[name="email"]').type('test@example.com');
      cy.get('input[name="password"]').type('password123');
      cy.get('button[type="submit"]').click();
    });
    
    // Verify user is logged in
    cy.get('[data-testid="user-profile"]').should('contain', 'test@example.com');
  });
});
```

## 🔧 API Reference

### Core Functions

#### `startAuth0Simulator(options)`

Starts the Auth0 simulator server.

**Parameters:**

- `options.port` (number): Internal port for the server
- `options.externalPort` (number): External port for JWT issuer
- `options.domain` (string): Base domain for the simulator
- `options.authConfig` (AuthConfig, optional): Custom authentication configuration

**Returns:** Promise<Server> - The running server instance

#### `createAuthConfig(port, options?)`

Creates an authentication configuration object.

**Parameters:**

- `port` (number): Port number for the configuration
- `options` (object, optional): Custom configuration options

**Returns:** AuthConfig - Configuration object

### User Data Management

#### `InMemoryUserStore`

In-memory user store for managing user data.

```typescript
import { InMemoryUserStore, createMockUser } from '@wataruoguchi/auth0-simulator';

const userStore = new InMemoryUserStore();

// Store a user
const user = createMockUser('https://localhost:4400/');
user.email = 'user@example.com';
user.name = 'Test User';
userStore.storeUser(user);

// Retrieve a user
const retrievedUser = userStore.getUserBySub('user-user-example-com');
```

### JWT Utilities

#### `generateAccessToken(user, options)`

Generates a JWT access token.

#### `generateIdToken(user, options)`

Generates a JWT ID token.

#### `decodeToken(token)`

Decodes a JWT token without verification.

## 🌐 Endpoints

The simulator provides the following endpoints:

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/` | GET | Health check |
| `/authorize` | GET | OAuth2 authorization endpoint |
| `/login` | POST | Login form processing |
| `/oauth/token` | POST | Token exchange |
| `/userinfo` | GET | Standard OAuth2 userinfo |
| `/api/e2e/fetch_email_by_sub` | GET | **E2E testing endpoint** |
| `/.well-known/openid_configuration` | GET | OpenID Connect discovery |
| `/.well-known/jwks.json` | GET | JSON Web Key Set |
| `/v2/logout` | GET | Logout endpoint |

## 🔐 Security Features

- **JWT Signature Verification**: All tokens are properly signed with RSA keys
- **JWKS Endpoint**: Provides public keys for token verification
- **HTTPS Support**: Self-signed certificates for secure communication
- **Token Validation**: Access tokens are verified before user data access
- **Secure Defaults**: Sensible security configurations out of the box

## 📊 User Data Capture

The simulator automatically captures user data from login forms:

```typescript
// User enters: test@example.com / password123
// Simulator generates: sub = "user-test-example-com"
// Stores: { email: "test@example.com", name: "test", ... }
```

## 🛠️ Configuration Options

### Environment Variables

- `PORT`: Server port (default: 4400)
- `EXTERNAL_PORT`: External port for JWT issuer (default: 4400)
- `NODE_TLS_REJECT_UNAUTHORIZED`: SSL verification (default: "0" for self-signed certs)

### Custom Configuration

```typescript
const authConfig = createAuthConfig(4400, {
  clientId: 'my-client-id',
  audience: 'my-api-audience',
  issuer: 'https://my-domain.com',
  userStore: new CustomUserStore()
});
```

## 🧪 Testing

```bash
# Run unit tests
npm test

# Run tests in watch mode
npm run test:watch

# Run E2E tests with Cypress
npm run e2e

# Run E2E tests with browser visible
npm run e2e:headed
```

## 📦 Build

```bash
# Build the package
npm run build

# Development mode
npm run dev
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Hono](https://hono.dev/) - A lightweight web framework
- JWT handling with [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken)
- Testing with [Cypress](https://www.cypress.io/) and [Vitest](https://vitest.dev/)

## 📞 Support

- 📧 Email: your.email@example.com
- 🐛 Issues: [GitHub Issues](https://github.com/wataruoguchi/auth0-simulator/issues)
- 📖 Documentation: [GitHub Wiki](https://github.com/wataruoguchi/auth0-simulator/wiki)

---

Made with ❤️ for the testing community