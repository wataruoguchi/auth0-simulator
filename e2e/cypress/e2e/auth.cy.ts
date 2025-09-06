describe('Authentication Flow', () => {
  beforeEach(() => {
    // Visit the app before each test
    cy.visit('/')
  })

  it('should display login button when not authenticated', () => {
    // Check if login button is visible
    cy.get('[data-testid="login-button"]').should('be.visible')
    
    // Check if logout button is not visible
    cy.get('[data-testid="logout-button"]').should('not.exist')
  })

  it('should login successfully with Auth0 simulator', () => {
    // Click login button
    cy.get('[data-testid="login-button"]').click()
    
    // Wait for redirect back to the app (Auth0 simulator redirects immediately)
    cy.url().should('include', '/')
    
    // Wait longer for the Auth0 library to process the callback
    cy.wait(5000)
    
    // Check if logout button is now visible
    cy.get('[data-testid="logout-button"]').should('be.visible')
    
    // Check if login button is not visible
    cy.get('[data-testid="login-button"]').should('not.exist')
  })

  it('should display user profile when authenticated', () => {
    // Login first
    cy.login()
    
    // Check if profile information is displayed
    cy.get('[data-testid="profile"]').should('be.visible')
    cy.get('[data-testid="user-email"]').should('contain', 'test@example.com')
  })

  it('should verify API endpoint with authentication', () => {
    // Login first
    cy.login()
    
    // Test the verification button
    cy.get('[data-testid="verify-button"]').click()
    
    // Check if verification result is displayed
    cy.get('[data-testid="verification-result"]').should('be.visible')
  })
})
