import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import fs from "fs";
import { Hono, type Context } from "hono";
import { cors } from "hono/cors";
import { jwk } from "hono/jwk";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = new Hono();

app.use(
  "*",
  cors({
    origin: "http://localhost:5173", // When the frontend dev server is running
  }),
);

app.use(
  "/api/*",
  jwk({
    jwks_uri: `https://${process.env.VITE_AUTH0_DOMAIN}/.well-known/jwks.json`, // Naming convention: The ENV variable names are copied from the frontend .env file
  }),
);

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
  const payload = c.get("jwtPayload");
  return c.json({ verified: true, payload });
});

serve(
  {
    fetch: app.fetch,
    port: 3000,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  },
);
