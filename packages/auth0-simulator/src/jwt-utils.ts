import jwt from "jsonwebtoken";

export interface MockUser {
  sub: string;
  email: string;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  aud: string;
  iss: string;
  azp: string;
  scope: string;
  nonce?: string;
}

export interface TokenPayload {
  sub: string;
  email: string;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  aud: string;
  iss: string;
  azp: string;
  scope: string;
  nonce?: string;
  iat: number;
  exp: number;
}

export const JWT_SECRET = "test-secret-key";

export const createMockUser = (issuer: string): MockUser => ({
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

export const createTokenPayload = (
  user: MockUser,
  nonce?: string,
): TokenPayload => {
  const now = Math.floor(Date.now() / 1000);
  return {
    ...user,
    iat: now,
    exp: now + 3600, // 1 hour from now
    ...(nonce && { nonce }),
  };
};

export const generateToken = (
  payload: TokenPayload,
  privateKey: string,
  algorithm: "HS256" | "RS256" = "HS256",
  keyId?: string,
): string => {
  const options: jwt.SignOptions = { algorithm };
  if (keyId) {
    options.keyid = keyId;
  }

  return jwt.sign(payload, privateKey, options);
};

export const generateHMACToken = (payload: TokenPayload): string => {
  return generateToken(payload, JWT_SECRET, "HS256");
};

export const generateRSAToken = (
  payload: TokenPayload,
  privateKey: string,
  keyId: string,
): string => {
  return generateToken(payload, privateKey, "RS256", keyId);
};

export const verifyToken = (
  token: string,
  secret: string,
  algorithm: "HS256" | "RS256" = "HS256",
): any => {
  return jwt.verify(token, secret, { algorithms: [algorithm] });
};

export const decodeToken = (token: string): any => {
  return jwt.decode(token);
};
