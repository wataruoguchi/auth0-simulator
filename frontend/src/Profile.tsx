import { useAuth0 } from "@auth0/auth0-react";

export function Profile() {
  const { user, isAuthenticated } = useAuth0();

  return isAuthenticated ? (
    <div data-testid="profile">
      <div data-testid="user-name">Hello {user!.name}</div>
      <div data-testid="user-email">{user!.email}</div>
    </div>
  ) : (
    <div data-testid="profile">No user found</div>
  );
}
