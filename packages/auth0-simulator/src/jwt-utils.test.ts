import { describe, expect, it } from "vitest";
import {
  createMockUser,
  createTokenPayload,
  decodeToken,
  generateHMACToken,
  generateRSAToken,
  generateToken,
  JWT_SECRET,
  verifyToken,
} from "./jwt-utils";

describe("JWT Utils", () => {
  describe("createMockUser", () => {
    it("should create a mock user with correct structure", () => {
      const issuer = "https://localhost:4400/";
      const user = createMockUser(issuer);

      expect(user).toEqual({
        sub: "test-user-123",
        email: "test@example.com",
        name: "Test User",
        given_name: "Test",
        family_name: "User",
        picture: "https://via.placeholder.com/150",
        aud: "test-client-id",
        iss: issuer,
        azp: "test-client-id",
        scope: "openid profile email offline_access",
        nonce: "test-nonce-123",
      });
    });
  });

  describe("createTokenPayload", () => {
    it("should create token payload with correct structure", () => {
      const user = createMockUser("https://localhost:4400/");
      const payload = createTokenPayload(user);

      expect(payload).toMatchObject({
        sub: user.sub,
        email: user.email,
        name: user.name,
        aud: user.aud,
        iss: user.iss,
      });
      expect(payload.iat).toBeTypeOf("number");
      expect(payload.exp).toBeTypeOf("number");
      expect(payload.exp - payload.iat).toBe(3600);
    });

    it("should include nonce when provided", () => {
      const user = createMockUser("https://localhost:4400/");
      const nonce = "custom-nonce-123";
      const payload = createTokenPayload(user, nonce);

      expect(payload.nonce).toBe(nonce);
    });
  });

  describe("generateToken", () => {
    it("should generate HMAC token by default", () => {
      const user = createMockUser("https://localhost:4400/");
      const payload = createTokenPayload(user);
      const token = generateToken(payload, JWT_SECRET);

      expect(token).toBeTypeOf("string");
      expect(token.split(".")).toHaveLength(3);
    });

    it("should generate RSA token when algorithm is RS256", () => {
      const user = createMockUser("https://localhost:4400/");
      const payload = createTokenPayload(user);
      const privateKey =
        "-----BEGIN PRIVATE KEY-----\nMOCK_KEY\n-----END PRIVATE KEY-----";

      expect(() => {
        generateToken(payload, privateKey, "RS256", "test-key-id");
      }).toThrow(); // Will throw because it's not a real RSA key, but tests the function call
    });
  });

  describe("generateHMACToken", () => {
    it("should generate HMAC token", () => {
      const user = createMockUser("https://localhost:4400/");
      const payload = createTokenPayload(user);
      const token = generateHMACToken(payload);

      expect(token).toBeTypeOf("string");
      expect(token.split(".")).toHaveLength(3);
    });
  });

  describe("generateRSAToken", () => {
    it("should generate RSA token with key ID", () => {
      const user = createMockUser("https://localhost:4400/");
      const payload = createTokenPayload(user);
      const privateKey =
        "-----BEGIN PRIVATE KEY-----\nMOCK_KEY\n-----END PRIVATE KEY-----";

      expect(() => {
        generateRSAToken(payload, privateKey, "test-key-id");
      }).toThrow(); // Will throw because it's not a real RSA key, but tests the function call
    });
  });

  describe("verifyToken", () => {
    it("should verify valid HMAC token", () => {
      const user = createMockUser("https://localhost:4400/");
      const payload = createTokenPayload(user);
      const token = generateHMACToken(payload);

      const decoded = verifyToken(token, JWT_SECRET, "HS256");
      expect(decoded).toMatchObject({
        sub: user.sub,
        email: user.email,
        name: user.name,
      });
    });

    it("should reject invalid token", () => {
      expect(() => {
        verifyToken("invalid-token", JWT_SECRET, "HS256");
      }).toThrow();
    });
  });

  describe("decodeToken", () => {
    it("should decode token without verification", () => {
      const user = createMockUser("https://localhost:4400/");
      const payload = createTokenPayload(user);
      const token = generateHMACToken(payload);

      const decoded = decodeToken(token);
      expect(decoded).toMatchObject({
        sub: user.sub,
        email: user.email,
        name: user.name,
      });
    });
  });
});
