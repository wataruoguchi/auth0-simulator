describe("Console Debug", () => {
  it("should check for JavaScript errors in console", () => {
    // Capture console errors
    const errors: string[] = [];
    const warnings: string[] = [];
    
    cy.visit("/", {
      onBeforeLoad: (win) => {
        // Override console methods to capture errors
        win.console.error = (...args) => {
          errors.push(args.join(' '));
          console.log("🚨 CONSOLE ERROR:", ...args);
        };
        
        win.console.warn = (...args) => {
          warnings.push(args.join(' '));
          console.log("⚠️ CONSOLE WARNING:", ...args);
        };
        
        // Also capture unhandled errors
        win.addEventListener('error', (event) => {
          errors.push(`Unhandled Error: ${event.error?.message || event.message}`);
          console.log("🚨 UNHANDLED ERROR:", event.error?.message || event.message);
        });
        
        win.addEventListener('unhandledrejection', (event) => {
          errors.push(`Unhandled Promise Rejection: ${event.reason}`);
          console.log("🚨 UNHANDLED PROMISE REJECTION:", event.reason);
        });
      }
    });
    
    // Wait for the page to load
    cy.wait(5000);
    
    // Check what's in the root div
    cy.get("#root").then(($root) => {
      const html = $root.html();
      console.log("Root div HTML:", html);
      
      if (html.trim() === "") {
        console.log("❌ Root div is empty - React not rendering");
      } else {
        console.log("✅ Root div has content");
      }
    });
    
    // Check for any Auth0 related elements
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
    });
    
    // Wait a bit more to catch any async errors
    cy.wait(2000).then(() => {
      console.log(`Total errors captured: ${errors.length}`);
      console.log(`Total warnings captured: ${warnings.length}`);
      
      if (errors.length > 0) {
        console.log("Errors found:", errors);
      }
      
      if (warnings.length > 0) {
        console.log("Warnings found:", warnings);
      }
    });
    
    // Take a screenshot
    cy.screenshot("console-debug");
  });
});
