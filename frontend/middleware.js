import { NextResponse } from 'next/server';

export const config = {
  matcher: '/((?!api).*)',
};

const CANARY_URL = 'https://policyforge-v2.vercel.app';

export default function middleware(request) {

  const url = request.nextUrl;

  // Existing cookie
  const versionCookie =
    request.cookies.get('app-version')?.value;

  let version = versionCookie;

  // 60-40 assignment
  if (!version) {
    version = Math.random() < 0.6
      ? 'stable'
      : 'canary';
  }

  let response;

  // Canary traffic
  if (version === 'canary') {

    const rewriteUrl = new URL(
      url.pathname + url.search,
      CANARY_URL
    );

    response = NextResponse.rewrite(rewriteUrl);

  } else {

    response = NextResponse.next();
  }

  // Persist assignment
  response.cookies.set({
    name: 'app-version',
    value: version,
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: '/',
    secure: true,
    sameSite: 'lax',
  });

  return response;
}