import { fetchWithTimeout } from "@/lib/feeds/adapter";

// Resolves a Gmail API access token from env, supporting two modes:
//
//  1. Quick test: set GMAIL_ACCESS_TOKEN to a short-lived token
//     (e.g. from the OAuth Playground). Expires in ~1 hour.
//
//  2. Long-lived (recommended): set GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET and
//     GMAIL_REFRESH_TOKEN. The refresh token is exchanged for a fresh access
//     token on each request, so it never silently expires.
//
// Required scope: https://www.googleapis.com/auth/gmail.readonly

interface TokenResponse {
  access_token?: string;
  expires_in?: number;
  error?: string;
  error_description?: string;
}

// Simple in-memory cache so we don't mint a new token on every feed request.
let cached: { token: string; expiresAt: number } | null = null;

export async function getGmailAccessToken(): Promise<string | null> {
  const staticToken = process.env.GMAIL_ACCESS_TOKEN;
  const clientId = process.env.GMAIL_CLIENT_ID;
  const clientSecret = process.env.GMAIL_CLIENT_SECRET;
  const refreshToken = process.env.GMAIL_REFRESH_TOKEN;

  // Prefer the refresh-token flow when fully configured.
  if (clientId && clientSecret && refreshToken) {
    if (cached && cached.expiresAt > Date.now() + 60_000) {
      return cached.token;
    }
    const res = await fetchWithTimeout("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: "refresh_token",
      }).toString(),
    });
    const data = (await res.json()) as TokenResponse;
    if (!res.ok || !data.access_token) {
      throw new Error(
        `Gmail token refresh failed: ${data.error || res.status}${
          data.error_description ? ` (${data.error_description})` : ""
        }`
      );
    }
    cached = {
      token: data.access_token,
      expiresAt: Date.now() + (data.expires_in ?? 3600) * 1000,
    };
    return cached.token;
  }

  // Fall back to the static token (quick test mode).
  return staticToken || null;
}
