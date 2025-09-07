// Test script to simulate the authentication flow
const https = require('https');

// Test the JWKS endpoint
console.log('🔍 Testing JWKS endpoint...');
https.get('https://localhost:4400/.well-known/jwks.json', { rejectUnauthorized: false }, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('JWKS Response:', JSON.parse(data));
    
    // Test the OpenID Connect Discovery endpoint
    console.log('\n🔍 Testing OpenID Connect Discovery...');
    https.get('https://localhost:4400/.well-known/openid_configuration', { rejectUnauthorized: false }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log('OpenID Config Response:', JSON.parse(data));
        
        // Test the app
        console.log('\n🔍 Testing app...');
        const http = require('http');
        http.get('http://localhost:3000/', (res) => {
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => {
            console.log('App Response (first 200 chars):', data.substring(0, 200));
            console.log('App contains login button:', data.includes('data-testid="login-button"'));
          });
        });
      });
    });
  });
});
