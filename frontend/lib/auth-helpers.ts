import { NextRequest, NextResponse } from "next/server";
import { sealData } from "iron-session";
import { sessionOptions } from "./session";
import { redirect } from "next/navigation";

// Define the shape of the token response from the backend
interface TokenResponse {
  accessToken: string;
  refreshToken?: string;
}

/**
 * Checks if the given pathname requires authentication.
 */
export function isProtectedRoute(pathname: string): boolean {
  return pathname.startsWith("/profile") || pathname.startsWith("/admin");
}

/**
 * Attempts to refresh the access token using the provided refresh token.
 */
export async function refreshAuthToken(refreshToken: string): Promise<TokenResponse | null> {
  try {
    // Note: Use absolute URL for server-side fetches
    const refreshRes = await fetch("http://localhost:3001/refreshtoken///", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: refreshToken }),
    });

    if (refreshRes.ok) {
      return await refreshRes.json();
    }
  } catch (error) {
    console.error("Helper refresh failed:", error);
  }
  return null;
}

/**
 * Updates the session with the new access token, constructs the necessary headers
 * to pass the updated session to both the *request* (for Server Components)
 * and the *response* (for the Client).
 */
export async function updateSessionAndCookies(
  req: NextRequest,
  session: any, // Typed as 'any' to avoid complex IronSession generic imports, but effectively IronSession<SessionData>
  newTokens: TokenResponse
): Promise<NextResponse> {
  // 1. Update Session object in memory
  session.accessToken = newTokens.accessToken;
  // We don't strictly need session.save() here if we are manually sealing, 
  // but it's good practice if we were using 'res' from getIronSession. 
  // Here we are building a NEW response.
  await session.save();

  // 2. Seal the data manually to create the cookie string
  const sealedSession = await sealData(session, {
    password: sessionOptions.password,
  });

  // ----------------------------------------------------------------------
  // CRITICAL FIX: To make the new session available to the Server Component
  // immediately, we must update the REQUEST headers.
  // ----------------------------------------------------------------------

  const requestHeaders = new Headers(req.headers);

  // We need to build the full "Cookie" header string.
  // A. Get all existing cookies
  const allCookies = new Map();
  req.cookies.getAll().forEach((c) => allCookies.set(c.name, c.value));

  // B. Overwrite with New Cookies
  allCookies.set(sessionOptions.cookieName || "iron_session", sealedSession);
  if (newTokens.refreshToken) {
    allCookies.set("refreshToken", newTokens.refreshToken);
  }

  // C. Construct new Cookie header
  const newCookieString = Array.from(allCookies.entries())
    .map(([name, value]) => `${name}=${value}`)
    .join("; ");

  requestHeaders.set("Cookie", newCookieString);

  // 3. Create response that uses new headers for the *Request*
  const finalRes = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  // 4. Persist cookies to the *Client* (Response)
  finalRes.cookies.set(
    sessionOptions.cookieName!,
    sealedSession,
    sessionOptions.cookieOptions!
  );

  if (newTokens.refreshToken) {
    finalRes.cookies.set("refreshToken", newTokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/", // Ensure path matches
      maxAge: 7 * 24 * 60 * 60,
    });
  }

  return finalRes;
}


//function to redirect if the error status is 401 or 403
export function handleServerError(error: unknown) {

  redirect('/login')

}
