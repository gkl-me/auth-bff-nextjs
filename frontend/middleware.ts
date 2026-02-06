import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getIronSession } from "iron-session";
import { sessionOptions, SessionData } from "./lib/session";
import { isProtectedRoute, refreshAuthToken, updateSessionAndCookies } from "./lib/auth-helpers";


export async function middleware(req: NextRequest) {
  console.log("middleware")
  // 1. Init response
  const res = NextResponse.next();
  const session = await getIronSession<SessionData>(req, res, sessionOptions);

  const { pathname } = req.nextUrl;

  // Protected Routes
  if (isProtectedRoute(pathname)) {
    const hasRefreshToken = req.cookies.has("refreshToken");
    
    // Case: No Access Token but we have Refresh Token
    if (!session.accessToken && hasRefreshToken) {
        const refreshToken = req.cookies.get("refreshToken")?.value;
        if (refreshToken) {
            const newTokens = await refreshAuthToken(refreshToken);
            
            if (newTokens) {
                return await updateSessionAndCookies(req, session, newTokens);
            }
            // If refresh fails, we fall through. 
            // Original behavior was to NOT redirect if hasRefreshToken is true, 
            // even if refresh failed. 
        }
    }

    if (!session.accessToken && !hasRefreshToken) {
        // Redirect to login
        const url = req.nextUrl.clone();
        url.pathname = "/login";
        url.searchParams.set("reason", "unauthorized");
        return NextResponse.redirect(url);
    }
  }

  return res;
}

export const config = {
  matcher: ["/profile/:path*", "/admin/:path*"],
};


