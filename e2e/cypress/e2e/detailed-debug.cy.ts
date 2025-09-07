describe("Detailed Debug", () => {
  it("should debug the page rendering in detail", () => {
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
    
    // Check for any script tags
    cy.get("script").then(($scripts) => {
      console.log("Number of script tags:", $scripts.length);
      $scripts.each((index, script) => {
        console.log(`Script ${index}:`, script.src || "inline script");
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
    
    // Try to find any React-related elements
    cy.get("body").then(($body) => {
      const bodyHtml = $body.html();
      
      // Look for common React patterns
      if (bodyHtml.includes("data-reactroot") || bodyHtml.includes("__reactInternalInstance")) {
        console.log("✅ React appears to be loaded");
      } else {
        console.log("❌ No React indicators found");
      }
      
      // Look for Auth0 related elements
      if (bodyHtml.includes("auth0") || bodyHtml.includes("Auth0")) {
        console.log("✅ Auth0 elements found");
      } else {
        console.log("❌ No Auth0 elements found");
      }
    });
    
    // Check for any console errors
    cy.window().then((win) => {
      const originalError = win.console.error;
      const originalWarn = win.console.warn;
      
      let errorCount = 0;
      let warnCount = 0;
      
      win.console.error = (...args) => {
        errorCount++;
        console.log("🚨 Console Error:", ...args);
        originalError.apply(win.console, args);
      };
      
      win.console.warn = (...args) => {
        warnCount++;
        console.log("⚠️ Console Warning:", ...args);
        originalWarn.apply(win.console, args);
      };
      
      // Wait a bit to catch any async errors
      cy.wait(2000).then(() => {
        console.log(`Total errors: ${errorCount}, warnings: ${warnCount}`);
      });
    });
    
    // Take a final screenshot
    cy.screenshot("detailed-debug-final");
  });
});
