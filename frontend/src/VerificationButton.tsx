import { useAuth0 } from "@auth0/auth0-react";
import { useState } from "react";

export function VerificationButton() {
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();

  const [isVerified, setIsVerified] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  return (
    isAuthenticated && (
      <div>
        <button
          type="button"
          data-testid="verify-button"
          onClick={async () => {
            setIsVerifying(true);
            setIsVerified(false);
            try {
              const token = await getAccessTokenSilently();

              const response = await fetch(
                `${import.meta.env.VITE_API_URL}/api/verify`,
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                },
              );

              if (!response.ok) {
                const errorText = await response.text();
                throw new Error(
                  `Failed to verify token: ${response.status} ${errorText}`,
                );
              }

              const data = await response.json();
              setIsVerified(data.verified);
            } catch (error) {
              console.error("Verification error:", error);
              setIsVerified(false);
            }
            setIsVerifying(false);
          }}
        >
          {isVerifying ? "Verifying..." : "Verify"}
        </button>
        <p data-testid="verification-result">
          {isVerified ? "Verified" : "Unverified"} by the backend.
        </p>
      </div>
    )
  );
}
