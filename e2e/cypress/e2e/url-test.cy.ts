describe("URL Test", () => {
  it("should check what URL Cypress is using", () => {
    // Log the current URL
    cy.url().then((url) => {
      console.log("Current URL:", url);
    });
    
    // Visit the app
    cy.visit("/");
    
    // Log the URL after visiting
    cy.url().then((url) => {
      console.log("URL after visit:", url);
    });
    
    // Wait for page to load
    cy.wait(5000);
    
    // Check if we can access the page
    cy.title().then((title) => {
      console.log("Page title:", title);
    });
    
    // Check what's in the root div
    cy.get("#root").then(($root) => {
      const html = $root.html();
      console.log("Root div content:", html);
      
      if (html.trim() === "") {
        console.log("❌ Root div is empty");
      } else {
        console.log("✅ Root div has content");
      }
    });
    
    // Check for any JavaScript errors by looking at the page content
    cy.get("body").then(($body) => {
      const bodyText = $body.text();
      console.log("Body text:", bodyText);
      
      if (bodyText.includes("error") || bodyText.includes("Error")) {
        console.log("❌ Found error text");
      }
    });
    
    // Take a screenshot
    cy.screenshot("url-test");
  });
});
