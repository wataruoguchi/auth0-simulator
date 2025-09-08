describe("UserInfo API Endpoint", () => {
  it("should return user info when called with valid access token", () => {
    // Visit the app
    cy.visit("http://localhost:3000");

    // Login with custom email
    cy.get('[data-testid="login-button"]').click();

    cy.origin(Cypress.env("AUTH0_DOMAIN") || "https://localhost:4400", () => {
      // Change the email to a custom value
      cy.get('input[name="email"]').clear().type("api-test@example.com");
      cy.get('input[name="password"]').clear().type("testpassword");

      // Click the login button
      cy.get('[data-testid="simulator-login-button"]').click();
    });

    // Wait for authentication to complete
    cy.get('[data-testid="logout-button"]').should("be.visible");

    // Get the access token from localStorage (Auth0 stores it there)
    cy.window().then((win) => {
      const auth0Data = win.localStorage.getItem(
        "@@auth0spajs@@::test-client-id::@@user@@",
      );
      expect(auth0Data).to.not.be.null;

      const parsed = JSON.parse(auth0Data);
      const accessToken = parsed.access_token;
      expect(accessToken).to.not.be.undefined;

      // Test the userinfo endpoint
      cy.request({
        method: "GET",
        url: "https://localhost:4400/userinfo",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property("sub");
        expect(response.body).to.have.property("email", "api-test@example.com");
        expect(response.body).to.have.property("name", "api-test");
        expect(response.body).to.have.property("given_name", "api-test");
        expect(response.body).to.have.property("family_name", "example");
        expect(response.body).to.have.property("picture");
        expect(response.body).to.have.property("aud", "test-client-id");
        expect(response.body).to.have.property(
          "iss",
          "https://localhost:4400/",
        );
        expect(response.body).to.have.property("azp", "test-client-id");
        expect(response.body).to.have.property(
          "scope",
          "openid profile email offline_access",
        );
      });
    });
  });

  it("should return 401 when called without access token", () => {
    cy.request({
      method: "GET",
      url: "https://localhost:4400/userinfo",
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(401);
      expect(response.body).to.have.property(
        "error",
        "Missing or invalid authorization header",
      );
    });
  });

  it("should return 401 when called with invalid access token", () => {
    cy.request({
      method: "GET",
      url: "https://localhost:4400/userinfo",
      headers: {
        Authorization: "Bearer invalid-token",
      },
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(401);
      expect(response.body).to.have.property("error", "Invalid access token");
    });
  });
});
