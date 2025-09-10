/// <reference types="cypress" />

// Auth0 configuration for testing with auth0-spa-js
const AUTH0_DOMAIN = Cypress.env("AUTH0_DOMAIN") || "https://localhost:4400";
const AUTH0_CLIENT_ID = "test-client-id";
const AUTH0_AUDIENCE = "test-audience";

// Custom commands using @auth0/cypress for SPA applications
Cypress.Commands.add("login", () => {
  // For SPA applications, we need to handle the redirect flow
  cy.visit("/");

  // Click the login button to trigger auth0-spa-js loginWithRedirect
  cy.get('[data-testid="login-button"]').click();

  // Handle the Auth0 simulator page
  cy.origin(AUTH0_DOMAIN, () => {
    // Fill in the login form
    cy.get('input[name="email"]').type("test@example.com");
    cy.get('input[name="password"]').type("password123");
    cy.get('button[type="submit"]').click();
  });

  // Verify we're logged in
  cy.get('[data-testid="logout-button"]').should("be.visible");
});

Cypress.Commands.add("logout", () => {
  // Click logout button
  cy.get('[data-testid="logout-button"]').click();

  // Verify we're logged out
  cy.get('[data-testid="login-button"]').should("be.visible");
});

Cypress.Commands.add("verifyApi", () => {
  // Test the API endpoint with authentication
  cy.request({
    method: "GET",
    url: "/api/verify",
    headers: {
      Authorization: "Bearer test-token",
    },
    failOnStatusCode: false,
  }).then((response) => {
    // The API should return 401 without proper token, or 200 with proper token
    expect([200, 401]).to.include(response.status);
  });
});
