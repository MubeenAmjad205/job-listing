import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getIronSession } from 'iron-session';
import { sessionOptions } from '@/lib/session';
import { SessionData } from '@/types';

export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
  ) {
    try {
      // Await the params object to extract the id
      const { id } = await params;
      const userId = parseInt(id, 10);
  
      if (isNaN(userId)) {
        return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
      }
  
      const session = await getIronSession<SessionData>(
        req,
        NextResponse.next(),
        sessionOptions
      );
  
      if (!session.user || session.user.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
  
      const body = await req.json();
  
      if (!body.role) {
        return NextResponse.json({ error: 'Role is required' }, { status: 400 });
      }
  
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { role: body.role },
      });
  
      return NextResponse.json({ updatedUser }, { status: 200 });
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params; 
    const session = await getIronSession<SessionData>(
      req,
      NextResponse.next(),
      sessionOptions
    );
    if (!session.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    await prisma.user.delete({
      where: { id: parseInt(id, 10) },
    });
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
