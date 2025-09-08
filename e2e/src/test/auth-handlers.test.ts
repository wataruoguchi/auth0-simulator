import { beforeEach, describe, expect, it } from "vitest";
import {
  InMemoryAuthCodeStore,
  createAuthConfig,
  createLoginForm,
  createLogoutPage,
  createOpenIDConfig,
  generateAuthCode,
  processLogin,
  processTokenExchange,
} from "../auth-handlers";

describe("Auth Handlers", () => {
  describe("InMemoryAuthCodeStore", () => {
    let store: InMemoryAuthCodeStore;

    beforeEach(() => {
      store = new InMemoryAuthCodeStore();
    });

    it("should store and retrieve authorization codes", () => {
      const code = "test-auth-code-123";
      const nonce = "test-nonce-456";

      store.set(code, nonce);
      expect(store.get(code)).toBe(nonce);
    });

    it("should return undefined for non-existent codes", () => {
      expect(store.get("non-existent-code")).toBeUndefined();
    });

    it("should delete authorization codes", () => {
      const code = "test-auth-code-123";
      const nonce = "test-nonce-456";

      store.set(code, nonce);
      expect(store.delete(code)).toBe(true);
      expect(store.get(code)).toBeUndefined();
    });
  });

  describe("createAuthConfig", () => {
    it("should create auth config with correct structure", () => {
      const config = createAuthConfig(4400);

      expect(config).toMatchObject({
        issuer: "https://localhost:4400/",
        port: 4400,
        mockUser: {
          sub: "test-user-123",
          email: "test@example.com",
          name: "Test User",
          iss: "https://localhost:4400/",
        },
      });
      expect(config.authCodeStore).toBeInstanceOf(InMemoryAuthCodeStore);
    });
  });

  describe("generateAuthCode", () => {
    it("should generate unique authorization codes", async () => {
      const code1 = generateAuthCode();
      // Add small delay to ensure different timestamps
      await new Promise((resolve) => setTimeout(resolve, 1));
      const code2 = generateAuthCode();

      expect(code1).toMatch(/^test-auth-code-\d+$/);
      expect(code2).toMatch(/^test-auth-code-\d+$/);
      expect(code1).not.toBe(code2);
    });
  });

  describe("createOpenIDConfig", () => {
    it("should create OpenID Connect configuration", () => {
      const issuer = "https://localhost:4400/";
      const config = createOpenIDConfig(issuer);

      expect(config).toEqual({
        issuer,
        authorization_endpoint: `${issuer}authorize`,
        token_endpoint: `${issuer}oauth/token`,
        userinfo_endpoint: `${issuer}userinfo`,
        jwks_uri: `${issuer}.well-known/jwks.json`,
        response_types_supported: ["code", "id_token", "token"],
        subject_types_supported: ["public"],
        id_token_signing_alg_values_supported: ["HS256"],
        scopes_supported: ["openid", "profile", "email", "offline_access"],
        code_challenge_methods_supported: ["S256"],
      });
    });
  });

  describe("createLoginForm", () => {
    it("should create HTML login form with parameters", () => {
      const params = {
        client_id: "test-client",
        redirect_uri: "http://localhost:3000",
        state: "test-state",
        response_type: "code",
        scope: "openid",
        code_challenge: "test-challenge",
        code_challenge_method: "S256",
        nonce: "test-nonce",
      };

      const html = createLoginForm(params);

      expect(html).toContain("Auth0 Simulator Login");
      expect(html).toContain("test-client");
      expect(html).toContain("http://localhost:3000");
      expect(html).toContain("test-state");
      expect(html).toContain("test-challenge");
      expect(html).toContain("test-nonce");
      expect(html).toContain('data-testid="simulator-login-button"');
    });
  });

  describe("createLogoutPage", () => {
    it("should create logout page HTML", () => {
      const html = createLogoutPage();

      expect(html).toContain("Successfully Logged Out");
      expect(html).toContain("Return to App");
      expect(html).toContain("http://localhost:3000");
    });
  });

  describe("processLogin", () => {
    let authConfig: ReturnType<typeof createAuthConfig>;

    beforeEach(() => {
      authConfig = createAuthConfig();
    });

    it("should process login and return redirect URL with auth code", () => {
      const formData = {
        client_id: "test-client",
        redirect_uri: "http://localhost:3000",
        state: "test-state",
        response_type: "code",
        scope: "openid",
        code_challenge: "test-challenge",
        code_challenge_method: "S256",
        nonce: "test-nonce",
      };

      const result = processLogin(formData, authConfig);

      expect(result.redirectUrl).toContain("http://localhost:3000");
      expect(result.redirectUrl).toContain("code=");
      expect(result.redirectUrl).toContain("state=test-state");
      expect(result.authCode).toMatch(/^test-auth-code-\d+$/);
    });

    it("should store nonce with authorization code", () => {
      const formData = {
        client_id: "test-client",
        redirect_uri: "http://localhost:3000",
        state: "test-state",
        response_type: "code",
        scope: "openid",
        code_challenge: "test-challenge",
        code_challenge_method: "S256",
        nonce: "test-nonce",
      };

      const result = processLogin(formData, authConfig);
      const storedNonce = authConfig.authCodeStore.get(result.authCode);

      expect(storedNonce).toBe("test-nonce");
    });
  });

  describe("processTokenExchange", () => {
    let authConfig: ReturnType<typeof createAuthConfig>;

    beforeEach(() => {
      authConfig = createAuthConfig();
    });

    it("should process valid token exchange", () => {
      const authCode = "test-auth-code-123";
      authConfig.authCodeStore.set(authCode, "test-nonce");

      const tokenData = {
        code: authCode,
        grant_type: "authorization_code",
        redirect_uri: "http://localhost:3000",
        client_id: "test-client",
        code_verifier: "test-verifier",
      };

      const result = processTokenExchange(tokenData, authConfig);

      expect(result).toMatchObject({
        access_token: expect.any(String),
        id_token: expect.any(String),
        token_type: "Bearer",
        expires_in: 3600,
        refresh_token: "test-refresh-token",
      });
    });

    it("should throw error for invalid grant type", () => {
      const tokenData = {
        code: "test-auth-code-123",
        grant_type: "invalid_grant",
        redirect_uri: "http://localhost:3000",
        client_id: "test-client",
      };

      expect(() => {
        processTokenExchange(tokenData, authConfig);
      }).toThrow("Invalid token request");
    });

    it("should throw error for missing code", () => {
      const tokenData = {
        grant_type: "authorization_code",
        redirect_uri: "http://localhost:3000",
        client_id: "test-client",
      };

      expect(() => {
        processTokenExchange(tokenData, authConfig);
      }).toThrow("Invalid token request");
    });
  });
});
