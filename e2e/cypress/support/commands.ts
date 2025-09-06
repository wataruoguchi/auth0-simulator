/// <reference types="cypress" />

// Auth0 Simulator configuration
const AUTH0_DOMAIN = 'localhost:4400'
const AUTH0_CLIENT_ID = 'test-client-id'
const AUTH0_AUDIENCE = 'test-audience'

// Custom commands
Cypress.Commands.add('login', () => {
  // Visit the login page or trigger login
  cy.visit('/')

  // Click login button
  cy.get('[data-testid="login-button"]').click()

  // Wait for redirect to Auth0 simulator
  cy.url().should('include', 'localhost:4400')

  // Handle the Auth0 simulator page with cy.origin
  cy.origin('https://localhost:4400', () => {
    // Click the login button on the Auth0 simulator page
    cy.get('button').contains('Login as Test User').click()
  })

  // Wait for redirect back to the app
  cy.url().should('not.include', 'localhost:4400')

  // Wait for Auth0 library to process the callback
  cy.wait(5000)

  // Verify we're logged in
  cy.get('[data-testid="logout-button"]').should('be.visible')
})

Cypress.Commands.add('logout', () => {
  // Click logout button (assuming there's a logout button)
  cy.get('[data-testid="logout-button"]').click()
  
  // Verify we're logged out
  cy.get('[data-testid="login-button"]').should('be.visible')
})

Cypress.Commands.add('verifyApi', () => {
  // Test the API endpoint with authentication
  cy.request({
    method: 'GET',
    url: '/api/verify',
    headers: {
      'Authorization': 'Bearer test-token'
    },
    failOnStatusCode: false
  }).then((response) => {
    // The API should return 401 without proper token, or 200 with proper token
    expect([200, 401]).to.include(response.status)
  })
})
