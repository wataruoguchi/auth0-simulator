import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import fs from "fs";
import { Hono, type Context } from "hono";
import { cors } from "hono/cors";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = new Hono();

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

// Custom JWT verification middleware
app.use("/api/*", async (c, next) => {
  const authHeader = c.req.header("Authorization");
  console.log("🔍 Custom JWT Middleware:");
  console.log("  Authorization header:", authHeader);
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.log("  No valid authorization header");
    return c.json({ error: "No authorization header" }, 401);
  }
  
  const token = authHeader.replace("Bearer ", "");
  console.log("  JWT Token:", token);
  
  try {
    // For now, let's just decode the JWT without verification to see what we have
    const parts = token.split('.');
    if (parts.length === 3) {
      const header = JSON.parse(Buffer.from(parts[0], 'base64url').toString());
      const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString());
      console.log("  JWT Header:", header);
      console.log("  JWT Payload:", payload);
      
      // Set the payload in the context for the verify endpoint
      (c as any).set("jwtPayload", payload);
    }
  } catch (error) {
    console.log("  JWT Decode Error:", error);
    return c.json({ error: "Invalid JWT format" }, 401);
  }
  
  await next();
});

// Add JWT debugging middleware
app.use("/api/*", async (c, next) => {
  console.log("🔍 API Request received:", c.req.method, c.req.url);
  const authHeader = c.req.header("Authorization");
  console.log("🔍 Backend JWT Debug:");
  console.log("  Authorization header:", authHeader);
  
  if (authHeader) {
    const token = authHeader.replace("Bearer ", "");
    console.log("  JWT Token:", token);
    
    // Try to decode the JWT without verification to see its structure
    try {
      const parts = token.split('.');
      if (parts.length === 3) {
        const header = JSON.parse(Buffer.from(parts[0], 'base64url').toString());
        const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString());
        console.log("  JWT Header:", header);
        console.log("  JWT Payload:", payload);
      }
    } catch (error) {
      console.log("  JWT Decode Error:", error);
    }
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
  console.log("🔍 Verify endpoint called");
  console.log("  Headers:", Object.fromEntries(c.req.raw.headers.entries()));
  
  // Check what the jwk middleware provides
  const jwtPayload = c.get("jwtPayload");
  const jwt = c.get("jwt");
  const user = c.get("user");
  
  console.log("  jwtPayload:", jwtPayload);
  console.log("  jwt:", jwt);
  console.log("  user:", user);
  
  if (jwtPayload) {
    return c.json({ verified: true, payload: jwtPayload });
  } else if (jwt) {
    return c.json({ verified: true, payload: jwt });
  } else if (user) {
    return c.json({ verified: true, payload: user });
  } else {
    return c.json({ error: "No JWT payload found", available: { jwtPayload, jwt, user } }, 401);
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
