describe("Basic Test", () => {
  it("should check if the React app is loading", () => {
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
    
    // Take a screenshot
    cy.screenshot("basic-test");
  });
});
