// lib/session.ts
// import { SessionOptions } from "iron-session";

// lib/session.ts
export const sessionOptions = {
  cookieName: "session",
  password: process.env.SESSION_SECRET as string,
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    path: "/",
    sameSite: "lax" as const,
    // Add maxAge for automatic expiration
    maxAge: 60 * 60 * 24 * 7 // 1 week
  },
};

// Extend the Iron Session data to include our user data.
declare module "iron-session" {
  interface IronSessionData {
    user?: {
      id: number;
      email: string;
      role: string; // "user" or "admin"
    };
  }
}

