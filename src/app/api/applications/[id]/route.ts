// app/api/applications/[id]/resume/route.ts  
import { NextRequest, NextResponse } from 'next/server';  
import { prisma } from '@/lib/prisma';  
import { z } from 'zod';  

export async function GET( { params }:any) {  
  try {  
    
    // Here, `params` is already the correct type, no need for `await`  
    const { id } = await params; // `params` does not need to be awaited for destructuring  
    const application = await prisma.application.findUnique({  
      where: { id: Number(id) },  
      select: { resume: true }  
    });  

    if (!application) {  
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });  
    }  

    return NextResponse.redirect(application.resume);  
  } catch (error) {  
    if (error instanceof Error) {  
      return NextResponse.json(  
        { error: error.message || "Failed to get session" },  
        { status: 500 }  
      );  
    }  
    return NextResponse.json(  
      { error: "Unknown error occurred" },  
      { status: 500 }  
    );  
  }   
}  

const updateSchema = z.object({  
  status: z.enum(['approved', 'rejected', 'pending'])  
});  

export async function PUT(  
  request: NextRequest,  
  { params }: any  
) {  
  try {  
    // Same change here: no need to await `params`  
    const { id } =await params;  
    const applicationId = parseInt(id);  

    if (isNaN(applicationId)) {  
      return NextResponse.json(  
        { error: 'Invalid application ID' },  
        { status: 400 }  
      );  
    }  

    const body = await request.json();  
    const validation = updateSchema.safeParse(body);  
    
    if (!validation.success) {  
      return NextResponse.json(  
        { error: validation.error.errors[0].message },  
        { status: 400 }  
      );  
    }  

    const { status } = validation.data;  

    const existingApplication = await prisma.application.findUnique({  
      where: { id: applicationId }  
    });  

    if (!existingApplication) {  
      return NextResponse.json(  
        { error: 'Application not found' },  
        { status: 404 }  
      );  
    }  

    const updatedApplication = await prisma.application.update({  
      where: { id: applicationId },  
      data: { status }  
    });  

    return NextResponse.json(  
      { success: true, application: updatedApplication },  
      { status: 200 }  
    );  

  } catch (error) {  
    console.error('Error updating application:', error);  
    return NextResponse.json(  
      { error: 'Internal server error' },  
      { status: 500 }  
    );  
  }  
}