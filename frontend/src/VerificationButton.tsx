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
              console.log("🔍 Verification Debug:");
              const token = await getAccessTokenSilently();
              console.log("  Access token for verification:", token);
              
              const response = await fetch(
                `${import.meta.env.VITE_API_URL}/api/verify`,
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                },
              );
              
              console.log("  API response status:", response.status);
              console.log("  API response headers:", Object.fromEntries(response.headers.entries()));
              
              if (!response.ok) {
                const errorText = await response.text();
                console.error("  API error response:", errorText);
                throw new Error(`Failed to verify token: ${response.status} ${errorText}`);
              }
              
              const data = await response.json();
              console.log("  API response data:", data);
              setIsVerified(data.verified);
              console.log("  Verification result:", data.verified);
              console.log("  JWT payload:", data.payload);
            } catch (error) {
              console.error("❌ Verification error:", error);
              setIsVerified(false);
            }
            setIsVerifying(false);
          }}
        >
          {isVerifying ? "Verifying..." : "Verify"}
        </button>
        <p data-testid="verification-result">
          {isVerified ? "Verified" : "Not Verified"} by the backend.
        </p>
      </div>
    )
  );
}
