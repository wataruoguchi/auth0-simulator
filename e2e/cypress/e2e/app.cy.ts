describe('Application', () => {
  it('should load static assets correctly', () => {
    cy.visit('/')
    
    // Check if CSS is loaded (no specific element, just that page loads without errors)
    cy.get('body').should('be.visible')
    
    // Check if JavaScript is loaded by looking for React content
    cy.get('#root').should('be.visible')
  })

  it('should have working API endpoint', () => {
    // Test the API endpoint without authentication (should return 401)
    cy.request({
      method: 'GET',
      url: '/api/verify',
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.eq(401)
    })
  })

  it('should display all UI components', () => {
    cy.visit('/')
    
    // Check if the main React app is loaded
    cy.get('#root').should('be.visible')
    
    // Check if the page contains some expected content
    cy.get('body').should('contain.text', 'Vite + React')
  })
})
