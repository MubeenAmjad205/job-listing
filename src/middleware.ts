// middleware.ts

import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { sessionOptions } from '@/lib/session';

interface SessionData {
  user?: {
    id: number;
    email: string;
    role: string;
  };
}

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  const session = await getIronSession<SessionData>(req, res, sessionOptions);

  if (!session.user) {
    return NextResponse.redirect(new URL('/auth/login', req.url));
  }

  // const { role } = session.user;
  // const { pathname } = req.nextUrl;

  // // Restrict 'admin' users from accessing '/user/dashboard'
  // if (pathname.startsWith('/dashboard/user') && role === 'admin') {
  //   return NextResponse.redirect(new URL('/dashboard/admin', req.url));
  // }
  

  return res;
}

export const config = {
  matcher: [
    '/api/auth/logout',
    '/user/dashboard',
    '/admin/dashboard',
    '/api/jobs/**',
    'api/applications/**',
    '/jobs/[id]/apply',
    '/jobs/[id]/edit',

  ],
};
