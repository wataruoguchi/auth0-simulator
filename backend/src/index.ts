import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import fs from "fs";
import { Hono, type Context } from "hono";
import { cors } from "hono/cors";
import { verifyWithJwks } from "hono/jwt";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = new Hono();

// JWT verification using Hono's verifyWithJwks
async function verifyJWT(token: string): Promise<any> {
  try {
    // Temporarily disable SSL certificate verification for self-signed certificates
    const originalRejectUnauthorized = process.env.NODE_TLS_REJECT_UNAUTHORIZED;
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

    const payload = await verifyWithJwks(token, {
      jwks_uri: `${process.env.VITE_AUTH0_DOMAIN}/.well-known/jwks.json`,
    });

    // Restore original SSL verification setting
    if (originalRejectUnauthorized !== undefined) {
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = originalRejectUnauthorized;
    } else {
      delete process.env.NODE_TLS_REJECT_UNAUTHORIZED;
    }

    return payload;
  } catch (error) {
    console.error("JWT Verification Error:", error);
    throw error;
  }
}

if (!process.env.VITE_AUTH0_DOMAIN) {
  throw new Error("Missing environment variables");
}

app.use(
  "*",
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? "*" // In production, allow all origins since we serve from same origin
        : "http://localhost:5173", // When the frontend dev server is running
  }),
);

// JWT signature verification middleware using Hono's verifyWithJwks
app.use("/api/*", async (c, next) => {
  const authHeader = c.req.header("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return c.json({ error: "No authorization header" }, 401);
  }

  const token = authHeader.replace("Bearer ", "");

  try {
    // Verify JWT signature using JWKS
    const payload = await verifyJWT(token);

    // Set the verified payload in the context for the verify endpoint
    (c as any).set("jwtPayload", payload);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return c.json(
      { error: "JWT verification failed", details: errorMessage },
      401,
    );
  }

  await next();
});

// Serve static files from public directory (except for root)
app.use(
  "/assets/*",
  serveStatic({ root: path.join(__dirname, "..", "public") }),
);
app.use("/*.svg", serveStatic({ root: path.join(__dirname, "..", "public") }));

app.get("/", (c) => {
  // Serve the frontend index.html file from public directory
  return c.html(
    fs
      .readFileSync(path.join(__dirname, "..", "public", "index.html"))
      .toString(),
  );
});

app.get("/api/verify", (c: Context) => {
  // JWT signature verification middleware provides the verified JWT payload
  const jwtPayload = c.get("jwtPayload");

  if (jwtPayload) {
    return c.json({
      verified: true,
      payload: jwtPayload,
      message: "JWT signature verified successfully with JWKS",
    });
  } else {
    return c.json({ error: "No verified JWT payload found" }, 401);
  }
});

const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;

serve(
  {
    fetch: app.fetch,
    port: port,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  },
);
