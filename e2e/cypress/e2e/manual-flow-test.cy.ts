describe("Manual Flow Test", () => {
  it("should test the manual authentication flow step by step", () => {
    // Visit the app
    cy.visit("/");
    
    // Wait for page to load
    cy.wait(5000);
    
    // Check if the page title is correct
    cy.title().should("contain", "Vite + React + TS");
    
    // Check if the root div exists
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
    
    // Check if there are any Auth0 related elements
    cy.get("body").then(($body) => {
      const bodyHtml = $body.html();
      console.log("Body HTML length:", bodyHtml.length);
      
      // Look for any text content
      const textContent = $body.text();
      console.log("Body text content:", textContent);
      
      // Check if there are any error messages
      if (textContent.includes("error") || textContent.includes("Error")) {
        console.log("❌ Found error text in page");
      }
      
      // Check if there are any Auth0 related elements
      if (bodyHtml.includes("auth0") || bodyHtml.includes("Auth0")) {
        console.log("✅ Auth0 elements found");
      } else {
        console.log("❌ No Auth0 elements found");
      }
    });
    
    // Try to find the login button by any means
    cy.get("body").then(($body) => {
      const bodyHtml = $body.html();
      
      // Look for any button elements
      const buttons = $body.find("button");
      console.log("Number of buttons found:", buttons.length);
      
      buttons.each((index, button) => {
        console.log(`Button ${index}:`, button.textContent, button.getAttribute("data-testid"));
      });
      
      // Look for any elements with data-testid
      const testElements = $body.find("[data-testid]");
      console.log("Number of elements with data-testid:", testElements.length);
      
      testElements.each((index, element) => {
        console.log(`Element ${index}:`, element.tagName, element.getAttribute("data-testid"), element.textContent);
      });
    });
    
    // Take a screenshot
    cy.screenshot("manual-flow-test");
  });
});
