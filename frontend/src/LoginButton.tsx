import { useAuth0 } from "@auth0/auth0-react";

export function LoginButton() {
  const { isAuthenticated, loginWithRedirect } = useAuth0();

  const handleLogin = async () => {
    try {
      await loginWithRedirect();
    } catch (err) {
      console.error("Login error:", err);
    }
  };

  return (
    !isAuthenticated && (
      <button type="button" data-testid="login-button" onClick={handleLogin}>
        Log in
      </button>
    )
  );
}
