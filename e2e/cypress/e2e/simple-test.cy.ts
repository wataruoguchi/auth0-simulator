describe("Simple Test", () => {
  it("should visit the page and check for errors", () => {
    cy.visit("/");
    
    // Wait for page to load
    cy.wait(3000);
    
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
    
    // Check for any script tags and their sources
    cy.get("script").then(($scripts) => {
      console.log("Number of script tags:", $scripts.length);
      $scripts.each((index, script) => {
        if (script.src) {
          console.log(`Script ${index}: ${script.src}`);
        } else {
          console.log(`Script ${index}: inline script`);
        }
      });
    });
    
    // Check for any error messages in the page
    cy.get("body").then(($body) => {
      const bodyText = $body.text();
      console.log("Body text content:", bodyText);
      
      if (bodyText.includes("error") || bodyText.includes("Error")) {
        console.log("❌ Found error text in body");
      }
    });
    
    // Take a screenshot
    cy.screenshot("simple-test");
  });
});
