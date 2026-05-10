export const config = {
  matcher: '/((?!api).*)',
};

const CANARY_URL = 'https://policyforge-v2.vercel.app';

export default async function middleware(request) {

  const url = new URL(request.url);

  const cookieHeader =
    request.headers.get('cookie') || '';

  let version = null;

  if (cookieHeader.includes('app-version=canary')) {
    version = 'canary';

  } else if (
    cookieHeader.includes('app-version=stable')
  ) {
    version = 'stable';
  }

  // 60-40 split
  if (!version) {

    version =
      Math.random() < 0.6
        ? 'stable'
        : 'canary';
  }

  // Stable traffic
  if (version === 'stable') {

    const response = await fetch(request);

    response.headers.set(
      'Set-Cookie',
      `app-version=stable; Path=/; Max-Age=2592000; SameSite=Lax; Secure`
    );

    return response;
  }

  // Canary traffic
  const rewriteUrl = new URL(
    url.pathname + url.search,
    CANARY_URL
  );

  const response = await fetch(rewriteUrl, request);

  response.headers.set(
    'Set-Cookie',
    `app-version=canary; Path=/; Max-Age=2592000; SameSite=Lax; Secure`
  );

  return response;
}