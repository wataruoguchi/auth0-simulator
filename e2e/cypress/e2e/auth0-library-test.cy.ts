describe('Auth0 Library Test', () => {
  it('should check if Auth0 library is working', () => {
    cy.visit('/')
    
    // Wait for page to load
    cy.wait(2000)
    
    // Check if Auth0 is loaded
    cy.window().then((win) => {
      console.log('Window object keys:', Object.keys(win))
      
      // Check if Auth0 is available
      if (win.Auth0Provider) {
        console.log('Auth0Provider found on window')
      } else {
        console.log('Auth0Provider NOT found on window')
      }
      
      // Check if useAuth0 hook is available
      if (win.React) {
        console.log('React found on window')
      } else {
        console.log('React NOT found on window')
      }
      
      // Check environment variables
      console.log('Environment variables not available in Cypress test context')
    })
    
    // Check if login button exists
    cy.get('[data-testid="login-button"]').should('exist').and('be.visible')
    
    // Check if login button is clickable
    cy.get('[data-testid="login-button"]').should('be.enabled')
    
    // Try to click the login button
    cy.get('[data-testid="login-button"]').click()
    
    // Wait a bit
    cy.wait(2000)
    
    // Check URL
    cy.url().then((url) => {
      console.log('URL after click:', url)
    })
  })
})
