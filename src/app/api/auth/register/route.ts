import { NextResponse } from 'next/server';
import { hash } from 'bcrypt';
import { registerSchema } from '@/schemas';
import { prisma } from '@/lib/prisma';



export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsedData = registerSchema.parse(body);

    const hashedPassword = await hash(parsedData.password, 10);

    const newUser = await prisma.user.create({
      data: {
        name: parsedData.name,
        email: parsedData.email,
        password: hashedPassword
      }
    });

    return NextResponse.json(newUser, { status: 201 });
  }  catch (error) {  
    if (error instanceof Error) {  
      return NextResponse.json(  
        { error: error.message || "Failed to Register" },  
        { status: 500 }  
      );  
    }  
    return NextResponse.json(  
      { error: "Unknown error occurred" },  
      { status: 500 }  
    );  
  } 
}
