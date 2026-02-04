import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getIronSession } from "iron-session";
import { sessionOptions, SessionData } from "./lib/session";

export async function middleware(req: NextRequest) {
  console.log("middleware is running")
  const res = NextResponse.next();
  const session = await getIronSession<SessionData>(req, res, sessionOptions);

  const { pathname } = req.nextUrl;

  // Protected Routes
  if (pathname.startsWith("/profile") || pathname.startsWith("/admin")) {
    const hasRefreshToken = req.cookies.has("refreshToken");
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
