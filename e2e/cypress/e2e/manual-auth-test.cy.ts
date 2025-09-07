describe("Manual Auth Test", () => {
  it("should test the manual authentication flow", () => {
    // Visit the app
    cy.visit("/");
    
    // Wait for the app to load
    cy.wait(5000);
    
    // Check if the login button is visible
    cy.get('[data-testid="login-button"]').should('be.visible');
    
    // Click the login button
    cy.get('[data-testid="login-button"]').click();
    
    // Wait for redirect to Auth0 simulator
    cy.url().should('include', 'localhost:4400');
    
    // Handle the Auth0 simulator page
    cy.origin('https://localhost:4400', () => {
      // Fill in the login form
      cy.get('input[name="email"]').type('test@example.com');
      cy.get('input[name="password"]').type('password123');
      cy.get('button[type="submit"]').click();
    });
    
    // Wait for redirect back to the app with code
    cy.url().should('include', 'code=');
    cy.url().should('include', 'state=');
    
    // Wait for the Auth0 library to process the callback
    cy.wait(5000);
    
    // Check if we're logged in (logout button should be visible)
    cy.get('[data-testid="logout-button"]').should('be.visible');
  });
});
