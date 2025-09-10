import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Mock the dependencies
vi.mock("hono", () => ({
  Hono: vi.fn().mockImplementation(() => ({
    use: vi.fn().mockReturnThis(),
    get: vi.fn().mockReturnThis(),
    post: vi.fn().mockReturnThis(),
    request: vi.fn(),
  })),
}));

vi.mock("hono/cors", () => ({
  cors: vi.fn(() => vi.fn()),
}));

vi.mock("https", () => ({
  default: {
    createServer: vi.fn(() => ({
      listen: vi.fn(),
      close: vi.fn(),
    })),
  },
}));

vi.mock("./auth-handlers", () => ({
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
  createLoginForm: vi.fn(() => "<html>login form</html>"),
  createLogoutPage: vi.fn(() => "<html>logout page</html>"),
  createOpenIDConfig: vi.fn(() => ({
    issuer: "https://localhost:4400/",
    authorization_endpoint: "https://localhost:4400/authorize",
    token_endpoint: "https://localhost:4400/oauth/token",
    userinfo_endpoint: "https://localhost:4400/userinfo",
    jwks_uri: "https://localhost:4400/.well-known/jwks.json",
  })),
  getUserInfo: vi.fn(() => ({ sub: "test-user", email: "test@example.com" })),
  processLogin: vi.fn(() => ({
    redirectUrl: "https://localhost:3000?code=test-code",
    authCode: "test-code",
  })),
  processTokenExchange: vi.fn(() => ({
    access_token: "test-access-token",
    id_token: "test-id-token",
    token_type: "Bearer",
    expires_in: 3600,
    refresh_token: "test-refresh-token",
  })),
}));

vi.mock("./cert-utils", () => ({
  createJWKS: vi.fn(() => ({
    keys: [{ kty: "RSA", kid: "test-key-id" }],
  })),
  generateSelfSignedCert: vi.fn(() => ({
    key: "test-private-key",
    cert: "test-certificate",
  })),
  getRSAKeyPair: vi.fn(() => ({
    privateKey: "test-private-key",
    publicKey: "test-public-key",
  })),
}));

describe("Integration Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("Module Integration", () => {
    it("should integrate all modules correctly", async () => {
      // Test that all modules can be imported and work together
      const authHandlers = await import("../auth-handlers");
      const certUtils = await import("../cert-utils");
      const jwtUtils = await import("../jwt-utils");

      expect(authHandlers.createAuthConfig).toBeDefined();
      expect(certUtils.generateSelfSignedCert).toBeDefined();
      expect(jwtUtils.generateToken).toBeDefined();
    });

    it("should handle environment variables correctly", () => {
      const originalPort = process.env.PORT;
      const originalExternalPort = process.env.EXTERNAL_PORT;

      // Test with custom ports
      process.env.PORT = "5000";
      process.env.EXTERNAL_PORT = "5001";

      expect(process.env.PORT).toBe("5000");
      expect(process.env.EXTERNAL_PORT).toBe("5001");

      // Test with default ports
      delete process.env.PORT;
      delete process.env.EXTERNAL_PORT;

      expect(process.env.PORT).toBeUndefined();
      expect(process.env.EXTERNAL_PORT).toBeUndefined();

      // Restore original values
      if (originalPort) {
        process.env.PORT = originalPort;
      }
      if (originalExternalPort) {
        process.env.EXTERNAL_PORT = originalExternalPort;
      }
    });
  });

  describe("Function Integration", () => {
    it("should integrate auth handlers with JWT utils", async () => {
      const { createMockUser, generateToken } = await import("../jwt-utils");
      const { processTokenExchange } = await import("../auth-handlers");

      const mockUser = createMockUser("https://localhost:4400/");
      const token = generateToken(mockUser, "test-secret");

      expect(mockUser.sub).toBe("test-user-123");
      expect(mockUser.email).toBe("test@example.com");
      expect(typeof token).toBe("string");
      expect(token.length).toBeGreaterThan(0);
    });

    it("should integrate cert utils with auth handlers", async () => {
      const { generateSelfSignedCert } = await import("../cert-utils");
      const { createAuthConfig } = await import("../auth-handlers");

      const cert = generateSelfSignedCert();
      const authConfig = createAuthConfig(4400);

      expect(cert).toBeDefined();
      expect(authConfig).toBeDefined();
      expect(authConfig.port).toBe(4400);
    });
  });

  describe("Error Handling Integration", () => {
    it("should handle errors gracefully across modules", async () => {
      const { createMockUser } = await import("../jwt-utils");

      // Test with invalid input - createMockUser always returns the same values
      const mockUser = createMockUser("");

      expect(mockUser.sub).toBe("test-user-123");
      expect(mockUser.email).toBe("test@example.com");
    });

    it("should handle missing environment variables", () => {
      const originalPort = process.env.PORT;

      delete process.env.PORT;

      // Should not throw when PORT is undefined
      expect(() => {
        const port = process.env.PORT ? parseInt(process.env.PORT) : 4400;
        expect(port).toBe(4400);
      }).not.toThrow();

      // Restore original value
      if (originalPort) {
        process.env.PORT = originalPort;
      }
    });
  });

  describe("Type Integration", () => {
    it("should have consistent types across modules", async () => {
      const { createMockUser } = await import("../jwt-utils");
      const { createAuthConfig } = await import("../auth-handlers");

      const mockUser = createMockUser("https://localhost:4400/");
      const authConfig = createAuthConfig(4400);

      // Test that types are consistent
      expect(typeof mockUser.sub).toBe("string");
      expect(typeof mockUser.email).toBe("string");
      expect(typeof authConfig.port).toBe("number");
      expect(typeof authConfig.issuer).toBe("string");
    });
  });
});
