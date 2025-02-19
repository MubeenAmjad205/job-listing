import { NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { sessionOptions } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import cloudinary from '@/lib/cloudinary';
import upload from '@/lib/multer';
import { Readable } from 'stream';

// Augment Express.Multer.File to include the 'buffer' property.
interface MulterFile extends Express.Multer.File {
  buffer: Buffer;
}

export const config = {
  runtime: 'nodejs', // Ensure Node.js runtime so that Buffer and streams work correctly
  api: {
    bodyParser: false, // Disable default body parser to allow multer to handle multipart/form-data
  },
};

interface SessionData {
  user?: {
    name: string;
    id: number;
    email: string;
    role: string;
  };
}

interface MulterRequest extends NodeJS.ReadableStream {
  headers: Record<string, string | string[]>;
  method: string;
  body: Record<string, any>;
  file?: MulterFile;
}

// Define the type for the middleware function used in runMiddleware.
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
  // add other properties if needed
}

export async function POST(req: Request) {
  try {
    // Check session for authentication.
    const session = await getIronSession<SessionData>(req, NextResponse.next(), sessionOptions);
    if (!session.user || session.user.role === 'admin') {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    // Read the entire request body into an ArrayBuffer.
    const arrayBuffer = await req.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    // Create a Node.js Readable stream from the buffer.
    const stream = Readable.from(buffer);
    // Cast the stream to our custom MulterRequest type.
    const reqAny = stream as any;
    reqAny.headers = Object.fromEntries(req.headers);
    reqAny.method = req.method;
    reqAny.body = {}; // Ensure a body property exists for multer to populate.

    // Run the multer middleware to process the file (field name: 'resume') and text fields.
    const uploads:any=  upload.single('resume')
    await runMiddleware(reqAny, {}, uploads);

    // Use the text fields populated by multer.
    const { jobId, fullName, email, coverLetter } = reqAny.body;
    const resumeFile = reqAny.file;

    // Validate required fields.
    if (!jobId || !fullName || !email || !coverLetter || !resumeFile) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    // Upload the resume file to Cloudinary.
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

    // Retrieve job title for the application.
    const job = await prisma.job.findUnique({
      where: { id: Number(jobId) },
      select: { title: true },
    });

    // Create the application record in the database.
    const application = await prisma.application.create({
      data: {
        userName: fullName.toString(),
        email: email.toString(),
        jobTitle: job?.title??"", // the tyoe is changed from inside ....
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
    // In production, add authorization to restrict this route to admins.
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
