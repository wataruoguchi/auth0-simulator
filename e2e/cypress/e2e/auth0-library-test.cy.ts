describe("Auth0 Library Test", () => {
  it("should check if Auth0 library is working", () => {
    cy.visit("/");

    // Wait for page to load
    cy.wait(2000);

    // Check if login button exists and is clickable
    cy.get('[data-testid="login-button"]').should("exist").and("be.visible").and("be.enabled");

    // Click the login button to test Auth0 integration
    cy.get('[data-testid="login-button"]').click();

    // Wait for redirect to Auth0 simulator
    cy.url().should("include", "localhost:4400");
  });
});
