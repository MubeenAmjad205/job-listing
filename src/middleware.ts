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

  // Retrieve the session
  const session = await getIronSession<SessionData>(req, res, sessionOptions);

  // Check if the user is authenticated
  if (!session.user) {
    return NextResponse.redirect(new URL('/auth/login', req.url));
  }

  const { role } = session.user;
  const { pathname } = req.nextUrl;

  // Restrict 'admin' users from accessing '/user/dashboard'
  if (pathname.startsWith('/dashboard/user') && role === 'admin') {
    return NextResponse.redirect(new URL('/dashboard/admin', req.url));
  }
  

  // Restrict 'user' users from accessing '/admin/dashboard'
  if (pathname.startsWith('/dashboard/admin') && role === 'user') {
    return NextResponse.redirect(new URL('/dashboard/user', req.url));
  }

  return res;
}

export const config = {
  matcher: [
    '/',
    '/api/create',
    '/user/dashboard',
    '/admin/dashboard',
    '/jobs/',
    '/api/update',
  ],
};
