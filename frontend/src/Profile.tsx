import { useAuth0 } from "@auth0/auth0-react";

export function Profile() {
  const { user, isAuthenticated, getAccessTokenSilently, getIdTokenClaims } =
    useAuth0();

  // Add detailed logging for user data and tokens
  console.log("👤 Profile Debug:");
  console.log("  isAuthenticated:", isAuthenticated);
  console.log("  user:", user);

  if (isAuthenticated && user) {
    console.log("  user details:", {
      sub: user.sub,
      name: user.name,
      email: user.email,
      picture: user.picture,
      aud: user.aud,
      iss: user.iss,
      iat: user.iat,
      exp: user.exp,
    });

    // Get access token details
    getAccessTokenSilently()
      .then((token) => {
        console.log("🎫 Access Token in Profile:", token);
      })
      .catch((err) => {
        console.error("❌ Access Token Error in Profile:", err);
      });

    // Get ID token details
    getIdTokenClaims()
      .then((claims) => {
        console.log("🆔 ID Token Claims in Profile:", claims);
      })
      .catch((err) => {
        console.error("❌ ID Token Claims Error in Profile:", err);
      });
  }

  return isAuthenticated ? (
    <div data-testid="profile">
      <div data-testid="user-name">Hello {user!.name}</div>
      <div data-testid="user-email">{user!.email}</div>
    </div>
  ) : (
    <div data-testid="profile">No user found</div>
  );
}
