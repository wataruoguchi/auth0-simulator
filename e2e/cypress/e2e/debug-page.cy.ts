describe("Debug Page Rendering", () => {
  it("should visit the page and take a screenshot", () => {
    cy.visit("/");
    
    // Wait a bit for the page to load
    cy.wait(3000);
    
    // Take a screenshot to see what's rendered
    cy.screenshot("debug-page-rendering");
    
    // Log the page content
    cy.get("body").then(($body) => {
      console.log("Body HTML:", $body.html());
    });
    
    // Check if the root div has any content
    cy.get("#root").then(($root) => {
      console.log("Root div HTML:", $root.html());
      console.log("Root div text:", $root.text());
    });
    
    // Check for any JavaScript errors in console
    cy.window().then((win) => {
      // Override console.error to catch errors
      const originalError = win.console.error;
      win.console.error = (...args) => {
        console.log("JavaScript Error:", ...args);
        originalError.apply(win.console, args);
      };
    });
  });
});
