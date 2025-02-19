// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getIronSession } from "iron-session";
import { sessionOptions } from "@/lib/session";
import bcrypt from "bcrypt";


declare global {
  interface IronSessionData {
    user?: {
      id: string;
      name: string;
      email: string;
      role: string;
    };
  }
}

interface SessionData {
  user?:{
    name:string
    id: number;
    email: string;
    role: string;
  }
}



const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Find the user by email
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Compare provided password with the stored hashed password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Create a response with a JSON payload
    const res = NextResponse.json(
      {
        success: true,
        message: "Login successful",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
      { status: 200 }
    );

    // Use Iron Session to create the session and set the session cookie.
    // In local development, ensure secure is false so cookies are set over HTTP.
    const session = await getIronSession<SessionData>(req, res, {
      cookieName: sessionOptions.cookieName,
      password: sessionOptions.password,
      cookieOptions: {
        ...sessionOptions.cookieOptions,
        secure: process.env.NODE_ENV === "production", // false in local
      },
    });

    // Store user info (including role) in the session.
    session.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    await session.save();

    // The session cookie is automatically set in the response.
    return res;
  }  catch (error) {  
    // Ensure that error is typed correctly.  
    if (error instanceof Error) {  
      return NextResponse.json(  
        { error: error.message || "Failed to login" },  
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
