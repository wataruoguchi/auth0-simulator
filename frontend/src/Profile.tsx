import { useAuth0 } from "@auth0/auth0-react";

export function Profile() {
  const { user, isAuthenticated } = useAuth0();

  return isAuthenticated ? (
    <div>Hello {user!.name}</div>
  ) : (
    <div>No user found</div>
  );
}
