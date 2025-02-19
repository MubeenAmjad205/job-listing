// app/api/auth/register/route.ts
import { NextResponse } from 'next/server';
import { hash } from 'bcrypt';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
 // Ensure you have a prisma instance exported from a file like /lib/prisma

// Define the input schema with Zod 
const registerSchema = z.object({
  name: z.string().min(1, { message: 'Name is required' }),
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' })
});
const prisma = new PrismaClient();  

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsedData = registerSchema.parse(body);

    // Hash the password
    const hashedPassword = await hash(parsedData.password, 10);

    // Create a new user in the database
    const newUser = await prisma.user.create({
      data: {
        name: parsedData.name,
        email: parsedData.email,
        password: hashedPassword
      }
    });

    return NextResponse.json(newUser, { status: 201 });
  }  catch (error) {  
    // Ensure that error is typed correctly.  
    if (error instanceof Error) {  
      return NextResponse.json(  
        { error: error.message || "Failed to Register" },  
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
