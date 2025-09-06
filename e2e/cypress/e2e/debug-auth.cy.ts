describe('Debug Auth Flow', () => {
  it('should debug the login flow', () => {
    // Intercept network requests
    cy.intercept('GET', '**/.well-known/openid_configuration').as('openidConfig')
    cy.intercept('POST', '**/oauth/token').as('tokenRequest')
    cy.intercept('GET', '**/userinfo').as('userinfoRequest')
    
    cy.visit('/')
    
    // Wait for the page to load
    cy.wait(2000)
    
    // Check if login button is visible
    cy.get('[data-testid="login-button"]').should('be.visible')
    
    // Capture console logs
    cy.window().then((win) => {
      const consoleLogs = []
      const originalLog = win.console.log
      const originalError = win.console.error
      const originalWarn = win.console.warn
      
      win.console.log = (...args) => {
        consoleLogs.push(['log', ...args])
        originalLog.apply(win.console, args)
      }
      
      win.console.error = (...args) => {
        consoleLogs.push(['error', ...args])
        originalError.apply(win.console, args)
      }
      
      win.console.warn = (...args) => {
        consoleLogs.push(['warn', ...args])
        originalWarn.apply(win.console, args)
      }
      
      // Click login button and see what happens
      cy.get('[data-testid="login-button"]').click()
      
      // Wait for redirect to Auth0
      cy.url().should('include', 'localhost:4400')
      
      // Wait for redirect back
      cy.url().should('not.include', 'localhost:4400', { timeout: 10000 })
      
      // Wait for network requests
      cy.wait('@openidConfig')
      cy.wait('@tokenRequest')
      
      // Check what elements are visible
      cy.get('body').then(() => {
        console.log('Login button visible:', Cypress.$('[data-testid="login-button"]').length > 0)
        console.log('Logout button visible:', Cypress.$('[data-testid="logout-button"]').length > 0)
        console.log('Profile visible:', Cypress.$('[data-testid="profile"]').length > 0)
      })
      
      // Wait a bit more for any errors
      cy.wait(2000).then(() => {
        console.log('Console logs:', consoleLogs)
      })
    })
  })

  it('should check what happens when clicking login', () => {
    cy.visit('/')
    cy.wait(2000)
    
    // Check initial state
    cy.get('[data-testid="login-button"]').should('be.visible')
    cy.get('[data-testid="logout-button"]').should('not.exist')
    
    // Click login and wait for redirect
    cy.get('[data-testid="login-button"]').click()
    
    // Wait for redirect to Auth0
    cy.url().should('include', 'localhost:4400')
    
    // Wait for redirect back
    cy.url().should('not.include', 'localhost:4400', { timeout: 10000 })
    
    // Check if we're back and authenticated
    cy.get('[data-testid="logout-button"]').should('be.visible')
  })

  it('should check Auth0 configuration', () => {
    cy.visit('/')
    
    cy.window().then((win) => {
      // Check if Auth0 is configured
      cy.get('[data-testid="login-button"]').should('be.visible')
      
      // Check the Auth0 configuration
      cy.window().its('Auth0Provider').should('exist')
      
      // Check environment variables
      cy.window().then(() => {
        console.log('VITE_AUTH0_DOMAIN:', Cypress.env('VITE_AUTH0_DOMAIN'))
        console.log('VITE_AUTH0_CLIENT_ID:', Cypress.env('VITE_AUTH0_CLIENT_ID'))
        console.log('VITE_AUTH0_AUDIENCE:', Cypress.env('VITE_AUTH0_AUDIENCE'))
      })
    })
  })

  it('should test Auth0 simulator directly', () => {
    // Test the Auth0 simulator endpoints directly
    cy.request('GET', 'https://localhost:4400/.well-known/openid_configuration')
      .then((response) => {
        expect(response.status).to.eq(200)
        console.log('Auth0 config:', response.body)
      })
    
    cy.request('GET', 'https://localhost:4400/.well-known/jwks.json')
      .then((response) => {
        expect(response.status).to.eq(200)
        console.log('JWKS:', response.body)
      })
  })
})
