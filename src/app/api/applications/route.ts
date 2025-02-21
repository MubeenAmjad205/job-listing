import { NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { sessionOptions } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import cloudinary from '@/lib/cloudinary';
import upload from '@/lib/multer';
import { Readable } from 'stream';
import { SessionData } from '@/types';

interface MulterFile extends Express.Multer.File {
  buffer: Buffer;
}

export const config = {
  runtime: 'nodejs', 
  api: {
    bodyParser: false, 
  },
};



interface MulterRequest extends NodeJS.ReadableStream {
  headers: Record<string, string | string[]>;
  method: string;
  body: Record<string, any>;
  file?: MulterFile;
}

type MiddlewareFn = (
  req: MulterRequest,
  res: unknown,
  callback: (result?: unknown) => void
) => void;

function runMiddleware(
  req: MulterRequest,
  res: unknown,
  fn: MiddlewareFn
): Promise<unknown> {
  return new Promise((resolve, reject) => {
    fn(req, res, (result?: unknown) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
}

interface CloudinaryUploadResult {
  secure_url?: string;
}

export async function POST(req: Request) {
  try {
    const session = await getIronSession<SessionData>(req, NextResponse.next(), sessionOptions);
    if (!session.user || session.user.role === 'admin') {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    const arrayBuffer = await req.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const stream = Readable.from(buffer);
    const reqAny = stream as any;
    reqAny.headers = Object.fromEntries(req.headers);
    reqAny.method = req.method;
    reqAny.body = {};

    const uploads:any=  upload.single('resume')
    await runMiddleware(reqAny, {}, uploads);

    const { jobId, fullName, email, coverLetter } = reqAny.body;
    const resumeFile = reqAny.file;

    if (!jobId || !fullName || !email || !coverLetter || !resumeFile) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    const cloudinaryResponse: CloudinaryUploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: 'auto',
          folder: 'job-portal/resumes',
        },
        (error, result:any) => {
          if (error) {
            return reject(error);
          }
          return resolve(result);
        }
      ).end(resumeFile.buffer);
    });

    if (!cloudinaryResponse || !cloudinaryResponse.secure_url) {
      throw new Error('Cloudinary upload failed');
    }

    const job = await prisma.job.findUnique({
      where: { id: Number(jobId) },
      select: { title: true },
    });

    const application = await prisma.application.create({
      data: {
        userName: fullName.toString(),
        email: email.toString(),
        jobTitle: job?.title??"", 
        jobId: parseInt(jobId.toString(), 10),
        userId: session.user.id,
        resume: cloudinaryResponse.secure_url,
        coverLetter: coverLetter.toString(),
        status: 'pending',
      },
    });

    return NextResponse.json({ success: true, application }, { status: 201 });
  } catch (error: unknown) {
    console.error('Application error:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Application submission failed';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function GET(_req: Request) {
  try {
    const applications = await prisma.application.findMany({
      include: {
        job: true,
        user: true,
        
      },
      
    });
    return NextResponse.json({ success: true, applications });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to fetch applications';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
