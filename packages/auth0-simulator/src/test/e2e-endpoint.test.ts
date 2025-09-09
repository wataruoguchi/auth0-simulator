import { Hono } from "hono";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createAuthConfig, getUserInfo } from "../auth-handlers.js";
import { createMockUser } from "../jwt-utils.js";

// Mock the hono/jwt module
vi.mock("hono/jwt", () => ({
  verifyWithJwks: vi.fn(),
}));

// Import the mocked function
import { verifyWithJwks } from "hono/jwt";

describe("E2E Endpoint Tests", () => {
  let app: Hono;
  let authConfig: ReturnType<typeof createAuthConfig>;

  beforeEach(() => {
    // Create a fresh auth config for each test
    authConfig = createAuthConfig(4400);

    // Create a new Hono app for testing
    app = new Hono();

    // Add the E2E endpoint to the app
    app.get("/api/e2e/fetch_email_by_sub", async (c) => {
      try {
        // Get the Authorization header
        const authHeader = c.req.header("Authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
          return c.json(
            { error: "Missing or invalid authorization header" },
            401,
          );
        }

        // Extract the access token
        const accessToken = authHeader.substring(7);

        // Verify JWT signature using JWKS (same as backend)
        const decoded = await (verifyWithJwks as any)(accessToken, {
          jwks_uri: `https://localhost:4400/.well-known/jwks.json`,
        });

        if (!decoded || !decoded.sub) {
          return c.json({ error: "Invalid access token" }, 401);
        }

        // Look up the user by sub
        const user = getUserInfo(decoded.sub, authConfig);

        if (!user) {
          return c.json({ error: "User not found" }, 404);
        }

        // Return user info for E2E testing
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
        console.error("E2E fetch user error:", error);
        return c.json({ error: "Failed to get user info" }, 500);
      }
    });
  });

  describe("Authentication", () => {
    it("should return 401 when no Authorization header is provided", async () => {
      const res = await app.request("/api/e2e/fetch_email_by_sub");
      expect(res.status).toBe(401);

      const body = await res.json();
      expect(body).toEqual({
        error: "Missing or invalid authorization header",
      });
    });

    it("should return 401 when Authorization header doesn't start with 'Bearer '", async () => {
      const res = await app.request("/api/e2e/fetch_email_by_sub", {
        headers: {
          Authorization: "Invalid token",
        },
      });
      expect(res.status).toBe(401);

      const body = await res.json();
      expect(body).toEqual({
        error: "Missing or invalid authorization header",
      });
    });

    it("should return 401 when access token is invalid", async () => {
      (verifyWithJwks as any).mockResolvedValue(null);

      const res = await app.request("/api/e2e/fetch_email_by_sub", {
        headers: {
          Authorization: "Bearer invalid-token",
        },
      });
      expect(res.status).toBe(401);

      const body = await res.json();
      expect(body).toEqual({
        error: "Invalid access token",
      });
    });

    it("should return 401 when decoded token has no sub", async () => {
      (verifyWithJwks as any).mockResolvedValue({ email: "test@example.com" });

      const res = await app.request("/api/e2e/fetch_email_by_sub", {
        headers: {
          Authorization: "Bearer valid-token",
        },
      });
      expect(res.status).toBe(401);

      const body = await res.json();
      expect(body).toEqual({
        error: "Invalid access token",
      });
    });
  });

  describe("User Lookup", () => {
    it("should return 404 when user is not found", async () => {
      (verifyWithJwks as any).mockResolvedValue({ sub: "non-existent-user" });

      const res = await app.request("/api/e2e/fetch_email_by_sub", {
        headers: {
          Authorization: "Bearer valid-token",
        },
      });
      expect(res.status).toBe(404);

      const body = await res.json();
      expect(body).toEqual({
        error: "User not found",
      });
    });

    it("should return user info when user is found", async () => {
      // Create a test user and store it
      const testUser = createMockUser("https://localhost:4400/");
      testUser.sub = "test-user-123";
      testUser.email = "test@example.com";
      testUser.name = "Test User";
      testUser.given_name = "Test";
      testUser.family_name = "User";

      authConfig.userStore.storeUser(testUser);

      (verifyWithJwks as any).mockResolvedValue({ sub: "test-user-123" });

      const res = await app.request("/api/e2e/fetch_email_by_sub", {
        headers: {
          Authorization: "Bearer valid-token",
        },
      });
      expect(res.status).toBe(200);

      const body = await res.json();
      expect(body).toEqual({
        sub: "test-user-123",
        email: "test@example.com",
        name: "Test User",
        given_name: "Test",
        family_name: "User",
        picture: "https://via.placeholder.com/150",
        aud: "test-client-id",
        iss: "https://localhost:4400/",
        azp: "test-client-id",
        scope: "openid profile email offline_access",
      });
    });

    it("should return user info for custom email user", async () => {
      // Create a user with custom email data
      const customUser = createMockUser("https://localhost:4400/");
      customUser.sub = "user-custom-example-com";
      customUser.email = "custom@example.com";
      customUser.name = "custom";
      customUser.given_name = "custom";
      customUser.family_name = "example";

      authConfig.userStore.storeUser(customUser);

      (verifyWithJwks as any).mockResolvedValue({
        sub: "user-custom-example-com",
      });

      const res = await app.request("/api/e2e/fetch_email_by_sub", {
        headers: {
          Authorization: "Bearer valid-token",
        },
      });
      expect(res.status).toBe(200);

      const body = await res.json();
      expect(body).toEqual({
        sub: "user-custom-example-com",
        email: "custom@example.com",
        name: "custom",
        given_name: "custom",
        family_name: "example",
        picture: "https://via.placeholder.com/150",
        aud: "test-client-id",
        iss: "https://localhost:4400/",
        azp: "test-client-id",
        scope: "openid profile email offline_access",
      });
    });
  });

  describe("Error Handling", () => {
    it("should return 500 when verifyWithJwks throws an error", async () => {
      (verifyWithJwks as any).mockRejectedValue(
        new Error("JWT verification error"),
      );

      const res = await app.request("/api/e2e/fetch_email_by_sub", {
        headers: {
          Authorization: "Bearer valid-token",
        },
      });
      expect(res.status).toBe(500);

      const body = await res.json();
      expect(body).toEqual({
        error: "Failed to get user info",
      });
    });

    it("should handle getUserInfo throwing an error", async () => {
      // Mock getUserInfo to throw an error
      const originalGetUserInfo = authConfig.userStore.getUserBySub;
      authConfig.userStore.getUserBySub = vi.fn().mockImplementation(() => {
        throw new Error("User store error");
      });

      (verifyWithJwks as any).mockResolvedValue({ sub: "test-user-123" });

      const res = await app.request("/api/e2e/fetch_email_by_sub", {
        headers: {
          Authorization: "Bearer valid-token",
        },
      });
      expect(res.status).toBe(500);

      const body = await res.json();
      expect(body).toEqual({
        error: "Failed to get user info",
      });

      // Restore original function
      authConfig.userStore.getUserBySub = originalGetUserInfo;
    });
  });

  describe("Response Format", () => {
    it("should return all required user fields", async () => {
      const testUser = createMockUser("https://localhost:4400/");
      testUser.sub = "complete-user-123";
      testUser.email = "complete@example.com";
      testUser.name = "Complete User";
      testUser.given_name = "Complete";
      testUser.family_name = "User";

      authConfig.userStore.storeUser(testUser);

      (verifyWithJwks as any).mockResolvedValue({ sub: "complete-user-123" });

      const res = await app.request("/api/e2e/fetch_email_by_sub", {
        headers: {
          Authorization: "Bearer valid-token",
        },
      });
      expect(res.status).toBe(200);

      const body = await res.json();

      // Check that all required fields are present
      expect(body).toHaveProperty("sub");
      expect(body).toHaveProperty("email");
      expect(body).toHaveProperty("name");
      expect(body).toHaveProperty("given_name");
      expect(body).toHaveProperty("family_name");
      expect(body).toHaveProperty("picture");
      expect(body).toHaveProperty("aud");
      expect(body).toHaveProperty("iss");
      expect(body).toHaveProperty("azp");
      expect(body).toHaveProperty("scope");

      // Check that sensitive fields are not included
      expect(body).not.toHaveProperty("iat");
      expect(body).not.toHaveProperty("exp");
      expect(body).not.toHaveProperty("nonce");
    });

    it("should return correct content type", async () => {
      const testUser = createMockUser("https://localhost:4400/");
      testUser.sub = "content-type-user";
      authConfig.userStore.storeUser(testUser);

      (verifyWithJwks as any).mockResolvedValue({ sub: "content-type-user" });

      const res = await app.request("/api/e2e/fetch_email_by_sub", {
        headers: {
          Authorization: "Bearer valid-token",
        },
      });
      expect(res.status).toBe(200);
      expect(res.headers.get("content-type")).toContain("application/json");
    });
  });

  describe("Multiple Users", () => {
    it("should handle multiple users in the store", async () => {
      // Store multiple users
      const user1 = createMockUser("https://localhost:4400/");
      user1.sub = "user-1";
      user1.email = "user1@example.com";
      user1.name = "User One";
      authConfig.userStore.storeUser(user1);

      const user2 = createMockUser("https://localhost:4400/");
      user2.sub = "user-2";
      user2.email = "user2@example.com";
      user2.name = "User Two";
      authConfig.userStore.storeUser(user2);

      // Test fetching user1
      (verifyWithJwks as any).mockResolvedValue({ sub: "user-1" });
      const res1 = await app.request("/api/e2e/fetch_email_by_sub", {
        headers: {
          Authorization: "Bearer valid-token",
        },
      });
      expect(res1.status).toBe(200);
      const body1 = await res1.json();
      expect(body1.email).toBe("user1@example.com");

      // Test fetching user2
      (verifyWithJwks as any).mockResolvedValue({ sub: "user-2" });
      const res2 = await app.request("/api/e2e/fetch_email_by_sub", {
        headers: {
          Authorization: "Bearer valid-token",
        },
      });
      expect(res2.status).toBe(200);
      const body2 = await res2.json();
      expect(body2.email).toBe("user2@example.com");
    });
  });
});
