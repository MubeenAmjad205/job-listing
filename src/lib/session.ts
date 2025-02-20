
export const sessionOptions = {
  cookieName: "session",
  password: process.env.SESSION_SECRET as string,
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    path: "/",
    sameSite: "lax" as const,
    maxAge: 60 * 60 * 24 * 7 
  },
};

declare module "iron-session" {
  interface IronSessionData {
    user?: {
      id: number;
      email: string;
      role: string; 
    };
  }
}

