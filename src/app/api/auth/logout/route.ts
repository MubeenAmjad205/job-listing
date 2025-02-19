// app/api/auth/logout/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { sessionOptions } from "@/lib/session";

export async function POST(req: NextRequest) {
  try {
    const session = await getIronSession(req, NextResponse.next(), {
      cookieName: sessionOptions.cookieName,
      password: sessionOptions.password,
      cookieOptions: sessionOptions.cookieOptions,
    });

    // Destroy the iron session
    session.destroy();

    // Create the response
    const response = NextResponse.json(
      { success: true, message: "Logged out successfully" },
      { status: 200 }
    );

    // Clear the cookie manually to ensure removal
    response.cookies.set(sessionOptions.cookieName, "", {
      path: "/",
      maxAge: -1, // Immediately expire
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    return response;
  }  catch (error) {  
    // Ensure that error is typed correctly.  
    if (error instanceof Error) {  
      return NextResponse.json(  
        { error: error.message || "Failed to logout" },  
        { status: 500 }  
      );  
    }  
    // In case the error is not an instance of Error  
    return NextResponse.json(  
      { error: "Unknown error occurred" },  
      { status: 500 }  
    );  
  } 
}