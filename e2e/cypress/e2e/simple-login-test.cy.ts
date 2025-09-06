describe('Simple Login Test', () => {
  it('should test login button click', () => {
    cy.visit('/')
    
    // Wait for page to load
    cy.wait(2000)
    
    // Check if login button exists and is visible
    cy.get('[data-testid="login-button"]').should('exist').and('be.visible')
    
    // Log initial URL
    cy.url().then((url) => {
      console.log('Initial URL:', url)
    })
    
    // Click login button
    cy.get('[data-testid="login-button"]').click()
    
    // Wait for redirect to Auth0 simulator
    cy.url().should('include', 'localhost:4400')
    
    // Handle the Auth0 simulator page with cy.origin
    cy.origin('https://localhost:4400', () => {
      // Log URL in Auth0 simulator
      cy.url().then((url) => {
        console.log('URL in Auth0 simulator:', url)
      })
      
      // Check if we're on Auth0 simulator page
      cy.get('body').then(() => {
        console.log('Page title in Auth0 simulator:', Cypress.$('title').text())
        console.log('Page content contains Auth0:', Cypress.$('body').text().includes('Auth0'))
      })
      
      // Click the login button
      cy.get('button').contains('Login as Test User').click()
    })
    
    // Wait for redirect back to the app
    cy.url().should('not.include', 'localhost:4400')
    
    // Log final URL
    cy.url().then((url) => {
      console.log('Final URL:', url)
    })
    
    // Check if we're back and authenticated
    cy.get('[data-testid="logout-button"]').should('be.visible')
  })
})
