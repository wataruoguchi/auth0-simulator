/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable {
    /**
     * Custom command to login with Auth0 simulator
     * @example cy.login()
     */
    login(): Chainable<void>
    
    /**
     * Custom command to logout
     * @example cy.logout()
     */
    logout(): Chainable<void>
    
    /**
     * Custom command to verify API endpoint
     * @example cy.verifyApi()
     */
    verifyApi(): Chainable<void>
  }
}
