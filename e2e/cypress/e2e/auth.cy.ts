/**
 * This test is a basic test to check if the authentication flow is working.
 * We should NOT use the login fixture in this test.
 */
describe("Authentication Flow", () => {
  beforeEach(() => {
    // Clear any existing authentication state
    cy.clearCookies(); // This is sufficient if we are storing the state in the cookies.
    cy.clearLocalStorage(); // This is sufficient if we are storing the state in the local storage.

    // Visit the app before each test
    cy.visit("/");
  });

  it("should display login button when not authenticated", () => {
    // Check if login button is visible
    cy.get('[data-testid="login-button"]').should("be.visible");

    // Check if logout button is not visible
    cy.get('[data-testid="logout-button"]').should("not.exist");
  });

  it("should login successfully with Auth0 simulator", () => {
    // Click login button
    cy.get('[data-testid="login-button"]').click();

    // Handle the Auth0 simulator page with cy.origin
    cy.origin("https://localhost:4400", () => {
      // Click the login button on the Auth0 simulator page
      cy.get('[data-testid="simulator-login-button"]').click();
    });

    // Check if logout button is now visible
    cy.get('[data-testid="logout-button"]').should("be.visible");

    // Check if login button is not visible
    cy.get('[data-testid="login-button"]').should("not.exist");
  });

  it("should display user profile when authenticated", () => {
    // Login first
    cy.get('[data-testid="login-button"]').click();

    // Handle the Auth0 simulator page with cy.origin
    cy.origin("https://localhost:4400", () => {
      // Click the login button on the Auth0 simulator page
      cy.get('[data-testid="simulator-login-button"]').click();
    });

    // Check if profile information is displayed
    cy.get('[data-testid="profile"]').should("be.visible");
    cy.get('[data-testid="user-email"]').should("contain", "test@example.com");
  });

  it("should verify API endpoint with authentication", () => {
    // Login first
    cy.get('[data-testid="login-button"]').click();

    // Handle the Auth0 simulator page with cy.origin
    cy.origin("https://localhost:4400", () => {
      // Click the login button on the Auth0 simulator page
      cy.get('[data-testid="simulator-login-button"]').click();
    });

    // Check verification result's initial state
    cy.get('[data-testid="verification-result"]').should("be.visible").should("not.contain", "Verified").should("contain", "Unverified");

    // Test the verification button
    cy.get('[data-testid="verify-button"]').click();

    // Check verification result's final state
    cy.get('[data-testid="verification-result"]').should("be.visible").should("contain", "Verified").should("not.contain", "Unverified");
  });

  it("should logout successfully when authenticated", () => {
    // User is not authenticated, login first then logout
    cy.get('[data-testid="login-button"]').click();

    // Handle the Auth0 simulator page with cy.origin
    cy.origin("https://localhost:4400", () => {
      cy.get('[data-testid="simulator-login-button"]').click();
    });

    // Now test logout
    cy.get('[data-testid="logout-button"]').click();

    // Check if login button is now visible
    cy.get('[data-testid="login-button"]').should("be.visible");
    cy.get('[data-testid="logout-button"]').should("not.exist");
  });
});
