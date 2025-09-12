// Auth0 simulator using Hono with HTTPS and proper PKCE support
import { Hono } from "hono";
import { cors } from "hono/cors";
import https from "https";
import {
  createAuthConfig,
  createLoginForm,
  createLogoutPage,
  createOpenIDConfig,
  getUserInfo,
  processLogin,
  processTokenExchange,
} from "./auth-handlers.js";
import {
  createJWKS,
  generateSelfSignedCert,
  getRSAKeyPair,
} from "./cert-utils.js";

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 4400;
const EXTERNAL_PORT = process.env.EXTERNAL_PORT
  ? parseInt(process.env.EXTERNAL_PORT)
  : PORT;
const app = new Hono();

// Create auth configuration with external port for issuer
const authConfig = createAuthConfig(EXTERNAL_PORT);

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
  const config = createOpenIDConfig(authConfig.issuer);
  return c.json(config);
});

// JWKS endpoint
app.get("/.well-known/jwks.json", (c) => {
  console.log("JWKS request received");
  const rsaKeys = getRSAKeyPair();
  const jwks = createJWKS(rsaKeys);
  console.log("JWKS response:", jwks);
  return c.json(jwks);
});

// Authorization endpoint
app.get("/authorize", (c) => {
  const queryParams = c.req.query();
  const html = createLoginForm(queryParams);
  return c.html(html);
});

// Login endpoint
app.post("/login", async (c) => {
  try {
    const body = await c.req.parseBody();
    console.log("Login body:", body);
    const formData = body as Record<string, string>;

    const { redirectUrl } = processLogin(formData, authConfig);
    return c.redirect(redirectUrl);
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
      const tokens = processTokenExchange(body, authConfig);
      console.log("Token response:", tokens);
      console.log("Generated access token:", tokens.access_token);
      console.log("Generated id token:", tokens.id_token);
      return c.json(tokens);
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

// User info endpoint (standard OAuth2)
app.get("/userinfo", async (c) => {
  try {
    // Get the Authorization header
    const authHeader = c.req.header("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return c.json({ error: "Missing or invalid authorization header" }, 401);
    }

    // Extract the access token (handle multiple spaces and trim)
    const accessToken = authHeader
      .split(" ")
      .map((s) => s.trim())
      .pop();
    if (!accessToken) {
      return c.json({ error: "Missing or invalid access token" }, 401);
    }

    // Verify JWT signature using JWKS (same as backend)
    const { verifyWithJwks } = await import("hono/jwt");
    const decoded = await verifyWithJwks(accessToken, {
      jwks_uri: `https://localhost:${EXTERNAL_PORT}/.well-known/jwks.json`,
    });

    if (!decoded || typeof decoded.sub !== "string" || !decoded.sub) {
      return c.json({ error: "Invalid access token" }, 401);
    }

    // Look up the user by sub
    const user = getUserInfo(decoded.sub, authConfig);

    if (!user) {
      return c.json({ error: "User not found" }, 404);
    }

    // Return user info (excluding sensitive fields)
    const userInfo = {
      sub: user.sub,
      email: user.email,
      name: user.name,
      given_name: user.given_name,
      family_name: user.family_name,
      picture: user.picture,
      aud: user.aud,
      iss: user.iss,
      azp: user.azp,
      scope: user.scope,
    };

    return c.json(userInfo);
  } catch (error) {
    console.error("Userinfo error:", error);
    return c.json({ error: "Failed to get user info" }, 500);
  }
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
    const html = createLogoutPage();
    return c.html(html);
  }
});

// Health check endpoint
app.get("/healthz", (c) => {
  return c.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Export the app and other functions for testing
export { app, authConfig, generateSelfSignedCert };

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
        method: req.method || "GET",
        headers: req.headers as any,
        body: body || null,
      });

      const response = await app.fetch(request);

      res.statusCode = response.status;
      response.headers.forEach((value, key) => {
        res.setHeader(key, value);
      });

      if (response.body) {
        const reader = response.body.getReader();
        const pump = async () => {
          try {
            const { done, value } = await reader.read();
            if (done) {
              res.end();
            } else {
              res.write(value);
              await pump();
            }
          } catch (error) {
            console.error("Stream pump error:", error);
            res.end();
          }
        };
        await pump();
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
