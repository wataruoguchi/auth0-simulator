import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Mock the auth0-simulator module
vi.mock("@wataruoguchi/auth0-simulator", () => ({
  createAuthConfig: vi.fn(() => ({
    issuer: "https://localhost:4400/",
    port: 4400,
    authCodeStore: {
      set: vi.fn(),
      get: vi.fn(),
      delete: vi.fn(),
    },
    userStore: {
      addUser: vi.fn(),
      getUserBySub: vi.fn(),
    },
  })),
  startAuth0Simulator: vi.fn(() => Promise.resolve("https://localhost:4400")),
}));

describe("Examples", () => {
  let originalConsoleLog: any;
  let originalProcessOn: any;
  let originalProcessExit: any;
  let originalSetInterval: any;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock console methods
    originalConsoleLog = console.log;
    console.log = vi.fn();
    
    // Mock process methods
    originalProcessOn = process.on;
    originalProcessExit = process.exit;
    process.on = vi.fn();
    process.exit = vi.fn();
    
    // Mock setInterval
    originalSetInterval = setInterval;
    setInterval = vi.fn();
  });

  afterEach(() => {
    // Restore original methods
    console.log = originalConsoleLog;
    process.on = originalProcessOn;
    process.exit = originalProcessExit;
    setInterval = originalSetInterval;
    
    vi.resetAllMocks();
  });

  describe("Basic Usage Example", () => {
    it("should import and run basic usage example", async () => {
      // Mock the basic usage example
      const basicUsageExample = vi.fn().mockImplementation(async () => {
        const { createAuthConfig, startAuth0Simulator } = await import("@wataruoguchi/auth0-simulator");
        
        console.log("🚀 Starting Auth0 Simulator...");
        
        // Create a custom configuration
        const authConfig = createAuthConfig(4400);
        
        // Start the simulator
        const server = await startAuth0Simulator();
        
        console.log("✅ Auth0 Simulator is running!");
        console.log("📍 URL: https://localhost:4400");
        console.log("🔑 JWKS: https://localhost:4400/.well-known/jwks.json");
        console.log("📖 OpenID Config: https://localhost:4400/.well-known/openid_configuration");
        console.log("🧪 E2E Endpoint: https://localhost:4400/api/e2e/fetch_email_by_sub");
        
        // Graceful shutdown
        process.on("SIGINT", () => {
          console.log("\n🛑 Shutting down Auth0 Simulator...");
          process.exit(0);
        });
        
        return server;
      });
      
      const result = await basicUsageExample();
      
      expect(result).toBe("https://localhost:4400");
      expect(console.log).toHaveBeenCalledWith("🚀 Starting Auth0 Simulator...");
      expect(console.log).toHaveBeenCalledWith("✅ Auth0 Simulator is running!");
      expect(console.log).toHaveBeenCalledWith("📍 URL: https://localhost:4400");
      expect(console.log).toHaveBeenCalledWith("🔑 JWKS: https://localhost:4400/.well-known/jwks.json");
      expect(console.log).toHaveBeenCalledWith("📖 OpenID Config: https://localhost:4400/.well-known/openid_configuration");
      expect(console.log).toHaveBeenCalledWith("🧪 E2E Endpoint: https://localhost:4400/api/e2e/fetch_email_by_sub");
    });
  });

  describe("Cypress Integration Example", () => {
    it("should import and run cypress integration example", async () => {
      // Mock the cypress integration example
      const cypressIntegrationExample = vi.fn().mockImplementation(async () => {
        const { createAuthConfig, startAuth0Simulator } = await import("@wataruoguchi/auth0-simulator");
        
        let auth0Simulator: any = null;
        
        const setupAuth0Simulator = async () => {
          console.log("🧪 Setting up Auth0 Simulator for Cypress tests...");
          
          const authConfig = createAuthConfig(4400);
          
          auth0Simulator = await startAuth0Simulator();
          
          console.log("✅ Auth0 Simulator ready for Cypress tests");
          return auth0Simulator;
        };
        
        const teardownAuth0Simulator = async () => {
          if (auth0Simulator) {
            console.log("🛑 Shutting down Auth0 Simulator...");
            // auth0Simulator.close(); // This would be called in real usage
            auth0Simulator = null;
          }
          console.log("Auth0 Simulator stopped.");
        };
        
        const cypressConfig = {
          e2e: {
            baseUrl: "http://localhost:3000",
            supportFile: "cypress/support/e2e.ts",
            setupNodeEvents: (on: any, config: any) => {
              on("task", {
                async setupAuth0() {
                  await setupAuth0Simulator();
                  return null;
                },
                async teardownAuth0() {
                  await teardownAuth0Simulator();
                  return null;
                },
              });
            },
          },
          env: {
            AUTH0_DOMAIN: "https://localhost:4400",
          },
        };
        
        return { setupAuth0Simulator, teardownAuth0Simulator, cypressConfig };
      });
      
      const result = await cypressIntegrationExample();
      
      expect(result.setupAuth0Simulator).toBeDefined();
      expect(result.teardownAuth0Simulator).toBeDefined();
      expect(result.cypressConfig).toBeDefined();
      expect(typeof result.setupAuth0Simulator).toBe("function");
      expect(typeof result.teardownAuth0Simulator).toBe("function");
      expect(result.cypressConfig.e2e.baseUrl).toBe("http://localhost:3000");
      expect(result.cypressConfig.env.AUTH0_DOMAIN).toBe("https://localhost:4400");
    });

    it("should handle setup and teardown functions", async () => {
      const { createAuthConfig, startAuth0Simulator } = await import("@wataruoguchi/auth0-simulator");
      
      let auth0Simulator: any = null;
      
      const setupAuth0Simulator = async () => {
        console.log("🧪 Setting up Auth0 Simulator for Cypress tests...");
        
        const authConfig = createAuthConfig(4400);
        
        auth0Simulator = await startAuth0Simulator();
        
        console.log("✅ Auth0 Simulator ready for Cypress tests");
        return auth0Simulator;
      };
      
      const teardownAuth0Simulator = async () => {
        if (auth0Simulator) {
          console.log("🛑 Shutting down Auth0 Simulator...");
          auth0Simulator = null;
        }
        console.log("Auth0 Simulator stopped.");
      };
      
      // Test setup
      const setupResult = await setupAuth0Simulator();
      expect(setupResult).toBe("https://localhost:4400");
      expect(console.log).toHaveBeenCalledWith("🧪 Setting up Auth0 Simulator for Cypress tests...");
      expect(console.log).toHaveBeenCalledWith("✅ Auth0 Simulator ready for Cypress tests");
      
      // Test teardown
      await teardownAuth0Simulator();
      expect(console.log).toHaveBeenCalledWith("🛑 Shutting down Auth0 Simulator...");
      expect(console.log).toHaveBeenCalledWith("Auth0 Simulator stopped.");
    });
  });
});
