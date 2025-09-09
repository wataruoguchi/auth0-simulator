/**
 * Basic Usage Example
 *
 * This example shows how to use the Auth0 Simulator in a simple Node.js application.
 */

import {
  createAuthConfig,
  startAuth0Simulator,
} from "@wataruoguchi/auth0-simulator";

async function main() {
  console.log("🚀 Starting Auth0 Simulator...");

  // Create a custom configuration
  const authConfig = createAuthConfig(4400);

  // Start the simulator
  const server = await startAuth0Simulator();

  console.log("✅ Auth0 Simulator is running!");
  console.log("📍 URL: https://localhost:4400");
  console.log("🔑 JWKS: https://localhost:4400/.well-known/jwks.json");
  console.log(
    "📖 OpenID Config: https://localhost:4400/.well-known/openid_configuration",
  );
  console.log(
    "🧪 E2E Endpoint: https://localhost:4400/api/e2e/fetch_email_by_sub",
  );

  // Graceful shutdown
  process.on("SIGINT", () => {
    console.log("\n🛑 Shutting down Auth0 Simulator...");
    process.exit(0);
  });
}

main().catch(console.error);
