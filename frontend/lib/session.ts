import { SessionOptions } from "iron-session";

export interface SessionData {
  accessToken: string;
}

export const defaultSession: SessionData = {
  accessToken: "",
};

export const sessionOptions: SessionOptions = {
  password: process.env.IRON_SESSION_PASSWORD || "complex_password_at_least_32_characters_long",
  cookieName: process.env.IRON_SESSION_COOKIE_NAME || "iron_session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
  },
};

import { getIronSession } from "iron-session";
import { cookies } from "next/headers";

export async function getSession() {
  const cookieStore = await cookies();
  return getIronSession<SessionData>(cookieStore, sessionOptions);
}

