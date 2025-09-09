/**
 * Auth0 Simulator - A complete OAuth2/OpenID Connect simulator for testing
 *
 * This package provides a full-featured Auth0 simulator that can be used for:
 * - E2E testing with Cypress or other testing frameworks
 * - Local development without requiring Auth0 setup
 * - OAuth2/OpenID Connect flow simulation
 * - JWT token generation and verification
 * - User data capture and retrieval
 */

// Main simulator functionality
export { startAuth0Simulator } from "./auth0-simulator.js";

// Core authentication handlers
export {
  InMemoryUserStore,
  createAuthConfig,
  getUserInfo,
  processLogin,
  processTokenExchange,
  type AuthConfig,
  type UserData,
  type UserStore,
} from "./auth-handlers.js";

// JWT utilities
export {
  createMockUser,
  decodeToken,
  generateToken,
  type MockUser as JwtMockUser,
} from "./jwt-utils.js";

// Certificate utilities
export {
  createJWKS,
  generateSelfSignedCert,
  getRSAKeyPair,
  pemToJwk,
} from "./cert-utils.js";

// Note: Types are already exported above from their respective modules

// Re-export Hono types that users might need
export type { Context } from "hono";
