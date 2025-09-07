import { useAuth0 } from "@auth0/auth0-react";

export function LoginButton() {
  const { isAuthenticated, loginWithRedirect, isLoading, error, user, getAccessTokenSilently } = useAuth0();

  // Add comprehensive logging
  console.log("🔍 Frontend Auth0 Debug:");
  console.log("  isAuthenticated:", isAuthenticated);
  console.log("  isLoading:", isLoading);
  console.log("  error:", error);
  console.log("  user:", user);
  console.log("  Auth0 domain:", import.meta.env.VITE_AUTH0_DOMAIN);
  console.log("  Auth0 clientId:", import.meta.env.VITE_AUTH0_CLIENT_ID);
  console.log("  Auth0 audience:", import.meta.env.VITE_AUTH0_AUDIENCE);

  const handleLogin = async () => {
    console.log("🚀 Starting login process...");
    try {
      await loginWithRedirect();
    } catch (err) {
      console.error("❌ Login error:", err);
    }
  };

  // Check if we have tokens
  if (isAuthenticated) {
    getAccessTokenSilently().then(token => {
      console.log("🎫 Access token:", token);
    }).catch(err => {
      console.error("❌ Token error:", err);
    });
  }

  return (
    !isAuthenticated && (
      <button
        type="button"
        data-testid="login-button"
        onClick={handleLogin}
      >
        Log in
      </button>
    )
  );
}
