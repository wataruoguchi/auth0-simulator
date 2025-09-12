import { describe, expect, it } from "vitest";

describe("Index Exports", () => {
  it("should export startAuth0Simulator", async () => {
    const module = await import("../index");
    expect(module.startAuth0Simulator).toBeDefined();
    expect(typeof module.startAuth0Simulator).toBe("function");
  });

  it("should not export internal functions", async () => {
    const module = await import("../index");

    // These are internal implementation details, not part of the public API
    expect((module as any).createAuthConfig).toBeUndefined();
    expect((module as any).decodeToken).toBeUndefined();
    expect((module as any).generateToken).toBeUndefined();
    expect((module as any).createJWKS).toBeUndefined();
    expect((module as any).generateSelfSignedCert).toBeUndefined();
    expect((module as any).getRSAKeyPair).toBeUndefined();
    expect((module as any).pemToJwk).toBeUndefined();
  });

  it("should have minimal API surface", async () => {
    const module = await import("../index");

    // Should only export the main function
    const exportedKeys = Object.keys(module);
    expect(exportedKeys).toEqual(["startAuth0Simulator"]);
  });
});
