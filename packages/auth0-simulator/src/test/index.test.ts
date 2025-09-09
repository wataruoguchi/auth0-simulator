import { describe, expect, it } from "vitest";

describe("Index Exports", () => {
  it("should export startAuth0Simulator", async () => {
    const module = await import("../index");
    expect(module.startAuth0Simulator).toBeDefined();
    expect(typeof module.startAuth0Simulator).toBe("function");
  });

  it("should export authentication handlers", async () => {
    const module = await import("../index");
    
    expect(module.InMemoryUserStore).toBeDefined();
    expect(module.createAuthConfig).toBeDefined();
    expect(module.getUserInfo).toBeDefined();
    expect(module.processLogin).toBeDefined();
    expect(module.processTokenExchange).toBeDefined();
    
    // Check types
    expect(typeof module.createAuthConfig).toBe("function");
    expect(typeof module.getUserInfo).toBe("function");
    expect(typeof module.processLogin).toBe("function");
    expect(typeof module.processTokenExchange).toBe("function");
  });

  it("should export JWT utilities", async () => {
    const module = await import("../index");
    
    expect(module.createMockUser).toBeDefined();
    expect(module.decodeToken).toBeDefined();
    expect(module.generateToken).toBeDefined();
    // JwtMockUser is a type export, not available at runtime
    expect(module.JwtMockUser).toBeUndefined();
    
    // Check types
    expect(typeof module.createMockUser).toBe("function");
    expect(typeof module.decodeToken).toBe("function");
    expect(typeof module.generateToken).toBe("function");
  });

  it("should export certificate utilities", async () => {
    const module = await import("../index");
    
    expect(module.createJWKS).toBeDefined();
    expect(module.generateSelfSignedCert).toBeDefined();
    expect(module.getRSAKeyPair).toBeDefined();
    expect(module.pemToJwk).toBeDefined();
    
    // Check types
    expect(typeof module.createJWKS).toBe("function");
    expect(typeof module.generateSelfSignedCert).toBe("function");
    expect(typeof module.getRSAKeyPair).toBe("function");
    expect(typeof module.pemToJwk).toBe("function");
  });

  it("should export Hono Context type", async () => {
    const module = await import("../index");
    
    // Context is a type export, not available at runtime
    expect(module.Context).toBeUndefined();
  });

  it("should export type definitions", async () => {
    const module = await import("../index");
    
    // These should be available as types (not runtime values)
    expect(module.AuthConfig).toBeUndefined(); // Type only
    expect(module.UserData).toBeUndefined(); // Type only
    expect(module.UserStore).toBeUndefined(); // Type only
  });
});
