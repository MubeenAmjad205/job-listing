import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { prisma } from '@/lib/prisma';
import { sessionOptions } from '@/lib/session';

interface SessionData {
  user?: {
    id: number;
    email: string;
    role: string;
  };
}

export async function GET(req: NextRequest) {
  try {
    const session = await getIronSession<SessionData>(req, NextResponse.next(), sessionOptions);

    if (!session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const applications = await prisma.application.findMany({
      where: { userId: session.user.id },
      include: {
        job: true, 
      },
    });

    return NextResponse.json(applications, { status: 200 });
  } catch (error) {
    console.error('Error fetching applications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch applications', catch: error },
      { status: 500 }
    );
  }
}
