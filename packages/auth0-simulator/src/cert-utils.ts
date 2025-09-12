import { execSync } from "child_process";
import fs from "fs";

export interface KeyPair {
  privateKey: Buffer;
  publicKey: string | null;
}

export interface CertificatePair {
  key: Buffer;
  cert: Buffer;
}

export const getRSAKeyPair = (
  keyPath: string = "/tmp/test-rsa-key.pem",
): KeyPair | null => {
  if (!fs.existsSync(keyPath)) {
    return null;
  }

  const privateKey = fs.readFileSync(keyPath);

  try {
    const publicKey = execSync(
      `openssl rsa -in ${keyPath} -pubout -outform PEM`,
      { encoding: "utf8" },
    );
    return {
      privateKey,
      publicKey,
    };
  } catch (error) {
    console.error("Error extracting public key:", error);
    return {
      privateKey,
      publicKey: null,
    };
  }
};

export const pemToJwk = (pemKey: string): any | null => {
  try {
    const modulus = execSync(
      `echo "${pemKey}" | openssl rsa -pubin -modulus -noout | sed 's/Modulus=//' | xxd -r -p | base64 -w 0 | tr -d '=' | tr '/+' '_-'`,
      { encoding: "utf8" },
    ).trim();

    return {
      kty: "RSA",
      kid: "test-key-id",
      use: "sig",
      alg: "RS256",
      n: modulus,
      e: "AQAB", // Standard exponent for RSA
    };
  } catch (error) {
    console.error("Error converting PEM to JWK:", error);
    return null;
  }
};

export const generateSelfSignedCert = (
  keyPath: string = "/tmp/key.pem",
  certPath: string = "/tmp/cert.pem",
): CertificatePair => {
  // Generate self-signed certificate if it doesn't exist
  if (!fs.existsSync(keyPath) || !fs.existsSync(certPath)) {
    try {
      execSync(
        `openssl req -x509 -newkey rsa:4096 -keyout "${keyPath}" -out "${certPath}" -days 365 -nodes -subj "/C=US/ST=Test/L=Test/O=Test/CN=localhost"`,
        { stdio: "inherit" },
      );
      console.log("Generated self-signed certificate for HTTPS");
    } catch (error) {
      console.warn("Could not generate self-signed certificate:", error);
      // Create dummy certificates for testing
      fs.writeFileSync(keyPath, "dummy-key");
      fs.writeFileSync(certPath, "dummy-cert");
    }
  }

  return {
    key: fs.readFileSync(keyPath),
    cert: fs.readFileSync(certPath),
  };
};

export const createJWKS = (rsaKeys: KeyPair | null): any => {
  if (rsaKeys && rsaKeys.publicKey) {
    const jwk = pemToJwk(rsaKeys.publicKey);
    if (jwk) {
      return { keys: [jwk] };
    }
    // Fallback to hardcoded modulus when conversion fails
    return {
      keys: [
        {
          kty: "RSA",
          kid: "test-key-id",
          use: "sig",
          alg: "RS256",
          n: "hardcoded-modulus",
          e: "AQAB",
        },
      ],
    };
  }
  throw new Error("createJWKS: No RSA key found");
};
