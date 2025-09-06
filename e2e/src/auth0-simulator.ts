// Working Auth0 simulator for testing with HTTPS support
import express from 'express'
import fs from 'fs'
import https from 'https'
import path from 'path'

const app = express()
const PORT = 4400

// Middleware
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

// Mock Auth0 endpoints
app.get('/.well-known/openid_configuration', (req, res) => {
  res.json({
    issuer: `https://localhost:${PORT}`,
    authorization_endpoint: `https://localhost:${PORT}/authorize`,
    token_endpoint: `https://localhost:${PORT}/oauth/token`,
    userinfo_endpoint: `https://localhost:${PORT}/userinfo`,
    jwks_uri: `https://localhost:${PORT}/.well-known/jwks.json`,
  })
})

app.get('/.well-known/jwks.json', (req, res) => {
  res.json({
    keys: [
      {
        kty: 'RSA',
        kid: 'test-key-id',
        use: 'sig',
        alg: 'RS256',
        n: 'test-n-value',
        e: 'AQAB'
      }
    ]
  })
})

app.get('/authorize', (req, res) => {
  // Mock OAuth authorization - show a simple login form
  const redirectUri = req.query.redirect_uri || 'http://localhost:3000'
  const state = req.query.state || ''
  const code = 'test-authorization-code'

  // Return a simple HTML form for login
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Mock Auth0 Login</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 50px; }
        .container { max-width: 400px; margin: 0 auto; }
        button { padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; }
        button:hover { background: #0056b3; }
      </style>
    </head>
    <body>
      <div class="container">
        <h2>Mock Auth0 Login</h2>
        <p>Click the button below to simulate a successful login:</p>
        <button onclick="window.location.href='${redirectUri}?code=${code}&state=${state}'">
          Login as Test User
        </button>
      </div>
    </body>
    </html>
  `)
})

        app.post('/oauth/token', (req, res) => {
          // Create a proper JWT token using jsonwebtoken
          const jwt = require('jsonwebtoken')

          const payload = {
            "iss": `https://localhost:${PORT}`,
            "sub": "test-user-id",
            "aud": "test-client-id",
            "exp": Math.floor(Date.now() / 1000) + 3600,
            "iat": Math.floor(Date.now() / 1000),
            "nonce": "test-nonce",
            "name": "Test User",
            "email": "test@example.com",
            "email_verified": true,
            "given_name": "Test",
            "family_name": "User",
            "nickname": "testuser",
            "picture": "https://example.com/avatar.jpg"
          }

          // Create a JWT token with a simple secret (not cryptographically secure, but valid JWT format)
          const secret = 'test-secret-key'
          const idToken = jwt.sign(payload, secret, { algorithm: 'HS256' })

          // Mock token endpoint
          res.json({
            access_token: 'mock-access-token',
            id_token: idToken,
            token_type: 'Bearer',
            expires_in: 3600,
            scope: 'openid profile email offline_access',
            refresh_token: 'mock-refresh-token'
          })
        })

app.get('/userinfo', (req, res) => {
  // Mock userinfo endpoint
  res.json({
    sub: 'test-user-id',
    name: 'Test User',
    email: 'test@example.com',
    email_verified: true
  })
})

// Generate self-signed certificate for HTTPS
const generateSelfSignedCert = () => {
  const { execSync } = require('child_process')
  const certDir = path.join(__dirname, '..', 'certs')
  
  // Create certs directory if it doesn't exist
  if (!fs.existsSync(certDir)) {
    fs.mkdirSync(certDir, { recursive: true })
  }
  
  const keyPath = path.join(certDir, 'key.pem')
  const certPath = path.join(certDir, 'cert.pem')
  
  // Generate self-signed certificate if it doesn't exist
  if (!fs.existsSync(keyPath) || !fs.existsSync(certPath)) {
    try {
      execSync(`openssl req -x509 -newkey rsa:4096 -keyout "${keyPath}" -out "${certPath}" -days 365 -nodes -subj "/C=US/ST=Test/L=Test/O=Test/CN=localhost"`, { stdio: 'inherit' })
    } catch (error) {
      console.warn('Could not generate self-signed certificate, falling back to HTTP')
      return null
    }
  }
  
  return {
    key: fs.readFileSync(keyPath),
    cert: fs.readFileSync(certPath)
  }
}

export const startAuth0Simulator = async () => {
  return new Promise((resolve) => {
    const cert = generateSelfSignedCert()
    
    if (cert) {
      // Start HTTPS server
      const server = https.createServer(cert, app).listen(PORT, () => {
        console.log(`Mock Auth0 Simulator running at https://localhost:${PORT}`)
        resolve(`https://localhost:${PORT}`)
      })
      
      // Store server reference for cleanup
      process.on('SIGINT', () => {
        server.close()
        process.exit(0)
      })
    } else {
      // Fallback to HTTP server
      const server = app.listen(PORT, () => {
        console.log(`Mock Auth0 Simulator running at http://localhost:${PORT}`)
        resolve(`http://localhost:${PORT}`)
      })
      
      // Store server reference for cleanup
      process.on('SIGINT', () => {
        server.close()
        process.exit(0)
      })
    }
  })
}

export const stopAuth0Simulator = async () => {
  console.log('Mock Auth0 Simulator stopped')
}
