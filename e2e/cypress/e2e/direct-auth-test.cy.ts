describe("Direct Auth Test", () => {
  it("should test authentication by directly visiting the simulator", () => {
    // First, visit the app to see what's there
    cy.visit("/");
    cy.wait(3000);
    
    // Check if the page loads
    cy.title().should("contain", "Vite + React + TS");
    
    // Check what's in the root div
    cy.get("#root").then(($root) => {
      const html = $root.html();
      console.log("Root div content:", html);
    });
    
    // Now try to visit the Auth0 simulator directly
    cy.visit("https://auth0-simulator:4400/authorize?client_id=test-client-id&redirect_uri=http://app:3000&state=test-state&response_type=code&scope=openid profile email&code_challenge=test-challenge&code_challenge_method=S256");
    
    // Wait for the simulator to load
    cy.wait(3000);
    
    // Use cy.origin to handle cross-origin navigation
    cy.origin("https://auth0-simulator:4400", () => {
      // Check if we can see the login form
      cy.get("body").then(($body) => {
        const bodyText = $body.text();
        console.log("Simulator body text:", bodyText);
        
        if (bodyText.includes("Auth0 Simulator Login")) {
          console.log("✅ Simulator login form found");
        } else {
          console.log("❌ Simulator login form not found");
        }
      });
      
      // Try to fill in the login form
      cy.get('input[name="email"]').type('test@example.com');
      cy.get('input[name="password"]').type('password123');
      cy.get('button[type="submit"]').click();
    });
    
    // Wait for redirect
    cy.wait(3000);
    
    // Check if we're redirected back to the app
    cy.url().then((url) => {
      console.log("URL after login:", url);
      
      if (url.includes("code=")) {
        console.log("✅ Redirected back with authorization code");
      } else {
        console.log("❌ Not redirected back with code");
      }
    });
    
    // Take a screenshot
    cy.screenshot("direct-auth-test");
  });
});
