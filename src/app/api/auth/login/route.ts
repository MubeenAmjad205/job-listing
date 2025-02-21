import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getIronSession } from "iron-session";
import { sessionOptions } from "@/lib/session";
import bcrypt from "bcrypt";
import { SessionData } from "@/types";







const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

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

    const session = await getIronSession<SessionData>(req, res, {
      cookieName: sessionOptions.cookieName,
      password: sessionOptions.password,
      cookieOptions: {
        ...sessionOptions.cookieOptions,
        secure: process.env.NODE_ENV === "production",
      },
    });

    session.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    await session.save();

    return res;
  }  catch (error) {  
    if (error instanceof Error) {  
      return NextResponse.json(  
        { error: error.message || "Failed to login" },  
        { status: 500 }  
      );  
    }  
    return NextResponse.json(  
      { error: "Unknown error occurred" },  
      { status: 500 }  
    );  
  } 
}
