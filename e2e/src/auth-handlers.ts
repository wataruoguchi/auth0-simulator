import { getRSAKeyPair } from "./cert-utils.js";
import {
  createMockUser,
  createTokenPayload,
  generateHMACToken,
  generateRSAToken,
  MockUser,
} from "./jwt-utils.js";

export interface AuthCodeStore {
  get(code: string): string | undefined;
  set(code: string, nonce: string): void;
  delete(code: string): boolean;
}

export class InMemoryAuthCodeStore implements AuthCodeStore {
  private store = new Map<string, string>();

  get(code: string): string | undefined {
    return this.store.get(code);
  }

  set(code: string, nonce: string): void {
    this.store.set(code, nonce);
  }

  delete(code: string): boolean {
    return this.store.delete(code);
  }
}

export interface AuthConfig {
  issuer: string;
  port: number;
  authCodeStore: AuthCodeStore;
  mockUser: MockUser;
}

export const createAuthConfig = (port: number = 4400): AuthConfig => {
  const issuer = `https://localhost:${port}/`;
  return {
    issuer,
    port,
    authCodeStore: new InMemoryAuthCodeStore(),
    mockUser: createMockUser(issuer),
  };
};

export const generateAuthCode = (): string => {
  return "test-auth-code-" + Date.now();
};

export const createOpenIDConfig = (issuer: string) => ({
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

export const createLoginForm = (params: Record<string, string>): string => {
  const {
    client_id,
    redirect_uri,
    state,
    response_type,
    scope,
    code_challenge,
    code_challenge_method,
    nonce,
  } = params;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Auth0 Simulator Login</title>
      <style>
        body { font-family: Arial, sans-serif; max-width: 400px; margin: 50px auto; padding: 20px; }
        .form-group { margin-bottom: 15px; }
        label { display: block; margin-bottom: 5px; }
        input { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; }
        button { background: #007bff; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; }
        button:hover { background: #0056b3; }
      </style>
    </head>
    <body>
      <h2>Auth0 Simulator Login</h2>
      <form method="post" action="/login">
        <input type="hidden" name="client_id" value="${client_id}">
        <input type="hidden" name="redirect_uri" value="${redirect_uri}">
        <input type="hidden" name="state" value="${state}">
        <input type="hidden" name="response_type" value="${response_type}">
        <input type="hidden" name="scope" value="${scope}">
        <input type="hidden" name="code_challenge" value="${code_challenge}">
        <input type="hidden" name="code_challenge_method" value="${code_challenge_method}">
        <input type="hidden" name="nonce" value="${nonce}">
        
        <div class="form-group">
          <label for="email">Email:</label>
          <input type="email" id="email" name="email" value="test@example.com" required>
        </div>
        
        <div class="form-group">
          <label for="password">Password:</label>
          <input type="password" id="password" name="password" value="password123" required>
        </div>
        
        <button data-testid="simulator-login-button" type="submit">Login</button>
      </form>
    </body>
    </html>
  `;
};

export const createLogoutPage = (): string => `
  <!DOCTYPE html>
  <html>
  <head>
    <title>Logged Out</title>
    <style>
      body { font-family: Arial, sans-serif; max-width: 400px; margin: 50px auto; padding: 20px; text-align: center; }
      .success { color: #28a745; }
    </style>
  </head>
  <body>
    <h2 class="success">Successfully Logged Out</h2>
    <p>You have been logged out of the Auth0 simulator.</p>
    <a href="http://localhost:3000">Return to App</a>
  </body>
  </html>
`;

export const processLogin = (
  formData: Record<string, string>,
  authConfig: AuthConfig,
): { redirectUrl: string; authCode: string } => {
  const {
    client_id,
    redirect_uri,
    state,
    response_type,
    scope,
    code_challenge,
    code_challenge_method,
    nonce,
  } = formData;

  // Generate authorization code
  const authCode = generateAuthCode();

  // Store the nonce with the authorization code
  if (nonce) {
    authConfig.authCodeStore.set(authCode, nonce);
  }

  // Create redirect URL
  const redirectUrl = new URL(redirect_uri);
  redirectUrl.searchParams.set("code", authCode);
  redirectUrl.searchParams.set("state", state);

  return { redirectUrl: redirectUrl.toString(), authCode };
};

export const processTokenExchange = (
  tokenData: Record<string, string>,
  authConfig: AuthConfig,
): {
  access_token: string;
  id_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
} => {
  const { code, grant_type, redirect_uri, client_id, code_verifier } =
    tokenData;

  if (grant_type !== "authorization_code" || !code) {
    throw new Error("Invalid token request");
  }

  // Retrieve the nonce associated with this authorization code
  const nonce = authConfig.authCodeStore.get(code);
  const tokenPayload = createTokenPayload(authConfig.mockUser, nonce);

  // Try to use RSA key if available, fallback to HMAC
  const rsaKeys = getRSAKeyPair();
  let accessToken: string;
  let idToken: string;

  if (rsaKeys && rsaKeys.privateKey) {
    accessToken = generateRSAToken(
      tokenPayload,
      rsaKeys.privateKey.toString(),
      "test-key-id",
    );
    idToken = generateRSAToken(
      tokenPayload,
      rsaKeys.privateKey.toString(),
      "test-key-id",
    );
  } else {
    accessToken = generateHMACToken(tokenPayload);
    idToken = generateHMACToken(tokenPayload);
  }

  return {
    access_token: accessToken,
    id_token: idToken,
    token_type: "Bearer",
    expires_in: 3600,
    refresh_token: "test-refresh-token",
  };
};
