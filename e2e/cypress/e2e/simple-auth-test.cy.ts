describe("Simple Auth Test", () => {
  it("should test authentication flow step by step", () => {
    // Visit the app
    cy.visit("/");
    
    // Wait for page to load
    cy.wait(5000);
    
    // Check if the page title is correct
    cy.title().should("contain", "Vite + React + TS");
    
    // Check if the root div exists and has content
    cy.get("#root").should("exist");
    
    // Check what's inside the root div
    cy.get("#root").then(($root) => {
      const html = $root.html();
      console.log("Root div content:", html);
      
      if (html.trim() === "") {
        console.log("❌ Root div is empty - React app not loading");
      } else {
        console.log("✅ Root div has content:", html);
      }
    });
    
    // Check if there are any buttons on the page
    cy.get("body").then(($body) => {
      const buttons = $body.find("button");
      console.log("Number of buttons found:", buttons.length);
      
      buttons.each((index, button) => {
        console.log(`Button ${index}:`, button.textContent, button.getAttribute("data-testid"));
      });
    });
    
    // Check if there are any elements with data-testid
    cy.get("body").then(($body) => {
      const testElements = $body.find("[data-testid]");
      console.log("Number of elements with data-testid:", testElements.length);
      
      testElements.each((index, element) => {
        console.log(`Element ${index}:`, element.tagName, element.getAttribute("data-testid"), element.textContent);
      });
    });
    
    // If no login button is found, try to manually trigger the auth flow
    cy.get("body").then(($body) => {
      const bodyHtml = $body.html();
      
      if (!bodyHtml.includes("data-testid=\"login-button\"")) {
        console.log("❌ Login button not found, trying to manually trigger auth flow");
        
        // Try to visit the Auth0 simulator directly
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
      } else {
        console.log("✅ Login button found, clicking it");
        cy.get("[data-testid=\"login-button\"]").click();
      }
    });
    
    // Take a screenshot
    cy.screenshot("simple-auth-test");
  });
});
