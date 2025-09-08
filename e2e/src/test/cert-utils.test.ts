import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock fs and child_process
vi.mock("fs", () => ({
  default: {
    existsSync: vi.fn(),
    readFileSync: vi.fn(),
    writeFileSync: vi.fn(),
  },
  existsSync: vi.fn(),
  readFileSync: vi.fn(),
  writeFileSync: vi.fn(),
}));

vi.mock("child_process", () => ({
  execSync: vi.fn(),
}));

import { execSync } from "child_process";
import fs from "fs";
import {
  createJWKS,
  generateSelfSignedCert,
  getRSAKeyPair,
  pemToJwk,
} from "../cert-utils";

describe("Certificate Utils", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getRSAKeyPair", () => {
    it("should return null when key file does not exist", () => {
      vi.mocked(fs.existsSync).mockReturnValue(false);

      const result = getRSAKeyPair();
      expect(result).toBeNull();
    });

    it("should return key pair when file exists and OpenSSL succeeds", () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue("mock-private-key");
      vi.mocked(execSync).mockReturnValue("mock-public-key");

      const result = getRSAKeyPair();
      expect(result).toEqual({
        privateKey: "mock-private-key",
        publicKey: "mock-public-key",
      });
    });

    it("should return key with null public key when OpenSSL fails", () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue("mock-private-key");
      vi.mocked(execSync).mockImplementation(() => {
        throw new Error("OpenSSL error");
      });

      const result = getRSAKeyPair();
      expect(result).toEqual({
        privateKey: "mock-private-key",
        publicKey: null,
      });
    });
  });

  describe("pemToJwk", () => {
    it("should convert PEM to JWK format", () => {
      vi.mocked(execSync).mockReturnValue("mock-modulus");

      const result = pemToJwk("mock-pem-key");
      expect(result).toEqual({
        kty: "RSA",
        kid: "test-key-id",
        use: "sig",
        alg: "RS256",
        n: "mock-modulus",
        e: "AQAB",
      });
    });

    it("should return null when conversion fails", () => {
      vi.mocked(execSync).mockImplementation(() => {
        throw new Error("Conversion error");
      });

      const result = pemToJwk("invalid-pem");
      expect(result).toBeNull();
    });
  });

  describe("generateSelfSignedCert", () => {
    it("should generate certificates when they do not exist", () => {
      vi.clearAllMocks();

      vi.mocked(fs.existsSync)
        .mockReturnValueOnce(false) // key.pem
        .mockReturnValueOnce(false); // cert.pem

      vi.mocked(execSync).mockImplementation(() => {
        return "Certificate generated";
      });

      vi.mocked(fs.readFileSync)
        .mockReturnValueOnce("generated-key")
        .mockReturnValueOnce("generated-cert");

      const result = generateSelfSignedCert();
      expect(result).toEqual({
        key: "generated-key",
        cert: "generated-cert",
      });
      expect(vi.mocked(execSync)).toHaveBeenCalledWith(
        expect.stringContaining("openssl req -x509"),
        { stdio: "inherit" },
      );
    });

    it("should use existing certificates when they exist", () => {
      vi.clearAllMocks();

      vi.mocked(fs.existsSync)
        .mockReturnValueOnce(true) // key.pem
        .mockReturnValueOnce(true); // cert.pem

      vi.mocked(fs.readFileSync)
        .mockReturnValueOnce("existing-key")
        .mockReturnValueOnce("existing-cert");

      const result = generateSelfSignedCert();
      expect(result).toEqual({
        key: "existing-key",
        cert: "existing-cert",
      });
    });

    it("should create dummy certificates when OpenSSL fails", () => {
      vi.resetAllMocks();

      vi.mocked(fs.existsSync)
        .mockReturnValueOnce(false) // key.pem
        .mockReturnValueOnce(false); // cert.pem

      vi.mocked(execSync).mockImplementation(() => {
        throw new Error("OpenSSL not available");
      });

      vi.mocked(fs.writeFileSync).mockImplementation(() => {
        // Mock writeFileSync to do nothing
      });

      vi.mocked(fs.readFileSync)
        .mockReturnValueOnce("dummy-key")
        .mockReturnValueOnce("dummy-cert");

      const result = generateSelfSignedCert();
      expect(result).toEqual({
        key: "dummy-key",
        cert: "dummy-cert",
      });
      expect(vi.mocked(fs.writeFileSync)).toHaveBeenCalledWith(
        "/tmp/key.pem",
        "dummy-key",
      );
      expect(vi.mocked(fs.writeFileSync)).toHaveBeenCalledWith(
        "/tmp/cert.pem",
        "dummy-cert",
      );
    });
  });

  describe("createJWKS", () => {
    it("should create JWKS with RSA key when available", () => {
      const rsaKeys = {
        privateKey: Buffer.from("mock-private-key"),
        publicKey: "mock-public-key",
      };

      vi.mocked(execSync).mockReturnValue("mock-modulus");

      const result = createJWKS(rsaKeys);
      expect(result).toEqual({
        keys: [
          {
            kty: "RSA",
            kid: "test-key-id",
            use: "sig",
            alg: "RS256",
            n: "mock-modulus",
            e: "AQAB",
          },
        ],
      });
    });

    it("should create JWKS with hardcoded modulus when RSA key conversion fails", () => {
      const rsaKeys = {
        privateKey: Buffer.from("mock-private-key"),
        publicKey: "mock-public-key",
      };

      vi.mocked(execSync).mockImplementation(() => {
        throw new Error("Conversion error");
      });

      const result = createJWKS(rsaKeys);
      expect(result).toHaveProperty("keys");
      expect(result.keys).toHaveLength(1);
      expect(result.keys[0]).toMatchObject({
        kty: "RSA",
        kid: "test-key-id",
        use: "sig",
        alg: "RS256",
        e: "AQAB",
      });
    });

    it("should create JWKS with hardcoded modulus when no RSA key", () => {
      const result = createJWKS(null);
      expect(result).toHaveProperty("keys");
      expect(result.keys).toHaveLength(1);
      expect(result.keys[0]).toMatchObject({
        kty: "RSA",
        kid: "test-key-id",
        use: "sig",
        alg: "RS256",
        e: "AQAB",
      });
    });
  });
});
