describe("Email Capture in ID Token", () => {
  it("should capture custom email in ID token", () => {
    // Visit the app
    cy.visit("http://localhost:3000");

    // Click login button
    cy.get('[data-testid="login-button"]').click();

    // Handle the Auth0 simulator page with cy.origin
    cy.origin(Cypress.env("AUTH0_DOMAIN") || "https://localhost:4400", () => {
      // Change the email to a custom value
      cy.get('input[name="email"]').clear().type("custom@test.com");
      cy.get('input[name="password"]').clear().type("mypassword");

      // Click the login button on the Auth0 simulator page
      cy.get('[data-testid="simulator-login-button"]').click();
    });

    // Wait for authentication to complete
    cy.get('[data-testid="logout-button"]').should("be.visible");

    // Check if the custom email is displayed in the profile
    cy.get('[data-testid="user-email"]').should("contain", "custom@test.com");
  });

  it("should capture another custom email in ID token", () => {
    // Visit the app
    cy.visit("http://localhost:3000");

    // Click login button
    cy.get('[data-testid="login-button"]').click();

    // Handle the Auth0 simulator page with cy.origin
    cy.origin(Cypress.env("AUTH0_DOMAIN") || "https://localhost:4400", () => {
      // Change the email to a different custom value
      cy.get('input[name="email"]').clear().type("admin@company.com");
      cy.get('input[name="password"]').clear().type("admin123");

      // Click the login button on the Auth0 simulator page
      cy.get('[data-testid="simulator-login-button"]').click();
    });

    // Wait for authentication to complete
    cy.get('[data-testid="logout-button"]').should("be.visible");

    // Check if the custom email is displayed in the profile
    cy.get('[data-testid="user-email"]').should("contain", "admin@company.com");
  });
});
