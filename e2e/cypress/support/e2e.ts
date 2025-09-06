// ***********************************************************
// This example support/e2e.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands';

// Handle uncaught exceptions from the application
Cypress.on('uncaught:exception', (err, runnable) => {
  // Ignore Auth0 secure origin errors in tests
  if (err.message.includes('auth0-spa-js must run on a secure origin')) {
    console.log('Ignoring Auth0 secure origin error for testing');
    return false;
  }
  // Don't prevent the test from failing for other errors
  return true;
});

// Alternatively you can use CommonJS syntax:
// require('./commands')
