describe("Timing Test", () => {
  it("should wait longer for React app to load", () => {
    cy.visit("/");
    
    // Wait much longer for the React app to load
    cy.wait(10000);
    
    // Check if the login button appears after waiting
    cy.get("body").then(($body) => {
      const bodyHtml = $body.html();
      console.log("Body HTML after 10 seconds:", bodyHtml);
      
      if (bodyHtml.includes("data-testid=\"login-button\"")) {
        console.log("✅ Login button found after waiting!");
      } else {
        console.log("❌ Login button still not found");
      }
    });
    
    // Try to find the login button
    cy.get("[data-testid=\"login-button\"]").should("exist");
  });
});
