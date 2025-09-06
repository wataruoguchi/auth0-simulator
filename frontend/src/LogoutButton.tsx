import { useAuth0 } from "@auth0/auth0-react";

export function LogoutButton() {
  const { isAuthenticated, logout } = useAuth0();

  return (
    isAuthenticated && (
      <button
        type="button"
        onClick={() => {
          logout({
            logoutParams: {
              returnTo: window.location.origin,
            },
          });
        }}
      >
        Log out
      </button>
    )
  );
}
