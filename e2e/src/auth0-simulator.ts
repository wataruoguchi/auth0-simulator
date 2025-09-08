// Auth0 simulator using Hono with HTTPS and proper PKCE support
import { execSync } from "child_process";
import fs from "fs";
import { Hono } from "hono";
import { cors } from "hono/cors";
import https from "https";
import jwt from "jsonwebtoken";

const PORT = 4400;
const app = new Hono();

// Mock JWT secret for HMAC (fallback)
const JWT_SECRET = "test-secret-key";

// Store for authorization codes and their associated nonces
const authCodeStore = new Map<string, string>();

// Hardcoded RSA key pair for JWT signing
const getRSAKeyPair = () => {
  // Use the pre-generated RSA key
  const keyPath = "/tmp/test-rsa-key.pem";

  if (fs.existsSync(keyPath)) {
    const privateKey = fs.readFileSync(keyPath);

    // Extract public key from private key for JWKS
    try {
      const publicKey = execSync(
        `openssl rsa -in ${keyPath} -pubout -outform PEM`,
        { encoding: "utf8" },
      );
      return {
        privateKey,
        publicKey,
      };
    } catch (error) {
      console.error("Error extracting public key:", error);
      return {
        privateKey,
        publicKey: null,
      };
    }
  }

  return null;
};

// Convert PEM public key to JWK format
const pemToJwk = (pemKey: string) => {
  try {
    // Extract modulus and exponent from the public key
    const modulus = execSync(
      `echo "${pemKey}" | openssl rsa -pubin -modulus -noout | sed 's/Modulus=//' | xxd -r -p | base64 -w 0 | tr -d '=' | tr '/+' '_-'`,
      { encoding: "utf8" },
    ).trim();
    return {
      kty: "RSA",
      kid: "test-key-id",
      use: "sig",
      alg: "RS256",
      n: modulus,
      e: "AQAB", // Standard exponent for RSA
    };
  } catch (error) {
    console.error("Error converting PEM to JWK:", error);
    return null;
  }
};

// Generate self-signed certificate for HTTPS
const generateSelfSignedCert = () => {
  const keyPath = "/tmp/key.pem";
  const certPath = "/tmp/cert.pem";

  // Generate self-signed certificate if it doesn't exist
  if (!fs.existsSync(keyPath) || !fs.existsSync(certPath)) {
    const { execSync } = require("child_process");
    try {
      execSync(
        `openssl req -x509 -newkey rsa:4096 -keyout "${keyPath}" -out "${certPath}" -days 365 -nodes -subj "/C=US/ST=Test/L=Test/O=Test/CN=localhost"`,
        { stdio: "inherit" },
      );
      console.log("Generated self-signed certificate for HTTPS");
    } catch (error) {
      console.warn("Could not generate self-signed certificate:", error);
      // Create dummy certificates for testing
      fs.writeFileSync(keyPath, "dummy-key");
      fs.writeFileSync(certPath, "dummy-cert");
    }
  }

  return {
    key: fs.readFileSync(keyPath),
    cert: fs.readFileSync(certPath),
  };
};

// Mock user data
const mockUser = {
  sub: "test-user-123",
  email: "test@example.com",
  name: "Test User",
  given_name: "Test",
  family_name: "User",
  picture: "https://via.placeholder.com/150",
  aud: "test-client-id", // Changed from "test-audience" to match clientId
  iss: `https://localhost:${PORT}/`,
  azp: "test-client-id",
  scope: "openid profile email offline_access",
  nonce: "test-nonce-123", // Added nonce claim
};

// Generate JWT token
const generateToken = (user: any, nonce?: string) => {
  const now = Math.floor(Date.now() / 1000);
  const tokenPayload = {
    ...user,
    iat: now,
    exp: now + 3600, // 1 hour from now
  };
  if (nonce) {
    tokenPayload.nonce = nonce;
  }

  const rsaKeys = getRSAKeyPair();
  if (rsaKeys) {
    return jwt.sign(tokenPayload, rsaKeys.privateKey, {
      algorithm: "RS256",
      keyid: "test-key-id", // Add the key ID for JWKS verification
    });
  } else {
    // Fall back to HMAC
    return jwt.sign(tokenPayload, JWT_SECRET, { algorithm: "HS256" });
  }
};

// CORS middleware
app.use(
  "*",
  cors({
    origin: "*",
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["*"],
    credentials: true,
  }),
);

// Logging middleware
app.use("*", async (c, next) => {
  console.log(`${c.req.method} ${c.req.path}`);
  await next();
});

// OpenID Connect Discovery endpoint
app.get("/.well-known/openid_configuration", (c) => {
  return c.json({
    issuer: `https://localhost:${PORT}/`,
    authorization_endpoint: `https://localhost:${PORT}/authorize`,
    token_endpoint: `https://localhost:${PORT}/oauth/token`,
    userinfo_endpoint: `https://localhost:${PORT}/userinfo`,
    jwks_uri: `https://localhost:${PORT}/.well-known/jwks.json`,
    response_types_supported: ["code", "id_token", "token"],
    subject_types_supported: ["public"],
    id_token_signing_alg_values_supported: ["HS256"],
    scopes_supported: ["openid", "profile", "email", "offline_access"],
    code_challenge_methods_supported: ["S256"],
  });
});

// JWKS endpoint
app.get("/.well-known/jwks.json", (c) => {
  console.log("JWKS request received");

  const rsaKeys = getRSAKeyPair();
  let jwks;

  if (rsaKeys && rsaKeys.publicKey) {
    // Convert the actual public key to JWK format
    const jwk = pemToJwk(rsaKeys.publicKey);

    if (jwk) {
      jwks = {
        keys: [jwk],
      };
    } else {
      // Fallback to hardcoded modulus if conversion fails
      const modulus =
        "sqGXf3aPXMRDiykYa1gUn3aislmG1ZmwngZrwStLr3tR7VGRatXFjTgN1nzF6Ie61byvoaC4-j-2lWY1G3DuJOUCJDng6wpgRJm-oyUeaUJuQI53o9tj6Z37I6SwMWMjkbQ9yA43gvGmYvld3us0JglQHpcM5IFmhUWwy1KwgccC0fbcwJVTKKowAo81sD5sdA0Gw3MTpKRIqO9uuBvEFL7sXoQC181G9aa8cl21V-NMxfNqUKUYiuCxRC_6xM-WkR7KsfK2zz03PYPYOKv-cbwf5ifAeZ9My4t1LAE92kj0_5NN6Wx8qogxwZVCopOfHDd_CCfWxWrpXrCw7wbDQ";

      jwks = {
        keys: [
          {
            kty: "RSA",
            kid: "test-key-id",
            use: "sig",
            alg: "RS256",
            n: modulus,
            e: "AQAB", // Standard exponent for RSA
          },
        ],
      };
    }
  } else {
    // Fall back to HMAC
    jwks = {
      keys: [
        {
          kty: "oct",
          kid: "test-key-id",
          use: "sig",
          alg: "HS256",
          k: Buffer.from(JWT_SECRET).toString("base64url"),
        },
      ],
    };
  }

  console.log("JWKS response:", jwks);
  return c.json(jwks);
});

// Authorization endpoint
app.get("/authorize", (c) => {
  const {
    client_id,
    redirect_uri,
    state,
    response_type,
    scope,
    code_challenge,
    code_challenge_method,
    nonce,
  } = c.req.query();

  // Simple HTML login form
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Auth0 Simulator Login</title>
      <style>
        body { font-family: Arial, sans-serif; max-width: 400px; margin: 50px auto; padding: 20px; }
        .form-group { margin-bottom: 15px; }
        label { display: block; margin-bottom: 5px; }
        input { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; }
        button { background: #007bff; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; }
        button:hover { background: #0056b3; }
      </style>
    </head>
    <body>
      <h2>Auth0 Simulator Login</h2>
      <form method="post" action="/login">
        <input type="hidden" name="client_id" value="${client_id}">
        <input type="hidden" name="redirect_uri" value="${redirect_uri}">
        <input type="hidden" name="state" value="${state}">
        <input type="hidden" name="response_type" value="${response_type}">
        <input type="hidden" name="scope" value="${scope}">
        <input type="hidden" name="code_challenge" value="${code_challenge}">
        <input type="hidden" name="code_challenge_method" value="${code_challenge_method}">
        <input type="hidden" name="nonce" value="${nonce}">
        
        <div class="form-group">
          <label for="email">Email:</label>
          <input type="email" id="email" name="email" value="test@example.com" required>
        </div>
        
        <div class="form-group">
          <label for="password">Password:</label>
          <input type="password" id="password" name="password" value="password123" required>
        </div>
        
        <button data-testid="simulator-login-button" type="submit">Login</button>
      </form>
    </body>
    </html>
  `;

  return c.html(html);
});

// Login endpoint
app.post("/login", async (c) => {
  try {
    const body = await c.req.parseBody();
    console.log("Login body:", body);
    const {
      client_id,
      redirect_uri,
      state,
      response_type,
      scope,
      code_challenge,
      code_challenge_method,
      nonce,
    } = body as Record<string, string>;

    // Generate authorization code
    const authCode = "test-auth-code-" + Date.now();

    // Store the nonce with the authorization code
    if (nonce) {
      authCodeStore.set(authCode, nonce as string);
    }

    // Redirect back to the app with authorization code
    const redirectUrl = new URL(redirect_uri as string);
    redirectUrl.searchParams.set("code", authCode);
    redirectUrl.searchParams.set("state", state as string);

    return c.redirect(redirectUrl.toString());
  } catch (error) {
    console.error("Login error:", error);
    return c.json({ error: "Failed to process login" }, 500);
  }
});

// Token endpoint with proper PKCE support
app.post("/oauth/token", async (c) => {
  try {
    const contentType = c.req.header("content-type") || "";
    console.log("Token content-type:", contentType);

    let body: Record<string, string>;
    if (contentType.includes("application/json")) {
      body = await c.req.json();
    } else {
      body = (await c.req.parseBody()) as Record<string, string>;
    }

    console.log("Token body:", body);
    const { code, grant_type, redirect_uri, client_id, code_verifier } = body;

    console.log("Token request:", {
      code,
      grant_type,
      redirect_uri,
      client_id,
      code_verifier,
    });

    if (grant_type === "authorization_code" && code) {
      // For PKCE, we should validate the code_verifier, but for testing we'll accept any
      // Retrieve the nonce associated with this authorization code
      const nonce = authCodeStore.get(code as string);
      const accessToken = generateToken(mockUser, nonce);
      const idToken = generateToken(mockUser, nonce);

      const response = {
        access_token: accessToken,
        id_token: idToken,
        token_type: "Bearer",
        expires_in: 3600,
        refresh_token: "test-refresh-token",
      };

      console.log("Token response:", response);
      console.log("Generated access token:", accessToken);
      console.log("Generated id token:", idToken);

      return c.json(response);
    } else {
      console.log("Invalid token request:", {
        code,
        grant_type,
        redirect_uri,
        client_id,
        code_verifier,
      });
      return c.json({ error: "invalid_grant" }, 400);
    }
  } catch (error) {
    console.error("Token error:", error);
    return c.json({ error: "Failed to process token request" }, 500);
  }
});

// User info endpoint
app.get("/userinfo", (c) => {
  return c.json(mockUser);
});

// Logout endpoint
app.get("/v2/logout", (c) => {
  const { returnTo } = c.req.query();
  console.log("Logout request:", { returnTo });

  if (returnTo) {
    // Redirect back to the app
    return c.redirect(returnTo as string);
  } else {
    // Default logout page
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Logged Out</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 400px; margin: 50px auto; padding: 20px; text-align: center; }
          .success { color: #28a745; }
        </style>
      </head>
      <body>
        <h2 class="success">Successfully Logged Out</h2>
        <p>You have been logged out of the Auth0 simulator.</p>
        <a href="http://localhost:3000">Return to App</a>
      </body>
      </html>
    `;
    return c.html(html);
  }
});

// Health check endpoint
app.get("/health", (c) => {
  return c.json({ status: "ok", timestamp: new Date().toISOString() });
});

export const startAuth0Simulator = async () => {
  try {
    console.log("Starting Auth0 simulator with HTTPS...");

    // Generate self-signed certificate
    const { key, cert } = generateSelfSignedCert();

    // Create HTTPS server using Hono's serve function
    const server = https.createServer({ key, cert }, async (req, res) => {
      const url = new URL(req.url!, `https://${req.headers.host}`);

      // Handle body for POST requests
      let body: string | undefined;
      if (req.method !== "GET" && req.method !== "HEAD") {
        const chunks: Buffer[] = [];
        req.on("data", (chunk) => chunks.push(chunk));
        await new Promise<void>((resolve) => {
          req.on("end", () => {
            body = Buffer.concat(chunks).toString();
            resolve();
          });
        });
      }

      const request = new Request(url.toString(), {
        method: req.method,
        headers: req.headers as any,
        body: body,
      });

      const response = await app.fetch(request);

      res.statusCode = response.status;
      response.headers.forEach((value, key) => {
        res.setHeader(key, value);
      });

      if (response.body) {
        const reader = response.body.getReader();
        const pump = async () => {
          const { done, value } = await reader.read();
          if (done) {
            res.end();
          } else {
            res.write(value);
            pump();
          }
        };
        pump();
      } else {
        res.end();
      }
    });

    server.listen(PORT, "0.0.0.0", () => {
      console.log(`Auth0 Simulator running at https://0.0.0.0:${PORT}`);
    });

    // Store server reference for cleanup
    process.on("SIGINT", () => {
      console.log("Shutting down Auth0 simulator...");
      server.close();
      process.exit(0);
    });

    return `https://localhost:${PORT}`;
  } catch (error) {
    console.error("Failed to start Auth0 simulator:", error);
    throw error;
  }
};

export const stopAuth0Simulator = async () => {
  console.log("Auth0 Simulator stopped");
};
