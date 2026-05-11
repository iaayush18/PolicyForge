export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes, already handled by vercel.json rewrites)
     * - _vercel (Vercel internals)
     */
    '/((?!api|_vercel).*)',
  ],
};

export default function middleware(request) {
  const url = new URL(request.url);
  const cookieName = 'pf-variant';
  const cookieHeader = request.headers.get('cookie') || '';
  
  // 1. Check if user already has a variant assigned
  let variant = '';
  if (cookieHeader.includes(`${cookieName}=v2`)) {
    variant = 'v2';
  } else if (cookieHeader.includes(`${cookieName}=stable`)) {
    variant = 'stable';
  } else {
    // 2. Randomly assign variant (50/50 split)
    variant = Math.random() < 0.5 ? 'v2' : 'stable';
  }

  const headers = new Headers();

  // 3. Persist the variant with a cookie if it was just assigned
  // This ensures the user stays on the same version across reloads and asset requests
  if (!cookieHeader.includes(`${cookieName}=`)) {
    headers.append(
      'Set-Cookie', 
      `${cookieName}=${variant}; Path=/; HttpOnly; SameSite=Lax; Max-Age=31536000`
    );
  }

  // 4. Route traffic based on the variant
  if (variant === 'v2') {
    // Invisibly proxy to the v2 deployment
    url.hostname = 'policyforge-v2.vercel.app';
    url.port = ''; // Ensure port is cleared if present
    url.protocol = 'https:';
    
    // x-middleware-rewrite tells Vercel to fetch from this URL and return it
    headers.set('x-middleware-rewrite', url.toString());
  } else {
    // Serve from the current deployment (stable)
    headers.set('x-middleware-next', '1');
  }

  // 5. Return the response with the appropriate routing headers
  return new Response(null, { headers });
}
