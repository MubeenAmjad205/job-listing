// app/api/jobs/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import {prisma} from "@/lib/prisma";
import { sessionOptions } from "@/lib/session";


interface SessionData {
  user?:{
    id: number;
    email: string;
    role: string;
  }
}




export async function POST(req: NextRequest) {
  try {
    const session = await getIronSession<SessionData>(req, NextResponse.next(), sessionOptions);
    
    if (!session.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const job = await prisma.job.create({
      data: {
        ...body,
        postedById: session.user.id,
      },
    });

    return NextResponse.json(job);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create job',catch:error },
      { status: 500 }
    );
  }
}

export async function GET() {
  try{

    const jobs = await prisma.job.findMany({
      include: {
        postedBy: true,
      },
      
    });
    return NextResponse.json(jobs,{ status: 200  });
  }catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch jobs',catch:error  },
      { status: 500 }
    );
  }
}
