import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getIronSession } from 'iron-session';
import { sessionOptions } from '@/lib/session';

interface SessionData {
  user?: {
    id: number;
    email: string;
    role: string;
  }
}

const prisma = new PrismaClient();

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await the params to resolve the promise
    const { id } = await params;
    const jobId = parseInt(id, 10);
    const job = await prisma.job.findUnique({
      where: { id: jobId },
    });
    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }
    return NextResponse.json(job, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
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
    const jobId = parseInt(id, 10);
    const body = await req.json();
    const updated = await prisma.job.update({
      where: { id: jobId },
      data: {
        title: body.title,
        description: body.description,
        category: body.category,
        location: body.location,
        salary: body.salary,
      },
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
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
    const jobId = parseInt(id, 10);
    await prisma.job.delete({
      where: { id: jobId },
    });
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
