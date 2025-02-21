
import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { sessionOptions } from '@/lib/session';
import { SessionData } from '@/types'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  const session = await getIronSession<SessionData>(req, res, sessionOptions);

  if (!session.user) {
    return NextResponse.redirect(new URL('/auth/login', req.url));
  }

  const { role } = session.user;
  const { pathname } = req.nextUrl;

  if (pathname.startsWith('/dashboard/admin') && role !== 'admin') {
    return NextResponse.redirect(new URL('/dashboard/user', req.url));
  }
  

  return res;
}

export const config = {
  matcher: [
    '/api/auth/logout',
    '/user/dashboard',
    '/admin/dashboard',
    '/api/jobs/:path*',
    '/api/applications/:path*',
    '/jobs/[id]/apply',
    '/jobs/[id]/edit',

  ],
};
