/**
 * Google OAuth Helper for Oxpecker AI
 * Integrates Google Identity Services (GIS) with Client ID
 */

export interface GoogleUserProfile {
  name: string;
  email: string;
  picture: string;
  sub: string;
}

export const GOOGLE_CLIENT_ID =
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
  "17336209293-o2nb2ujc7m36cu851qraclb3shrt2g1n.apps.googleusercontent.com";

// Loads Google Identity Services client script dynamically
export function loadGoogleGsiScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve(false);
      return;
    }

    if ((window as any).google?.accounts?.oauth2) {
      resolve(true);
      return;
    }

    const existingScript = document.getElementById("google-gsi-client");
    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(true));
      return;
    }

    const script = document.createElement("script");
    script.id = "google-gsi-client";
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => resolve(true);
    script.onerror = () => {
      console.warn("Failed to load Google GSI script from CDN.");
      resolve(false);
    };
    document.head.appendChild(script);
  });
}

/**
 * Initiates Google OAuth popup and retrieves user profile (Name, Email, Picture)
 */
export async function initiateGoogleSignIn(): Promise<GoogleUserProfile> {
  const loaded = await loadGoogleGsiScript();

  if (!loaded || !(window as any).google?.accounts?.oauth2) {
    throw new Error("Google Sign-In service could not be loaded. Please check your internet connection.");
  }

  return new Promise((resolve, reject) => {
    try {
      const client = (window as any).google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: "openid email profile",
        callback: async (tokenResponse: any) => {
          if (tokenResponse.error) {
            reject(new Error(tokenResponse.error_description || tokenResponse.error || "Google authentication was cancelled."));
            return;
          }

          if (!tokenResponse.access_token) {
            reject(new Error("No access token returned from Google."));
            return;
          }

          try {
            // Fetch verified user profile info from Google's userinfo API
            const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
              headers: {
                Authorization: `Bearer ${tokenResponse.access_token}`,
              },
            });

            if (!res.ok) {
              throw new Error("Failed to fetch profile details from Google.");
            }

            const data = await res.json();
            resolve({
              name: data.name || data.given_name || "Google User",
              email: data.email,
              picture: data.picture || "",
              sub: data.sub || data.id || "",
            });
          } catch (fetchErr: any) {
            reject(new Error(fetchErr.message || "Failed to retrieve Google profile details."));
          }
        },
        error_callback: (err: any) => {
          reject(new Error(err.message || "Google OAuth window closed or failed to open."));
        },
      });

      // Trigger the Google OAuth popup
      client.requestAccessToken({ prompt: "consent" });
    } catch (e: any) {
      reject(new Error(e.message || "Could not launch Google Sign-In."));
    }
  });
}
