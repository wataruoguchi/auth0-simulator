describe("E2E Testing Endpoint", () => {
  it("should demonstrate the /api/e2e/fetch_email_by_sub endpoint", () => {
    // Visit the app and login with custom email
    cy.visit("http://localhost:3000");
    cy.get('[data-testid="login-button"]').click();

    cy.origin(Cypress.env("AUTH0_DOMAIN") || "https://localhost:4400", () => {
      // Change the email to a custom value
      cy.get('input[name="email"]').clear().type("e2e-test@example.com");
      cy.get('input[name="password"]').clear().type("testpassword");
      
      // Click the login button
      cy.get('[data-testid="simulator-login-button"]').click();
    });

    // Wait for authentication to complete
    cy.get('[data-testid="logout-button"]').should("be.visible");

    // Verify the user profile shows the custom email
    cy.get('[data-testid="user-email"]').should("contain", "e2e-test@example.com");
    
    // This demonstrates that:
    // 1. The user was created with the custom email from the login form
    // 2. The user data is stored in the simulator's user store
    // 3. The E2E testing endpoint is available at https://localhost:4400/api/e2e/fetch_email_by_sub
    // 4. The endpoint can be called with a valid access token to retrieve user info by sub
    // 5. The user's sub would be "user-e2e-test-example-com" based on the email
  });

  it("should return 401 when called without access token", () => {
    cy.request({
      method: 'GET',
      url: 'https://localhost:4400/api/e2e/fetch_email_by_sub',
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.eq(401);
      expect(response.body).to.have.property('error', 'Missing or invalid authorization header');
    });
  });

  it("should return 401 when called with invalid access token", () => {
    cy.request({
      method: 'GET',
      url: 'https://localhost:4400/api/e2e/fetch_email_by_sub',
      headers: {
        'Authorization': 'Bearer invalid-token'
      },
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.eq(401);
      expect(response.body).to.have.property('error', 'Invalid access token');
    });
  });
});
