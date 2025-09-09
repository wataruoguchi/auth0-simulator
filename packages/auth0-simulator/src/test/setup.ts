import fs from "fs";
import { afterAll, beforeAll } from "vitest";

// Create test RSA key if it doesn't exist
beforeAll(async () => {
  const keyPath = "/tmp/test-rsa-key.pem";

  if (!fs.existsSync(keyPath)) {
    // Generate a test RSA key for testing
    const { execSync } = await import("child_process");
    try {
      execSync(`openssl genrsa -out ${keyPath} 2048`, { stdio: "pipe" });
      console.log("Generated test RSA key for testing");
    } catch (error) {
      console.warn("Could not generate test RSA key:", error);
    }
  }
});

// Cleanup after tests
afterAll(async () => {
  // Clean up any test files if needed
});
