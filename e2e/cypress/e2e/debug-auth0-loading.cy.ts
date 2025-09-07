describe("Debug Auth0 Loading", () => {
  it("should check if Auth0 library loads and shows errors", () => {
    cy.visit("/");
    
    // Wait for page to load
    cy.wait(3000);
    
    // Check if there are any console errors
    cy.window().then((win) => {
      // Log any console errors
      const consoleErrors: string[] = [];
      const originalError = win.console.error;
      win.console.error = (...args) => {
        consoleErrors.push(args.join(' '));
        originalError.apply(win.console, args);
      };
      
      // Wait a bit more for any async errors
      cy.wait(2000).then(() => {
        if (consoleErrors.length > 0) {
          console.log("Console errors found:", consoleErrors);
        } else {
          console.log("No console errors found");
        }
      });
    });
    
    // Check if the root div has any content
    cy.get('#root').should('not.be.empty');
    
    // Check if there are any React components rendered
    cy.get('body').then(($body) => {
      const html = $body.html();
      console.log("Body HTML:", html);
      
      // Check if Auth0 components are in the DOM but hidden
      if (html.includes('data-testid="login-button"')) {
        console.log("Login button found in HTML but not visible");
      } else {
        console.log("Login button not found in HTML");
      }
    });
    
    // Check if there are any network requests to Auth0
    cy.intercept('GET', '**/.well-known/openid_configuration').as('auth0Config');
    cy.intercept('POST', '**/oauth/token').as('auth0Token');
    
    // Wait for any Auth0 requests
    cy.wait(5000);
  });
});
