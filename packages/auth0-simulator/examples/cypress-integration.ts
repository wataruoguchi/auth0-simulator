/**
 * Cypress Integration Example
 *
 * This example shows how to integrate the Auth0 Simulator with Cypress E2E tests.
 */

import {
  createAuthConfig,
  startAuth0Simulator,
} from "@wataruoguchi/auth0-simulator";

// Global variable to store the simulator instance
let auth0Simulator: any;

/**
 * Setup function to run before all tests
 */
export async function setupAuth0Simulator() {
  console.log("🧪 Setting up Auth0 Simulator for Cypress tests...");

  const authConfig = createAuthConfig(4400);

  auth0Simulator = await startAuth0Simulator();

  console.log("✅ Auth0 Simulator ready for Cypress tests");
  return auth0Simulator;
}

/**
 * Teardown function to run after all tests
 */
export async function teardownAuth0Simulator() {
  if (auth0Simulator) {
    console.log("🛑 Shutting down Auth0 Simulator...");
    auth0Simulator.close();
  }
}

/**
 * Cypress configuration example
 */
export const cypressConfig = {
  e2e: {
    baseUrl: "http://localhost:3000",
    supportFile: "cypress/support/e2e.ts",
    setupNodeEvents(on: any, config: any) {
      on("task", {
        async setupAuth0() {
          await setupAuth0Simulator();
          return null;
        },
        async teardownAuth0() {
          await teardownAuth0Simulator();
          return null;
        },
      });
    },
  },
  env: {
    AUTH0_DOMAIN: "https://localhost:4400",
  },
};

/**
 * Example Cypress test commands
 */
export const cypressCommands = `
// cypress/support/commands.ts

declare global {
  namespace Cypress {
    interface Chainable {
      loginWithAuth0(email: string, password: string): Chainable<void>;
      logoutFromAuth0(): Chainable<void>;
      verifyUserProfile(): Chainable<void>;
    }
  }
}

Cypress.Commands.add('loginWithAuth0', (email: string, password: string) => {
  cy.visit('/');
  cy.get('[data-testid="login-button"]').click();
  
  cy.origin(Cypress.env('AUTH0_DOMAIN'), { args: { email, password } }, ({ email, password }) => {
    cy.get('input[name="email"]').type(email);
    cy.get('input[name="password"]').type(password);
    cy.get('button[type="submit"]').click();
  });
});

Cypress.Commands.add('logoutFromAuth0', () => {
  cy.get('[data-testid="logout-button"]').click();
});

Cypress.Commands.add('verifyUserProfile', () => {
  cy.get('[data-testid="user-profile"]').should('be.visible');
  cy.get('[data-testid="user-email"]').should('contain', '@');
});
`;

/**
 * Example test file
 */
export const exampleTest = `
// cypress/e2e/auth.cy.ts

describe('Authentication with Auth0 Simulator', () => {
  beforeEach(() => {
    cy.task('setupAuth0');
  });

  afterEach(() => {
    cy.task('teardownAuth0');
  });

  it('should login and display user profile', () => {
    cy.loginWithAuth0('test@example.com', 'password123');
    cy.verifyUserProfile();
  });

  it('should logout successfully', () => {
    cy.loginWithAuth0('test@example.com', 'password123');
    cy.verifyUserProfile();
    cy.logoutFromAuth0();
    cy.get('[data-testid="login-button"]').should('be.visible');
  });

  it('should handle API calls with authentication', () => {
    cy.loginWithAuth0('test@example.com', 'password123');
    
    // Test API call with authentication
    cy.window().then((win) => {
      return win.fetch('/api/protected', {
        headers: {
          'Authorization': \`Bearer \${win.localStorage.getItem('access_token')}\`
        }
      });
    }).then((response) => {
      expect(response.status).to.eq(200);
    });
  });
});
`;
