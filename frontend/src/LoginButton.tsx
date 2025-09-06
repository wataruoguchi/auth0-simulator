import { useAuth0 } from "@auth0/auth0-react";

export function LoginButton() {
  const { isAuthenticated, loginWithRedirect } = useAuth0();

  return (
    !isAuthenticated && (
      <button 
        type="button" 
        data-testid="login-button"
        onClick={() => loginWithRedirect()}
      >
        Log in
      </button>
    )
  );
}
