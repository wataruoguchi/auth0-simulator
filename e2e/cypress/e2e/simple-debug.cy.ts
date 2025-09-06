describe('Simple Debug', () => {
  it('should debug step by step', () => {
    cy.visit('/')
    
    // Wait for page to load
    cy.wait(2000)
    
    // Check if login button exists and is visible
    cy.get('[data-testid="login-button"]').should('exist').and('be.visible')
    
    // Log current URL
    cy.url().then((url) => {
      console.log('Initial URL:', url)
    })
    
    // Check if login button is clickable
    cy.get('[data-testid="login-button"]').should('be.enabled')
    
    // Log button text
    cy.get('[data-testid="login-button"]').then(($btn) => {
      console.log('Login button text:', $btn.text())
      console.log('Login button href:', $btn.attr('href'))
    })
    
    // Click login button
    cy.get('[data-testid="login-button"]').click()
    
    // Wait a bit and check URL
    cy.wait(1000)
    cy.url().then((url) => {
      console.log('URL after click:', url)
    })
  })
})
